import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { createPatient, listPatients } from "@/features/patients/patient.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.DOCTOR]);
    return ok(await listPatients());
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.STAFF]);
    return ok(await createPatient(await req.json()), 201);
  });
}
