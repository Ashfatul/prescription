"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Edit,
  Loader2,
  MapPin,
  Phone,
  Power,
  X,
  XCircle,
} from "lucide-react";
import { createGoogleCalendarAppointmentUrl } from "@/lib/calendar";
import { useLanguage } from "@/lib/i18n/language-context";
import { CustomSelect } from "@/components/common/custom-select";

type DoctorItem = {
  id: string;
  specialization: string;
  degrees?: string | null;
  hospital?: string | null;
  chamberAddress?: string | null;
  contactNumber?: string | null;
  visitingHours?: string | null;
  doctorFee?: number | null;
  clinicFee?: number | null;
  newPatientFee?: number | null;
  doctorFollowupFee?: number | null;
  clinicFollowupFee?: number | null;
  followupFee?: number | null;
  followupValidityDays?: number | null;
  reportFreeDays?: number | null;
  scheduleJson?: { days?: string[]; startTime?: string; endTime?: string; chamber?: string } | null;
  available: boolean;
  user: {
    name: string;
    email: string;
  };
  appointments: Array<{
    id: string;
    serialNumber: number;
    status: string;
    appointmentDate: string;
    patient: {
      user: { name: string; phone?: string | null };
    };
  }>;
};

export function StaffSchedulingManager() {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit doctor schedule modal
  const [editingDoctor, setEditingDoctor] = useState<DoctorItem | null>(null);
  const [chamberAddress, setChamberAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [scheduleStart, setScheduleStart] = useState("09:00");
  const [scheduleEnd, setScheduleEnd] = useState("13:00");
  const [doctorFee, setDoctorFee] = useState<number>(40);
  const [clinicFee, setClinicFee] = useState<number>(10);
  const [doctorFollowupFee, setDoctorFollowupFee] = useState<number>(25);
  const [clinicFollowupFee, setClinicFollowupFee] = useState<number>(5);
  const [followupValidityDays, setFollowupValidityDays] = useState<number>(90);
  const [reportFreeDays, setReportFreeDays] = useState<number>(2);
  const [saving, setSaving] = useState(false);

  // Search filter
  const [search, setSearch] = useState("");

  const totalConsultationFee = (Number(doctorFee) || 0) + (Number(clinicFee) || 0);
  const totalFollowupFee = (Number(doctorFollowupFee) || 0) + (Number(clinicFollowupFee) || 0);

  const fetchDoctors = () => {
    setLoading(true);
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setDoctors(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setDoctors(data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleAvailability = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/doctors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !current }),
      });
      setDoctors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, available: !current } : d))
      );
    } catch {
      // Ignore
    }
  };

  const openEditModal = (doc: DoctorItem) => {
    setEditingDoctor(doc);
    setChamberAddress(doc.chamberAddress || "");
    setContactNumber(doc.contactNumber || "");
    setScheduleDays(doc.scheduleJson?.days || ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]);
    setScheduleStart(doc.scheduleJson?.startTime || "09:00");
    setScheduleEnd(doc.scheduleJson?.endTime || "13:00");
    setDoctorFee(doc.doctorFee ?? 40);
    setClinicFee(doc.clinicFee ?? 10);
    setDoctorFollowupFee(doc.doctorFollowupFee ?? 25);
    setClinicFollowupFee(doc.clinicFollowupFee ?? 5);
    setFollowupValidityDays(doc.followupValidityDays ?? 90);
    setReportFreeDays(doc.reportFreeDays ?? 2);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/doctors/${editingDoctor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitingHours: `${scheduleDays.join(", ")} ${scheduleStart} - ${scheduleEnd}`,
          scheduleJson: {
            days: scheduleDays,
            startTime: scheduleStart,
            endTime: scheduleEnd,
            chamber: chamberAddress,
          },
          chamberAddress,
          contactNumber,
          doctorFee: Number(doctorFee) || 0,
          clinicFee: Number(clinicFee) || 0,
          newPatientFee: totalConsultationFee,
          doctorFollowupFee: Number(doctorFollowupFee) || 0,
          clinicFollowupFee: Number(clinicFollowupFee) || 0,
          followupFee: totalFollowupFee,
          followupValidityDays: Number(followupValidityDays) || 90,
          reportFreeDays: Number(reportFreeDays) ?? 2,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingDoctor(null);
        fetchDoctors();
      }
    } catch {
      // Ignore
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchDoctors();
    } catch {
      // Ignore
    }
  };

  const filteredDoctors = doctors.filter((d) => {
    const term = search.toLowerCase();
    return (
      d.user.name.toLowerCase().includes(term) ||
      d.specialization.toLowerCase().includes(term) ||
      (d.chamberAddress && d.chamberAddress.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.physicianSchedulingTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {t.physicianSchedulingSubtitle}
          </p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder={t.searchPhysicianOrChamber}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>
      </div>

      {/* Doctor Duty Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--brand-primary)] mb-2" />
          <span>{t.loadingPhysicianRosters}</span>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-slate-400">
          {t.noDoctorsMatchSearch}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredDoctors.map((doc) => {
            const bookedToday = doc.appointments || [];

            return (
              <div
                key={doc.id}
                className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition shadow-xs flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Doctor Info Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {doc.user.name.split(" ")[1]?.charAt(0) || "D"}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {doc.user.name}
                        </h3>
                        <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                          {doc.specialization}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {doc.degrees || "MBBS"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(doc.id, doc.available)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        doc.available
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{doc.available ? t.onDuty : t.offDuty}</span>
                    </button>
                  </div>

                  {/* Chamber Details */}
                  <div className="p-3 rounded-lg bg-[var(--bg-subtle)] space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t.visitingHoursLabel}: <strong>{doc.visitingHours || (t("uiNotSpecified"))}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t.chamberLabel}: <strong>{doc.chamberAddress || (t("uiMainOPD"))}</strong></span>
                    </div>
                    {doc.contactNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{t.chamberPhoneLabel}: <strong>{doc.contactNumber}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown Badge */}
                  <div className="p-3 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)] text-xs text-[var(--brand-text)] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">{t.newPatientFeeLabel}:</span>
                      <span className="font-mono font-black text-sm">
                        ${doc.newPatientFee ?? ((doc.doctorFee ?? 40) + (doc.clinicFee ?? 10))}
                      </span>
                      <span className="text-[10px] opacity-75 font-medium">
                        (Dr: ${doc.doctorFee ?? 40} + Clinic: ${doc.clinicFee ?? 10})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">{t.followupFeeLabel}:</span>
                      <span className="font-mono font-black text-sm">
                        ${doc.followupFee ?? ((doc.doctorFollowupFee ?? 25) + (doc.clinicFollowupFee ?? 5))}
                      </span>
                      <span className="text-[10px] opacity-75 font-medium">
                        (Dr: ${doc.doctorFollowupFee ?? 25} + Clinic: ${doc.clinicFollowupFee ?? 5})
                      </span>
                    </div>
                  </div>

                  {/* Today's Appointments Mini Queue */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {t.bookedPatientConsultations} ({bookedToday.length})
                      </span>
                      <span className="text-[10px] text-teal-600 font-semibold">
                        {t.liveChamberRoster}
                      </span>
                    </div>

                    {bookedToday.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic p-2 rounded-xl bg-[var(--bg-app)] text-center">
                        {t.noAppointmentsToday}
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {bookedToday.map((apt) => {
                          const gCalUrl = createGoogleCalendarAppointmentUrl({
                            doctorName: doc.user.name,
                            patientName: apt.patient.user.name,
                            appointmentDate: new Date(apt.appointmentDate),
                            serialNumber: apt.serialNumber,
                            chamberAddress: doc.chamberAddress || undefined,
                          });

                          return (
                            <div
                              key={apt.id}
                              className="p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-between text-xs gap-2"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-6 h-6 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] font-black text-[10px] flex items-center justify-center shrink-0">
                                  #{apt.serialNumber}
                                </span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {apt.patient.user.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <a
                                  href={gCalUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition"
                                  title="Add consultation to Google Calendar"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                </a>

                                {apt.status === "PENDING" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateAppointmentStatus(apt.id, "CONFIRMED")
                                      }
                                      className="p-1 rounded-lg text-amber-500 hover:text-emerald-500 transition cursor-pointer"
                                      title="Verify and Confirm appointment"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateAppointmentStatus(apt.id, "CANCELLED")
                                      }
                                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                      title="Reject / Cancel request"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}

                                {(apt.status === "CONFIRMED" || apt.status === "BOOKED") && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateAppointmentStatus(apt.id, "COMPLETED")
                                      }
                                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-500 transition cursor-pointer"
                                      title="Mark completed"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateAppointmentStatus(apt.id, "CANCELLED")
                                      }
                                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                      title="Cancel appointment"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Edit Button */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {t.status}: {doc.available ? t.acceptingPatients : t.chamberPaused}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEditModal(doc)}
                    className="px-3 py-1.5 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3 h-3" />
                    <span>{t.editRosterHours}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Doctor Schedule & Pricing Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t.editChamberSchedule} &amp; {t.pricingScheduleConfiguration}
                </h3>
                <p className="text-xs text-slate-500">{editingDoctor.user.name} • {editingDoctor.specialization}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingDoctor(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-body flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                {/* Notice Banner */}
                <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3 text-xs text-[var(--brand-text)] flex items-center gap-2">
                  <span className="font-bold shrink-0">💡 {t.pricingBreakdownNotice}</span>
                </div>

                {/* Section A: Chamber Roster & Timing */}
                <div className="space-y-3 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>{t.visitingHoursLabel} &amp; {t.chamberRoomLocation}</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                      {t.visitingHoursDays}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setScheduleDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day])}
                          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold cursor-pointer transition ${scheduleDays.includes(day) ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white" : "border-[var(--border-default)] bg-[var(--bg-app)] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1.5">
                      <label className="space-y-1 text-[10px] font-bold text-slate-500">
                        <span>Start time</span>
                        <input type="time" required value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] px-3 py-2 text-sm text-slate-900 dark:text-white" />
                      </label>
                      <label className="space-y-1 text-[10px] font-bold text-slate-500">
                        <span>End time</span>
                        <input type="time" required value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)} className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] px-3 py-2 text-sm text-slate-900 dark:text-white" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                        {t.chamberRoomLocation}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Room 301, 3rd Floor"
                        value={chamberAddress}
                        onChange={(e) => setChamberAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                        {t.chamberContactPhone}
                      </label>
                      <input
                        type="tel"
                        placeholder="+880 1711-234567"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Pricing & Fee Configuration */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.pricingScheduleConfiguration}</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* First Consultation Box */}
                    <div className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] space-y-2.5">
                      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-subtle)]">
                        <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200">
                          {t.newPatientFeeLabel}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.totalPatientFee}</span>
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            ${totalConsultationFee}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                            {t.doctorCharge} ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            required
                            value={doctorFee}
                            onChange={(e) => setDoctorFee(Math.max(0, Number(e.target.value)))}
                            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                            {t.clinicCharge} ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            required
                            value={clinicFee}
                            onChange={(e) => setClinicFee(Math.max(0, Number(e.target.value)))}
                            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Follow-up Box */}
                    <div className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-app)] space-y-2.5">
                      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-subtle)]">
                        <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200">
                          {t.followupFeeLabel}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.totalPatientFee}</span>
                          <span className="text-sm font-black text-teal-600 dark:text-teal-400 font-mono">
                            ${totalFollowupFee}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                            {t.doctorFollowupCharge} ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            required
                            value={doctorFollowupFee}
                            onChange={(e) => setDoctorFollowupFee(Math.max(0, Number(e.target.value)))}
                            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                            {t.clinicFollowupCharge} ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            required
                            value={clinicFollowupFee}
                            onChange={(e) => setClinicFollowupFee(Math.max(0, Number(e.target.value)))}
                            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {t.followupValidityLabel}
                      </label>
                      <CustomSelect
                        allowClear={false}
                        value={String(followupValidityDays)}
                        onChange={(val) => setFollowupValidityDays(Number(val))}
                        options={[
                          { value: "30", label: t.opt30Days },
                          { value: "60", label: t.opt60Days },
                          { value: "90", label: t.opt90Days },
                          { value: "180", label: t.opt180Days },
                        ]}
                        searchable={false}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {t.freeReportReviewLabel}
                      </label>
                      <CustomSelect
                        allowClear={false}
                        value={String(reportFreeDays)}
                        onChange={(val) => setReportFreeDays(Number(val))}
                        options={[
                          { value: "0", label: t.optNoFree },
                          { value: "2", label: t.opt2Days },
                          { value: "3", label: t.opt3Days },
                          { value: "5", label: t.opt5Days },
                          { value: "7", label: t.opt7Days },
                        ]}
                        searchable={false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer shrink-0 flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-default)] text-slate-600 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white font-bold cursor-pointer hover:opacity-90 disabled:opacity-50 transition shadow-xs"
                >
                  {saving ? t.saving : t.updateSchedule}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
