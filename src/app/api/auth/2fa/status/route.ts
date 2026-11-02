import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const backupCodes = Array.isArray(user.twoFactorBackupCodes)
      ? (user.twoFactorBackupCodes as string[])
      : [];

    return NextResponse.json({
      success: true,
      data: {
        twoFactorEnabled: Boolean(user.twoFactorEnabled),
        backupCodesRemaining: backupCodes.length,
      },
    });
  });
}
