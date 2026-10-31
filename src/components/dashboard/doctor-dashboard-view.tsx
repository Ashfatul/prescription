"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { DoctorQueue } from "@/components/dashboard/doctor-queue";
import { DoctorProfileEditor } from "@/components/dashboard/doctor-profile-editor";
import { PrescriptionEditor } from "@/components/dashboard/prescription-editor";
import { CatalogManager } from "@/components/dashboard/catalog-manager";
import { TemplateManager } from "@/components/dashboard/template-manager";

type DoctorData = {
  id: string;
  specialization: string;
  degrees?: string | null;
  designation?: string | null;
  hospital?: string | null;
  bmdcRegNo?: string | null;
  chamberAddress?: string | null;
  contactNumber?: string | null;
  available: boolean;
  user: {
    name: string;
    email: string;
    phone?: string | null;
  };
};

type AppointmentData = {
  id: string;
  serialNumber: number;
  status: string;
  appointmentDate: string;
  patientId: string;
  patient: {
    id: string;
    user: {
      name: string;
      email: string;
      phone?: string | null;
    };
    gender?: string | null;
  };
};

type PatientData = {
  id: string;
  user: {
    name: string;
    email: string;
    phone?: string | null;
  };
  gender?: string | null;
};

type PrescriptionSummary = {
  id: string;
  createdAt: string | Date;
  medicinesJson: unknown;
  testsJson: unknown;
  patient: {
    user: {
      name: string;
    };
  };
};

export type DoctorTabType = "prescription" | "queue" | "catalog" | "templates" | "profile" | "history";

export function DoctorDashboardView({
  doctor: initialDoctor,
  appointments,
  patients,
  recentPrescriptions,
}: {
  doctor: DoctorData;
  appointments: AppointmentData[];
  patients: PatientData[];
  recentPrescriptions: PrescriptionSummary[];
}) {
  const [doctor, setDoctor] = useState<DoctorData>(initialDoctor);
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlTab = searchParams.get("tab");
  const activeTab: DoctorTabType =
    urlTab === "catalog"
      ? "catalog"
      : urlTab === "templates"
      ? "templates"
      : urlTab === "profile"
      ? "profile"
      : urlTab === "queue"
      ? "queue"
      : urlTab === "history"
      ? "history"
      : "prescription";

  const handleTabChange = (tab: DoctorTabType) => {
    router.replace(`/dashboard/doctor?tab=${tab}`);
  };

  const handleProfileUpdated = (updated: Partial<DoctorData>) => {
    setDoctor((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Clinical Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-[var(--bg-surface)] p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] px-3 py-1 text-xs font-bold">
                Doctor Practice Portal
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  doctor.available
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                {doctor.available ? "● Active Consultation Queue" : "○ Queue Paused"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {doctor.user.name}
            </h1>
            <p className="text-sm font-semibold text-[var(--brand-text)] mt-0.5">
              {doctor.degrees ? `${doctor.degrees} • ` : ""}
              {doctor.specialization}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              {doctor.hospital && (
                <span>
                  🏥 Working for: <strong className="text-slate-800 dark:text-slate-200">{doctor.hospital}</strong>
                </span>
              )}
              {doctor.designation && <span>• {doctor.designation}</span>}
              {doctor.bmdcRegNo && <span>• BMDC: <strong>{doctor.bmdcRegNo}</strong></span>}
            </div>
          </div>

          {/* Quick Tab Switcher Pill Bar */}
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleTabChange("prescription")}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "prescription"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              📝 Prescribe
            </button>
            <button
              onClick={() => handleTabChange("queue")}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "queue"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              🩺 Queue ({appointments.length})
            </button>
            <button
              onClick={() => handleTabChange("catalog")}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "catalog"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              💊 Catalog
            </button>
            <button
              onClick={() => handleTabChange("templates")}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "templates"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              📋 Templates
            </button>
            <button
              onClick={() => handleTabChange("profile")}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "profile"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              👤 Profile
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "history"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              📜 History ({recentPrescriptions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Professional Prescription Generator */}
      {activeTab === "prescription" && (
        <PrescriptionEditor
          doctor={doctor}
          appointments={appointments}
          patients={patients}
        />
      )}

      {/* Tab 2: Live Queue & Today's Appointments */}
      {activeTab === "queue" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <DoctorQueue doctorId={doctor.id} />

          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Today&apos;s Booked Appointments
                </h2>
                <p className="text-xs text-slate-500">Live patient schedule queue</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {appointments.length} patients waiting
              </span>
            </div>

            <div className="space-y-2.5">
              {appointments.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  No appointments scheduled for today.
                </p>
              ) : (
                appointments.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-app)] border border-slate-200/70 dark:border-slate-800/70 text-sm transition hover:border-[var(--brand-border)]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[var(--brand-surface)] px-2 py-0.5 text-xs font-bold text-[var(--brand-text)]">
                          Serial #{item.serialNumber}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.patient.user.name}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.patient.user.email} • {item.patient.gender || "Patient"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTabChange("prescription")}
                      className="rounded-xl bg-[var(--brand-primary)] px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90 shadow-xs"
                    >
                      Prescribe
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pharmaceutical & Diagnostic Test Catalog */}
      {activeTab === "catalog" && <CatalogManager />}

      {/* Tab 4: Hospital & Prescription Templates */}
      {activeTab === "templates" && <TemplateManager />}

      {/* Tab 5: Doctor Profile & Chamber Settings */}
      {activeTab === "profile" && (
        <DoctorProfileEditor doctor={doctor} onSaved={handleProfileUpdated} />
      )}

      {/* Tab 6: Prescription History & Archive */}
      {activeTab === "history" && (
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Prescription Archive
              </h2>
              <p className="text-xs text-slate-500">
                View, re-print, and inspect previously issued prescriptions
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTabChange("prescription")}
              className="rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-xs font-bold text-white shadow-xs"
            >
              + Create New
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentPrescriptions.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                No past prescriptions found in your archive.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
                    <th className="pb-3">Patient Name</th>
                    <th className="pb-3">Date Issued</th>
                    <th className="pb-3">Medicines</th>
                    <th className="pb-3">Lab Tests</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentPrescriptions.map((p) => {
                    const medCount = Array.isArray(p.medicinesJson) ? p.medicinesJson.length : 0;
                    const testCount = Array.isArray(p.testsJson) ? p.testsJson.length : 0;
                    const dateStr = new Date(p.createdAt).toLocaleDateString();

                    return (
                      <tr key={p.id} className="text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                          {p.patient.user.name}
                        </td>
                        <td className="py-3.5 text-slate-500">{dateStr}</td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {medCount} items
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {testCount} items
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <Link
                            href={`/prescriptions/${p.id}/print`}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] px-3 py-1.5 text-xs font-bold transition hover:opacity-90 shadow-xs"
                          >
                            <span>🖨️ View & Print</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
