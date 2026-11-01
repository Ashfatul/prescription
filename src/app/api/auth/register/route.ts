import { NextRequest, NextResponse } from "next/server";
import { RoleName, OrganizationStatus } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { createUser } from "@/features/users/user.service";
import { ok } from "@/lib/http";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getAuthFromRequest } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { logActivity } from "@/features/activity-log/activity-log.service";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    try {
      const body = await req.json();

      // 1. SaaS Clinic / Organization Registration with Free Trial
      if (body.isClinicRegistration || body.role === "CLINIC_ADMIN") {
      const clinicName = body.clinicName?.trim();
      const adminName = (body.name || body.adminName)?.trim();
      const email = body.email?.toLowerCase().trim();
      const password = body.password;
      const phone = body.phone?.trim() || null;
      const address = body.address?.trim() || null;

      if (!clinicName || clinicName.length < 2) {
        throw new AppError("Clinic or Hospital name must be at least 2 characters", 400);
      }
      if (!adminName || adminName.length < 2) {
        throw new AppError("Administrator full name is required", 400);
      }
      if (!email || !email.includes("@")) {
        throw new AppError("A valid work email is required", 400);
      }
      if (!password || password.length < 6) {
        throw new AppError("Password must be at least 6 characters", 400);
      }

      // Generate or clean clinic slug
      const rawSlug = body.clinicSlug || clinicName;
      const cleanSlug = rawSlug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      if (!cleanSlug) {
        throw new AppError("Invalid clinic slug identifier", 400);
      }

      // Check for existing slug
      const existingSlug = await db.organization.findUnique({
        where: { slug: cleanSlug },
      });
      if (existingSlug) {
        throw new AppError(`Clinic identifier '${cleanSlug}' is already taken. Please choose another.`, 409);
      }

      // Check for existing email
      const existingUser = await db.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new AppError("An account with this email address already exists. Please log in.", 409);
      }

      // Resolve pricing plan
      let plan = null;
      if (body.planId && typeof body.planId === "string" && body.planId.trim()) {
        plan = await db.pricingPlan.findUnique({ where: { id: body.planId.trim() } });
      }
      if (!plan) {
        plan = await db.pricingPlan.findFirst({
          where: { isActive: true },
          orderBy: { price: "asc" },
        });
      }

      // 14-day free trial duration
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      // Create Organization
      const organization = await db.organization.create({
        data: {
          name: clinicName,
          slug: cleanSlug,
          plan: plan?.id ? { connect: { id: plan.id } } : undefined,
          status: OrganizationStatus.TRIAL,
          trialEndsAt,
          subscriptionStatus: "trialing",
          contactEmail: email,
          contactPhone: phone,
          address: address,
        },
        include: { plan: true },
      });

      // Find Super Admin role
      let adminRole = await db.role.findUnique({
        where: { name: RoleName.SUPER_ADMIN },
      });
      if (!adminRole) {
        adminRole = await db.role.create({
          data: {
            name: RoleName.SUPER_ADMIN,
            permissions: ["*"],
          },
        });
      }

      // Create Admin User
      const user = await db.user.create({
        data: {
          name: adminName,
          email,
          passwordHash: await hashPassword(password),
          phone: phone || null,
          roleId: adminRole.id,
          organizationId: organization.id,
        },
        include: { role: true, organization: true },
      });

      // Log activities
      await logActivity({
        organizationId: organization.id,
        userId: user.id,
        userName: user.name,
        userRole: "SUPER_ADMIN",
        action: "ORGANIZATION_CREATED",
        entityType: "Organization",
        entityId: organization.id,
        detailsJson: {
          clinicName: organization.name,
          slug: organization.slug,
          plan: plan?.name || "Free Trial",
          trialEndsAt: trialEndsAt.toISOString(),
        },
      });

      await logActivity({
        organizationId: organization.id,
        userId: user.id,
        userName: user.name,
        userRole: "SUPER_ADMIN",
        action: "TRIAL_STARTED",
        entityType: "Subscription",
        entityId: organization.id,
        detailsJson: {
          days: 14,
          plan: plan?.name,
          trialEndsAt: trialEndsAt.toISOString(),
        },
      });

      // Generate JWT session token
      const token = await signToken({
        sub: user.id,
        role: user.role.name,
        organizationId: organization.id,
      });

      const response = NextResponse.json(
        {
          success: true,
          data: {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role.name,
              organizationId: user.organizationId,
              organizationName: organization.name,
              status: organization.status,
            },
            organization,
            token,
          },
        },
        { status: 201 }
      );

      response.cookies.set(AUTH_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // 2. Standard Patient or Internal User Registration
    const userCount = await db.user.count();
    const isPatientRegistration = body.role === RoleName.PATIENT;

    // First user can be registered as SUPER_ADMIN without restrictions
    if (userCount > 0 && !isPatientRegistration) {
      const auth = await getAuthFromRequest(req);
      if (!auth || (auth.role !== RoleName.SUPER_ADMIN && auth.role !== RoleName.STAFF)) {
        throw new AppError("Only super admin or staff can register doctors and staff accounts", 403);
      }
    }

    const auth = await getAuthFromRequest(req);
    const user = await createUser(body, auth?.sub);
    return ok(user, 201);
    } catch (err: unknown) {
      const errorObj = err as Error;
      console.error("REGISTER ERROR STACK:", errorObj?.stack || errorObj);
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(errorObj?.message || "Internal registration error", 500);
    }
  });
}
