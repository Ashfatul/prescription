import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { createUser, listUsers } from "@/features/users/user.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const orgId = user.role === RoleName.SUPER_ADMIN ? undefined : user.organizationId || undefined;
    return ok(await listUsers(orgId));
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.STAFF]);
    const body = await req.json();
    return ok(await createUser(body, user.sub), 201);
  });
}
