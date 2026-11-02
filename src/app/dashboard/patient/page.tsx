import { RoleName } from "@prisma/client";
import { requirePageUser } from "@/lib/auth/page-auth";
import { db } from "@/lib/db";
import { PatientDashboardView } from "@/components/patient/patient-dashboard-view";

export default async function PatientDashboardPage() {
  const user = await requirePageUser([RoleName.PATIENT]);

  let patient = await db.patient.findUnique({
    where: { userId: user.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  // Auto-initialize patient record if missing
  if (!patient) {
    patient = await db.patient.create({
      data: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  const [appointments, doctors] = await Promise.all([
    db.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.doctor.findMany({
      where: { available: true },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  type PatientPrescriptionItem = Awaited<
    ReturnType<
      typeof db.prescription.findMany<{
        where: { patientId: string };
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            };
          };
          versions: {
            select: {
              id: true;
              versionNumber: true;
              changeReason: true;
              createdAt: true;
            };
          };
        };
      }>
    >
  >[number];

  let prescriptions: PatientPrescriptionItem[] = [];
  try {
    prescriptions = await db.prescription.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        versions: {
          select: {
            id: true,
            versionNumber: true,
            changeReason: true,
            createdAt: true,
          },
          orderBy: { versionNumber: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
    });
  } catch {
    try {
      const base = await db.prescription.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 30,
      });
      prescriptions = base.map((p) => ({
        ...p,
        versions: [],
      })) as PatientPrescriptionItem[];
    } catch {
      prescriptions = [];
    }
  }

  const serializedAppointments = appointments.map((a) => ({
    id: a.id,
    serialNumber: a.serialNumber,
    status: a.status,
    notes: a.notes,
    visitType: a.visitType,
    fee:
      a.fee !== null && a.fee !== undefined
        ? a.fee
        : a.visitType === "REPORT_REVIEW"
        ? 0
        : a.visitType === "FOLLOWUP"
        ? (a.doctor.followupFee ?? 30)
        : (a.doctor.newPatientFee ?? 50),
    paymentStatus: a.paymentStatus,
    paymentMethod: a.paymentMethod,
    appointmentDate: a.appointmentDate.toISOString(),
    refundStatus: a.refundStatus,
    refundAmount: a.refundAmount,
    refundReason: a.refundReason,
    cancellationReason: a.cancellationReason,
    cancelledAt: a.cancelledAt ? a.cancelledAt.toISOString() : null,
    cancelledByRole: a.cancelledByRole,
    verifiedAt: a.verifiedAt ? a.verifiedAt.toISOString() : null,
    verifiedBy: a.verifiedBy,
    verificationNotes: a.verificationNotes,
    doctor: {
      id: a.doctor.id,
      user: {
        name: a.doctor.user.name,
      },
      specialization: a.doctor.specialization,
      chamberAddress: a.doctor.chamberAddress,
      newPatientFee: a.doctor.newPatientFee ?? 50,
      followupFee: a.doctor.followupFee ?? 30,
      reportFreeDays: a.doctor.reportFreeDays ?? 2,
      cancellationWindowHours: a.doctor.cancellationWindowHours ?? 24,
    },
  }));

  const serializedDoctors = doctors.map((d) => ({
    id: d.id,
    name: d.user.name,
    imageUrl: d.user.imageUrl,
    specialization: d.specialization,
    degrees: d.degrees,
    designation: d.designation,
    hospital: d.hospital,
    chamberAddress: d.chamberAddress,
    visitingHours: d.visitingHours,
    consultationFee: d.consultationFee,
    newPatientFee: d.newPatientFee ?? 50,
    followupFee: d.followupFee ?? 30,
    followupValidityDays: d.followupValidityDays ?? 90,
    reportFreeDays: d.reportFreeDays ?? 2,
    schedule: d.scheduleJson as {
      days?: string[] | string;
      startTime?: string;
      endTime?: string;
      hours?: string;
      chamber?: string;
    } | null,
  }));

  const serializedPrescriptions = prescriptions.map((p) => ({
    id: p.id,
    version: p.version,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    doctor: {
      specialization: p.doctor.specialization,
      hospital: p.doctor.hospital,
      user: {
        name: p.doctor.user.name,
      },
    },
    versions: (p.versions || []).map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      changeReason: v.changeReason,
      createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
    })),
  }));

  return (
    <PatientDashboardView
      patientName={patient.user.name}
      initialAppointments={serializedAppointments}
      prescriptions={serializedPrescriptions}
      doctors={serializedDoctors}
    />
  );
}
