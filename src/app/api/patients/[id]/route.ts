import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { deletePatient, updatePatient } from "@/features/patients/patient.service";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF]);
    const { id } = await context.params;

    if (user.role !== RoleName.SUPER_ADMIN && user.organizationId) {
      const existing = await db.patient.findUnique({
        where: { id },
        include: { user: { select: { organizationId: true } } },
      });
      if (
        existing &&
        existing.organizationId !== user.organizationId &&
        existing.user.organizationId !== user.organizationId
      ) {
        throw new AppError("Forbidden: cannot modify a patient from another clinic", 403);
      }
    }

    return ok(await updatePatient(id, await req.json()));
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.ADMIN]);
    const { id } = await context.params;

    if (user.role !== RoleName.SUPER_ADMIN && user.organizationId) {
      const existing = await db.patient.findUnique({
        where: { id },
        include: { user: { select: { organizationId: true } } },
      });
      if (
        existing &&
        existing.organizationId !== user.organizationId &&
        existing.user.organizationId !== user.organizationId
      ) {
        throw new AppError("Forbidden: cannot delete a patient from another clinic", 403);
      }
    }

    return ok(await deletePatient(id));
  });
}
