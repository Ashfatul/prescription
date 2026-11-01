import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";
import { getDoctorQueue } from "@/features/doctors/doctor.service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    const { id } = await context.params;
    const doctor = await db.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    const queue = await getDoctorQueue(doctor.id);

    return ok({
      id: doctor.id,
      name: doctor.user.name,
      email: doctor.user.email,
      imageUrl: doctor.user.imageUrl,
      specialization: doctor.specialization,
      degrees: doctor.degrees,
      designation: doctor.designation,
      hospital: doctor.hospital,
      bmdcRegNo: doctor.bmdcRegNo,
      chamberAddress: doctor.chamberAddress,
      contactNumber: doctor.contactNumber,
      bio: doctor.bio,
      visitingHours: doctor.visitingHours,
      consultationFee: doctor.consultationFee,
      experienceYears: doctor.experienceYears,
      signatureUrl: doctor.signatureUrl,
      available: doctor.available,
      schedule: doctor.scheduleJson,
      currentSerial: queue.currentSerial,
      totalQueue: queue.total,
    });
  });
}
