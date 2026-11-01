import { RoleName } from "@prisma/client";
import { requirePageUser } from "@/lib/auth/page-auth";
import { db } from "@/lib/db";
import { PatientDashboardView } from "@/components/patient/patient-dashboard-view";

export default async function PatientDashboardPage() {
  const user = await requirePageUser([RoleName.PATIENT]);

  let patient = await db.patient.findUnique({
    where: { userId: user.id },
    include: { user: true },
  });

  // Auto-initialize patient record if missing
  if (!patient) {
    patient = await db.patient.create({
      data: { userId: user.id },
      include: { user: true },
    });
  }

  const appointments = await db.appointment.findMany({
    where: { patientId: patient.id },
    include: { doctor: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  type PatientPrescriptionItem = Awaited<
    ReturnType<
      typeof db.prescription.findMany<{
        where: { patientId: string };
        include: {
          doctor: { include: { user: true } };
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
        doctor: { include: { user: true } },
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
          doctor: { include: { user: true } },
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
    appointmentDate: a.appointmentDate.toISOString(),
    doctor: {
      user: {
        name: a.doctor.user.name,
      },
      specialization: a.doctor.specialization,
      chamberAddress: a.doctor.chamberAddress,
    },
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
    />
  );
}
