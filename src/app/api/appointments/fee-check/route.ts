import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { calculateDoctorConsultationFee } from "@/features/appointments/appointment.service";
import { getAuthFromRequest } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { RoleName } from "@prisma/client";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const auth = await getAuthFromRequest(req);
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    let patientId = searchParams.get("patientId");

    if (!doctorId) {
      throw new AppError("doctorId parameter is required", 400);
    }

    // If caller is a patient and no patientId provided, look up caller's patient record
    if (!patientId && auth && auth.role === RoleName.PATIENT) {
      const patient = await db.patient.findUnique({
        where: { userId: auth.sub },
        select: { id: true },
      });
      patientId = patient?.id || null;
    }

    const feeBreakdown = await calculateDoctorConsultationFee(doctorId, patientId || undefined);
    return ok(feeBreakdown);
  });
}
