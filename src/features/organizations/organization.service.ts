import crypto from "crypto";
import { resolveTxt } from "node:dns/promises";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { OrganizationStatus, RoleName } from "@prisma/client";
import { logActivity } from "@/features/activity-log/activity-log.service";
import { medicineService, testService } from "@/features/catalog/catalog.service";
import { sendTemplatedEmail } from "@/features/email-templates/email-template.service";
import { cleanSlug, isValidSlugFormat } from "@/lib/organizations/slug";

function normalizeCustomDomain(value: string): string {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function validateCustomDomain(value: string): boolean {
  return /^(?=.{4,253}$)(?!localhost$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value);
}

export function getCustomDomainConfig(org: {
  customDomain: string | null;
  customDomainStatus: string | null;
  customDomainVerificationToken: string | null;
  customDomainVerifiedAt: Date | null;
}) {
  return {
    domain: org.customDomain,
    status: org.customDomainStatus || "NONE",
    verifiedAt: org.customDomainVerifiedAt,
    dns: org.customDomain
      ? {
          cnameName: org.customDomain,
          cnameTarget: process.env.NEXT_PUBLIC_APP_DOMAIN || "app.example.com",
          txtName: `_ppms-verification.${org.customDomain}`,
          txtValue: org.customDomainVerificationToken,
        }
      : null,
  };
}

export async function getOrganizationDomain(id: string) {
  const org = await db.organization.findUnique({
    where: { id },
    select: {
      customDomain: true,
      customDomainStatus: true,
      customDomainVerificationToken: true,
      customDomainVerifiedAt: true,
    },
  });
  if (!org) throw new AppError("Organization not found", 404);
  return getCustomDomainConfig(org);
}

export async function updateOrganizationDomain(id: string, rawDomain: string | null) {
  const domain = rawDomain ? normalizeCustomDomain(rawDomain) : null;
  if (domain && !validateCustomDomain(domain)) {
    throw new AppError("Enter a valid domain such as clinic.example.com.", 400);
  }

  if (domain) {
    const existing = await db.organization.findFirst({
      where: { customDomain: domain, id: { not: id } },
      select: { id: true },
    });
    if (existing) throw new AppError("This custom domain is already assigned to another clinic.", 409);
  }

  const token = domain ? `ppms-${crypto.randomBytes(18).toString("hex")}` : null;
  const updated = await db.organization.update({
    where: { id },
    data: {
      customDomain: domain,
      customDomainStatus: domain ? "PENDING" : "NONE",
      customDomainVerificationToken: token,
      customDomainVerifiedAt: null,
    },
    select: {
      customDomain: true,
      customDomainStatus: true,
      customDomainVerificationToken: true,
      customDomainVerifiedAt: true,
    },
  });
  return getCustomDomainConfig(updated);
}

export async function verifyOrganizationDomain(id: string) {
  const org = await db.organization.findUnique({
    where: { id },
    select: { customDomain: true, customDomainVerificationToken: true },
  });
  if (!org?.customDomain || !org.customDomainVerificationToken) {
    throw new AppError("Configure a custom domain before verifying it.", 400);
  }

  let records: string[][] = [];
  try {
    records = await resolveTxt(`_ppms-verification.${org.customDomain}`);
  } catch {
    throw new AppError("The verification TXT record was not found yet. DNS changes may take time to propagate.", 400);
  }

  const found = records.some((record) => record.join("") === org.customDomainVerificationToken);
  if (!found) {
    throw new AppError("The verification TXT record does not match the value shown here.", 400);
  }

  const updated = await db.organization.update({
    where: { id },
    data: { customDomainStatus: "VERIFIED", customDomainVerifiedAt: new Date() },
    select: {
      customDomain: true,
      customDomainStatus: true,
      customDomainVerificationToken: true,
      customDomainVerifiedAt: true,
    },
  });
  return getCustomDomainConfig(updated);
}

export type CreateOrgParams = {
  name: string;
  slug: string;
  planId?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  logoUrl?: string;
};

export async function validateSlugAvailability(rawSlug: string): Promise<{
  available: boolean;
  slug: string;
  reason?: string;
}> {
  const slug = cleanSlug(rawSlug);
  const formatCheck = isValidSlugFormat(slug);

  if (!formatCheck.valid) {
    return {
      available: false,
      slug,
      reason: formatCheck.reason,
    };
  }

  const existing = await db.organization.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });

  if (existing) {
    return {
      available: false,
      slug,
      reason: `The subdomain '${slug}' is already taken by another registered clinic.`,
    };
  }

  return {
    available: true,
    slug,
  };
}

export async function listOrganizations(includeDemo?: boolean) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.DEMO_MODE === "true";
  const shouldIncludeDemo = includeDemo !== undefined ? includeDemo : isDemoMode;

  const orgs = await db.organization.findMany({
    where: shouldIncludeDemo
      ? {}
      : {
          slug: { not: "ppms-clinic" },
        },
    include: {
      plan: true,
      _count: {
        select: {
          users: true,
          appointments: true,
          prescriptions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orgs;
}

export async function getOrganizationById(id: string) {
  const org = await db.organization.findUnique({
    where: { id },
    include: {
      plan: true,
      users: {
        select: { id: true, name: true, email: true, role: true },
      },
      _count: {
        select: {
          appointments: true,
          prescriptions: true,
          testReports: true,
        },
      },
    },
  });

  if (!org) {
    throw new AppError("Organization not found", 404);
  }

  return org;
}

export async function createOrganization(params: CreateOrgParams, creatorUserId?: string) {
  const slugCheck = await validateSlugAvailability(params.slug);
  if (!slugCheck.available) {
    throw new AppError(slugCheck.reason || "Invalid or unavailable clinic slug.", 409);
  }

  const org = await db.organization.create({
    data: {
      name: params.name,
      slug: slugCheck.slug,
      plan: params.planId ? { connect: { id: params.planId } } : undefined,
      contactEmail: params.contactEmail,
      contactPhone: params.contactPhone,
      address: params.address,
      logoUrl: params.logoUrl,
      status: OrganizationStatus.ACTIVE,
    },
    include: { plan: true },
  });

  await Promise.all([
    medicineService.cloneDefaultsForOrganization(org.id),
    testService.cloneDefaultsForOrganization(org.id),
  ]);

  await logActivity({
    organizationId: org.id,
    userId: creatorUserId,
    userName: "Super Admin",
    userRole: "SUPER_ADMIN",
    action: "ORGANIZATION_CREATED",
    entityType: "Organization",
    entityId: org.id,
    detailsJson: { name: org.name, slug: org.slug, plan: org.plan?.name || "None" },
  });

  return org;
}

export async function updateOrganization(
  id: string,
  data: Partial<CreateOrgParams> & { status?: OrganizationStatus }
) {
  const existing = await db.organization.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Organization not found", 404);
  }

  return db.organization.update({
    where: { id },
    data: {
      name: data.name,
      plan: data.planId ? { connect: { id: data.planId } } : undefined,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      address: data.address,
      logoUrl: data.logoUrl,
      status: data.status,
    },
    include: { plan: true },
  });
}

export async function approveOrganization(id: string, approvedByUserName: string) {
  const existing = await db.organization.findUnique({
    where: { id },
    include: {
      users: {
        where: { role: { name: { in: [RoleName.ADMIN, RoleName.SUPER_ADMIN] } } },
      },
      plan: true,
    },
  });

  if (!existing) {
    throw new AppError("Organization not found", 404);
  }

  const updated = await db.organization.update({
    where: { id },
    data: {
      status: OrganizationStatus.ACTIVE,
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: approvedByUserName,
    },
    include: { plan: true },
  });

  // Also approve all admin accounts of this clinic
  await db.user.updateMany({
    where: { organizationId: id, role: { name: RoleName.ADMIN } },
    data: {
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: approvedByUserName,
    },
  });

  await logActivity({
    organizationId: id,
    userName: approvedByUserName,
    userRole: "SUPER_ADMIN",
    action: "ORGANIZATION_APPROVED",
    entityType: "Organization",
    entityId: id,
    detailsJson: {
      clinicName: existing.name,
      slug: existing.slug,
      approvedBy: approvedByUserName,
    },
  });

  // Dispatch confirmation email
  const recipientEmail = existing.contactEmail || existing.users[0]?.email;
  if (recipientEmail) {
    const adminUser = existing.users[0];
    const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await sendTemplatedEmail({
      key: "ORGANIZATION_APPROVED",
      to: recipientEmail,
      variables: {
        userName: adminUser?.name || "Clinic Administrator",
        clinicName: existing.name,
        loginUrl: `${host}/auth/login`,
        appName: process.env.NEXT_PUBLIC_APP_NAME || "PPMS",
        approvedBy: approvedByUserName,
      },
      organizationId: id,
    }).catch((err) => {
      console.error("Failed to send clinic approval confirmation email:", err);
    });
  }

  return updated;
}

export async function getSaaSGlobalMetrics() {
  const [
    totalOrganizations,
    totalUsers,
    totalDoctors,
    totalStaff,
    totalPatients,
    totalPrescriptions,
    activePlans,
  ] = await Promise.all([
    db.organization.count(),
    db.user.count(),
    db.doctor.count(),
    db.user.count({ where: { role: { name: "STAFF" } } }),
    db.patient.count(),
    db.prescription.count(),
    db.organization.findMany({
      where: { status: "ACTIVE", plan: { isNot: null } },
      include: { plan: true },
    }),
  ]);

  const estimatedMrr = activePlans.reduce((sum, org) => {
    return sum + (org.plan?.price || 0);
  }, 0);

  return {
    totalOrganizations,
    totalUsers,
    totalDoctors,
    totalStaff,
    totalPatients,
    totalPrescriptions,
    estimatedMrr,
  };
}
