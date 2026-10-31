"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/common/card";
import { DoctorQueue } from "@/components/dashboard/doctor-queue";
import { DoctorProfileEditor } from "@/components/dashboard/doctor-profile-editor";
import { PrescriptionEditor } from "@/components/dashboard/prescription-editor";

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
  const [activeTab, setActiveTab] = useState<"prescription" | "queue" | "profile" | "history">("prescription");

  const handleProfileUpdated = (updated: Partial<DoctorData>) => {
    setDoctor((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Professional Doctor Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-200/70 bg-gradient-to-r from-teal-50 via-white to-cyan-50 p-6 shadow-sm dark:border-teal-900/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-teal-950/30">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-teal-600 px-2.5 py-0.5 text-xs font-bold text-white">
                Doctor Portal
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  doctor.available
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                }`}
              >
                {doctor.available ? "● Active Serial Queue" : "○ Queue Paused"}
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              {doctor.user.name}
            </h1>
            <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">
              {doctor.degrees ? `${doctor.degrees} • ` : ""}
              {doctor.specialization}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              {doctor.hospital && <span>🏥 Working for: <strong className="text-zinc-800 dark:text-zinc-200">{doctor.hospital}</strong></span>}
              {doctor.designation && <span>• {doctor.designation}</span>}
              {doctor.bmdcRegNo && <span>• BMDC: {doctor.bmdcRegNo}</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("prescription")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                activeTab === "prescription"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              📝 Create Prescription
            </button>
            <button
              onClick={() => setActiveTab("queue")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                activeTab === "queue"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              🩺 Queue ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                activeTab === "profile"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              👤 Profile & Hospital
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                activeTab === "history"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              📋 History ({recentPrescriptions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Professional Prescription Generator */}
      {activeTab === "prescription" && (
        <div>
          <PrescriptionEditor
            doctor={doctor}
            appointments={appointments}
            patients={patients}
          />
        </div>
      )}

      {/* Tab 2: Live Queue & Today's Appointments */}
      {activeTab === "queue" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <DoctorQueue doctorId={doctor.id} />

          <Card>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Today&apos;s Booked Appointments</h2>
              <span className="text-xs text-zinc-500">{appointments.length} patients waiting</span>
            </div>

            <div className="mt-4 space-y-2.5">
              {appointments.length === 0 ? (
                <p className="py-6 text-sm text-zinc-500">No appointments scheduled for today.</p>
              ) : (
                appointments.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 text-sm transition hover:bg-zinc-100/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                          Serial #{item.serialNumber}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.patient.user.name}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.patient.user.email} • {item.patient.gender || "Patient"}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("prescription")}
                      className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-700"
                    >
                      Prescribe
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Doctor Profile & Hospital Affiliation */}
      {activeTab === "profile" && (
        <DoctorProfileEditor
          doctor={doctor}
          onSaved={handleProfileUpdated}
        />
      )}

      {/* Tab 4: Prescription History */}
      {activeTab === "history" && (
        <Card>
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold">Prescription Archive</h2>
              <p className="text-xs text-zinc-500">View and print previously generated prescriptions</p>
            </div>
            <button
              onClick={() => setActiveTab("prescription")}
              className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white"
            >
              + Create New
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            {recentPrescriptions.length === 0 ? (
              <p className="py-6 text-sm text-zinc-500">No prescriptions found.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-800">
                    <th className="pb-2">Patient</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Medicines</th>
                    <th className="pb-2">Tests</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {recentPrescriptions.map((p) => {
                    const medCount = Array.isArray(p.medicinesJson) ? p.medicinesJson.length : 0;
                    const testCount = Array.isArray(p.testsJson) ? p.testsJson.length : 0;
                    const dateStr = new Date(p.createdAt).toLocaleDateString();

                    return (
                      <tr key={p.id} className="text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="py-3 font-semibold text-zinc-800 dark:text-zinc-200">
                          {p.patient.user.name}
                        </td>
                        <td className="py-3 text-zinc-500">{dateStr}</td>
                        <td className="py-3 text-zinc-600 dark:text-zinc-400">{medCount} items</td>
                        <td className="py-3 text-zinc-600 dark:text-zinc-400">{testCount} items</td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/prescriptions/${p.id}/print`}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300"
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
        </Card>
      )}
    </div>
  );
}
