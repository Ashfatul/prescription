import { Card } from "@/components/common/card";
import { DoctorDashboardView } from "@/components/dashboard/doctor-dashboard-view";
import { requirePageUser } from "@/lib/auth/page-auth";
import { db } from "@/lib/db";

export default async function DoctorDashboardPage() {
  const user = await requirePageUser(["DOCTOR"]);

  const doctor = await db.doctor.findUnique({
    where: { userId: user.id },
    include: { user: true },
  });

  if (!doctor) {
    return (
      <Card>
        <h2 className="text-lg font-bold">Doctor Profile Not Found</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Your user account is not linked to a doctor record. Please contact the administrator.
        </p>
      </Card>
    );
  }

  const [todaysAppointments, patients] = await Promise.all([
    db.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { serialNumber: "asc" },
      take: 20,
    }),
    db.patient.findMany({
      include: {
        user: true,
      },
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  type PrescriptionItem = Awaited<
    ReturnType<
      typeof db.prescription.findMany<{
        where: { doctorId: string };
        include: {
          patient: { include: { user: true } };
          template: true;
          versions: true;
        };
      }>
    >
  >[number];

  let recentPrescriptions: PrescriptionItem[] = [];
  try {
    recentPrescriptions = await db.prescription.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        template: true,
        versions: {
          orderBy: { versionNumber: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
    });
  } catch (queryErr) {
    console.warn("Retrying prescription query with resilient fallback:", queryErr);
    try {
      const basePrescriptions = await db.prescription.findMany({
        where: { doctorId: doctor.id },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          template: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 30,
      });

      const pIds = basePrescriptions.map((p) => p.id);
      let allVersions: Array<{
        id: string;
        prescriptionId: string;
        versionNumber: number;
        changeReason?: string | null;
        medicinesJson: unknown;
        testsJson: unknown;
        vitalsJson?: unknown;
        clinicalInfoJson?: unknown;
        notes?: string | null;
        createdAt: Date;
      }> = [];

      try {
        if ("prescriptionVersion" in db) {
          allVersions = await (db as unknown as {
            prescriptionVersion: {
              findMany: (args: unknown) => Promise<typeof allVersions>;
            };
          }).prescriptionVersion.findMany({
            where: { prescriptionId: { in: pIds } },
            orderBy: { versionNumber: "desc" },
          });
        }
      } catch {
        allVersions = [];
      }

      recentPrescriptions = basePrescriptions.map((p) => ({
        ...p,
        versions: allVersions.filter((v) => v.prescriptionId === p.id),
      })) as PrescriptionItem[];
    } catch {
      recentPrescriptions = [];
    }
  }

  // Format appointments with serialized dates for client component
  const serializedAppointments = todaysAppointments.map((appt) => ({
    id: appt.id,
    serialNumber: appt.serialNumber,
    status: appt.status,
    appointmentDate: appt.appointmentDate.toISOString(),
    patientId: appt.patientId,
    patient: {
      id: appt.patient.id,
      gender: appt.patient.gender,
      dateOfBirth: appt.patient.dateOfBirth?.toISOString() || null,
      medicalHistory: appt.patient.medicalHistory || null,
      user: {
        name: appt.patient.user.name,
        email: appt.patient.user.email,
        phone: appt.patient.user.phone,
      },
    },
  }));

  const serializedPatients = patients.map((p) => ({
    id: p.id,
    gender: p.gender,
    dateOfBirth: p.dateOfBirth?.toISOString() || null,
    medicalHistory: p.medicalHistory || null,
    user: {
      name: p.user.name,
      email: p.user.email,
      phone: p.user.phone,
    },
  }));

  const serializedPrescriptions = (recentPrescriptions || []).map((p) => ({
    id: p.id,
    version: p.version,
    patientId: p.patientId,
    appointmentId: p.appointmentId,
    templateId: p.templateId,
    medicinesJson: p.medicinesJson,
    testsJson: p.testsJson,
    vitalsJson: p.vitalsJson,
    clinicalInfoJson: p.clinicalInfoJson,
    doctorOverrideJson: p.doctorOverrideJson,
    notes: p.notes,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
    patient: {
      id: p.patient?.id || p.patientId,
      gender: p.patient?.gender || null,
      dateOfBirth: p.patient?.dateOfBirth ? new Date(p.patient.dateOfBirth).toISOString() : null,
      medicalHistory: p.patient?.medicalHistory || null,
      user: {
        name: p.patient?.user?.name || "Patient",
        email: p.patient?.user?.email || "",
        phone: p.patient?.user?.phone || null,
      },
    },
    versions: (p.versions || []).map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      changeReason: v.changeReason,
      medicinesJson: v.medicinesJson,
      testsJson: v.testsJson,
      vitalsJson: v.vitalsJson,
      clinicalInfoJson: v.clinicalInfoJson,
      notes: v.notes,
      createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
    })),
  }));

  return (
    <DoctorDashboardView
      doctor={doctor}
      appointments={serializedAppointments}
      patients={serializedPatients}
      recentPrescriptions={serializedPrescriptions}
    />
  );
}
