"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { DoctorQueue } from "@/components/dashboard/doctor-queue";
import { DoctorProfileEditor } from "@/components/dashboard/doctor-profile-editor";
import { PrescriptionEditor } from "@/components/dashboard/prescription-editor";
import { CatalogManager } from "@/components/dashboard/catalog-manager";
import { TemplateManager } from "@/components/dashboard/template-manager";
import { ClinicalChat } from "@/components/dashboard/clinical-chat";
import { PrescriptionShareModal } from "@/components/dashboard/prescription-share-modal";
import { AnnouncementsBanner } from "@/components/dashboard/announcements-banner";
import { AnnouncementsManager } from "@/components/dashboard/announcements-manager";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Share2,
  Clock,
  Search,
  FileSearch,
  Paperclip,
  ExternalLink,
  ArrowRight,
  Activity,
  ShieldAlert,
  Phone,
  UserCheck,
} from "lucide-react";

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
  newPatientFee?: number | null;
  followupFee?: number | null;
  followupValidityDays?: number | null;
  reportFreeDays?: number | null;
  experienceYears?: string | null;
  signatureUrl?: string | null;
  user: {
    name: string;
    email: string;
    phone?: string | null;
    signatureUrl?: string | null;
  };
};

export type TestReportSummary = {
  id: string;
  title: string;
  description?: string | null;
  reportDate?: string | null;
  fileUrl: string;
  fileType: string;
  originalName: string;
  status?: string | null;
  notes?: string | null;
  createdAt: string;
};

export type AppointmentData = {
  id: string;
  serialNumber: number;
  status: string;
  appointmentDate: string;
  patientId: string;
  notes?: string | null;
  visitType?: string | null;
  fee?: number | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  diseasesJson?: unknown;
  allergiesJson?: unknown;
  medicalFlagsJson?: unknown;
  dietRequired?: boolean | null;
  dietInstructionsJson?: unknown;
  dietNotes?: string | null;
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
    testReports?: TestReportSummary[];
  };
};

export type PatientData = {
  id: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  medicalHistory?: string | null;
  user: {
    name: string;
    email: string;
    phone?: string | null;
  };
  testReports?: TestReportSummary[];
};

export type PrescriptionSummary = {
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
  appointments: initialAppointments,
  patients,
  recentPrescriptions,
}: {
  doctor: DoctorData;
  appointments: AppointmentData[];
  patients: PatientData[];
  recentPrescriptions: PrescriptionSummary[];
}) {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const [doctor, setDoctor] = useState<DoctorData>(initialDoctor);
  const [appointmentsState, setAppointmentsState] = useState<AppointmentData[]>(initialAppointments);
  const [prescriptionToRevise, setPrescriptionToRevise] = useState<PrescriptionSummary | null>(null);
  const [historyModalPrescription, setHistoryModalPrescription] = useState<PrescriptionSummary | null>(null);
  const [sharingPrescriptionId, setSharingPrescriptionId] = useState<string | null>(null);
  const [queueSearch, setQueueSearch] = useState("");
  const [reportsSearch, setReportsSearch] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  // Active Selected Appointment for Prescription
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(() => {
    return searchParams.get("appointmentId") || null;
  });

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

  const handleProfileUpdated = (updated: Partial<DoctorData>) => {
    setDoctor((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  // Waiting appointments for today (Requirement 2 & 3)
  const waitingAppointments = useMemo(
    () =>
      appointmentsState.filter(
        (a) => a.status === "CONFIRMED" || a.status === "BOOKED"
      ),
    [appointmentsState]
  );

  const completedAppointments = useMemo(
    () => appointmentsState.filter((a) => a.status === "COMPLETED"),
    [appointmentsState]
  );

  const nextWaitingAppt = waitingAppointments[0] || null;

  // Filtered waiting appointments based on search query
  const filteredWaiting = useMemo(() => {
    if (!queueSearch.trim()) return waitingAppointments;
    const q = queueSearch.toLowerCase();
    return waitingAppointments.filter(
      (a) =>
        a.serialNumber.toString().includes(q) ||
        a.patient.user.name.toLowerCase().includes(q) ||
        (a.patient.user.phone && a.patient.user.phone.toLowerCase().includes(q))
    );
  }, [waitingAppointments, queueSearch]);

  // Aggregate all patient test reports for reports tab (Requirement 12)
  const allPatientReports = useMemo(() => {
    const list: Array<TestReportSummary & { patientName: string; patientPhone?: string | null }> = [];
    const seen = new Set<string>();

    appointmentsState.forEach((a) => {
      (a.patient.testReports || []).forEach((r) => {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          list.push({
            ...r,
            patientName: a.patient.user.name,
            patientPhone: a.patient.user.phone,
          });
        }
      });
    });

    patients.forEach((p) => {
      (p.testReports || []).forEach((r) => {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          list.push({
            ...r,
            patientName: p.user.name,
            patientPhone: p.user.phone,
          });
        }
      });
    });

    return list;
  }, [appointmentsState, patients]);

  const filteredReports = useMemo(() => {
    if (!reportsSearch.trim()) return allPatientReports;
    const q = reportsSearch.toLowerCase();
    return allPatientReports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.patientName.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
    );
  }, [allPatientReports, reportsSearch]);

  const startConsultationForAppt = (apptId: string) => {
    setSelectedAppointmentId(apptId);
    setPrescriptionToRevise(null);
    router.replace(`/dashboard/doctor?tab=prescription&appointmentId=${apptId}`);
  };

  const handleCallNextPatient = () => {
    if (nextWaitingAppt) {
      startConsultationForAppt(nextWaitingAppt.id);
    } else {
      setSelectedAppointmentId(null);
      setPrescriptionToRevise(null);
      router.replace("/dashboard/doctor?tab=prescription");
    }
  };

  const handlePrescriptionCreated = (_id: string, completedApptId?: string) => {
    if (completedApptId) {
      setAppointmentsState((prev) =>
        prev.map((a) => (a.id === completedApptId ? { ...a, status: "COMPLETED" } : a))
      );
    }
    router.refresh();
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
                {t("uiAttendingPhysicianChamber")}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  doctor.available
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                {doctor.available
                  ? (t("uiActiveConsultationSession"))
                  : (t("uiChamberPaused"))}
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
                  🏥 {t("uiWorkingFor")} <strong className="text-slate-800 dark:text-slate-200">{doctor.hospital}</strong>
                </span>
              )}
              {doctor.designation && <span>• {doctor.designation}</span>}
              {doctor.bmdcRegNo && <span>• {t.bmdcRegNo}: <strong>{doctor.bmdcRegNo}</strong></span>}
            </div>
          </div>

          {/* Quick Queue Status Block */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-4 py-2.5">
              <span className="text-xs text-[var(--text-secondary)]">{t.chamberQueue}:</span>
              <span className="rounded-full bg-[var(--brand-primary)] px-2.5 py-0.5 text-xs font-bold text-white">
                {waitingAppointments.length}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[var(--bg-surface)] px-4 py-2.5 text-xs">
              <span className="text-slate-500">{t("uiCompletedToday")}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {completedAppointments.length}
              </span>
            </div>

            {nextWaitingAppt && !selectedAppointmentId && activeTab === "prescription" && (
              <button
                type="button"
                onClick={() => startConsultationForAppt(nextWaitingAppt.id)}
                className="flex items-center gap-1.5 rounded-2xl bg-[var(--brand-primary)] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:brightness-110 transition cursor-pointer"
              >
                <span>📞 {language === "bn" ? `সিরিয়াল #${nextWaitingAppt.serialNumber}-কে ডাকুন` : `Call Serial #${nextWaitingAppt.serialNumber}`}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: PRESCRIPTION FLOW (QUEUE-DRIVEN) */}
      {activeTab === "prescription" && (
        <>
          {selectedAppointmentId || prescriptionToRevise ? (
            /* Prescription Editor when a Queued Patient is Active */
            <PrescriptionEditor
              key={
                prescriptionToRevise
                  ? prescriptionToRevise.id
                  : `appt-${selectedAppointmentId || "active"}`
              }
              doctor={doctor}
              appointments={appointmentsState}
              patients={patients}
              selectedAppointmentId={selectedAppointmentId}
              initialPrescriptionToRevise={prescriptionToRevise}
              onCancelRevision={() => {
                setPrescriptionToRevise(null);
                setSelectedAppointmentId(null);
              }}
              onBackToQueue={() => {
                setSelectedAppointmentId(null);
                setPrescriptionToRevise(null);
                router.replace("/dashboard/doctor?tab=prescription");
              }}
              onPrescriptionCreated={handlePrescriptionCreated}
              onCallNextPatient={handleCallNextPatient}
            />
          ) : (
            /* Chamber Waiting Queue Console when No Patient is Selected (Requirement 2 & 8) */
            <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold">
                      {t("uiQueueDrivenConsultation")}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {t("uiSelectPatientToWritePrescription")}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {t("uiTodaySChamberWaitingQueue").replace("{count}", String(waitingAppointments.length))}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("uiPatientDemographicsTriageVitalsAnd2")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {nextWaitingAppt && (
                    <button
                      type="button"
                      onClick={() => startConsultationForAppt(nextWaitingAppt.id)}
                      className="px-5 py-3 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-extrabold shadow-md hover:opacity-95 transition cursor-pointer flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{language === "bn" ? `পরবর্তী রোগীকে ডাকুন (সিরিয়াল #${nextWaitingAppt.serialNumber})` : `Call Next Patient (Serial #${nextWaitingAppt.serialNumber})`}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={t.searchQueuePlaceholder}
                    value={queueSearch}
                    onChange={(e) => setQueueSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <span className="text-xs text-slate-400 font-medium shrink-0">
                  {language === "bn"
                    ? `${waitingAppointments.length} জনের মধ্যে ${filteredWaiting.length} জন দেখানো হচ্ছে`
                    : `Showing ${filteredWaiting.length} of ${waitingAppointments.length} waiting`}
                </span>
              </div>

              {/* Waiting Patients List */}
              {filteredWaiting.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[var(--bg-app)] border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t("uiNoPatientsCurrentlyWaitingIn")}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {waitingAppointments.length === 0
                      ? (t("uiAllQueuedPatientsHaveBeen"))
                      : (t("uiNoPatientsMatchedYourSearch"))}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {filteredWaiting.map((appt) => {
                    const diseases = Array.isArray(appt.diseasesJson) ? (appt.diseasesJson as string[]) : [];
                    const allergies = Array.isArray(appt.allergiesJson) ? (appt.allergiesJson as string[]) : [];
                    const reportCount = appt.patient.testReports?.length || 0;

                    return (
                      <div
                        key={appt.id}
                        className="p-5 rounded-2xl bg-[var(--bg-app)] border border-slate-200/90 dark:border-slate-800/90 hover:border-[var(--brand-border)] transition-all shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white font-mono font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                              #{appt.serialNumber}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                  {appt.patient.user.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                  ({appt.patient.gender || (t("rolePatient"))})
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                                {appt.patient.user.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{appt.patient.user.phone}</span>
                                  </span>
                                )}
                                <span>• {t.visitTypeLabel}: {appt.visitType || "Standard"}</span>
                                {appt.paymentStatus && (
                                  <span>• {t.statusLabel}: <strong className="text-emerald-600">{appt.paymentStatus}</strong></span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            {reportCount > 0 && (
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                                <Paperclip className="w-3 h-3" />
                                <span>{reportCount} {t.labReportsCount}</span>
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => startConsultationForAppt(appt.id)}
                              className="px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-extrabold shadow-sm hover:opacity-95 transition cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{t("uiStartConsultationPrescribe")}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Triage & Clinical Notes Strip */}
                        {appt.notes && (
                          <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span><strong>{t("uiTriageVitals")}</strong> {appt.notes}</span>
                          </div>
                        )}

                        {/* Allergy & Disease Badges */}
                        {(allergies.length > 0 || diseases.length > 0) && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                            {allergies.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 text-rose-600">
                                <ShieldAlert className="w-3 h-3" />
                                <span className="font-bold text-[11px]">{t.drugAllergiesWarnings}:</span>
                                {allergies.map((al) => (
                                  <span
                                    key={al}
                                    className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-200 dark:border-rose-900/40"
                                  >
                                    {al}
                                  </span>
                                ))}
                              </div>
                            )}

                            {diseases.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 text-slate-500 ml-2">
                                <span className="font-bold text-[11px]">{t.medicalHistoryStaff}:</span>
                                {diseases.map((dis) => (
                                  <span
                                    key={dis}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold"
                                  >
                                    {dis}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 2: CHAMBER QUEUE OVERVIEW */}
      {activeTab === "queue" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <DoctorQueue doctorId={doctor.id} />

          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t("uiTodaySBookedAppointments")}
                </h2>
                <p className="text-xs text-slate-500">{t("uiLivePatientTurnSequence")}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {waitingAppointments.length} {t("uiPatientsWaiting")}
              </span>
            </div>

            <div className="space-y-2.5">
              {appointmentsState.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  {t("uiNoAppointmentsScheduledForToday")}
                </p>
              ) : (
                appointmentsState.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200/70 dark:border-slate-800/70 text-sm transition hover:border-[var(--brand-border)] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-[var(--brand-surface)] px-2.5 py-1 text-xs font-black text-[var(--brand-text)] border border-[var(--brand-border)] font-mono">
                          {language === "bn" ? `সিরিয়াল #${item.serialNumber}` : `Serial #${item.serialNumber}`}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.patient.user.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({item.patient.gender || (t("rolePatient"))})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                          }`}
                        >
                          {item.status}
                        </span>

                        {item.status !== "COMPLETED" && (
                          <button
                            type="button"
                            onClick={() => startConsultationForAppt(item.id)}
                            className="rounded-xl bg-[var(--brand-primary)] px-3 py-1 text-xs font-bold text-white transition hover:opacity-90 shadow-xs cursor-pointer"
                          >
                            {t.prescriptions}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PATIENT LAB REPORTS (Requirement 12) */}
      {activeTab === "reports" && (
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>{t.attachedLabReportsScans}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {t("uiUploadedByHospitalTriageStaff")}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t.searchReportsPlaceholder}
                value={reportsSearch}
                onChange={(e) => setReportsSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredReports.length === 0 ? (
              <p className="py-12 text-center text-xs text-slate-400">
                {t.noReportsFound}
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-2.5 px-3">{t.reportTitle}</th>
                    <th className="py-2.5 px-3">{t("rolePatient")}</th>
                    <th className="py-2.5 px-3">{t.reportDate}</th>
                    <th className="py-2.5 px-3">{t("uiNotes2")}</th>
                    <th className="py-2.5 px-3 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {r.title}
                        </span>
                        <span className="text-[11px] text-slate-400">{r.originalName}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {r.patientName}
                        </span>
                        <span className="text-[11px] text-slate-400">{r.patientPhone || (t("uiNoPhone"))}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {r.reportDate ? new Date(r.reportDate).toLocaleDateString() : ""}
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                        {r.notes || r.description || "—"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <a
                          href={r.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-90 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{t.view}</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PHARMACEUTICAL CATALOG */}
      {activeTab === "catalog" && <CatalogManager initialTab="medicines" />}

      {/* TAB 5: DIAGNOSTIC LAB TESTS */}
      {activeTab === "tests" && <CatalogManager initialTab="tests" />}

      {/* TAB 6: TEMPLATES */}
      {activeTab === "templates" && <TemplateManager />}

      {/* TAB 7: PROFILE & CREDENTIALS */}
      {activeTab === "profile" && (
        <DoctorProfileEditor doctor={doctor} onSaved={handleProfileUpdated} />
      )}

      {/* TAB 8: CLINICAL CHAT */}
      {activeTab === "chat" && currentUser && (
        <ClinicalChat currentUserId={currentUser.id} />
      )}

      {/* TAB 9: ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <AnnouncementsManager canManage={false} userRole="DOCTOR" />
      )}

      {/* TAB 10: PRESCRIPTION ARCHIVE */}
      {activeTab === "history" && (
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.prescriptionHistoryTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.prescriptionHistorySubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedAppointmentId(null);
                setPrescriptionToRevise(null);
                router.replace("/dashboard/doctor?tab=prescription");
              }}
              className="rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              {t("uiCreateNew")}
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentPrescriptions.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                {t.noPrescriptionsFound}
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
                    <th className="pb-3">{t.patientName}</th>
                    <th className="pb-3">{t("uiVersionReason")}</th>
                    <th className="pb-3">{t("uiLastUpdated")}</th>
                    <th className="pb-3">{t.medications}</th>
                    <th className="pb-3">{t.investigations}</th>
                    <th className="pb-3 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentPrescriptions.map((p) => {
                    const medCount = Array.isArray(p.medicinesJson) ? p.medicinesJson.length : 0;
                    const testCount = Array.isArray(p.testsJson) ? p.testsJson.length : 0;
                    const dateStr = new Date(p.updatedAt || p.createdAt).toLocaleDateString();
                    const versionCount = p.versions ? p.versions.length : 1;
                    const latestReason =
                      p.versions?.[0]?.changeReason ||
                      (p.version > 1 ? `Revision v${p.version}` : "Initial consultation");

                    return (
                      <tr key={p.id} className="text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {p.patient.user.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {p.patient.gender || (t("rolePatient"))}
                            {p.patient.user.phone ? ` • ${p.patient.user.phone}` : ""}
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
                                  {versionCount} {t("uiRevisions")}
                                </button>
                              )}
                            </div>
                            <span
                              className="text-[11px] text-slate-500 truncate max-w-[200px]"
                              title={latestReason}
                            >
                              ↳ {latestReason}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 text-slate-500">{dateStr}</td>

                        <td className="py-3.5 text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {medCount} {t("uiItems")}
                          </span>
                        </td>

                        <td className="py-3.5 text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {testCount} {t("uiItems")}
                          </span>
                        </td>

                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setPrescriptionToRevise(p);
                                setSelectedAppointmentId(null);
                                router.replace("/dashboard/doctor?tab=prescription");
                              }}
                              title="Revise prescription and create a new version"
                              className="inline-flex items-center gap-1 rounded-xl bg-amber-500 text-white px-2.5 py-1.5 text-xs font-bold transition hover:bg-amber-600 shadow-xs cursor-pointer"
                            >
                              <span>✏️ {t.revisePrescription} (v{(p.version || 1) + 1})</span>
                            </button>

                            <Link
                              href={`/prescriptions/${p.id}/print`}
                              target="_blank"
                              title="View & Print Latest Version"
                              className="inline-flex items-center gap-1 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] px-2.5 py-1.5 text-xs font-bold transition hover:opacity-90 shadow-xs"
                            >
                              <span>🖨️ {t.print}</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => setSharingPrescriptionId(p.id)}
                              title="Share Prescription"
                              className="inline-flex items-center gap-1 rounded-xl bg-[var(--bg-subtle)] text-slate-700 dark:text-slate-300 border border-[var(--border-subtle)] px-2.5 py-1.5 text-xs font-bold hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>{t.sharePrescription}</span>
                            </button>

                            {versionCount > 1 && (
                              <button
                                type="button"
                                onClick={() => setHistoryModalPrescription(p)}
                                title="View All Historical Versions"
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                              >
                                <span>📜 {t.versionHistory}</span>
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
            <div className="modal-header shrink-0 flex items-start justify-between gap-4 p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text)]">
                  {t.prescriptionHistoryTitle}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {historyModalPrescription.patient.user.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rx ID: <code className="font-mono">{historyModalPrescription.id}</code> • {t("uiTotalVersions")}{" "}
                  <strong>{historyModalPrescription.versions?.length || 1}</strong>
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
                            {language === "bn" ? `সংস্করণ ${ver.versionNumber}` : `Version ${ver.versionNumber}`}
                          </span>
                          {isLatest && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text)]">
                              {t("uiCurrentActive2")}
                            </span>
                          )}
                          <span className="text-xs text-slate-500">{verDate}</span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">
                          {t("uiReason2")} {ver.changeReason || (t("uiPrescriptionRevision"))}
                        </p>

                        <p className="text-[11px] text-slate-500 mt-1">
                          {t("uiSnapshot")} <strong>{vMedCount}</strong> {t("uiMedicines")} •{" "}
                          <strong>{vTestCount}</strong> {t("uiDiagnosticTests")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <Link
                          href={`/prescriptions/${historyModalPrescription.id}/print?version=${ver.versionNumber}`}
                          target="_blank"
                          className="px-3.5 py-2 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold hover:bg-[var(--brand-primary)] hover:text-white transition shadow-xs"
                        >
                          🖨️ {t.viewAndPrintA4} v{ver.versionNumber}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-footer shrink-0 p-4 sm:px-8 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const target = historyModalPrescription;
                  setHistoryModalPrescription(null);
                  setPrescriptionToRevise(target);
                  setSelectedAppointmentId(null);
                  router.replace("/dashboard/doctor?tab=prescription");
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition shadow-xs cursor-pointer"
              >
                ✏️ {language === "bn" ? `নতুন সংস্করণ তৈরি (v${(historyModalPrescription.version || 1) + 1})` : `Create New Version (v${(historyModalPrescription.version || 1) + 1})`}
              </button>

              <button
                type="button"
                onClick={() => setHistoryModalPrescription(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Share Modal */}
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
