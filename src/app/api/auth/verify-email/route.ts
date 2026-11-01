import { NextRequest, NextResponse } from "next/server";
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
