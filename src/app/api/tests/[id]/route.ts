import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { testService } from "@/features/catalog/catalog.service";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [
      RoleName.SUPER_ADMIN,
      RoleName.ADMIN,
      RoleName.STAFF,
      RoleName.DOCTOR,
    ]);
    const { id } = await context.params;

    if (user.role !== RoleName.SUPER_ADMIN && user.organizationId) {
      const existing = await db.diagnosticTest.findUnique({ where: { id } });
      if (existing && existing.organizationId && existing.organizationId !== user.organizationId) {
        throw new AppError("Forbidden: Cannot modify diagnostic tests of another clinic", 403);
      }
    }

    return ok(await testService.update(id, await req.json()));
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF]);
    const { id } = await context.params;

    if (user.role !== RoleName.SUPER_ADMIN && user.organizationId) {
      const existing = await db.diagnosticTest.findUnique({ where: { id } });
      if (existing && existing.organizationId && existing.organizationId !== user.organizationId) {
        throw new AppError("Forbidden: Cannot delete diagnostic tests of another clinic", 403);
      }
    }

    await testService.delete(id);
    return ok({ deleted: true });
  });
}
