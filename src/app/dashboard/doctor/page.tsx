import Link from "next/link";
import { Card } from "@/components/common/card";
import { DoctorQueue } from "@/components/dashboard/doctor-queue";
import { QuickPrescriptionForm } from "@/components/dashboard/quick-prescription-form";
import { requirePageUser } from "@/lib/auth/page-auth";
import { db } from "@/lib/db";

export default async function DoctorDashboardPage() {
  const user = await requirePageUser(["DOCTOR"]);

  const doctor = await db.doctor.findUnique({ where: { userId: user.id } });
  if (!doctor) {
    return <p>Doctor profile is not configured yet.</p>;
  }

  const todaysAppointments = await db.appointment.findMany({
    where: { doctorId: doctor.id },
    include: { patient: { include: { user: true } } },
    orderBy: { serialNumber: "asc" },
    take: 10,
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DoctorQueue doctorId={doctor.id} />

      <Card>
        <h2 className="mb-2 text-lg font-semibold">Today Appointments</h2>
        <div className="space-y-2">
          {todaysAppointments.map((item: (typeof todaysAppointments)[number]) => (
            <div key={item.id} className="rounded-lg bg-zinc-100 p-2 text-sm dark:bg-zinc-800">
              <div className="flex justify-between">
                <span>#{item.serialNumber}</span>
                <span>{item.patient.user.name}</span>
              </div>
              <div className="mt-1 text-xs text-zinc-500">Status: {item.status}</div>
            </div>
          ))}
        </div>

        {todaysAppointments[0] && (
          <div className="mt-4">
            <QuickPrescriptionForm doctorId={doctor.id} patientId={todaysAppointments[0].patientId} />
          </div>
        )}

        <Link
          href="/api/prescriptions"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-lg bg-teal-600 px-3 py-1 text-sm text-white"
        >
          Prescription API
        </Link>
      </Card>
    </div>
  );
}
