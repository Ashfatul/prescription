"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Stethoscope,
  CreditCard,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { AppointmentBookingModal } from "@/components/appointments/appointment-booking-modal";
import { MedicineRemindersView } from "@/components/dashboard/medicine-reminders-view";
import { ClinicalChat } from "@/components/dashboard/clinical-chat";
import { PrescriptionShareModal } from "@/components/dashboard/prescription-share-modal";
import { AnnouncementsBanner } from "@/components/dashboard/announcements-banner";
import { AnnouncementsManager } from "@/components/dashboard/announcements-manager";
import { ChangePasswordCard } from "@/components/common/change-password-card";
import { TwoFactorAuthCard } from "@/components/common/two-factor-auth-card";
import { createGoogleCalendarAppointmentUrl } from "@/lib/calendar";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { DoctorScheduleDisplay } from "@/components/doctors/doctor-schedule-display";

export interface PatientDoctorItem {
  id: string;
  name: string;
  imageUrl?: string | null;
  specialization: string;
  degrees?: string | null;
  designation?: string | null;
  hospital?: string | null;
  chamberAddress?: string | null;
  visitingHours?: string | null;
  consultationFee?: string | null;
  newPatientFee: number;
  followupFee: number;
  followupValidityDays: number;
  reportFreeDays: number;
  schedule?: {
    days?: string[] | string;
    startTime?: string;
    endTime?: string;
    hours?: string;
    chamber?: string;
  } | null;
}

interface AppointmentItem {
  id: string;
  serialNumber: number;
  appointmentDate: Date | string;
  status: string;
  notes?: string | null;
  visitType?: string | null;
  fee?: number | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  refundStatus?: string | null;
  refundAmount?: number | null;
  refundReason?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  cancelledByRole?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  verificationNotes?: string | null;
  doctor: {
    id?: string;
    specialization: string;
    chamberAddress?: string | null;
    user: {
      name: string;
    };
    newPatientFee?: number;
    followupFee?: number;
    reportFreeDays?: number;
    cancellationWindowHours?: number;
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
  doctors?: PatientDoctorItem[];
}

export function PatientDashboardView({
  patientName,
  initialAppointments,
  prescriptions,
  doctors = [],
}: PatientDashboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const activeTab = searchParams.get("tab") || "overview";

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | undefined>(undefined);
  const [selectedSlip, setSelectedSlip] = useState<AppointmentItem | null>(null);
  const [selectedHistoryPrescription, setSelectedHistoryPrescription] = useState<PrescriptionItem | null>(null);
  const [sharingPrescriptionId, setSharingPrescriptionId] = useState<string | null>(null);
  const [nowTimestamp] = useState(() => Date.now());
  const [cancellationTarget, setCancellationTarget] = useState<AppointmentItem | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationSubmitting, setCancellationSubmitting] = useState(false);
  const [cancellationError, setCancellationError] = useState<string | null>(null);
  const [generatingRemindersId, setGeneratingRemindersId] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [payingAppointmentId, setPayingAppointmentId] = useState<string | null>(null);
  const [paymentBanner, setPaymentBanner] = useState<{
    type: "success" | "canceled" | "error" | "verifying";
    message: string;
  } | null>(null);

  const isStripePaidReturn = searchParams.get("paid") === "true" && Boolean(searchParams.get("appointment_id"));
  const isStripeCanceledReturn = searchParams.get("canceled") === "true";

  // Active banner combines dynamic state or query param feedback
  const activeBanner =
    paymentBanner ||
    (isStripePaidReturn
      ? {
          type: "verifying" as const,
          message: "Verifying your consultation fee with Stripe...",
        }
      : isStripeCanceledReturn
      ? {
          type: "canceled" as const,
          message:
            "Stripe checkout was canceled. You can pay your consultation fee anytime from your appointments list below.",
        }
      : null);

  // Capture Stripe Checkout Redirect (paid=true) and auto-verify
  useEffect(() => {
    const paidParam = searchParams.get("paid");
    const apptId = searchParams.get("appointment_id");
    const sessionId = searchParams.get("session_id");

    if (paidParam !== "true" || !apptId) return;

    let isMounted = true;

    fetch(`/api/appointments/${apptId}/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId || undefined }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          setPaymentBanner({
            type: "success",
            message: "Payment successfully verified via Stripe! Your appointment serial ticket is officially locked.",
          });
          router.refresh();
        } else {
          setPaymentBanner({
            type: "error",
            message: data.message || "Failed to verify Stripe payment.",
          });
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setPaymentBanner({
          type: "error",
          message: "Network error communicating with payment verification server.",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams, router]);

  const handlePayWithStripe = async (appointmentId: string) => {
    setPayingAppointmentId(appointmentId);
    setActionError(null);

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.data?.url) {
        throw new Error(data.message || "Failed to initiate Stripe checkout");
      }

      window.location.assign(data.data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate Stripe checkout";
      setActionError(msg);
      setPayingAppointmentId(null);
    }
  };

  const openBooking = (doctorId?: string) => {
    setBookingDoctorId(doctorId);
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setBookingDoctorId(undefined);
  };

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

  const handleOpenCancellationModal = (item: AppointmentItem) => {
    setCancellationTarget(item);
    setCancellationReason("");
    setCancellationError(null);
  };

  const handleConfirmCancellation = async () => {
    if (!cancellationTarget) return;

    setCancellationSubmitting(true);
    setCancellationError(null);

    try {
      const res = await fetch(`/api/appointments/${cancellationTarget.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: cancellationReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel appointment");
      }

      setCancellationTarget(null);
      setPaymentBanner({
        type: "success",
        message: `Appointment #${cancellationTarget.serialNumber} successfully cancelled.${
          data.data?.refundStatus === "REFUNDED"
            ? ` Full refund of $${data.data?.refundAmount ?? cancellationTarget.fee} has been credited to your payment method.`
            : ""
        }`,
      });
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error cancelling appointment";
      setCancellationError(msg);
    } finally {
      setCancellationSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Announcements Banner */}
      <AnnouncementsBanner />

      {activeBanner && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
            activeBanner.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200"
              : activeBanner.type === "verifying"
              ? "bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-200"
              : activeBanner.type === "canceled"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200"
              : "bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {activeBanner.type === "verifying" ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : activeBanner.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{activeBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setPaymentBanner(null)}
            className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center justify-between gap-2">
          <span>⚠️ {actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {reminderMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
          ✓ {reminderMessage}
        </div>
      )}

      {/* Horizontal Dashboard Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "overview", label: `📋 ${t.medicalOverview}` },
          { id: "reminders", label: `⏰ ${t.medicineReminders}` },
          { id: "chat", label: `💬 ${t.clinicalChat}` },
          { id: "announcements", label: `📢 ${t.clinicNotices}` },
          { id: "security", label: `🔒 ${t.securityAnd2FA}` },
        ].map((tabItem) => {
          const isActive =
            tabItem.id === "overview"
              ? activeTab === "overview" || activeTab === "main"
              : activeTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => router.replace(`/dashboard/patient?tab=${tabItem.id}`)}
              className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                isActive
                  ? "bg-[var(--brand-primary)] text-white shadow-sm"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {/* Render Sub Tabs */}
      {activeTab === "reminders" && <MedicineRemindersView />}
      {activeTab === "chat" && currentUser && (
        <ClinicalChat currentUserId={currentUser.id} />
      )}
      {activeTab === "announcements" && (
        <AnnouncementsManager canManage={false} userRole="PATIENT" />
      )}
      {activeTab === "security" && (
        <div className="space-y-6">
          <TwoFactorAuthCard />
          <ChangePasswordCard />
        </div>
      )}

      {/* Default Overview */}
      {(activeTab === "overview" || activeTab === "main") && (
        <>
          {/* Patient Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t.verifiedPatientBadge}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 leading-tight">
            {language === "bn" ? `স্বাগতম, ${patientName}` : `Welcome back, ${patientName}`}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {language === "bn" ? "আপনার সিরিয়াল বুকিং করুন, ডাক্তারদের সময়সূচী দেখুন এবং ডিজিটাল প্রেসক্রিপশন পর্যালোচনা করুন।" : "Reserve your consultation queue serials, track visiting physician schedules, and review your official digital prescriptions."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => openBooking()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-90 transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.bookAppointment}</span>
        </button>
      </div>

      {/* Patient Health Overview Live Stats (Direct from System) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {t.myPrescriptions}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
            {prescriptions.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">{language === "bn" ? "অফিসিয়াল ডিজিটাল প্রেসক্রিপশন" : "Official digital records"}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {t.activeBookings}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[var(--brand-text)] tracking-tight font-mono">
            {
              initialAppointments.filter(
                (a) => a.status === "PENDING" || a.status === "CONFIRMED" || a.status === "BOOKED"
              ).length
            }
          </span>
          <p className="text-[11px] text-slate-500 mt-1">{t.scheduledChamberVisits}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {t.completedVisits}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
            {initialAppointments.filter((a) => a.status === "COMPLETED").length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">{t.pastConsultations}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {t.totalAppointments}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
            {initialAppointments.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">{t.allRecordedSerials}</p>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Available Consulting Physicians & Consultation Rates */}
      {doctors && doctors.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.consultingSpecialistsVisitingCharges}
                </h2>
                <p className="text-xs text-slate-500">
                  {t.specialistsVisitingRatesDesc}
                </p>
              </div>
            </div>

            <Link
              href="/doctors"
              className="text-xs font-bold text-[var(--brand-primary)] hover:underline self-start sm:self-auto"
            >
              {t.allDoctorsDirectory}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between gap-3 hover:border-[var(--brand-border)] transition-all shadow-2xs"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div className="relative w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-300/60 dark:border-slate-700/60">
                      {doc.imageUrl ? (
                        <Image src={doc.imageUrl} alt={doc.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-500">
                          Dr.
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {doc.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-[var(--brand-text)] truncate">
                        {doc.specialization}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {doc.chamberAddress || doc.hospital || (language === "bn" ? "চেম্বার উন্মুক্ত" : "Chamber Open")}
                      </p>
                    </div>
                  </div>

                  {/* Visual Weekly Schedule Strip */}
                  <div className="mt-3">
                    <DoctorScheduleDisplay
                      schedule={doc.schedule}
                      visitingHours={doc.visitingHours}
                      chamber={doc.chamberAddress || doc.hospital}
                      compact={true}
                      showEmergencyNotice={false}
                    />
                  </div>

                  {/* Consultation Pricing Schedule */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-800/70 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">{t.firstVisit}:</span>
                      <span className="font-extrabold text-blue-700 dark:text-blue-300 font-mono">
                        ${doc.newPatientFee}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        {t.followup} ({doc.followupValidityDays}d):
                      </span>
                      <span className="font-extrabold text-teal-700 dark:text-teal-300 font-mono">
                        ${doc.followupFee}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        {t.reportReview}:
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                        {t.free} ({doc.reportFreeDays}d)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 italic truncate" title={language === "bn" ? "জরুরি প্রয়োজনে সময়সূচী পরিবর্তিত হতে পারে" : "Schedule may adjust for clinical emergencies"}>
                    {language === "bn" ? "জরুরি প্রয়োজনে সময় পরিবর্তিত হতে পারে" : "Schedule may adjust in emergencies"}
                  </span>
                  <button
                    type="button"
                    onClick={() => openBooking(doc.id)}
                    className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white text-[11px] font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t.bookSerial}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                    {t.consultationAppointments}
                  </h2>
                  <p className="text-xs text-slate-500">{t.upcomingPreviousChamberVisits}</p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {initialAppointments.length} {language === "bn" ? "বুকড" : "Booked"}
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
                      {t.noScheduledAppointments}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {t.bookWithSpecialistInstantSerial}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openBooking()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold hover:bg-[var(--brand-primary)] hover:text-white transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.bookNow}</span>
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
                              {t.serialNumber} #{item.serialNumber}
                            </span>
                          </div>

                          {/* Visit Type & Payment Badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.visitType === "REPORT_REVIEW"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                                  : item.visitType === "FOLLOWUP"
                                  ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20"
                                  : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                              }`}
                            >
                              {item.visitType === "REPORT_REVIEW"
                                ? t.freeReportReviewNotice
                                : item.visitType === "FOLLOWUP"
                                ? `${t.followup} ($${item.fee ?? 30})`
                                : `${t.firstVisit} ($${item.fee ?? 50})`}
                            </span>

                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                item.paymentStatus === "PAID"
                                  ? "bg-emerald-600 text-white"
                                  : item.paymentStatus === "WAIVED"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              }`}
                            >
                              {item.paymentStatus === "PAID"
                                ? (language === "bn" ? `পরিশোধিত (${item.paymentMethod || "স্ট্রাইপ"})` : `PAID (${item.paymentMethod || "Stripe"})`)
                                : item.paymentStatus === "WAIVED"
                                ? (language === "bn" ? "ফি মওকুফ" : "FEE WAIVED")
                                : (language === "bn" ? "পেমেন্ট বাকি" : "PAYMENT PENDING")}
                            </span>
                          </div>

                          {item.notes && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">
                              ↳ &quot;{item.notes}&quot;
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {(() => {
                            const isPending = item.status === "PENDING";
                            const isConfirmed = item.status === "CONFIRMED" || item.status === "BOOKED";
                            const cutoffHours = item.doctor.cancellationWindowHours ?? 24;
                            const apptDateObj = new Date(item.appointmentDate);
                            const hoursRemaining = (apptDateObj.getTime() - nowTimestamp) / (1000 * 60 * 60);
                            const canCancel = hoursRemaining >= cutoffHours;

                            return (
                              <>
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                    isCompleted
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                      : isCancelled
                                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                                      : isPending
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                  }`}
                                >
                                  {isPending
                                    ? (language === "bn" ? "যাচাইকরণের অপেক্ষায়" : "Pending Verification")
                                    : isConfirmed
                                    ? (language === "bn" ? "নিশ্চিত" : "Confirmed")
                                    : isCompleted
                                    ? (language === "bn" ? "সম্পন্ন" : "Completed")
                                    : isCancelled
                                    ? (language === "bn" ? "বাতিলকৃত" : "Cancelled")
                                    : item.status}
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
                                        title={language === "bn" ? "গুগল ক্যালেন্ডারে যোগ করুন" : "Add to Google Calendar"}
                                        className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 text-amber-600 dark:text-amber-400 transition cursor-pointer text-xs"
                                      >
                                        <Calendar className="w-3.5 h-3.5" />
                                      </a>

                                      <button
                                        type="button"
                                        onClick={() => setSelectedSlip(item)}
                                        title={language === "bn" ? "অ্যাপয়েন্টমেন্ট স্লিপ দেখুন" : "View Appointment Slip"}
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer text-xs"
                                      >
                                        <Printer className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}

                                  {!isCancelled && !isCompleted && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCancellationModal(item)}
                                      title={
                                        canCancel
                                          ? (language === "bn" ? `অ্যাপয়েন্টমেন্ট বাতিল করুন ও রিফান্ড পান (${cutoffHours} ঘণ্টা পূর্বে)` : `Cancel Appointment & Get Full Refund (> ${cutoffHours}h before consultation)`)
                                          : (language === "bn" ? `বাতিলের সময়সীমা শেষ (< ${cutoffHours} ঘণ্টা বাকি)` : `Cancellation Window Closed (< ${cutoffHours}h remaining)`)
                                      }
                                      className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                                        canCancel
                                          ? "border-red-200 dark:border-red-900/50 hover:bg-red-50 text-red-600 dark:text-red-400"
                                          : "border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                      }`}
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Verification Status Details */}
                      {item.status === "PENDING" && (
                        <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between text-amber-700 dark:text-amber-300">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            {language === "bn" ? "ক্লিনিক ফ্রন্ট-ডেস্ক যাচাইকরণ ও নিশ্চিতকরণের অপেক্ষায়" : "Awaiting Clinic Front-Desk Verification & Confirmation"}
                          </span>
                          <span className="text-[11px] opacity-80">
                            {t.serialNumber} #{item.serialNumber} {language === "bn" ? "সংরক্ষিত" : "reserved"}
                          </span>
                        </div>
                      )}

                      {/* Cancellation & Refund Notice */}
                      {isCancelled && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-200 space-y-1">
                          <div className="flex items-center justify-between font-semibold">
                            <span>{language === "bn" ? "অ্যাপয়েন্টমেন্ট বাতিল করা হয়েছে" : "Appointment Cancelled"}</span>
                            {item.refundStatus === "REFUNDED" ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase">
                                ✓ {language === "bn" ? "রিফান্ড প্রদান করা হয়েছে:" : "Refund Issued:"} ${item.refundAmount || item.fee}
                              </span>
                            ) : item.refundStatus === "REFUND_PENDING" ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase">
                                ⏳ {language === "bn" ? "রিফান্ড প্রক্রিয়াধীন:" : "Refund Processing:"} ${item.refundAmount || item.fee}
                              </span>
                            ) : null}
                          </div>
                          {item.cancellationReason && (
                            <p className="text-[11px] opacity-85 italic">
                              {language === "bn" ? "কারণ:" : "Reason:"} {item.cancellationReason}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Stripe Payment CTA for pending appointments */}
                      {!isCancelled && item.paymentStatus === "PENDING" && (item.fee ?? 0) > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-slate-600 dark:text-slate-400">
                              {language === "bn" ? "প্রদেয় ফি:" : "Payment Due:"} <strong className="font-mono text-slate-900 dark:text-white">${item.fee}</strong>
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={payingAppointmentId === item.id}
                            onClick={() => handlePayWithStripe(item.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white text-[11px] font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {payingAppointmentId === item.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>{language === "bn" ? "স্ট্রাইপ লোড হচ্ছে..." : "Opening Stripe..."}</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>{language === "bn" ? `স্ট্রাইপ দিয়ে $${item.fee} প্রদান করুন` : `Pay $${item.fee} via Stripe`}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
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
                  {t.medicalPrescriptions}
                </h2>
                <p className="text-xs text-slate-500">{t.officialDigitalPrescriptions}</p>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {prescriptions.length} {language === "bn" ? "রেকর্ড" : "Records"}
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {prescriptions.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.noPrescriptionsYetTitle}
                </p>
                <p className="text-[11px] text-slate-400">
                  {t.prescriptionsIssuedAppearHere}
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
                            {language === "bn" ? `${versionCount}টি সংস্করণ` : `${versionCount} revisions`}
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.version && item.version > 1 ? (language === "bn" ? `আপডেট: ${formattedDate}` : `Updated on ${formattedDate}`) : (language === "bn" ? `প্রদান: ${formattedDate}` : `Issued on ${formattedDate}`)}
                      </p>

                      {latestReason && item.version && item.version > 1 && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
                          ↳ {language === "bn" ? "নোট:" : "Note:"} {latestReason}
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
                          📜 {language === "bn" ? "সংস্করণসমূহ" : "Versions"}
                        </button>
                      )}

                      <Link
                        href={`/prescriptions/${item.id}/print`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold hover:bg-[var(--brand-primary)] hover:text-white transition-all shadow-xs cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{t.viewAndPrint}</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSharingPrescriptionId(item.id)}
                        title="Share Prescription via Public Link, QR Code, or Email"
                        className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--border-default)] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[var(--bg-subtle)] transition cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t.share}</span>
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
                          {generatingRemindersId === item.id ? (language === "bn" ? "সেট হচ্ছে..." : "Setting...") : (language === "bn" ? "রিমাইন্ডার" : "Reminders")}
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
        onClose={closeBooking}
        initialDoctorId={bookingDoctorId}
        onSuccess={handleBookingSuccess}
      />

      {/* Appointment Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-surface)] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                {t.patientAppointmentSlip}
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
                  {t.confirmedQueueTicket}
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
                  {t.chamberLocation}: {selectedSlip.doctor.chamberAddress || (language === "bn" ? "ডাক্তার পরামর্শ চেম্বার" : "Doctor Consultation Chamber")}
                </p>

                {/* Consultation Fee & Visit Type */}
                <div className="pt-3 border-t border-[var(--brand-primary)]/20 grid grid-cols-2 gap-2 text-left text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === "bn" ? "ভিজিটের ধরন:" : "Visit Type:"}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedSlip.visitType === "REPORT_REVIEW"
                        ? t.freeReportReviewNotice
                        : selectedSlip.visitType === "FOLLOWUP"
                        ? t.followupConsultation
                        : t.newPatientConsultation}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === "bn" ? "ফি ও পেমেন্ট:" : "Fee & Payment:"}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedSlip.visitType === "REPORT_REVIEW" || selectedSlip.fee === 0
                        ? (language === "bn" ? "ফ্রি ($০.০০)" : "Free ($0.00)")
                        : `$${selectedSlip.fee} • ${
                            selectedSlip.paymentStatus === "PAID"
                              ? (language === "bn" ? "পরিশোধিত" : "Paid")
                              : selectedSlip.paymentStatus === "WAIVED"
                              ? (language === "bn" ? "মওকুফ" : "Waived")
                              : (language === "bn" ? "বাকি" : "Pending")
                          }`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.print}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSlip(null)}
                className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold cursor-pointer hover:opacity-90 transition shadow-xs"
              >
                {t.close}
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
                  {language === "bn" ? "প্রেসক্রিপশন সংস্করণ টাইমলাইন" : "Prescription Version Timeline"}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Dr. {selectedHistoryPrescription.doctor.user.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedHistoryPrescription.doctor.specialization} • {language === "bn" ? "মোট সংস্করণ:" : "Total Revisions:"} <strong>{selectedHistoryPrescription.versions?.length || 1}</strong>
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
                            {language === "bn" ? `সংস্করণ ${ver.versionNumber}` : `Version ${ver.versionNumber}`}
                          </span>
                          {isLatest && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text)]">
                              {language === "bn" ? "● বর্তমান সক্রিয়" : "● Current Active"}
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            {verDate}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">
                          ↳ {language === "bn" ? "কারণ:" : "Reason:"} {ver.changeReason || (language === "bn" ? "প্রেসক্রিপশন সংশোধন" : "Prescription revision")}
                        </p>
                      </div>

                      <Link
                        href={`/prescriptions/${selectedHistoryPrescription.id}/print?version=${ver.versionNumber}`}
                        target="_blank"
                        className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold hover:bg-[var(--brand-primary)] hover:text-white transition shadow-xs"
                      >
                        {language === "bn" ? `🖨️ প্রিন্ট করুন v${ver.versionNumber}` : `🖨️ View & Print v${ver.versionNumber}`}
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
                {t.close}
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

      {/* Patient Appointment Cancellation & Refund Modal */}
      {cancellationTarget && (() => {
        const cutoff = cancellationTarget.doctor.cancellationWindowHours ?? 24;
        const apptTime = new Date(cancellationTarget.appointmentDate).getTime();
        const hoursUntil = (apptTime - nowTimestamp) / (1000 * 60 * 60);
        const isAllowed = hoursUntil >= cutoff;
        const wasPaid = (cancellationTarget.fee ?? 0) > 0 && cancellationTarget.paymentStatus === "PAID";

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-[var(--bg-surface)] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isAllowed
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {isAllowed ? (
                      <XCircle className="w-6 h-6" />
                    ) : (
                      <AlertCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {isAllowed ? t.cancelAppointmentTitle : t.cancellationWindowClosed}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t.serialNumber} #{cancellationTarget.serialNumber} • Dr. {cancellationTarget.doctor.user.name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCancellationTarget(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Policy Body */}
              {!isAllowed ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      {language === "bn" ? "ক্লিনিক অ্যাপয়েন্টমেন্ট বাতিল নীতিমালা" : "Clinic Cancellation Policy Notice"}
                    </p>
                    <p className="leading-relaxed">
                      {language === "bn"
                        ? `অ্যাপয়েন্টমেন্ট ও পরামর্শ ফি রিফান্ড চেম্বারের নির্ধারিত সময়ের কমপক্ষে ${cutoff} ঘণ্টা পূর্বে বাতিল করতে হবে।`
                        : `Appointments and consultation fee refunds can only be cancelled at least ${cutoff} hours before the scheduled chamber time.`}
                    </p>
                    <p className="text-[11px] opacity-85">
                      {language === "bn"
                        ? `বর্তমানে: ${hoursUntil > 0 ? `${Math.max(1, Math.round(hoursUntil))} ঘণ্টা বাকি` : "নির্ধারিত সময় অতিবাহিত হয়েছে"}। চিকিৎসকের পরামর্শ স্লট সংরক্ষণের জন্য অনলাইন বাতিল বন্ধ রয়েছে।`
                        : `Currently: ${hoursUntil > 0 ? `${Math.max(1, Math.round(hoursUntil))} hour(s) remaining` : "Scheduled time has passed"}. Online cancellation is closed to protect physician consultation slots.`}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === "bn"
                      ? `আপনার যদি জরুরি কোনো মেডিকেল পরিস্থিতি থাকে বা সময় পরিবর্তন প্রয়োজন হয়, অনুগ্রহ করে অভ্যর্থনা ডেস্কে যোগাযোগ করুন (${cancellationTarget.doctor.chamberAddress || "ক্লিনিক অভ্যর্থনা"})।`
                      : `If you have an urgent medical emergency or need to reschedule your serial, please contact the front desk at ${cancellationTarget.doctor.chamberAddress || "clinic reception"}.`}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCancellationTarget(null)}
                      className="px-6 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 transition cursor-pointer"
                    >
                      {language === "bn" ? "বুঝেছি" : "Understood"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Eligible Notice */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{t.eligibleForFullRefund}</span>
                    </div>
                    <p className="text-[11px] opacity-85">
                      {language === "bn"
                        ? `আপনি ${Math.round(hoursUntil)} ঘণ্টা পূর্বে বাতিল করছেন (সীমা ${cutoff} ঘণ্টা)।`
                        : `You are cancelling ${Math.round(hoursUntil)} hours in advance (threshold is ${cutoff}h).`}
                    </p>
                  </div>

                  {/* Refund Details */}
                  {wasPaid && (
                    <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {language === "bn" ? "রিফান্ড গণনা" : "Refund Calculation"}
                      </span>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">{t.paidConsultationFee}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          ${cancellationTarget.fee}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80 dark:border-slate-800/80 font-bold">
                        <span className="text-emerald-600 dark:text-emerald-400">{t.refundCredited}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          ${cancellationTarget.fee} (100%)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 pt-1">
                        {t.refundNoticeMethod}
                      </p>
                    </div>
                  )}

                  {/* Reason Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t.reasonForCancellation}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { en: "Schedule conflict", bn: "সময়ের অমিল" },
                        { en: "Symptoms improved", bn: "লক্ষণ উপশম হয়েছে" },
                        { en: "Booked wrong doctor/date", bn: "ভুল ডাক্তার/তারিখ" },
                        { en: "Emergency", bn: "জরুরি পরিস্থিতি" },
                      ].map((preset) => {
                        const text = language === "bn" ? preset.bn : preset.en;
                        return (
                          <button
                            key={preset.en}
                            type="button"
                            onClick={() => setCancellationReason(text)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                              cancellationReason === text
                                ? "bg-[var(--brand-primary)] text-white"
                                : "bg-[var(--bg-app)] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
                            }`}
                          >
                            {text}
                          </button>
                        );
                      })}
                    </div>
                    <textarea
                      rows={2}
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder={language === "bn" ? "ক্লিনিক কর্মীদের জন্য অতিরিক্ত তথ্য লিখুন..." : "Add any additional details for clinic staff..."}
                      className="w-full mt-1.5 p-3 rounded-2xl bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>

                  {cancellationError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{cancellationError}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={cancellationSubmitting}
                      onClick={() => setCancellationTarget(null)}
                      className="px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
                    >
                      {t.keepAppointment}
                    </button>
                    <button
                      type="button"
                      disabled={cancellationSubmitting}
                      onClick={handleConfirmCancellation}
                      className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {cancellationSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{t.cancelling}</span>
                        </>
                      ) : (
                        <span>{t.confirmCancellationRefund}</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
