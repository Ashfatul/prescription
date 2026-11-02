import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { deleteAppointment, updateAppointment } from "@/features/appointments/appointment.service";
import { requireUser } from "@/lib/auth/session";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const { id } = await context.params;
    return ok(
      await updateAppointment(id, await req.json(), {
        role: auth.role,
        userId: auth.sub,
      })
    );
  });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    await requireUser(req);
    const { id } = await context.params;
    return ok(await deleteAppointment(id));
  });
}
