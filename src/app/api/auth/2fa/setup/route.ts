import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { setupTwoFactor } from "@/features/auth/two-factor.service";

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const setupData = await setupTwoFactor({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      data: setupData,
    });
  });
}
