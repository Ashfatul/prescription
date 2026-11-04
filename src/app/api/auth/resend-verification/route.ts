import crypto from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { sendTemplatedEmail } from "@/features/email-templates/email-template.service";
import { getAuthFromRequest } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    let email: string | undefined;

    try {
      const body = await req.json();
      email = body.email?.toLowerCase().trim();
    } catch {
      // Body may be empty if called by authenticated session
    }

    if (!email) {
      const auth = await getAuthFromRequest(req);
      if (auth?.sub) {
        const u = await db.user.findUnique({ where: { id: auth.sub }, select: { email: true } });
        if (u) email = u.email;
      }
    }

    if (!email || !email.includes("@")) {
      throw new AppError("A valid email address is required to resend verification.", 400);
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { role: true, organization: true },
    });

    if (!user) {
      // Don't leak user existence
      return ok({
        success: true,
        message: "If an account with this email exists and is pending verification, a fresh link has been dispatched.",
      });
    }

    if (user.emailVerified) {
      return ok({
        success: true,
        alreadyVerified: true,
        message: "Your email is already verified. You can proceed directly to log in.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: expiresAt,
      },
    });

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const verifyUrl = `${protocol}://${host}/auth/verify-email?token=${token}`;

    await sendTemplatedEmail({
      key: "EMAIL_VERIFICATION",
      to: user.email,
      variables: {
        userName: user.name,
        userEmail: user.email,
        verifyUrl,
        token,
        appName: process.env.NEXT_PUBLIC_APP_NAME || "CareFlow",
      },
      organizationId: user.organizationId,
    });

    return ok({
      success: true,
      message: `A fresh verification email has been dispatched to ${user.email}. Please check your inbox and spam folder.`,
    });
  });
}
