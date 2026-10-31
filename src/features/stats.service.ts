import { db } from "@/lib/db";

export async function getDashboardStats() {
  const [users, doctors, patients, appointments, prescriptions] = await Promise.all([
    db.user.count(),
    db.doctor.count(),
    db.patient.count(),
    db.appointment.count(),
    db.prescription.count(),
  ]);

  return {
    users,
    doctors,
    patients,
    appointments,
    prescriptions,
  };
}
