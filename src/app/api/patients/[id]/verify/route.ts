import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { verifyPatient } from "@/features/patients/patient.service";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    const user = await requireUser(req, [
      RoleName.SUPER_ADMIN,
      RoleName.ADMIN,
      RoleName.STAFF,
    ]);
    const { id } = await context.params;

    // Clinic boundary check
    if (user.role !== RoleName.SUPER_ADMIN && user.organizationId) {
      const existing = await db.patient.findUnique({
        where: { id },
        include: { user: { select: { organizationId: true } } },
      });
      if (
        existing &&
        existing.organizationId &&
        existing.organizationId !== user.organizationId &&
        existing.user.organizationId !== user.organizationId
      ) {
        throw new AppError("Forbidden: cannot verify a patient from another clinic", 403);
      }
    }

    const dbUser = await db.user.findUnique({ where: { id: user.sub } });
    const verifiedBy = dbUser?.name || user.role;

    const verified = await verifyPatient(id, verifiedBy);
    return ok(verified);
  });
}
