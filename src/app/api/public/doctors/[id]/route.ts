import { NextRequest } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { AppointmentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { AppError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(req, async () => {
    const { id } = await context.params;
    const doctor = await db.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    const today = new Date();
    const [currentAppt, totalQueue] = await Promise.all([
      db.appointment.findFirst({
        where: {
          doctorId: doctor.id,
          appointmentDate: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
          status: AppointmentStatus.BOOKED,
        },
        orderBy: { serialNumber: "asc" },
        select: { serialNumber: true },
      }),
      db.appointment.count({
        where: {
          doctorId: doctor.id,
          appointmentDate: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
          status: {
            not: AppointmentStatus.CANCELLED,
          },
        },
      }),
    ]);

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
      currentSerial: currentAppt?.serialNumber ?? 0,
      totalQueue,
    });
  });
}
