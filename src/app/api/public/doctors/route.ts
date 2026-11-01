import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { getDoctorQueue } from "@/features/doctors/doctor.service";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const doctors = await db.doctor.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    const withQueue = await Promise.all(
      doctors.map(async (doctor) => {
        const queue = await getDoctorQueue(doctor.id);
        return {
          id: doctor.id,
          name: doctor.user.name,
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
        };
      }),
    );

    return ok(withQueue);
  });
}
