"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  Printer,
  XCircle,
  FileText,
  AlertCircle,
  Plus,
  Share2,
} from "lucide-react";
import { AppointmentBookingModal } from "@/components/appointments/appointment-booking-modal";
import { TestReportsManager } from "@/components/dashboard/test-reports-manager";
import { MedicineRemindersView } from "@/components/dashboard/medicine-reminders-view";
import { ClinicalChat } from "@/components/dashboard/clinical-chat";
import { PrescriptionShareModal } from "@/components/dashboard/prescription-share-modal";
import { AnnouncementsBanner } from "@/components/dashboard/announcements-banner";
import { AnnouncementsManager } from "@/components/dashboard/announcements-manager";
import { ChangePasswordCard } from "@/components/common/change-password-card";
import { createGoogleCalendarAppointmentUrl } from "@/lib/calendar";
import { useAuth } from "@/lib/auth/auth-context";

interface AppointmentItem {
  id: string;
  serialNumber: number;
  appointmentDate: Date | string;
  status: string;
  notes?: string | null;
  doctor: {
    specialization: string;
    chamberAddress?: string | null;
    user: {
      name: string;
    };
  };
}

interface PrescriptionItem {
  id: string;
  version?: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  doctor: {
    specialization: string;
    hospital?: string | null;
    user: {
      name: string;
    };
  };
  versions?: Array<{
    id: string;
    versionNumber: number;
    changeReason?: string | null;
    createdAt: Date | string;
  }>;
}

interface PatientDashboardViewProps {
  patientName: string;
  initialAppointments: AppointmentItem[];
  prescriptions: PrescriptionItem[];
}

export function PatientDashboardView({
  patientName,
  initialAppointments,
  prescriptions,
}: PatientDashboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();
  const activeTab = searchParams.get("tab") || "overview";

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<AppointmentItem | null>(null);
  const [selectedHistoryPrescription, setSelectedHistoryPrescription] = useState<PrescriptionItem | null>(null);
  const [sharingPrescriptionId, setSharingPrescriptionId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [generatingRemindersId, setGeneratingRemindersId] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleGenerateReminders = async (rxId: string) => {
    setGeneratingRemindersId(rxId);
    setReminderMessage(null);
    try {
      const res = await fetch("/api/medicine-reminders/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionId: rxId }),
      });
      const data = await res.json();
      if (data.success) {
        setReminderMessage("Medicine dosage reminders added to your schedule!");
        setTimeout(() => setReminderMessage(null), 4000);
      }
    } catch {
      // Ignore
    } finally {
      setGeneratingRemindersId(null);
    }
  };

  const handleBookingSuccess = () => {
    router.refresh();
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment serial?")) return;

    setCancellingId(id);
    setActionError(null);

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel appointment");
      }

      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error cancelling appointment";
      setActionError(msg);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Announcements Banner */}
      <AnnouncementsBanner />

      {reminderMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
          ✓ {reminderMessage}
        </div>
      )}

      {/* Horizontal Dashboard Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "overview", label: "📋 Medical Overview" },
          { id: "reports", label: "🧪 Test Reports & Scans" },
          { id: "reminders", label: "⏰ Medicine Reminders" },
          { id: "chat", label: "💬 Doctor Chat" },
          { id: "announcements", label: "📢 Clinic Notices" },
          { id: "security", label: "🔒 Security & Password" },
        ].map((t) => {
          const isActive =
            t.id === "overview"
              ? activeTab === "overview" || activeTab === "main"
              : activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => router.replace(`/dashboard/patient?tab=${t.id}`)}
              className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                isActive
                  ? "bg-[var(--brand-primary)] text-white shadow-sm"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Render Sub Tabs */}
      {activeTab === "reports" && <TestReportsManager role="PATIENT" />}
      {activeTab === "reminders" && <MedicineRemindersView />}
      {activeTab === "chat" && currentUser && (
        <ClinicalChat currentUserId={currentUser.id} />
      )}
      {activeTab === "announcements" && (
        <AnnouncementsManager canManage={false} userRole="PATIENT" />
      )}
      {activeTab === "security" && <ChangePasswordCard />}

      {/* Default Overview */}
      {(activeTab === "overview" || activeTab === "main") && (
        <>
          {/* Patient Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Verified Patient Health Records
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 leading-tight">
            Welcome back, {patientName}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Reserve your consultation queue serials, track visiting physician schedules, and review your official digital prescriptions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsBookingOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-90 transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Consultation</span>
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appointments Section */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Consultation Appointments
                  </h2>
                  <p className="text-xs text-slate-500">Upcoming and previous chamber visits</p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {initialAppointments.length} Booked
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {initialAppointments.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No Scheduled Appointments
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Book with any consulting specialist to get an instant serial ticket.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold hover:bg-[var(--brand-primary)] hover:text-white transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Book Now</span>
                  </button>
                </div>
              ) : (
                initialAppointments.map((item) => {
                  const isCancelled = item.status === "CANCELLED";
                  const isCompleted = item.status === "COMPLETED";
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCancelled
                          ? "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60"
                          : "bg-[var(--bg-app)] border-slate-200/80 dark:border-slate-800/80 hover:border-[var(--brand-border)] shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {item.doctor.user.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] font-semibold">
                              {item.doctor.specialization}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(item.appointmentDate).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="font-bold text-[var(--brand-text)]">
                              Serial #{item.serialNumber}
                            </span>
                          </div>

                          {item.notes && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">
                              ↳ &quot;{item.notes}&quot;
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : isCancelled
                                ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                            }`}
                          >
                            {item.status}
                          </span>

                          <div className="flex items-center gap-1">
                            {!isCancelled && (
                              <>
                                <a
                                  href={createGoogleCalendarAppointmentUrl({
                                    doctorName: item.doctor.user.name,
                                    patientName,
                                    appointmentDate: new Date(item.appointmentDate),
                                    serialNumber: item.serialNumber,
                                    chamberAddress: item.doctor.chamberAddress || undefined,
                                  })}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Add to Google Calendar"
                                  className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 text-amber-600 dark:text-amber-400 transition cursor-pointer text-xs"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  type="button"
                                  onClick={() => setSelectedSlip(item)}
                                  title="View Appointment Slip"
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer text-xs"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {!isCancelled && !isCompleted && (
                              <button
                                type="button"
                                onClick={() => handleCancelAppointment(item.id)}
                                disabled={cancellingId === item.id}
                                title="Cancel Appointment"
                                className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 text-red-600 dark:text-red-400 transition cursor-pointer text-xs disabled:opacity-40"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Prescriptions Section */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Medical Prescriptions
                </h2>
                <p className="text-xs text-slate-500">Official digital prescriptions issued by doctors</p>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {prescriptions.length} Records
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {prescriptions.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No Prescriptions Yet
                </p>
                <p className="text-[11px] text-slate-400">
                  Prescriptions issued by your physician will appear here with instant print options.
                </p>
              </div>
            ) : (
              prescriptions.map((item) => {
                const versionCount = item.versions?.length || 1;
                const latestReason = item.versions?.[0]?.changeReason;
                const formattedDate = new Date(item.updatedAt || item.createdAt).toLocaleDateString();

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--brand-border)] transition-all shadow-2xs"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.doctor.user.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] font-semibold">
                          {item.doctor.specialization}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          v{item.version || 1}
                        </span>
                        {versionCount > 1 && (
                          <button
                            type="button"
                            onClick={() => setSelectedHistoryPrescription(item)}
                            className="text-[10px] font-semibold text-[var(--brand-text)] underline hover:opacity-80 cursor-pointer"
                          >
                            {versionCount} revisions
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.version && item.version > 1 ? `Updated on ${formattedDate}` : `Issued on ${formattedDate}`}
                      </p>

                      {latestReason && item.version && item.version > 1 && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
                          ↳ Note: {latestReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {versionCount > 1 && (
                        <button
                          type="button"
                          onClick={() => setSelectedHistoryPrescription(item)}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          📜 Versions
                        </button>
                      )}

                      <Link
                        href={`/prescriptions/${item.id}/print`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold hover:bg-[var(--brand-primary)] hover:text-white transition-all shadow-xs cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View & Print</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSharingPrescriptionId(item.id)}
                        title="Share Prescription via Public Link, QR Code, or Email"
                        className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--border-default)] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[var(--bg-subtle)] transition cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Share</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleGenerateReminders(item.id)}
                        disabled={generatingRemindersId === item.id}
                        title="Generate Daily Medicine Reminders"
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-500/20 transition cursor-pointer disabled:opacity-50"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {generatingRemindersId === item.id ? "Setting..." : "Reminders"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      </>
      )}

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      {/* Appointment Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-surface)] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                Patient Appointment Slip
              </span>
              <button
                type="button"
                onClick={() => setSelectedSlip(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="modal-body flex-1 overflow-y-auto p-6 space-y-4">
              <div className="p-5 rounded-2xl bg-[var(--brand-surface)] border border-[var(--brand-border)] text-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text)]">
                  Confirmed Queue Ticket
                </span>
                <div className="text-4xl font-black text-[var(--brand-primary)]">
                  #{selectedSlip.serialNumber}
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedSlip.doctor.user.name} ({selectedSlip.doctor.specialization})
                </p>
                <p className="text-[11px] text-slate-500">
                  {new Date(selectedSlip.appointmentDate).toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-[11px] text-slate-400">
                  Chamber: {selectedSlip.doctor.chamberAddress || "Room 301, Consultation Wing"}
                </p>
              </div>
            </div>

            <div className="modal-footer shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSlip(null)}
                className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold cursor-pointer hover:opacity-90 transition shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Prescription Version History Modal */}
      {selectedHistoryPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-[var(--bg-surface)] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-start justify-between gap-4 p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text)]">
                  Prescription Version Timeline
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Dr. {selectedHistoryPrescription.doctor.user.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedHistoryPrescription.doctor.specialization} • Total Revisions: <strong>{selectedHistoryPrescription.versions?.length || 1}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHistoryPrescription(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="modal-body flex-1 overflow-y-auto p-6 space-y-3">
              {(selectedHistoryPrescription.versions || []).map((ver) => {
                const isLatest = ver.versionNumber === selectedHistoryPrescription.version;
                const verDate = new Date(ver.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={ver.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isLatest
                        ? "bg-[var(--brand-surface)]/50 border-[var(--brand-border)]"
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
                      </div>

                      <Link
                        href={`/prescriptions/${selectedHistoryPrescription.id}/print?version=${ver.versionNumber}`}
                        target="_blank"
                        className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold hover:bg-[var(--brand-primary)] hover:text-white transition shadow-xs"
                      >
                        🖨️ View & Print v{ver.versionNumber}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-footer shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedHistoryPrescription(null)}
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
