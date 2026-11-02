import { NextRequest } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";
import { ok } from "@/lib/http";
import { isDemoModeActive } from "@/features/demo/demo-reset.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const { searchParams } = new URL(req.url);
    const clinicSlug = searchParams.get("clinic") || req.headers.get("x-clinic-slug") || null;
    const organizationId = searchParams.get("organizationId") || null;
    const isDemoMode = isDemoModeActive();

    const where: Prisma.DoctorWhereInput = {};

    if (organizationId) {
      // Scoped strictly by organization ID (used by tenant reception/dashboards)
      where.organization = {
        id: organizationId,
        status: { not: "SUSPENDED" },
      };
    } else if (clinicSlug) {
      // Filter strictly by the requested clinic
      where.organization = {
        slug: clinicSlug,
        status: { not: "SUSPENDED" },
        ...(isDemoMode ? {} : { isDemo: false, slug: { not: "ppms-clinic" } }),
      };
    } else if (!isDemoMode) {
      // Exclude demo clinic entirely when Demo Mode is off
      where.organization = {
        isDemo: false,
        slug: { not: "ppms-clinic" },
        status: { not: "SUSPENDED" },
      };
    } else {
      where.organization = {
        status: { not: "SUSPENDED" },
      };
    }

    const doctors = await db.doctor.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            isDemo: true,
          },
        },
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

    // Fetch earliest active booked appointment for today across these doctors in a single query
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
      hospital: doctor.hospital || doctor.organization?.name || null,
      clinicSlug: doctor.organization?.slug || null,
      isDemo: doctor.organization?.isDemo || false,
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
