import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { createDoctor, listDoctors } from "@/features/doctors/doctor.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.STAFF, RoleName.DOCTOR]);
    return ok(await listDoctors());
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req, [RoleName.SUPER_ADMIN, RoleName.STAFF]);
    return ok(await createDoctor(await req.json()), 201);
  });
}
