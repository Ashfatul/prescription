"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { DoctorQueue } from "@/components/dashboard/doctor-queue";
import { DoctorProfileEditor } from "@/components/dashboard/doctor-profile-editor";
import { PrescriptionEditor } from "@/components/dashboard/prescription-editor";
import { CatalogManager } from "@/components/dashboard/catalog-manager";
import { TemplateManager } from "@/components/dashboard/template-manager";
import { TestReportsManager } from "@/components/dashboard/test-reports-manager";
import { ClinicalChat } from "@/components/dashboard/clinical-chat";
import { PrescriptionShareModal } from "@/components/dashboard/prescription-share-modal";
import { AnnouncementsBanner } from "@/components/dashboard/announcements-banner";
import { AnnouncementsManager } from "@/components/dashboard/announcements-manager";
import { useAuth } from "@/lib/auth/auth-context";
import { Share2 } from "lucide-react";

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
  bio?: string | null;
  visitingHours?: string | null;
  consultationFee?: string | null;
  experienceYears?: string | null;
  signatureUrl?: string | null;
  user: {
    name: string;
    email: string;
    phone?: string | null;
    signatureUrl?: string | null;
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
    gender?: string | null;
    dateOfBirth?: string | null;
    medicalHistory?: string | null;
    user: {
      name: string;
      email: string;
      phone?: string | null;
    };
  };
};

type PatientData = {
  id: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  medicalHistory?: string | null;
  user: {
    name: string;
    email: string;
    phone?: string | null;
  };
};

type PrescriptionSummary = {
  id: string;
  version: number;
  patientId: string;
  appointmentId?: string | null;
  templateId?: string | null;
  medicinesJson: unknown;
  testsJson: unknown;
  vitalsJson?: unknown;
  clinicalInfoJson?: unknown;
  doctorOverrideJson?: unknown;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  patient: {
    id: string;
    gender?: string | null;
    dateOfBirth?: string | null;
    medicalHistory?: string | null;
    user: {
      name: string;
      email: string;
      phone?: string | null;
    };
  };
  versions?: Array<{
    id: string;
    versionNumber: number;
    changeReason?: string | null;
    medicinesJson?: unknown;
    testsJson?: unknown;
    vitalsJson?: unknown;
    clinicalInfoJson?: unknown;
    notes?: string | null;
    createdAt: string | Date;
  }>;
};

export type DoctorTabType =
  | "prescription"
  | "queue"
  | "catalog"
  | "tests"
  | "templates"
  | "profile"
  | "history"
  | "reports"
  | "chat"
  | "announcements";

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
  const { user: currentUser } = useAuth();
  const [doctor, setDoctor] = useState<DoctorData>(initialDoctor);
  const [prescriptionToRevise, setPrescriptionToRevise] = useState<PrescriptionSummary | null>(null);
  const [historyModalPrescription, setHistoryModalPrescription] = useState<PrescriptionSummary | null>(null);
  const [sharingPrescriptionId, setSharingPrescriptionId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlTab = searchParams.get("tab");
  const activeTab: DoctorTabType =
    urlTab === "catalog"
      ? "catalog"
      : urlTab === "tests"
      ? "tests"
      : urlTab === "templates"
      ? "templates"
      : urlTab === "profile"
      ? "profile"
      : urlTab === "queue"
      ? "queue"
      : urlTab === "history"
      ? "history"
      : urlTab === "reports"
      ? "reports"
      : urlTab === "chat"
      ? "chat"
      : urlTab === "announcements"
      ? "announcements"
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
      {/* Broadcast Announcements Banner */}
      <AnnouncementsBanner />

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

          {/* Quick Action Block */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-4 py-2.5">
              <span className="text-xs text-[var(--text-secondary)]">Queue Waiting:</span>
              <span className="rounded-full bg-[var(--brand-primary)] px-2.5 py-0.5 text-xs font-bold text-white">
                {appointments.length}
              </span>
            </div>

            {activeTab !== "prescription" && (
              <Link
                href="/dashboard/doctor"
                className="flex items-center gap-1.5 rounded-2xl bg-[var(--brand-primary)] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:brightness-110 transition"
              >
                <span>📝 Write Prescription</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Dashboard Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "prescription", label: "📝 Prescription Generator" },
          { id: "queue", label: `👥 Today's Queue (${appointments.length})` },
          { id: "catalog", label: "💊 Medicines Catalog" },
          { id: "tests", label: "🧪 Lab Investigations" },
          { id: "templates", label: "📑 Templates" },
          { id: "history", label: "📜 History & Archive" },
          { id: "profile", label: "👨‍⚕️ Profile & Signature" },
          { id: "announcements", label: "📢 Hospital Notices" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as DoctorTabType)}
              className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                isActive
                  ? "bg-[var(--brand-primary)] text-white shadow-sm"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Professional Prescription Generator */}
      {activeTab === "prescription" && (
        <PrescriptionEditor
          key={prescriptionToRevise ? prescriptionToRevise.id : "new-prescription"}
          doctor={doctor}
          appointments={appointments}
          patients={patients}
          initialPrescriptionToRevise={prescriptionToRevise}
          onCancelRevision={() => setPrescriptionToRevise(null)}
          onPrescriptionCreated={() => {
            setPrescriptionToRevise(null);
            router.refresh();
          }}
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

      {/* Tab 3: Pharmaceutical Catalog */}
      {activeTab === "catalog" && <CatalogManager initialTab="medicines" />}

      {/* Tab: Diagnostic Lab Tests */}
      {activeTab === "tests" && <CatalogManager initialTab="tests" />}

      {/* Tab 4: Hospital & Prescription Templates */}
      {activeTab === "templates" && <TemplateManager />}

      {/* Tab 5: Doctor Profile & Chamber Settings */}
      {activeTab === "profile" && (
        <DoctorProfileEditor doctor={doctor} onSaved={handleProfileUpdated} />
      )}

      {/* Tab: Diagnostic Test Reports */}
      {activeTab === "reports" && <TestReportsManager role="DOCTOR" />}

      {/* Tab: Doctor-Patient Clinical Chat */}
      {activeTab === "chat" && currentUser && (
        <ClinicalChat currentUserId={currentUser.id} />
      )}

      {/* Tab: Hospital Bulletins & Announcements */}
      {activeTab === "announcements" && (
        <AnnouncementsManager canManage={false} userRole="DOCTOR" />
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
                    <th className="pb-3">Version & Reason</th>
                    <th className="pb-3">Last Updated</th>
                    <th className="pb-3">Medicines</th>
                    <th className="pb-3">Lab Tests</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentPrescriptions.map((p) => {
                    const medCount = Array.isArray(p.medicinesJson) ? p.medicinesJson.length : 0;
                    const testCount = Array.isArray(p.testsJson) ? p.testsJson.length : 0;
                    const dateStr = new Date(p.updatedAt || p.createdAt).toLocaleDateString();
                    const versionCount = p.versions ? p.versions.length : 1;
                    const latestReason = p.versions?.[0]?.changeReason || (p.version > 1 ? `Revision v${p.version}` : "Initial consultation");

                    return (
                      <tr key={p.id} className="text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {p.patient.user.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {p.patient.gender || "Patient"}{p.patient.user.phone ? ` • ${p.patient.user.phone}` : ""}
                          </p>
                        </td>

                        <td className="py-3.5">
                          <div className="flex flex-col gap-1 items-start">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] font-bold text-[11px]">
                                v{p.version || 1}
                              </span>
                              {versionCount > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setHistoryModalPrescription(p)}
                                  className="text-[10px] font-semibold text-slate-500 hover:text-[var(--brand-text)] underline cursor-pointer"
                                >
                                  {versionCount} revisions
                                </button>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 truncate max-w-[200px]" title={latestReason}>
                              ↳ {latestReason}
                            </span>
                          </div>
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
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setPrescriptionToRevise(p);
                                handleTabChange("prescription");
                              }}
                              title="Revise prescription and create a new version"
                              className="inline-flex items-center gap-1 rounded-xl bg-amber-500 text-white px-2.5 py-1.5 text-xs font-bold transition hover:bg-amber-600 shadow-xs cursor-pointer"
                            >
                              <span>✏️ Revise (v{(p.version || 1) + 1})</span>
                            </button>

                            <Link
                              href={`/prescriptions/${p.id}/print`}
                              target="_blank"
                              title="View & Print Latest Version"
                              className="inline-flex items-center gap-1 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] px-2.5 py-1.5 text-xs font-bold transition hover:opacity-90 shadow-xs"
                            >
                              <span>🖨️ Print</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => setSharingPrescriptionId(p.id)}
                              title="Share Prescription via Public Link, QR Code, or Email"
                              className="inline-flex items-center gap-1 rounded-xl bg-[var(--bg-subtle)] text-slate-700 dark:text-slate-300 border border-[var(--border-subtle)] px-2.5 py-1.5 text-xs font-bold hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share</span>
                            </button>

                            {versionCount > 1 && (
                              <button
                                type="button"
                                onClick={() => setHistoryModalPrescription(p)}
                                title="View All Historical Versions"
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                              >
                                <span>📜 History</span>
                              </button>
                            )}
                          </div>
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

      {/* Version History Modal */}
      {historyModalPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[var(--bg-surface)] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="modal-header shrink-0 flex items-start justify-between gap-4 p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text)]">
                  Prescription History & Revisions
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {historyModalPrescription.patient.user.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rx ID: <code className="font-mono">{historyModalPrescription.id}</code> • Total Versions: <strong>{historyModalPrescription.versions?.length || 1}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setHistoryModalPrescription(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Version Timeline Body */}
            <div className="modal-body flex-1 overflow-y-auto p-6 sm:p-8 space-y-3">
              {(historyModalPrescription.versions || []).map((ver, idx) => {
                const isLatest = ver.versionNumber === historyModalPrescription.version;
                const vMedCount = Array.isArray(ver.medicinesJson) ? ver.medicinesJson.length : 0;
                const vTestCount = Array.isArray(ver.testsJson) ? ver.testsJson.length : 0;
                const verDate = new Date(ver.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={ver.id || idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isLatest
                        ? "bg-[var(--brand-surface)]/40 border-[var(--brand-border)] shadow-xs"
                        : "bg-[var(--bg-app)] border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                              isLatest
                                ? "bg-[var(--brand-primary)] text-white"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            Version {ver.versionNumber}
                          </span>
                          {isLatest && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text)]">
                              ● Current Active
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            {verDate}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">
                          ↳ Reason: {ver.changeReason || "Prescription revision"}
                        </p>

                        <p className="text-[11px] text-slate-500 mt-1">
                          Snapshot: <strong>{vMedCount}</strong> medicines • <strong>{vTestCount}</strong> diagnostic tests
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <Link
                          href={`/prescriptions/${historyModalPrescription.id}/print?version=${ver.versionNumber}`}
                          target="_blank"
                          className="px-3.5 py-2 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold hover:bg-[var(--brand-primary)] hover:text-white transition shadow-xs"
                        >
                          🖨️ View & Print v{ver.versionNumber}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer shrink-0 p-4 sm:px-8 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const target = historyModalPrescription;
                  setHistoryModalPrescription(null);
                  setPrescriptionToRevise(target);
                  handleTabChange("prescription");
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition shadow-xs cursor-pointer"
              >
                ✏️ Create New Version (v{(historyModalPrescription.version || 1) + 1})
              </button>

              <button
                type="button"
                onClick={() => setHistoryModalPrescription(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Share Modal (Public Link, QR Code, Email) */}
      {sharingPrescriptionId && (
        <PrescriptionShareModal
          prescriptionId={sharingPrescriptionId}
          isOpen={!!sharingPrescriptionId}
          onClose={() => setSharingPrescriptionId(null)}
        />
      )}
    </div>
  );
}
