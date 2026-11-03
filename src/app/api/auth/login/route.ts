import { NextRequest, NextResponse } from "next/server";
import { RoleName, OrganizationStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signToken, sign2FATempToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { logActivity } from "@/features/activity-log/activity-log.service";
import { isEmailVerificationRequired } from "@/features/settings/settings.service";
import {
  isDemoModeActive,
  DEMO_ACCOUNT_EMAILS,
  repairDemoSuperAdmin,
  seedOrResetDemoClinic,
  SUPER_ADMIN_EMAIL,
} from "@/features/demo/demo-reset.service";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const body = loginSchema.parse(await req.json());

    let user = await db.user.findUnique({
      where: { email: body.email },
      include: { role: true, organization: true },
    });

    // Repair the renamed Super Admin account in place so login does not need to
    // clear the entire demo clinic just to migrate existing credentials.
    if (!user && isDemoModeActive() && body.email === SUPER_ADMIN_EMAIL) {
      const repaired = await repairDemoSuperAdmin(db);
      if (!repaired && DEMO_ACCOUNT_EMAILS.includes(body.email)) {
        await seedOrResetDemoClinic(db);
      }
      user = await db.user.findUnique({
        where: { email: body.email },
        include: { role: true, organization: true },
      });
    } else if (!user && isDemoModeActive() && DEMO_ACCOUNT_EMAILS.includes(body.email)) {
      await seedOrResetDemoClinic(db);
      user = await db.user.findUnique({
        where: { email: body.email },
        include: { role: true, organization: true },
      });
    }

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const requireVerification = await isEmailVerificationRequired();
    if (requireVerification && !user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          requireVerification: true,
          email: user.email,
          message: "Please verify your email address to continue. Check your inbox for the verification link.",
        },
        { status: 403 }
      );
    }

    // Organization approval check: unapproved clinics cannot log in
    if (
      user.role.name !== RoleName.SUPER_ADMIN &&
      user.organization &&
      (user.organization.status === OrganizationStatus.PENDING_APPROVAL ||
        user.organization.isApproved === false)
    ) {
      return NextResponse.json(
        {
          success: false,
          pendingOrgApproval: true,
          message:
            "Your clinic registration is currently pending review and confirmation by the Super Administrator. You will receive an email once approved.",
        },
        { status: 403 }
      );
    }

    // Patient verification check: unverified patients cannot log in
    if (user.role.name === RoleName.PATIENT && user.isApproved === false) {
      return NextResponse.json(
        {
          success: false,
          pendingPatientVerification: true,
          message:
            "Your patient account is pending verification and activation by clinic administration or front desk staff. You will receive an email once verified.",
        },
        { status: 403 }
      );
    }

    // Generic unapproved check (e.g. staff/admin accounts pending review)
    if (user.role.name !== RoleName.SUPER_ADMIN && user.isApproved === false) {
      return NextResponse.json(
        {
          success: false,
          pendingApproval: true,
          message:
            "Your account is currently awaiting administrative approval before you can log in.",
        },
        { status: 403 }
      );
    }

    // 2FA Security Challenge Check
    if (user.twoFactorEnabled) {
      const tempToken = await sign2FATempToken(user.id);
      return NextResponse.json({
        success: true,
        requires2FA: true,
        tempToken,
        maskedEmail: user.email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(Math.max(1, b.length))),
        message: "Two-factor authentication required. Please enter your 6-digit authenticator code.",
      });
    }

    const token = await signToken({
      sub: user.id,
      role: user.role.name,
      organizationId: user.organizationId,
    });

    // Log login activity
    await logActivity({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.name,
      userRole: user.role.name,
      action: "USER_LOGIN",
      entityType: "User",
      entityId: user.id,
      detailsJson: { email: user.email },
    });

    const res = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        organizationId: user.organizationId,
        organizationName: user.organization?.name || null,
        theme: user.theme || "system",
        accent: user.accent || "teal",
      },
    });

    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set("ppms_theme", user.theme || "system", {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });

    res.cookies.set("ppms_accent", user.accent || "teal", {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });

    return res;
  });
}
