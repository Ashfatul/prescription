import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { logActivity } from "@/features/activity-log/activity-log.service";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const body = await req.json();

    const currentPassword = body.currentPassword;
    const newPassword = body.newPassword;
    const confirmPassword = body.confirmPassword;

    if (!currentPassword) {
      throw new AppError("Current password is required.", 400);
    }

    if (!newPassword || newPassword.length < 8) {
      throw new AppError("New password must be at least 8 characters long.", 400);
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      throw new AppError("New password and confirmation password do not match.", 400);
    }

    const user = await db.user.findUnique({
      where: { id: auth.sub },
      include: { role: true },
    });

    if (!user) {
      throw new AppError("User account not found.", 404);
    }

    const validCurrent = await verifyPassword(currentPassword, user.passwordHash);
    if (!validCurrent) {
      throw new AppError("The current password you entered is incorrect.", 400);
    }

    const newHash = await hashPassword(newPassword);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
      },
    });

    await logActivity({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.name,
      userRole: user.role.name,
      action: "USER_PASSWORD_CHANGED",
      entityType: "User",
      entityId: user.id,
      detailsJson: { email: user.email },
    });

    return ok({
      success: true,
      message: "Your password has been changed successfully.",
    });
  });
}
