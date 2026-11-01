import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { hashPassword } from "@/lib/auth/password";
import { logActivity } from "@/features/activity-log/activity-log.service";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const body = await req.json();
    const token = body.token?.trim();
    const password = body.password;

    if (!token) {
      throw new AppError("Password reset token is required.", 400);
    }

    if (!password || password.length < 8) {
      throw new AppError("New password must be at least 8 characters long.", 400);
    }

    const user = await db.user.findFirst({
      where: {
        passwordResetToken: token,
      },
      include: { role: true },
    });

    if (!user) {
      throw new AppError("Invalid or expired password reset link. Please request a new one.", 400);
    }

    if (
      user.passwordResetTokenExpiresAt &&
      user.passwordResetTokenExpiresAt.getTime() < Date.now()
    ) {
      throw new AppError("This password reset link has expired. Please submit a new reset request.", 400);
    }

    const newHash = await hashPassword(password);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
      },
    });

    await logActivity({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.name,
      userRole: user.role.name,
      action: "PASSWORD_RESET_COMPLETED",
      entityType: "User",
      entityId: user.id,
      detailsJson: { email: user.email },
    });

    return ok({
      success: true,
      message: "Your password has been successfully reset. You may now log in with your new password.",
    });
  });
}
