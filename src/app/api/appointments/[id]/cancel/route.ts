import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { cancelAppointment } from "@/features/appointments/appointment.service";
import { requireUser } from "@/lib/auth/session";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));

    const result = await cancelAppointment(
      id,
      {
        role: auth.role,
        userId: auth.sub,
      },
      {
        reason: body.reason,
        refundChoice: body.refundChoice,
        refundAmount: body.refundAmount,
      }
    );

    return ok(result);
  });
}
