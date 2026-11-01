import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { createUser, listUsers } from "@/features/users/user.service";
import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const queryOrgId = searchParams.get("organizationId");

    // Clinic admins and staff are scoped strictly to their own clinic
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
    const user = await requireUser(req, [
      RoleName.SUPER_ADMIN,
      RoleName.ADMIN,
      RoleName.STAFF,
    ]);
    const body = await req.json();

    // Prevent non-super-admins from creating super admins
    if (user.role !== RoleName.SUPER_ADMIN && body.role === RoleName.SUPER_ADMIN) {
      throw new AppError("Only platform Super Admins can provision Super Admin accounts", 403);
    }

    // Clinic admins automatically create doctors/staff for their own clinic
    if (user.organizationId) {
      body.organizationId = user.organizationId;
    }

    return ok(await createUser(body, user.sub), 201);
  });
}
