import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken, verify2FATempToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { logActivity } from "@/features/activity-log/activity-log.service";
import { verifyLoginTwoFactor } from "@/features/auth/two-factor.service";

const verify2FALoginSchema = z.object({
  tempToken: z.string().min(1, "Temporary authentication challenge token is required"),
  code: z.string().min(1, "Verification code is required"),
});

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const body = verify2FALoginSchema.parse(await req.json());

    // 1. Verify the challenge JWT
    const challenge = await verify2FATempToken(body.tempToken);
    if (!challenge) {
      throw new AppError("Two-factor authentication session expired. Please sign in again.", 401);
    }

    // 2. Fetch user
    const user = await db.user.findUnique({
      where: { id: challenge.userId },
      include: { role: true, organization: true },
    });

    if (!user || !user.twoFactorEnabled) {
      throw new AppError("Invalid authentication request.", 401);
    }

    // 3. Verify TOTP or Backup recovery code
    const verification = await verifyLoginTwoFactor(user.id, body.code);
    if (!verification.success) {
      throw new AppError("Invalid verification code. Please check your authenticator app or backup code.", 401);
    }

    // 4. Issue standard session token
    const token = await signToken({
      sub: user.id,
      role: user.role.name,
      organizationId: user.organizationId,
    });

    // 5. Log activity
    await logActivity({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.name,
      userRole: user.role.name,
      action: "USER_LOGIN_2FA",
      entityType: "User",
      entityId: user.id,
      detailsJson: {
        email: user.email,
        usedBackupCode: verification.usedBackupCode || false,
      },
    });

    const res = NextResponse.json({
      success: true,
      message: "Two-factor authentication successful.",
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
