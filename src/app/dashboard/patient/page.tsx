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

  const [appointments, prescriptions] = await Promise.all([
    db.appointment.findMany({
      where: { patientId: patient.id },
      include: { doctor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.prescription.findMany({
      where: { patientId: patient.id },
      include: { doctor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <PatientDashboardView
      patientName={patient.user.name}
      initialAppointments={appointments}
      prescriptions={prescriptions}
    />
  );
}
