import crypto from "crypto";
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
import { medicineService, testService } from "@/features/catalog/catalog.service";
import { isEmailVerificationRequired, isOrgApprovalRequired } from "@/features/settings/settings.service";
import { sendTemplatedEmail } from "@/features/email-templates/email-template.service";
import { validateSlugAvailability } from "@/features/organizations/organization.service";

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

      // Validate clinic subdomain slug format, reservation, and availability
      const rawSlug = body.clinicSlug || clinicName;
      const slugValidation = await validateSlugAvailability(rawSlug);
      if (!slugValidation.available) {
        throw new AppError(slugValidation.reason || "Invalid or unavailable clinic subdomain.", 409);
      }
      const cleanSlug = slugValidation.slug;

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
      const requireOrgApproval = await isOrgApprovalRequired();

      // Create Organization
      const organization = await db.organization.create({
        data: {
          name: clinicName,
          slug: cleanSlug,
          plan: plan?.id ? { connect: { id: plan.id } } : undefined,
          status: requireOrgApproval ? OrganizationStatus.PENDING_APPROVAL : OrganizationStatus.TRIAL,
          isApproved: !requireOrgApproval,
          approvedAt: !requireOrgApproval ? new Date() : null,
          trialEndsAt,
          subscriptionStatus: "trialing",
          contactEmail: email,
          contactPhone: phone,
          address: address,
        },
        include: { plan: true },
      });

      // Find or create Clinic Administrator role
      let adminRole = await db.role.findUnique({
        where: { name: RoleName.ADMIN },
      });
      if (!adminRole) {
        adminRole = await db.role.create({
          data: {
            name: RoleName.ADMIN,
            permissions: ["*"],
          },
        });
      }

      const requireVerification = await isEmailVerificationRequired();
      const verificationToken = requireVerification ? crypto.randomBytes(32).toString("hex") : null;
      const verificationExpiresAt = requireVerification ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

      // Create Admin User
      const user = await db.user.create({
        data: {
          name: adminName,
          email,
          passwordHash: await hashPassword(password),
          phone: phone || null,
          roleId: adminRole.id,
          organizationId: organization.id,
          isApproved: !requireOrgApproval,
          approvedAt: !requireOrgApproval ? new Date() : null,
          emailVerified: requireVerification ? null : new Date(),
          emailVerificationToken: verificationToken,
          emailVerificationTokenExpiresAt: verificationExpiresAt,
        },
        include: { role: true, organization: true },
      });

      // Clone default medicines and diagnostic tests for the new clinic so they have their own independent catalog
      await Promise.all([
        medicineService.cloneDefaultsForOrganization(organization.id),
        testService.cloneDefaultsForOrganization(organization.id),
      ]);

      // Log activities
      await logActivity({
        organizationId: organization.id,
        userId: user.id,
        userName: user.name,
        userRole: "ADMIN",
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
        userRole: "ADMIN",
        action: "TRIAL_STARTED",
        entityType: "Subscription",
        entityId: organization.id,
        detailsJson: {
          days: 14,
          plan: plan?.name,
          trialEndsAt: trialEndsAt.toISOString(),
        },
      });

      // If email verification is required, dispatch verification email and do not issue session token yet
      if (requireVerification && verificationToken) {
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const verifyUrl = `${protocol}://${host}/auth/verify-email?token=${verificationToken}`;

        await sendTemplatedEmail({
          key: "EMAIL_VERIFICATION",
          to: user.email,
          variables: {
            userName: user.name,
            userEmail: user.email,
            verifyUrl,
            token: verificationToken,
            appName: process.env.NEXT_PUBLIC_APP_NAME || "PPMS",
          },
          organizationId: organization.id,
        });

        return NextResponse.json(
          {
            success: true,
            requireVerification: true,
            requireOrgApproval,
            email: user.email,
            message: requireOrgApproval
              ? "Clinic registered successfully! A verification email has been dispatched. After email confirmation, your clinic account will be reviewed and approved by the Super Administrator."
              : "Clinic registered successfully! A verification email has been dispatched. Please verify your email before logging in.",
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
            },
          },
          { status: 201 }
        );
      }

      // If email verification is off but organization approval is required, do NOT issue session token
      if (requireOrgApproval) {
        return NextResponse.json(
          {
            success: true,
            requireOrgApproval: true,
            message: "Clinic registered successfully! Your organization is pending review and confirmation by the Super Administrator. You will receive an email once approved.",
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
            },
          },
          { status: 201 }
        );
      }

      // Generate JWT session token (if email verification and approval gates are passed)
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
      if (!auth || (auth.role !== RoleName.SUPER_ADMIN && auth.role !== RoleName.ADMIN && auth.role !== RoleName.STAFF)) {
        throw new AppError("Only hospital administrators or staff can register doctors and staff accounts", 403);
      }
    }

    const auth = await getAuthFromRequest(req);
    const user = await createUser(body, auth?.sub);

    // If verification is required and user has a pending verification token, dispatch verification email
    if (user && !user.emailVerified && user.emailVerificationToken) {
      const host = req.headers.get("host") || "localhost:3000";
      const protocol = req.headers.get("x-forwarded-proto") || "http";
      const verifyUrl = `${protocol}://${host}/auth/verify-email?token=${user.emailVerificationToken}`;

      await sendTemplatedEmail({
        key: "EMAIL_VERIFICATION",
        to: user.email,
        variables: {
          userName: user.name,
          userEmail: user.email,
          verifyUrl,
          token: user.emailVerificationToken,
          appName: process.env.NEXT_PUBLIC_APP_NAME || "PPMS",
        },
        organizationId: user.organizationId,
      });

      return NextResponse.json(
        {
          success: true,
          requireVerification: true,
          email: user.email,
          message: "Registration successful! A verification link has been sent to your email. Please verify before logging in.",
          data: user,
        },
        { status: 201 }
      );
    }

    if (user && !user.isApproved) {
      return NextResponse.json(
        {
          success: true,
          requirePatientVerification: true,
          email: user.email,
          message: "Patient registered successfully! Your account is pending verification and activation by clinic front desk or administration. You will receive an email once verified.",
          data: user,
        },
        { status: 201 }
      );
    }

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
