import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { confirmAppointment } from "@/features/appointments/appointment.service";
import { requireUser } from "@/lib/auth/session";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));

    const result = await confirmAppointment(
      id,
      {
        role: auth.role,
        userId: auth.sub,
      },
      body.verificationNotes || body.notes
    );

    return ok(result);
  });
}
