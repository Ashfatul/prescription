import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { createAppointment, listAppointments } from "@/features/appointments/appointment.service";
import { requireUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    return ok(await listAppointments({ role: auth.role, userId: auth.sub }));
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    return ok(await createAppointment(await req.json()), 201);
  });
}
