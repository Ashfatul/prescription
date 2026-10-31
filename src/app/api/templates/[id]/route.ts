import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { templateService } from "@/features/templates/template.service";

import { AppError } from "@/lib/errors";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    const { id } = await context.params;
    const item = await templateService.get(id);
    if (!item) {
      throw new AppError("Template not found", 404);
    }
    return ok(item);
  });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.DOCTOR]);
    const { id } = await context.params;
    return ok(await templateService.update(id, await req.json()));
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.DOCTOR]);
    const { id } = await context.params;
    await templateService.delete(id);
    return ok({ deleted: true });
  });
}
