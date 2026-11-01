"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { AppointmentBookingModal } from "@/components/appointments/appointment-booking-modal";

type ScheduleData = {
  days?: string[] | string;
  startTime?: string;
  endTime?: string;
  hours?: string;
  chamber?: string;
  [key: string]: unknown;
};

type PublicDoctor = {
  id: string;
  name: string;
  imageUrl: string | null;
  specialization: string;
  available: boolean;
  schedule: ScheduleData | null;
  currentSerial: number;
};

function formatSchedule(schedule: ScheduleData | null | undefined): string | null {
  if (!schedule || typeof schedule !== "object") return null;

  if (schedule.days) {
    const daysStr = Array.isArray(schedule.days)
      ? schedule.days.map((d) => d.slice(0, 3)).join(", ")
      : String(schedule.days);
    const timeStr =
      schedule.hours ||
      (schedule.startTime && schedule.endTime ? `${schedule.startTime} - ${schedule.endTime}` : null) ||
      schedule.startTime ||
      "";
    const chamberStr = schedule.chamber ? ` • ${schedule.chamber}` : "";
    return timeStr ? `${daysStr}: ${timeStr}${chamberStr}` : `${daysStr}${chamberStr}`;
  }

  const entries = Object.entries(schedule).filter(([, v]) => typeof v === "string" || typeof v === "number");
  if (entries.length > 0) {
    return entries
      .map(([key, val]) => {
        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase())
          .trim();
        return `${formattedKey}: ${val}`;
      })
      .join(" | ");
  }

  return null;
}

export function DoctorList() {
  const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<string | undefined>(undefined);
  const { t } = useLanguage();

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/public/doctors");
        if (!res.ok) return;
        const payload = await res.json();
        if (active && payload.success && Array.isArray(payload.data)) {
          setDoctors(payload.data);
        }
      } catch (err) {
        console.error("Failed to load doctor list:", err);
      }
    };

    void load();
    const timer = setInterval(load, 8000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (!doctors.length) {
    return (
      <div className="p-8 text-center rounded-3xl bg-[var(--bg-surface)] border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500">No doctors available right now.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {doctors.map((doctor, index) => {
        const formattedSchedule = formatSchedule(doctor.schedule);

        return (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex flex-col justify-between p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:border-[var(--brand-border)] hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                  {doctor.imageUrl ? (
                    <Image
                      src={doctor.imageUrl}
                      alt={doctor.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                      Dr.
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        doctor.available ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        doctor.available
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-slate-400"
                      }`}
                    >
                      {doctor.available ? "Chamber Open" : "Offline"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {doctor.name}
                  </h3>
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] mt-1 truncate max-w-full">
                    {doctor.specialization}
                  </span>
                </div>
              </div>

              {formattedSchedule && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/80 mb-3 text-xs">
                  <span className="font-semibold text-slate-500 uppercase text-[10px] block mb-0.5">
                    {t.schedule}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-snug">
                    {formattedSchedule}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  {t.currentSerial}
                </span>
                <span className="text-sm font-extrabold text-[var(--brand-text)]">
                  #{doctor.currentSerial || "1"}
                </span>
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Queue Active
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedDoctorForBooking(doctor.id);
                setIsBookingModalOpen(true);
              }}
              className="w-full mt-3 py-2 px-3 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-90 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Consultation</span>
            </button>
          </motion.div>
        );
      })}

      <AppointmentBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialDoctorId={selectedDoctorForBooking}
      />
    </div>
  );
}
