import { NextRequest } from "next/server";
import { z } from "zod";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { getAuthFromRequest } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import {
  isDemoModeActive,
  performSecureDatabaseReset,
} from "@/features/demo/demo-reset.service";
import { DEMO_RESET_CONFIRMATION } from "@/features/demo/demo-reset.constants";
import { RoleName } from "@prisma/client";

export const dynamic = "force-dynamic";

const resetRequestSchema = z.object({
  password: z.string().min(8),
  confirmation: z.literal(DEMO_RESET_CONFIRMATION),
});

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    if (!isDemoModeActive()) {
      throw new AppError("Database reset is only available when Demo Mode is enabled.", 403);
    }

    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
      throw new AppError("Invalid request origin.", 403);
    }

    const auth = await getAuthFromRequest(req);
    if (!auth) {
      throw new AppError("Authentication is required.", 401);
    }

    const actor = await db.user.findUnique({
      where: { id: auth.sub },
      include: { role: true },
    });
    if (!actor || actor.role.name !== RoleName.SUPER_ADMIN) {
      throw new AppError("Only a Super Admin can reset the demo database.", 403);
    }

    const body = resetRequestSchema.parse(await req.json());
    const passwordMatches = await verifyPassword(body.password, actor.passwordHash);
    if (!passwordMatches) {
      throw new AppError("The Super Admin password is incorrect.", 401);
    }

    return ok(await performSecureDatabaseReset(actor.id));
  });
}
