import { NextRequest, NextResponse } from "next/server";
import { RoleName, OrganizationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { logActivity } from "@/features/activity-log/activity-log.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token")?.trim();

    if (!token) {
      throw new AppError("Verification token is required", 400);
    }

    const user = await db.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
      include: { role: true, organization: true },
    });

    if (!user) {
      throw new AppError("Invalid or expired verification token. Please request a new verification email.", 400);
    }

    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt.getTime() < Date.now()
    ) {
      throw new AppError("Verification token has expired. Please request a fresh verification link.", 400);
    }

    // Mark verified and clear verification tokens
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
      include: { role: true, organization: true },
    });

    await logActivity({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.name,
      userRole: user.role.name,
      action: "EMAIL_VERIFIED",
      entityType: "User",
      entityId: user.id,
      detailsJson: { email: user.email },
    });

    const isOrgPending =
      updatedUser.role.name !== RoleName.SUPER_ADMIN &&
      updatedUser.organization &&
      (updatedUser.organization.status === OrganizationStatus.PENDING_APPROVAL ||
        updatedUser.organization.isApproved === false);

    const isPatientPending =
      updatedUser.role.name === RoleName.PATIENT && updatedUser.isApproved === false;

    const isUserPending =
      updatedUser.role.name !== RoleName.SUPER_ADMIN && updatedUser.isApproved === false;

    if (isOrgPending || isPatientPending || isUserPending) {
      const message = isOrgPending
        ? "Email address verified successfully! Your clinic registration is now awaiting review and confirmation by the Super Administrator. You will receive an email once approved."
        : isPatientPending
        ? "Email address verified successfully! Your patient account is now awaiting verification by clinic administration or front desk staff. You will receive an email once verified."
        : "Email address verified successfully! Your account is awaiting administrative approval.";

      return NextResponse.json({
        success: true,
        pendingApproval: true,
        isOrgPending: Boolean(isOrgPending),
        isPatientPending: Boolean(isPatientPending),
        message,
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role.name,
          organizationId: updatedUser.organizationId,
          pendingApproval: true,
        },
      });
    }

    // Sign session token so user can proceed directly
    const sessionToken = await signToken({
      sub: user.id,
      role: user.role.name,
      organizationId: user.organizationId,
    });

    const res = NextResponse.json({
      success: true,
      message: "Email address verified successfully. Welcome!",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role.name,
        organizationId: updatedUser.organizationId,
      },
    });

    res.cookies.set(AUTH_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  });
}
