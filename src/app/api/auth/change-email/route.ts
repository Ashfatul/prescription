import crypto from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { verifyPassword } from "@/lib/auth/password";
import { sendTemplatedEmail } from "@/features/email-templates/email-template.service";
import { logActivity } from "@/features/activity-log/activity-log.service";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const body = await req.json();
    const currentEmail = body.currentEmail?.toLowerCase().trim();
    const newEmail = body.newEmail?.toLowerCase().trim();
    const password = body.password;

    if (!currentEmail || !newEmail || !password) {
      throw new AppError("Current email, new email, and account password are required.", 400);
    }

    if (!newEmail.includes("@") || newEmail.length < 5) {
      throw new AppError("Please provide a valid new email address.", 400);
    }

    if (currentEmail === newEmail) {
      throw new AppError("The new email address cannot be identical to the current email.", 400);
    }

    const user = await db.user.findUnique({
      where: { email: currentEmail },
      include: { role: true },
    });

    if (!user) {
      throw new AppError("User account not found with the provided email.", 404);
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      throw new AppError("Invalid account password. Please check your credentials.", 401);
    }

    // Check if new email is already in use
    const emailConflict = await db.user.findUnique({
      where: { email: newEmail },
    });
    if (emailConflict) {
      throw new AppError(`The email '${newEmail}' is already registered to another account.`, 409);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        email: newEmail,
        emailVerified: null,
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: expiresAt,
      },
    });

    await logActivity({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.name,
      userRole: user.role.name,
      action: "USER_EMAIL_CHANGED",
      entityType: "User",
      entityId: user.id,
      detailsJson: { from: currentEmail, to: newEmail },
    });

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const verifyUrl = `${protocol}://${host}/auth/verify-email?token=${token}`;

    await sendTemplatedEmail({
      key: "EMAIL_VERIFICATION",
      to: newEmail,
      variables: {
        userName: user.name,
        userEmail: newEmail,
        verifyUrl,
        token,
        appName: process.env.NEXT_PUBLIC_APP_NAME || "PPMS",
      },
      organizationId: user.organizationId,
    });

    return ok({
      success: true,
      email: newEmail,
      message: `Your account email has been updated to ${newEmail}. A fresh verification link has been dispatched to your new inbox.`,
    });
  });
}
