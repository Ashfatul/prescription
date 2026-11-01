import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { requireUser } from "@/lib/auth/session";
import { getActivityLogs } from "@/features/activity-log/activity-log.service";
import { ok } from "@/lib/http";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [
      RoleName.SUPER_ADMIN,
      RoleName.ADMIN,
      RoleName.STAFF,
    ]);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;
    const action = searchParams.get("action") || undefined;
    const entityType = searchParams.get("entityType") || undefined;
    const organizationId = searchParams.get("organizationId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const logs = await getActivityLogs({
      search,
      role,
      action,
      entityType,
      organizationId: user.role === RoleName.SUPER_ADMIN ? organizationId : (user.organizationId || undefined),
      limit,
      offset,
    });

    return ok(logs);
  });
}
