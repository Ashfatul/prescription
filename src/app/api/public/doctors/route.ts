import { NextRequest } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { AppointmentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const doctors = await db.doctor.findMany({
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const today = new Date();
    const doctorIds = doctors.map((d) => d.id);

    // Fetch earliest active booked appointment for today across all doctors in a single query
    const activeAppointments =
      doctorIds.length > 0
        ? await db.appointment.findMany({
            where: {
              doctorId: { in: doctorIds },
              appointmentDate: {
                gte: startOfDay(today),
                lte: endOfDay(today),
              },
              status: {
                in: [AppointmentStatus.CONFIRMED, AppointmentStatus.BOOKED],
              },
            },
            select: {
              doctorId: true,
              serialNumber: true,
            },
            orderBy: { serialNumber: "asc" },
          })
        : [];

    const currentSerialByDoctor = new Map<string, number>();
    for (const appt of activeAppointments) {
      if (!currentSerialByDoctor.has(appt.doctorId)) {
        currentSerialByDoctor.set(appt.doctorId, appt.serialNumber);
      }
    }

    const withQueue = doctors.map((doctor) => ({
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
      newPatientFee: doctor.newPatientFee ?? 50,
      followupFee: doctor.followupFee ?? 30,
      followupValidityDays: doctor.followupValidityDays ?? 90,
      reportFreeDays: doctor.reportFreeDays ?? 2,
      experienceYears: doctor.experienceYears,
      signatureUrl: doctor.signatureUrl,
      available: doctor.available,
      schedule: doctor.scheduleJson,
      currentSerial: currentSerialByDoctor.get(doctor.id) ?? 0,
    }));

    return ok(withQueue);
  });
}
