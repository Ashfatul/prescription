import { NextRequest } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { AppointmentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";

function formatSafePatientName(fullName?: string | null, serialNumber?: number): string {
  if (!fullName || fullName.trim().length === 0) {
    return `Patient #${serialNumber || ""}`.trim();
  }
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0];
  }
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || "";
  return `${firstName} ${lastInitial}.`;
}

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // 1. Fetch all doctors with their public safe credentials
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

    if (doctors.length === 0) {
      return ok({ doctors: [], timestamp: new Date().toISOString() });
    }

    const doctorIds = doctors.map((d) => d.id);

    // 2. Fetch all today's appointments across these doctors in a single batch query
    const appointments = await db.appointment.findMany({
      where: {
        doctorId: { in: doctorIds },
        appointmentDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        doctorId: true,
        serialNumber: true,
        status: true,
        appointmentDate: true,
        patient: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { serialNumber: "asc" },
    });

    // Group appointments by doctorId
    const apptsByDoctor = new Map<string, typeof appointments>();
    for (const appt of appointments) {
      const list = apptsByDoctor.get(appt.doctorId) || [];
      list.push(appt);
      apptsByDoctor.set(appt.doctorId, list);
    }

    const payload = doctors.map((doctor) => {
      const docAppts = apptsByDoctor.get(doctor.id) || [];

      const completed = docAppts.filter((a) => a.status === AppointmentStatus.COMPLETED);
      const booked = docAppts.filter((a) => a.status === AppointmentStatus.BOOKED);
      const cancelled = docAppts.filter((a) => a.status === AppointmentStatus.CANCELLED);

      const currentAppt = booked.length > 0 ? booked[0] : null;
      const nextAppt = booked.length > 1 ? booked[1] : null;
      const previousAppt = completed.length > 0 ? completed[completed.length - 1] : null;

      const currentSerial = currentAppt
        ? currentAppt.serialNumber
        : completed.length > 0
          ? completed[completed.length - 1].serialNumber
          : 0;

      const currentPatient = currentAppt
        ? {
            serialNumber: currentAppt.serialNumber,
            safeName: formatSafePatientName(
              currentAppt.patient.user.name,
              currentAppt.serialNumber
            ),
            status: "IN_CHAMBER",
          }
        : null;

      const previousPatient = previousAppt
        ? {
            serialNumber: previousAppt.serialNumber,
            safeName: formatSafePatientName(
              previousAppt.patient.user.name,
              previousAppt.serialNumber
            ),
            status: "COMPLETED",
          }
        : null;

      const nextPatient = nextAppt
        ? {
            serialNumber: nextAppt.serialNumber,
            safeName: formatSafePatientName(
              nextAppt.patient.user.name,
              nextAppt.serialNumber
            ),
            status: "WAITING_IN_LOBBY",
          }
        : null;

      const upcomingPatients = booked.slice(2, 7).map((item) => ({
        serialNumber: item.serialNumber,
        safeName: formatSafePatientName(item.patient.user.name, item.serialNumber),
        status: "QUEUED",
      }));

      const missedPatients = cancelled.map((item) => ({
        serialNumber: item.serialNumber,
        safeName: formatSafePatientName(item.patient.user.name, item.serialNumber),
        status: "MISSED",
      }));

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
        visitingHours: doctor.visitingHours,
        consultationFee: doctor.consultationFee,
        available: doctor.available,
        currentSerial,
        totalToday: docAppts.length,
        completedCount: completed.length,
        waitingCount: booked.length,
        missedCount: cancelled.length,
        currentPatient,
        previousPatient,
        nextPatient,
        upcomingPatients,
        missedPatients,
      };
    });

    return ok({
      doctors: payload,
      timestamp: new Date().toISOString(),
    });
  });
}
