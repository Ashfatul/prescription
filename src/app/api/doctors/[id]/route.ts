import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { deleteDoctor, updateDoctor } from "@/features/doctors/doctor.service";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    const { id } = await context.params;
    const doctor = await db.doctor.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }
    return ok(doctor);
  });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.DOCTOR]);
    const { id } = await context.params;

    if (auth.role === RoleName.DOCTOR) {
      const existing = await db.doctor.findUnique({ where: { id } });
      if (!existing || existing.userId !== auth.sub) {
        throw new AppError("Forbidden: cannot modify another doctor's profile", 403);
      }
    }

    return ok(await updateDoctor(id, await req.json()));
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN]);
    const { id } = await context.params;
    return ok(await deleteDoctor(id));
  });
}
