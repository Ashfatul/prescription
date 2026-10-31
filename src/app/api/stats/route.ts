import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { ok } from "@/lib/http";
import { getDashboardStats } from "@/features/stats.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.STAFF]);
    return ok(await getDashboardStats());
  });
}
