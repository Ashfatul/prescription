import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { RoleName } from "@prisma/client";
import { ok } from "@/lib/http";
import {
  getClinicSubscription,
  getPlatformSuperAdminSubscription,
} from "@/features/subscription/subscription.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const requestedOrgId = searchParams.get("organizationId");

    // Root platform super-admin without a requested organization is the platform owner
    if (auth.role === RoleName.SUPER_ADMIN && !requestedOrgId && !auth.organizationId) {
      return ok(getPlatformSuperAdminSubscription());
    }

    let orgId = auth.organizationId;
    if (auth.role === RoleName.SUPER_ADMIN && requestedOrgId) {
      orgId = requestedOrgId;
    }

    if (!orgId) {
      return ok(getPlatformSuperAdminSubscription());
    }

    const subscription = await getClinicSubscription(orgId);
    return ok(subscription);
  });
}
