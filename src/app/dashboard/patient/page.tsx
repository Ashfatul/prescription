import Link from "next/link";
import { RoleName } from "@prisma/client";
import { Card } from "@/components/common/card";
import { requirePageUser } from "@/lib/auth/page-auth";
import { db } from "@/lib/db";

export default async function PatientDashboardPage() {
  const user = await requirePageUser([RoleName.PATIENT]);

  const patient = await db.patient.findUnique({ where: { userId: user.id } });
  if (!patient) {
    return <p>Patient profile is not configured yet.</p>;
  }

  const [appointments, prescriptions] = await Promise.all([
    db.appointment.findMany({
      where: { patientId: patient.id },
      include: { doctor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.prescription.findMany({
      where: { patientId: patient.id },
      include: { doctor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Appointments</h2>
        <div className="space-y-2 text-sm">
          {appointments.map((item) => (
            <div key={item.id} className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800">
              <div className="font-medium">Dr. {item.doctor.user.name}</div>
              <div className="text-xs text-zinc-500">Serial #{item.serialNumber}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Prescriptions</h2>
        <div className="space-y-2 text-sm">
          {prescriptions.map((item) => (
            <div key={item.id} className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800">
              <div className="font-medium">Dr. {item.doctor.user.name}</div>
              <Link className="text-xs text-teal-700" href={`/prescriptions/${item.id}/print`} target="_blank">
                Printable View
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
