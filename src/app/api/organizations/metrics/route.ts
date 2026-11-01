import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { getSaaSGlobalMetrics } from "@/features/organizations/organization.service";
import { RoleName } from "@prisma/client";
import { ok } from "@/lib/http";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN]);
    const metrics = await getSaaSGlobalMetrics();
    return ok(metrics);
  });
}
