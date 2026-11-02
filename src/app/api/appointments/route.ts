import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { createAppointment, listAppointments } from "@/features/appointments/appointment.service";
import { requireUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const queryOrgId = searchParams.get("organizationId");
    const orgId = auth.organizationId || (auth.role === "SUPER_ADMIN" ? queryOrgId : undefined);
    return ok(await listAppointments({ role: auth.role, userId: auth.sub, organizationId: orgId }));
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await requireUser(req);
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const origin = `${protocol}://${host}`;

    return ok(
      await createAppointment(
        await req.json(),
        {
          role: auth.role,
          userId: auth.sub,
          organizationId: auth.organizationId,
        },
        origin
      ),
      201
    );
  });
}
