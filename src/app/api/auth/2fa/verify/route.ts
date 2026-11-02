import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { enableTwoFactor } from "@/features/auth/two-factor.service";

const verifySetupSchema = z.object({
  code: z.string().min(6).max(8),
  secret: z.string().min(16),
  backupCodes: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const body = verifySetupSchema.parse(await req.json());

    const result = await enableTwoFactor(user.id, body.code, body.secret, body.backupCodes);

    return NextResponse.json(result);
  });
}
