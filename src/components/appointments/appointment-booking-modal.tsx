"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Printer,
  X,
  AlertCircle,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  User,
  CreditCard,
  ShieldCheck,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { CustomDatePicker } from "@/components/common/custom-date-picker";
import {
  ClinicalIntakeForm,
  ClinicalIntakeData,
} from "@/components/appointments/clinical-intake-form";
import {
  evaluateDoctorSchedule,
} from "@/lib/doctor-schedule";

export interface PublicDoctorItem {
  id: string;
  name: string;
  imageUrl: string | null;
  specialization: string;
  degrees?: string | null;
  hospital?: string | null;
  chamberAddress?: string | null;
  contactNumber?: string | null;
  visitingHours?: string | null;
  consultationFee?: string | null;
  newPatientFee?: number | null;
  followupFee?: number | null;
  followupValidityDays?: number | null;
  reportFreeDays?: number | null;
  available: boolean;
  schedule: {
    days?: string[] | string;
    startTime?: string;
    endTime?: string;
    hours?: string;
    chamber?: string;
  } | null;
  currentSerial: number;
}

export type FeeBreakdown = {
  visitType: "NEW" | "FOLLOWUP" | "REPORT_REVIEW";
  fee: number;
  isFreeReportReview: boolean;
  followupEligible: boolean;
  previousPrescriptionId?: string | null;
  daysSinceLastVisit?: number | null;
  lastVisitDate?: Date | string | null;
  newPatientFee: number;
  followupFee: number;
  followupValidityDays: number;
  reportFreeDays: number;
  reason: string;
};

export interface CreatedAppointment {
  id: string;
  serialNumber: number;
  appointmentDate: string;
  status: string;
  notes?: string | null;
  visitType?: string | null;
  fee?: number | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  doctor: {
    specialization: string;
    degrees?: string | null;
    chamberAddress?: string | null;
    user: {
      name: string;
    };
  };
  patient: {
    user: {
      name: string;
      email: string;
      phone?: string | null;
    };
  };
}

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoctorId?: string;
  onSuccess?: (appointment: CreatedAppointment) => void;
}

const QUICK_VISIT_REASONS = [
  { en: "Routine Health Checkup", bn: "নিয়মিত স্বাস্থ্য পরীক্ষা" },
  { en: "Fever & Seasonal Flu", bn: "জ্বর ও সর্দি-কাশি" },
  { en: "Chronic Disease Review", bn: "দীর্ঘস্থায়ী রোগের ফলো-আপ" },
  { en: "Prescription Refill", bn: "প্রেসক্রিপশন নবায়ন" },
  { en: "Diagnostic Report Follow-up", bn: "রিপোর্ট ফলো-আপ" },
  { en: "Post-Op Consultation", bn: "অপারেশন পরবর্তী পরামর্শ" },
];

export function AppointmentBookingModal({
  isOpen,
  onClose,
  initialDoctorId,
  onSuccess,
}: AppointmentBookingModalProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [doctors, setDoctors] = useState<PublicDoctorItem[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoctorId || "");

  // Date selection
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<CreatedAppointment | null>(null);

  // Clinical Intake Form State
  const [intake, setIntake] = useState<ClinicalIntakeData>({
    diseases: [],
    allergies: [],
    medicalFlags: [],
    dietRequired: false,
    dietInstructions: [],
    dietNotes: "",
  });

  // Dynamic Consultation Fee Breakdown
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null);
  const [loadingFee, setLoadingFee] = useState(false);
  const [selectedVisitType, setSelectedVisitType] = useState<"NEW" | "FOLLOWUP" | "REPORT_REVIEW">("NEW");

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId);
  }, [doctors, selectedDoctorId]);

  // Instant fallback breakdown derived directly from the loaded doctor record
  const effectiveBreakdown: FeeBreakdown | null = useMemo(() => {
    if (feeBreakdown) return feeBreakdown;
    if (!selectedDoctor) return null;
    return {
      visitType: "NEW",
      fee: selectedDoctor.newPatientFee ?? 50,
      isFreeReportReview: false,
      followupEligible: false,
      newPatientFee: selectedDoctor.newPatientFee ?? 50,
      followupFee: selectedDoctor.followupFee ?? 30,
      followupValidityDays: selectedDoctor.followupValidityDays ?? 90,
      reportFreeDays: selectedDoctor.reportFreeDays ?? 2,
      reason: `Consultation fee schedule for ${selectedDoctor.name}.`,
    };
  }, [feeBreakdown, selectedDoctor]);

  useEffect(() => {
    if (!selectedDoctorId || !isOpen) return;

    let isMounted = true;
    fetch(`/api/appointments/fee-check?doctorId=${selectedDoctorId}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json?.success && json?.data) {
          setFeeBreakdown(json.data);
          setSelectedVisitType(json.data.visitType);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch doctor fee breakdown:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingFee(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDoctorId, isOpen]);

  // Load public doctors list
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/public/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setDoctors(data.data);
          if (initialDoctorId) {
            setSelectedDoctorId(initialDoctorId);
          } else if (data.data.length > 0) {
            setSelectedDoctorId((prev) => prev || data.data[0].id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load doctors:", err);
      })
      .finally(() => {
        setLoadingDoctors(false);
      });
  }, [isOpen, initialDoctorId]);

  const handleClose = () => {
    setConfirmedAppointment(null);
    setErrorMsg(null);
    onClose();
  };

  // Check if chosen date matches doctor visiting days
  const visitingDayStatus = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return null;
    return evaluateDoctorSchedule(
      selectedDoctor.schedule,
      selectedDoctor.visitingHours,
      selectedDate,
      selectedDoctor.chamberAddress || selectedDoctor.hospital
    );
  }, [selectedDoctor, selectedDate]);

  // Derived fee based on selection
  const chosenFee = useMemo(() => {
    if (selectedVisitType === "REPORT_REVIEW") return 0;
    if (selectedVisitType === "FOLLOWUP") {
      return effectiveBreakdown?.followupFee ?? selectedDoctor?.followupFee ?? 30;
    }
    return effectiveBreakdown?.newPatientFee ?? selectedDoctor?.newPatientFee ?? 50;
  }, [selectedVisitType, effectiveBreakdown, selectedDoctor]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setErrorMsg("Please select a consulting doctor.");
      return;
    }
    if (!selectedDate) {
      setErrorMsg("Please select an appointment date.");
      return;
    }

    if (selectedVisitType === "FOLLOWUP" && !effectiveBreakdown?.followupEligible) {
      setErrorMsg(
        `Ineligible for Follow-up rate: Dr. ${
          selectedDoctor?.name || "the physician"
        } requires a prior completed visit within ${
          effectiveBreakdown?.followupValidityDays ?? 90
        } days. No valid prior visit found. Please select First Visit.`
      );
      return;
    }

    if (selectedVisitType === "REPORT_REVIEW" && !effectiveBreakdown?.isFreeReportReview) {
      setErrorMsg(
        `Ineligible for Complimentary Report Review: Free report review is only valid within ${
          effectiveBreakdown?.reportFreeDays ?? 2
        } days of prior consultation. Please select Follow-up or First Visit.`
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          appointmentDate: new Date(`${selectedDate}T09:00:00.000Z`).toISOString(),
          notes: notes.trim() || undefined,
          visitType: selectedVisitType,
          fee: chosenFee,
          paymentMethod: chosenFee === 0 ? "WAIVED" : "STRIPE",
          previousPrescriptionId: effectiveBreakdown?.previousPrescriptionId || undefined,
          diseases: intake.diseases,
          allergies: intake.allergies,
          medicalFlags: intake.medicalFlags,
          dietRequired: intake.dietRequired,
          dietInstructions: intake.dietInstructions,
          dietNotes: intake.dietNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to book appointment");
      }

      // If Stripe Checkout URL was generated and returned, redirect to Stripe
      if (data.data?.stripeCheckoutUrl) {
        window.location.href = data.data.stripeCheckoutUrl;
        return;
      }

      setConfirmedAppointment(data.data);
      if (onSuccess) {
        onSuccess(data.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to book appointment";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
      <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {confirmedAppointment ? t.appointmentConfirmedHeader : t.bookDoctorConsultationHeader}
              </h2>
              <p className="text-xs text-slate-500">
                {confirmedAppointment
                  ? t.appointmentReservedSubtitle
                  : t.selectSpecialistDateSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body flex-1 overflow-y-auto p-6">
          {/* SUCCESS APPOINTMENT SLIP */}
          {confirmedAppointment ? (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[var(--brand-surface)] border-2 border-[var(--brand-primary)]/30 text-center space-y-3 print:border-black print:bg-white">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                    {t.officialAppointmentTicket}
                  </span>
                  <div className="mt-1 flex items-baseline justify-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">{t.yourSerial}</span>
                    <span className="text-4xl font-black text-[var(--brand-primary)] tracking-tight">
                      #{confirmedAppointment.serialNumber}
                    </span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.pendingClinicVerification}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                    {t.pendingClinicVerificationDesc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--brand-primary)]/20 grid grid-cols-2 gap-3 text-left text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">{t.consultingPhysician}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {confirmedAppointment.doctor.user.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {confirmedAppointment.doctor.specialization}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">{t.patientName}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {confirmedAppointment.patient.user.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {confirmedAppointment.patient.user.phone || confirmedAppointment.patient.user.email}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">{t.dateOfConsultation}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {new Date(confirmedAppointment.appointmentDate).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">{t.chamberLocation}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {confirmedAppointment.doctor.chamberAddress || (t("uiMainOPDConsultationWing"))}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">{t.consultationTypeAndFee}</span>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {confirmedAppointment.visitType === "REPORT_REVIEW"
                        ? t.diagnosticReportReview
                        : confirmedAppointment.visitType === "FOLLOWUP"
                        ? t.followupConsultation
                        : t.newPatientConsultation}
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                      {confirmedAppointment.fee === 0
                        ? t.freeReportReviewNotice
                        : `$${confirmedAppointment.fee} • ${
                            confirmedAppointment.paymentStatus === "PAID" ? t.paymentCompleted : t.paymentPending
                          }`}
                    </span>
                  </div>
                </div>

                {confirmedAppointment.notes && (
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-left text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t.patientNoteSymptoms}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                      {confirmedAppointment.notes}
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-slate-500 pt-1">
                  {t.arrivalNotice}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 cursor-pointer transition shadow-xs"
                >
                  <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>{t.printSlip}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 transition cursor-pointer"
                >
                  {t.done}
                </button>
              </div>
            </div>
          ) : !user ? (
            /* UNAUTHENTICATED PROMPT */
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center shadow-xs">
                <User className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.signInToReserve}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t.signInToReserveDesc}
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href="/auth/login"
                  className="px-6 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 transition"
                >
                  {t.signInDemoLogin}
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            /* BOOKING FORM */
            <form onSubmit={handleBook} className="space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Doctor Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.stepSelectPhysician}
                  </label>
                  <span className="text-[10px] text-slate-400">{t.clickDoctorSchedule}</span>
                </div>

                {loadingDoctors ? (
                  <div className="p-4 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                    {t.loadingConsultingDoctors}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {doctors.map((doc) => {
                      const isSelected = selectedDoctorId === doc.id;
                      const docSched = evaluateDoctorSchedule(
                        doc.schedule,
                        doc.visitingHours,
                        selectedDate,
                        doc.chamberAddress
                      );

                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => setSelectedDoctorId(doc.id)}
                          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2.5 cursor-pointer ${
                            isSelected
                              ? "border-[var(--brand-primary)] bg-[var(--brand-surface)] shadow-xs ring-1 ring-[var(--brand-primary)]"
                              : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 bg-[var(--bg-surface)]"
                          }`}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className="relative w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                              {doc.imageUrl ? (
                                <Image src={doc.imageUrl} alt={doc.name} fill className="object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                                  Dr.
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {doc.name}
                                </h4>
                                {docSched.isAvailableToday ? (
                                  <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {t("uiToday")}
                                  </span>
                                ) : (
                                  <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                                    {docSched.nextAvailableDay || (t("uiNextDay"))}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[var(--brand-text)] font-semibold truncate">
                                {doc.specialization}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {doc.chamberAddress || doc.hospital || (t("uiChamberOpen"))}
                              </p>
                            </div>
                          </div>

                          {/* Day Pills & Hours Row */}
                          <div className="w-full flex items-center justify-between gap-1 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px]">
                            <div className="flex items-center gap-0.5">
                              {docSched.dayStatusList.map((d) => (
                                <span
                                  key={d.day}
                                  title={`${d.fullDay}: ${d.isActive ? "Visiting Day" : "Off Day"}`}
                                  className={`w-4.5 h-4 rounded text-[8px] flex items-center justify-center font-bold ${
                                    d.isActive
                                      ? "bg-[var(--brand-primary)] text-white font-extrabold"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50"
                                  }`}
                                >
                                  {d.day.slice(0, 1)}
                                </span>
                              ))}
                            </div>
                            <span className="text-slate-500 font-mono text-[10px] truncate">
                              {docSched.formattedHours}
                            </span>
                          </div>

                          {/* Pricing Pills Row */}
                          <div className="flex items-center justify-between gap-1 w-full pt-1 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px]">
                            <span className="font-extrabold text-blue-700 dark:text-blue-300">
                              {t("uiSt")}: ${doc.newPatientFee ?? 50}
                            </span>
                            <span className="font-extrabold text-teal-700 dark:text-teal-300">
                              {t("uiReturn")}: ${doc.followupFee ?? 30}
                            </span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                              {t("uiReportFree")}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Doctor Summary Card */}
              {selectedDoctor && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-[var(--brand-primary)]" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedDoctor.name} ({selectedDoctor.specialization})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {selectedDoctor.schedule?.startTime && selectedDoctor.schedule?.endTime
                          ? `${selectedDoctor.schedule.startTime} - ${selectedDoctor.schedule.endTime}`
                          : selectedDoctor.visitingHours || "09:00 AM - 01:00 PM"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {selectedDoctor.chamberAddress || "Doctor Consultation Chamber"}
                      </span>
                    </div>
                  </div>

                  {/* Consultation Fee Banner */}
                  <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
                    <span className="font-semibold text-slate-500">{t("uiVisitingRates")}</span>
                    <span className="font-bold text-blue-700 dark:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md">
                      {t.firstVisit}: ${selectedDoctor.newPatientFee ?? 50}
                    </span>
                    <span className="font-bold text-teal-700 dark:text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-md">
                      {t.followup}: ${selectedDoctor.followupFee ?? 30} ({language === "bn" ? `${selectedDoctor.followupValidityDays ?? 90} দিনের মধ্যে` : `within ${selectedDoctor.followupValidityDays ?? 90}d`})
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {t.reportReview}: {t.free} ({language === "bn" ? `${selectedDoctor.reportFreeDays ?? 2} দিন` : `${selectedDoctor.reportFreeDays ?? 2}d`})
                    </span>
                  </div>
                </div>
              )}

              {/* 2. Date Selection (Full Width Separate Row) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.stepChooseDate}
                  </label>
                  <span className="text-[10px] text-slate-400">{t.queueSerialsAssigned}</span>
                </div>

                {/* Date Picker Input (Full Width Row) */}
                <div className="w-full">
                  <CustomDatePicker
                    minDate={todayStr}
                    value={selectedDate}
                    onChange={(val) => setSelectedDate(val)}
                    placeholder={t.selectAppointmentDate}
                    quickPresets={true}
                  />
                </div>

                {/* Full-Width Dedicated Visiting Date Info & Availability Card */}
                {selectedDoctor && visitingDayStatus && (
                  <div
                    className={`p-4 rounded-2xl border text-xs transition-all space-y-2.5 ${
                      visitingDayStatus.isAvailableOnDate
                        ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200"
                        : "bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2.5">
                        {visitingDayStatus.isAvailableOnDate ? (
                          <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <span className="font-black text-sm block">
                            {visitingDayStatus.isAvailableOnDate
                              ? `${t.confirmedVisitingDay} (${visitingDayStatus.selectedDayName})`
                              : `${t.regularOffDayNotice} (${visitingDayStatus.selectedDayName})`}
                          </span>
                          <span className="text-[11px] opacity-80">
                            {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/10 self-start sm:self-auto">
                        <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                        <span>{visitingDayStatus.formattedHours}</span>
                      </div>
                    </div>

                    <div className="text-[11px] leading-relaxed space-y-1">
                      <p className="font-medium">
                        {visitingDayStatus.isAvailableOnDate
                          ? (language === "bn"
                              ? `✓ ডাঃ ${selectedDoctor.name} নিয়মিতভাবে প্রতি ${visitingDayStatus.selectedDayName} চেম্বারে রোগী দেখেন (${selectedDoctor.chamberAddress || selectedDoctor.hospital || "প্রধান পরামর্শ চেম্বার"})। এই সেশনের জন্য আপনার সিরিয়াল টোকেন নির্ধারিত হবে।`
                              : `✓ Dr. ${selectedDoctor.name} regularly holds in-chamber consultations on ${visitingDayStatus.selectedDayName}s at ${selectedDoctor.chamberAddress || selectedDoctor.hospital || "Main OPD Consultation Chamber"}. Your serial queue ticket will be confirmed for this session.`)
                          : (language === "bn"
                              ? `⚠️ ডাঃ ${selectedDoctor.name} সাধারণত ${visitingDayStatus.selectedDayName}-বারে চেম্বারে বসেন না। ডাক্তারের নিয়মিত চেম্বারের দিনসমূহ: ${visitingDayStatus.activeDays.join(", ")}। জরুরি চিকিৎসা মূল্যায়নের জন্য আপনি এই সিরিয়াল সংরক্ষণ করতে পারেন অথবা নির্ধারিত কোনো দিন নির্বাচন করুন।`
                              : `⚠️ Dr. ${selectedDoctor.name} does not hold regular visiting hours on ${visitingDayStatus.selectedDayName}s. Regular visiting days are: ${visitingDayStatus.activeDays.join(", ")}. You may still reserve this serial for emergency clinical triage, or select one of the doctor's scheduled visiting days.`)}
                      </p>
                    </div>

                    {/* Schedule Emergency Disclaimer */}
                    <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-1.5 text-[10px] opacity-75 italic">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{t.emergencyScheduleDisclaimerText}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Reason / Clinical Symptoms */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.stepReasonSymptoms}
                  </label>
                  <span className="text-[10px] text-slate-400">{t.helpsDoctorPrepare}</span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {QUICK_VISIT_REASONS.map((item) => {
                    const text = language === "bn" ? item.bn : item.en;
                    return (
                      <button
                        key={item.en}
                        type="button"
                        onClick={() => setNotes((prev) => (prev ? `${prev}, ${text}` : text))}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition cursor-pointer border border-transparent hover:border-[var(--brand-border)]"
                      >
                        + {text}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.symptomsPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all resize-none"
                />
              </div>

              {/* 4. Pre-Consultation Clinical History, Allergies & Diet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.stepMedicalHistory}
                  </label>
                  <span className="text-[10px] text-slate-400">{t.transmittedSecurely}</span>
                </div>
                <ClinicalIntakeForm value={intake} onChange={setIntake} />
              </div>

              {/* 5. Consultation Fee & Visiting Policy */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {t.stepConsultationFee}
                    </span>
                  </div>
                  {loadingFee && (
                    <span className="text-[10px] text-slate-400 animate-pulse">{t("uiCalculatingRate")}</span>
                  )}
                </div>

                {effectiveBreakdown ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Option 1: First Visit */}
                      <button
                        type="button"
                        onClick={() => setSelectedVisitType("NEW")}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          selectedVisitType === "NEW"
                            ? "bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500"
                            : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-slate-600 dark:text-slate-400 hover:border-blue-300"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold block">{t.firstVisit}</span>
                        <span className="text-lg font-black font-mono block text-slate-900 dark:text-white">
                          ${effectiveBreakdown.newPatientFee}
                        </span>
                        <span className="text-[10px] opacity-75">{t.newPatientRegistration}</span>
                      </button>

                      {/* Option 2: Follow-up */}
                      <button
                        type="button"
                        onClick={() => setSelectedVisitType("FOLLOWUP")}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          selectedVisitType === "FOLLOWUP"
                            ? "bg-teal-500/10 border-teal-500 text-teal-900 dark:text-teal-200 ring-1 ring-teal-500"
                            : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-slate-600 dark:text-slate-400 hover:border-teal-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold block">{t.followup}</span>
                          {effectiveBreakdown.followupEligible && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-teal-500 text-white rounded font-bold">
                              {t.eligible}
                            </span>
                          )}
                        </div>
                        <span className="text-lg font-black font-mono block text-slate-900 dark:text-white">
                          ${effectiveBreakdown.followupFee}
                        </span>
                        <span className="text-[10px] opacity-75">
                          {language === "bn" ? `${effectiveBreakdown.followupValidityDays} দিন পর্যন্ত বৈধ` : `Valid up to ${effectiveBreakdown.followupValidityDays}d`}
                        </span>
                      </button>

                      {/* Option 3: Diagnostic Report Review */}
                      <button
                        type="button"
                        onClick={() => setSelectedVisitType("REPORT_REVIEW")}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          selectedVisitType === "REPORT_REVIEW"
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500"
                            : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-slate-600 dark:text-slate-400 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold block">{t.diagnosticReportReview}</span>
                          {effectiveBreakdown.isFreeReportReview && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500 text-white rounded font-bold">
                              {t.free}
                            </span>
                          )}
                        </div>
                        <span className="text-lg font-black font-mono block text-emerald-600 dark:text-emerald-400">
                          $0.00
                        </span>
                        <span className="text-[10px] opacity-75">
                          {language === "bn" ? `প্রথম সাক্ষাতের ${effectiveBreakdown.reportFreeDays} দিনের মধ্যে` : `Within ${effectiveBreakdown.reportFreeDays}d of initial visit`}
                        </span>
                      </button>
                    </div>

                    {/* Policy Verification & Eligibility Banner */}
                    {selectedVisitType === "FOLLOWUP" && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                          effectiveBreakdown.followupEligible
                            ? "bg-teal-500/10 border-teal-500/30 text-teal-900 dark:text-teal-200"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
                        }`}
                      >
                        {effectiveBreakdown.followupEligible ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <span className="font-bold block">
                            {effectiveBreakdown.followupEligible
                              ? (t("uiFollowUpConsultationVerified"))
                              : (t("uiFollowUpRateIneligible"))}
                          </span>
                          <p className="text-[11px] leading-relaxed">
                            {effectiveBreakdown.followupEligible
                              ? (language === "bn"
                                  ? `ডাঃ ${selectedDoctor?.name || "চিকিৎসক"}-এর পূর্ববর্তী রোগী হিসেবে যাচাই করা হয়েছে। শেষ পরামর্শ ছিল ${effectiveBreakdown.daysSinceLastVisit} দিন পূর্বে, যা ${effectiveBreakdown.followupValidityDays}-দিনের মেয়াদের মধ্যে রয়েছে।`
                                  : `Verified returning patient with Dr. ${
                                      selectedDoctor?.name || "physician"
                                    }. Last consultation was ${
                                      effectiveBreakdown.daysSinceLastVisit
                                    } days ago (${new Date(
                                      effectiveBreakdown.lastVisitDate!
                                    ).toLocaleDateString()}), well within the ${
                                      effectiveBreakdown.followupValidityDays
                                    }-day validity window. Linked to previous consultation (${
                                      effectiveBreakdown.previousPrescriptionId
                                        ? `Rx #${effectiveBreakdown.previousPrescriptionId.slice(0, 8)}...`
                                        : "Prior Visit"
                                    }).`
                                )
                              : (language === "bn"
                                  ? `ফলো-আপ ডিসকাউন্ট পেতে ডাঃ ${selectedDoctor?.name || "এই চিকিৎসক"}-এর অধীনে গত ${effectiveBreakdown.followupValidityDays} দিনের মধ্যে একটি পরামর্শ থাকতে হবে। কোনো বৈধ পূর্ববর্তী ভিজিট না থাকায় অনুগ্রহ করে প্রথম সাক্ষাৎ বেছে নিন ($${effectiveBreakdown.newPatientFee})।`
                                  : `Dr. ${
                                      selectedDoctor?.name || "this doctor"
                                    } requires an established prior consultation within ${
                                      effectiveBreakdown.followupValidityDays
                                    } days to qualify for the follow-up discount. Since no qualifying prior visit was found, please select First Visit ($${
                                      effectiveBreakdown.newPatientFee
                                    }).`
                                )}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedVisitType === "REPORT_REVIEW" && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                          effectiveBreakdown.isFreeReportReview
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
                        }`}
                      >
                        {effectiveBreakdown.isFreeReportReview ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <span className="font-bold block">
                            {effectiveBreakdown.isFreeReportReview
                              ? (t("uiFreeDiagnosticReportReviewQualified"))
                              : (t("uiReportReviewWindowExpiredIneligible"))}
                          </span>
                          <p className="text-[11px] leading-relaxed">
                            {effectiveBreakdown.isFreeReportReview
                              ? (language === "bn"
                                  ? `বিনামূল্যে রিপোর্ট রিভিউ নিশ্চিত হয়েছে! আপনার পূর্ববর্তী পরামর্শ ছিল ${effectiveBreakdown.daysSinceLastVisit === 0 ? "আজকে" : `${effectiveBreakdown.daysSinceLastVisit} দিন আগে`} (${effectiveBreakdown.reportFreeDays} দিনের মধ্যে যোগ্য)।`
                                  : `Complimentary review confirmed! Your prior consultation was ${
                                      effectiveBreakdown.daysSinceLastVisit === 0
                                        ? "today"
                                        : `${effectiveBreakdown.daysSinceLastVisit} day(s) ago`
                                    } (eligible within ${
                                      effectiveBreakdown.reportFreeDays
                                    } days). Linked to prior consultation #${
                                      effectiveBreakdown.previousPrescriptionId
                                        ? effectiveBreakdown.previousPrescriptionId.slice(0, 8)
                                        : "Record"
                                    }.`
                                )
                              : (language === "bn"
                                  ? `বিনামূল্যে রিপোর্ট পর্যালোচনা প্রাথমিক পরামর্শের ${effectiveBreakdown.reportFreeDays} দিনের মধ্যে পাওয়া যায়। অনুগ্রহ করে ফলো-আপ ($${effectiveBreakdown.followupFee}) বা ১ম সাক্ষাৎ ($${effectiveBreakdown.newPatientFee}) নির্বাচন করুন।`
                                  : `Complimentary review is only available within ${
                                      effectiveBreakdown.reportFreeDays
                                    } days of your initial consultation. Please select Follow-up ($${
                                      effectiveBreakdown.followupFee
                                    }) or First Visit ($${effectiveBreakdown.newPatientFee}).`
                                )}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedVisitType === "NEW" && (
                      <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold text-[var(--brand-text)] block">
                            {t("uiFirstVisitConsultationRate")}
                          </span>
                          <p className="text-[11px] leading-relaxed">
                            {language === "bn"
                              ? `ডাঃ ${selectedDoctor?.name || "চিকিৎসক"}-এর জন্য প্রমিত নিবন্ধন ও ট্রায়াজ। এই সাক্ষাতে পরবর্তী ${effectiveBreakdown.followupValidityDays} দিনের ফলো-আপ ডিসকাউন্ট ও ২ দিনের ফ্রি রিপোর্ট রিভিউ সক্রিয় হবে।`
                              : `Standard initial registration and full clinical triage for Dr. ${selectedDoctor?.name || "the physician"}. This visit automatically unlocks follow-up discounts for ${effectiveBreakdown.followupValidityDays} days and 2-day free report review.`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Itemized Payment Breakdown & Process Transparency */}
                    <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[var(--brand-primary)]" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {t.paymentDetailsTransparency}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold">
                          {selectedVisitType === "REPORT_REVIEW"
                            ? (t("uiComplimentary"))
                            : selectedVisitType === "FOLLOWUP"
                            ? (t("uiReturningPatientRate"))
                            : (t("uiStandardFirstConsultation"))}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>
                            {selectedVisitType === "REPORT_REVIEW"
                              ? t.diagnosticReportReview
                              : selectedVisitType === "FOLLOWUP"
                              ? `${t.followupConsultation} (${selectedDoctor?.name || "Specialist"})`
                              : `${t.newPatientConsultation} (${selectedDoctor?.name || "Specialist"})`}
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            ${chosenFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>{t.queueSerialIssuance}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {t("uiIncluded")}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-baseline">
                          <span className="font-bold text-slate-900 dark:text-white">{t.totalAmountPayable}</span>
                          <span className="text-lg font-black font-mono text-[var(--brand-text)]">
                            ${chosenFee.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Clear payment explanation banner */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-[11px] leading-relaxed space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <Shield className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                          <span>{t.whatHappensAfterSubmitting}</span>
                        </div>
                        {chosenFee === 0 ? (
                          <p className="text-slate-600 dark:text-slate-400">
                            {language === "bn"
                              ? `✓ আপনার পরামর্শটি ২ দিনের রিপোর্ট উইন্ডোর মধ্যে বিনামূল্যে মূল্যায়নের যোগ্য ($০.০০)। "বিনামূল্যে অ্যাপয়েন্টমেন্ট নিশ্চিত করুন" ক্লিক করলে কোনো কার্ড পেমেন্ট ছাড়াই তাৎক্ষণিকভাবে আপনার সিরিয়াল টোকেন তৈরি হবে।`
                              : `✓ Your consultation qualifies for free review ($0.00) within the 2-day report window. Clicking "Confirm Free Appointment" will immediately allocate your queue serial number and printable slip without any card payment.`}
                          </p>
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400">
                            {language === "bn"
                              ? `💳 ক্রেডিট/ডেবিট কার্ডের মাধ্যমে $${chosenFee.toFixed(2)} পরিশোধ করতে আপনাকে স্ট্রাইপ চেকআউটে নিয়ে যাওয়া হবে। সফল পেমেন্টের পর আপনার সিরিয়াল নম্বর সংরক্ষিত হবে।`
                              : `💳 You will be transferred to Stripe Checkout to pay $${chosenFee.toFixed(2)} via credit/debit card. Upon successful checkout, your serial number is confirmed and guaranteed in the visiting roster. (Demo quick payments are also supported).`}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 italic">
                          {t.emergencyScheduleDisclaimerText}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">{t("uiSelectADoctorAboveTo")}</p>
                )}
              </div>

              {/* Patient Badge Info */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    {t.bookingAs} <strong className="text-slate-900 dark:text-white">{user.name}</strong> ({user.email})
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[var(--brand-text)]">
                  {t.instantSerialIssuance}
                </span>
              </div>

              {/* Submit Buttons & Ineligibility Feedback */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    (selectedVisitType === "FOLLOWUP" && !effectiveBreakdown?.followupEligible) ||
                    (selectedVisitType === "REPORT_REVIEW" && !effectiveBreakdown?.isFreeReportReview)
                  }
                  className="px-6 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {submitting
                      ? t.processingConsultation
                      : selectedVisitType === "FOLLOWUP" && !effectiveBreakdown?.followupEligible
                      ? t.followupIneligible
                      : selectedVisitType === "REPORT_REVIEW" && !effectiveBreakdown?.isFreeReportReview
                      ? t.freeReviewIneligible
                      : chosenFee === 0
                      ? t.confirmFreeAppointment
                      : (language === "bn" ? `স্ট্রাইপ দিয়ে $${chosenFee.toFixed(2)} প্রদান ও সিরিয়াল নিশ্চিত করুন` : `Pay $${chosenFee.toFixed(2)} via Stripe & Reserve Serial`)}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
