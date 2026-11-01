"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  Pill,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import { createGoogleCalendarMedicineReminderUrl } from "@/lib/calendar";

type ReminderItem = {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timeOfDay: string;
  notes?: string | null;
  isActive: boolean;
  googleCalUrl?: string | null;
  createdAt: string;
};

export function MedicineRemindersView({ patientId }: { patientId?: string }) {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("1+0+1");
  const [timeOfDay, setTimeOfDay] = useState("Morning & Night (After meals)");
  const [notes, setNotes] = useState("");

  const fetchReminders = () => {
    setLoading(true);
    const url = patientId
      ? `/api/medicine-reminders?patientId=${patientId}`
      : "/api/medicine-reminders";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setReminders(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    const url = patientId
      ? `/api/medicine-reminders?patientId=${patientId}`
      : "/api/medicine-reminders";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setReminders(data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/medicine-reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !current } : r))
      );
    } catch {
      // Ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/medicine-reminders/${id}`, { method: "DELETE" });
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // Ignore
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/medicine-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineName,
          dosage,
          frequency,
          timeOfDay,
          notes,
          patientId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setMedicineName("");
        setDosage("");
        setNotes("");
        fetchReminders();
      }
    } catch {
      // Ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
              <Pill className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Medicine Schedule & Dosing Reminders
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Never miss a prescribed dose. Sync recurring medicine reminders with Google Calendar with 1-click.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine Reminder</span>
        </button>
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--brand-primary)] mb-2" />
          <span>Loading medication reminders...</span>
        </div>
      ) : reminders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
          <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No Active Reminders
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Reminders will appear here when generated from your doctor&apos;s prescription or added manually.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reminders.map((reminder) => {
            const gCalUrl =
              reminder.googleCalUrl ||
              createGoogleCalendarMedicineReminderUrl({
                medicineName: reminder.medicineName,
                dosage: reminder.dosage,
                frequency: reminder.frequency,
                timing: reminder.timeOfDay,
                instructions: reminder.notes || undefined,
              });

            return (
              <div
                key={reminder.id}
                className={`p-5 rounded-3xl bg-[var(--bg-surface)] border transition flex flex-col justify-between space-y-4 shadow-xs ${
                  reminder.isActive
                    ? "border-[var(--border-subtle)] hover:border-[var(--brand-border)]"
                    : "border-dashed opacity-60"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] text-[10px] font-bold font-mono">
                      {reminder.frequency}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {reminder.medicineName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {reminder.dosage} • {reminder.timeOfDay}
                    </p>
                    {reminder.notes && (
                      <p className="text-[11px] text-slate-400 italic pt-1">
                        Note: {reminder.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                  <a
                    href={gCalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Add to Google Calendar</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 text-[11px]">
                      <input
                        type="checkbox"
                        checked={reminder.isActive}
                        onChange={() => handleToggle(reminder.id, reminder.isActive)}
                        className="w-3.5 h-3.5 accent-[var(--brand-primary)]"
                      />
                      <span>Active Schedule</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDelete(reminder.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                New Medicine Reminder
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Napa Extra or Maxpro"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Strength / Dosage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg or 20mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Frequency
                  </label>
                  <CustomSelect
                    value={frequency}
                    onChange={(val) => setFrequency(val)}
                    options={[
                      { value: "1+0+1", label: "1+0+1 (Twice Daily)" },
                      { value: "1+1+1", label: "1+1+1 (Thrice Daily)" },
                      { value: "1+0+0", label: "1+0+0 (Morning Only)" },
                      { value: "0+0+1", label: "0+0+1 (Bedtime)" },
                      { value: "As Needed", label: "As Needed (PRN)" },
                    ]}
                    searchable={false}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  Timing Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. 30 mins before breakfast & dinner"
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  Notes / Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Drink plenty of water"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-default)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white font-bold"
                >
                  {submitting ? "Saving..." : "Create Reminder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
