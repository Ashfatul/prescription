import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { getDoctorQueue } from "@/features/doctors/doctor.service";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(req, async () => {
    const { id } = await context.params;
    return ok(await getDoctorQueue(id));
  });
}
