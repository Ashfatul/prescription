import Link from "next/link";
import { RoleName } from "@prisma/client";
import { requirePageUser } from "@/lib/auth/page-auth";
import { db } from "@/lib/db";

export default async function PatientDashboardPage() {
  const user = await requirePageUser([RoleName.PATIENT]);

  const patient = await db.patient.findUnique({
    where: { userId: user.id },
    include: { user: true },
  });

  if (!patient) {
    return (
      <div className="p-8 text-center rounded-3xl bg-[var(--bg-surface)] border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold">Patient profile not found</h2>
        <p className="text-xs text-slate-500 mt-1">
          Please contact front desk staff to link your patient medical record.
        </p>
      </div>
    );
  }

  const [appointments, prescriptions] = await Promise.all([
    db.appointment.findMany({
      where: { patientId: patient.id },
      include: { doctor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.prescription.findMany({
      where: { patientId: patient.id },
      include: { doctor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Patient Welcome Header */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold">
            Patient Health Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Welcome back, {patient.user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Access your verified medical prescriptions, scheduled clinic appointments, and doctor advice.
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-semibold hover:opacity-90 transition-all shadow-xs self-start sm:self-auto"
        >
          <span>🗓️ Book New Consultation</span>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appointments List */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                My Appointments
              </h2>
              <p className="text-xs text-slate-500">Upcoming and previous chamber visits</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {appointments.length} Visits
            </span>
          </div>

          <div className="space-y-3">
            {appointments.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                You have no scheduled appointments.
              </p>
            ) : (
              appointments.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-[var(--brand-border)] transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.doctor.user.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] font-semibold">
                        {item.doctor.specialization}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Date: {new Date(item.appointmentDate).toLocaleDateString()} • Serial #{item.serialNumber}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${
                      item.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Medical Prescriptions
              </h2>
              <p className="text-xs text-slate-500">Official digital prescriptions issued by doctors</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {prescriptions.length} Records
            </span>
          </div>

          <div className="space-y-3">
            {prescriptions.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                No prescriptions have been issued yet.
              </p>
            ) : (
              prescriptions.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-[var(--brand-border)] transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.doctor.user.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] font-semibold">
                        {item.doctor.specialization}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Issued on {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    href={`/prescriptions/${item.id}/print`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold hover:opacity-90 transition-all shadow-xs shrink-0"
                  >
                    <span>🖨️ View & Print</span>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
