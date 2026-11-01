import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { OrganizationStatus } from "@prisma/client";
import { logActivity } from "@/features/activity-log/activity-log.service";

export type CreateOrgParams = {
  name: string;
  slug: string;
  planId?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  logoUrl?: string;
};

export async function listOrganizations() {
  const orgs = await db.organization.findMany({
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
  const existing = await db.organization.findUnique({
    where: { slug: params.slug },
  });

  if (existing) {
    throw new AppError("Clinic slug/identifier already exists. Please choose another.", 409);
  }

  const org = await db.organization.create({
    data: {
      name: params.name,
      slug: params.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      planId: params.planId,
      contactEmail: params.contactEmail,
      contactPhone: params.contactPhone,
      address: params.address,
      logoUrl: params.logoUrl,
      status: OrganizationStatus.ACTIVE,
    },
    include: { plan: true },
  });

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
      planId: data.planId,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      address: data.address,
      logoUrl: data.logoUrl,
      status: data.status,
    },
    include: { plan: true },
  });
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
