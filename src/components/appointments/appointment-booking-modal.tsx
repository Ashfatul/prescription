"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Printer,
  X,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  User,
} from "lucide-react";

export interface PublicDoctorItem {
  id: string;
  name: string;
  imageUrl: string | null;
  specialization: string;
  degrees?: string | null;
  hospital?: string | null;
  chamberAddress?: string | null;
  contactNumber?: string | null;
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

export interface CreatedAppointment {
  id: string;
  serialNumber: number;
  appointmentDate: string;
  status: string;
  notes?: string | null;
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
  "Routine Health Checkup",
  "Fever & Seasonal Flu",
  "Chronic Disease Review",
  "Prescription Refill",
  "Diagnostic Report Follow-up",
  "Post-Op Consultation",
];

export function AppointmentBookingModal({
  isOpen,
  onClose,
  initialDoctorId,
  onSuccess,
}: AppointmentBookingModalProps) {
  const { user } = useAuth();
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

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId);
  }, [doctors, selectedDoctorId]);

  // Check if chosen date matches doctor visiting days
  const visitingDayStatus = useMemo(() => {
    if (!selectedDoctor?.schedule?.days || !selectedDate) return null;
    const dateObj = new Date(selectedDate);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const chosenDay = dayNames[dateObj.getDay()];

    const scheduledDays = Array.isArray(selectedDoctor.schedule.days)
      ? selectedDoctor.schedule.days
      : [selectedDoctor.schedule.days];

    const isVisitingDay = scheduledDays.some((d) =>
      chosenDay.toLowerCase().includes(d.toLowerCase().slice(0, 3))
    );

    return {
      chosenDay,
      isVisitingDay,
      visitingDaysText: scheduledDays.join(", "),
    };
  }, [selectedDoctor, selectedDate]);

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
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to book appointment");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {confirmedAppointment ? "Appointment Confirmed" : "Book Doctor Consultation"}
              </h2>
              <p className="text-xs text-slate-500">
                {confirmedAppointment
                  ? "Your chamber visit serial number has been reserved"
                  : "Select specialist, visiting date, and reserve your serial queue ticket"}
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
        <div className="p-6">
          {/* SUCCESS APPOINTMENT SLIP */}
          {confirmedAppointment ? (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[var(--brand-surface)] border-2 border-[var(--brand-primary)]/30 text-center space-y-3 print:border-black print:bg-white">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                    Official Appointment Ticket
                  </span>
                  <div className="mt-1 flex items-baseline justify-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Your Serial:</span>
                    <span className="text-4xl font-black text-[var(--brand-primary)] tracking-tight">
                      #{confirmedAppointment.serialNumber}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--brand-primary)]/20 grid grid-cols-2 gap-3 text-left text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Consulting Physician</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {confirmedAppointment.doctor.user.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {confirmedAppointment.doctor.specialization}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Patient Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {confirmedAppointment.patient.user.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {confirmedAppointment.patient.user.phone || confirmedAppointment.patient.user.email}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Date of Consultation</span>
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
                    <span className="text-slate-400 block text-[11px] font-medium">Chamber Location</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {confirmedAppointment.doctor.chamberAddress || "Main OPD Consultation Wing"}
                    </span>
                  </div>
                </div>

                {confirmedAppointment.notes && (
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-left text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Patient Note / Symptoms:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                      {confirmedAppointment.notes}
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-slate-500 pt-1">
                  ⚠️ Please arrive 15 minutes prior to the chamber schedule with previous medical reports.
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
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 transition cursor-pointer"
                >
                  Done
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
                  Sign in to Reserve Your Appointment
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Please log in or register your patient account to automatically record your consultation serial and link future prescriptions.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href="/auth/login"
                  className="px-6 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 transition"
                >
                  Sign In / Quick Demo Login
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  1. Select Consulting Physician
                </label>
                {loadingDoctors ? (
                  <div className="p-4 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                    Loading consulting doctors...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {doctors.map((doc) => {
                      const isSelected = selectedDoctorId === doc.id;
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => setSelectedDoctorId(doc.id)}
                          className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? "border-[var(--brand-primary)] bg-[var(--brand-surface)] shadow-xs"
                              : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                          }`}
                        >
                          <div className="relative w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                            {doc.imageUrl ? (
                              <Image src={doc.imageUrl} alt={doc.name} fill className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                                Dr.
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {doc.name}
                            </h4>
                            <p className="text-[11px] text-[var(--brand-text)] font-semibold truncate">
                              {doc.specialization}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {doc.chamberAddress || doc.hospital || "Chamber Open"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Doctor Summary Card */}
              {selectedDoctor && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedDoctor.name} ({selectedDoctor.specialization})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {selectedDoctor.schedule?.startTime && selectedDoctor.schedule?.endTime
                        ? `${selectedDoctor.schedule.startTime} - ${selectedDoctor.schedule.endTime}`
                        : "09:00 AM - 01:00 PM"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedDoctor.chamberAddress || "Room 301"}
                    </span>
                  </div>
                </div>
              )}

              {/* 2. Date Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  2. Consultation Date
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs cursor-pointer shadow-xs"
                    required
                  />

                  {visitingDayStatus && (
                    <div
                      className={`p-2.5 rounded-xl border text-[11px] font-semibold flex items-center gap-2 ${
                        visitingDayStatus.isVisitingDay
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                          : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      <span>
                        {visitingDayStatus.isVisitingDay ? "✓ Visiting Day:" : "⚠️ Off-Day Notice:"}
                      </span>
                      <span className="font-bold">
                        {visitingDayStatus.chosenDay} (Days: {visitingDayStatus.visitingDaysText})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Reason / Clinical Symptoms */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    3. Reason for Visit / Symptoms (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400">Helps doctor prepare</span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {QUICK_VISIT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setNotes((prev) => (prev ? `${prev}, ${reason}` : reason))}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition cursor-pointer border border-transparent hover:border-[var(--brand-border)]"
                    >
                      + {reason}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your symptoms or reason for consulting the doctor..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Patient Badge Info */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    Booking as: <strong className="text-slate-900 dark:text-white">{user.name}</strong> ({user.email})
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[var(--brand-text)]">
                  Instant Serial Issuance
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
                >
                  <span>{submitting ? "Reserving Serial..." : "Confirm & Reserve Serial Ticket"}</span>
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
