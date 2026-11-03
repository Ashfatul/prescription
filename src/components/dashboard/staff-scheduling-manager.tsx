"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
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

type DoctorItem = {
  id: string;
  specialization: string;
  degrees?: string | null;
  hospital?: string | null;
  chamberAddress?: string | null;
  contactNumber?: string | null;
  visitingHours?: string | null;
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
  const { t, language } = useLanguage();
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit doctor schedule modal
  const [editingDoctor, setEditingDoctor] = useState<DoctorItem | null>(null);
  const [visitingHours, setVisitingHours] = useState("");
  const [chamberAddress, setChamberAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [saving, setSaving] = useState(false);

  // Search filter
  const [search, setSearch] = useState("");

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
    setVisitingHours(doc.visitingHours || "09:00 AM - 01:00 PM");
    setChamberAddress(doc.chamberAddress || "");
    setContactNumber(doc.contactNumber || "");
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
          visitingHours,
          chamberAddress,
          contactNumber,
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
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
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
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-slate-400">
          {t.noDoctorsMatchSearch}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredDoctors.map((doc) => {
            const bookedToday = doc.appointments || [];

            return (
              <div
                key={doc.id}
                className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition shadow-xs flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Doctor Info Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
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
                  <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t.visitingHoursLabel}: <strong>{doc.visitingHours || (language === "bn" ? "নির্দিষ্ট নয়" : "Not specified")}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t.chamberLabel}: <strong>{doc.chamberAddress || (language === "bn" ? "মূল ওপিডি" : "Main OPD")}</strong></span>
                    </div>
                    {doc.contactNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{t.chamberPhoneLabel}: <strong>{doc.contactNumber}</strong></span>
                      </div>
                    )}
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

      {/* Edit Doctor Schedule Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t.editChamberSchedule}
                </h3>
                <p className="text-xs text-slate-500">{editingDoctor.user.name}</p>
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
              <div className="modal-body flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    {t.visitingHoursDays}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sat-Thu 09:00 AM - 01:00 PM"
                    value={visitingHours}
                    onChange={(e) => setVisitingHours(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    {t.chamberRoomLocation}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 301, 3rd Floor"
                    value={chamberAddress}
                    onChange={(e) => setChamberAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    {t.chamberContactPhone}
                  </label>
                  <input
                    type="tel"
                    placeholder="+880 1711-234567"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white"
                  />
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
