import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { medicineService } from "@/features/catalog/catalog.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const queryOrgId = searchParams.get("organizationId");

    let orgId: string | undefined = user.organizationId || undefined;
    if (user.role === RoleName.SUPER_ADMIN && !user.organizationId) {
      orgId = queryOrgId || undefined;
    }

    return ok(await medicineService.list(orgId));
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [
      RoleName.SUPER_ADMIN,
      RoleName.ADMIN,
      RoleName.STAFF,
      RoleName.DOCTOR,
    ]);
    const body = await req.json();
    const orgId = user.organizationId || body.organizationId || undefined;
    return ok(await medicineService.create(body, orgId), 201);
  });
}
