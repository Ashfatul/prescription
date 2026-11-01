import crypto from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { sendTemplatedEmail } from "@/features/email-templates/email-template.service";
import { logActivity } from "@/features/activity-log/activity-log.service";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const body = await req.json();
    const email = body.email?.toLowerCase().trim();

    if (!email || !email.includes("@")) {
      throw new AppError("A valid email address is required.", 400);
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // Always respond with success to avoid leaking registered emails
    if (!user) {
      return ok({
        success: true,
        message: "If an account matches that email address, password reset instructions have been dispatched.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetTokenExpiresAt: expiresAt,
      },
    });

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const resetUrl = `${protocol}://${host}/auth/reset-password?token=${resetToken}`;

    await sendTemplatedEmail({
      key: "PASSWORD_RESET",
      to: user.email,
      variables: {
        userName: user.name,
        userEmail: user.email,
        resetUrl,
        token: resetToken,
        appName: process.env.NEXT_PUBLIC_APP_NAME || "PPMS",
      },
      organizationId: user.organizationId,
    });

    await logActivity({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.name,
      userRole: user.role.name,
      action: "PASSWORD_RESET_REQUESTED",
      entityType: "User",
      entityId: user.id,
      detailsJson: { email: user.email },
    });

    return ok({
      success: true,
      message: "If an account matches that email address, password reset instructions have been dispatched.",
    });
  });
}
