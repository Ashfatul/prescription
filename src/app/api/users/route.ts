import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { createUser, listUsers } from "@/features/users/user.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const queryOrgId = searchParams.get("organizationId");

    // Clinic admins and staff are scoped to their own clinic
    // Root platform super-admin (no organizationId) can inspect any clinic or all
    let orgId: string | undefined = user.organizationId || undefined;
    if (user.role === RoleName.SUPER_ADMIN && !user.organizationId) {
      orgId = queryOrgId || undefined;
    }

    return ok(await listUsers(orgId));
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.STAFF]);
    const body = await req.json();

    // Clinic admins automatically create doctors/staff for their own clinic
    if (user.organizationId && !body.organizationId) {
      body.organizationId = user.organizationId;
    }

    return ok(await createUser(body, user.sub), 201);
  });
}
