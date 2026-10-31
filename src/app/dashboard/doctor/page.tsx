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

  const [todaysAppointments, patients, recentPrescriptions] = await Promise.all([
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
    db.prescription.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        template: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

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
    user: {
      name: p.user.name,
      email: p.user.email,
      phone: p.user.phone,
    },
  }));

  return (
    <DoctorDashboardView
      doctor={doctor}
      appointments={serializedAppointments}
      patients={serializedPatients}
      recentPrescriptions={recentPrescriptions}
    />
  );
}
