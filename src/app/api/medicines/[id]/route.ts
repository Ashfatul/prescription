import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { medicineService } from "@/features/catalog/catalog.service";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.DOCTOR]);
    const { id } = await context.params;
    return ok(await medicineService.update(id, await req.json()));
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.STAFF]);
    const { id } = await context.params;
    await medicineService.delete(id);
    return ok({ deleted: true });
  });
}
