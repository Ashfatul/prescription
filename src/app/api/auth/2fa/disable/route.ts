import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { disableTwoFactor } from "@/features/auth/two-factor.service";

const disableSchema = z.object({
  password: z.string().min(1, "Current password is required to disable two-factor authentication"),
});

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await getCurrentUserFromCookie();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const body = disableSchema.parse(await req.json());

    const result = await disableTwoFactor(user.id, body.password);

    return NextResponse.json(result);
  });
}
