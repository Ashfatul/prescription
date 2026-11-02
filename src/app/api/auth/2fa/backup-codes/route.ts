import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { regenerateBackupCodes } from "@/features/auth/two-factor.service";

const regenSchema = z.object({
  password: z.string().min(1, "Password is required to regenerate backup codes"),
});

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const body = regenSchema.parse(await req.json());

    const result = await regenerateBackupCodes(user.id, body.password);

    return NextResponse.json(result);
  });
}
