"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Search, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  Sparkles,
  Filter
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";
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
  degrees?: string | null;
  hospital?: string | null;
  chamberAddress?: string | null;
  contactNumber?: string | null;
  available: boolean;
  schedule: ScheduleData | null;
  currentSerial: number;
};

const INITIAL_DISPLAY_LIMIT = 9;

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

interface DoctorListProps {
  initialLimit?: number;
}

export function DoctorList({ initialLimit = INITIAL_DISPLAY_LIMIT }: DoctorListProps = {}) {
  const { user } = useAuth();
  const isStaffOrDoctor = user && (user.role === "DOCTOR" || user.role === "STAFF" || user.role === "SUPER_ADMIN");

  const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<string | undefined>(undefined);
  
  // Filtering & Expand/Collapse state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");
  const [isExpanded, setIsExpanded] = useState(false);

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
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    const timer = setInterval(load, 8000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  // Compute unique specializations
  const specializations = useMemo(() => {
    const specs = new Set<string>();
    doctors.forEach((d) => {
      if (d.specialization) specs.add(d.specialization.trim());
    });
    return ["All", ...Array.from(specs)];
  }, [doctors]);

  // Filtered doctors based on search & specialization
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.degrees && doc.degrees.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.hospital && doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSpecialty =
        selectedSpecialty === "All" ||
        doc.specialization.toLowerCase() === selectedSpecialty.toLowerCase();

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchQuery, selectedSpecialty]);

  // Sliced doctors based on expander state
  const displayedDoctors = useMemo(() => {
    if (isExpanded) {
      return filteredDoctors;
    }
    return filteredDoctors.slice(0, initialLimit);
  }, [filteredDoctors, isExpanded, initialLimit]);

  const hasMore = filteredDoctors.length > initialLimit;

  if (loading && !doctors.length) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] animate-pulse space-y-4"
          >
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
              </div>
            </div>
            <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (!doctors.length) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
        <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Consulting Doctors Active</h3>
        <p className="text-xs text-slate-500 mt-1">Please check back during regular OPD chamber visiting hours.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Specialization Filters Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsExpanded(true); // Auto-expand when searching
              }}
              placeholder="Search by physician name, department, or degree..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-input)] text-xs text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
            />
          </div>

          {/* Accurate Result Counter */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium px-2">
            <Filter className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
            <span>
              Showing <strong className="text-[var(--text-primary)] font-bold">{displayedDoctors.length}</strong> of{" "}
              <strong className="text-[var(--text-primary)] font-bold">{filteredDoctors.length}</strong>
              {filteredDoctors.length !== doctors.length && (
                <span className="text-slate-400"> (filtered from {doctors.length} total)</span>
              )}{" "}
              Physicians
            </span>
          </div>
        </div>

        {/* Category Chips Scroll */}
        {specializations.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            {specializations.map((spec) => {
              const active = selectedSpecialty === spec;
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => {
                    setSelectedSpecialty(spec);
                    setIsExpanded(false); // Reset to preview limit when changing category
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-[var(--brand-primary)] text-white shadow-xs"
                      : "bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {spec}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Doctor Cards Grid */}
      {displayedDoctors.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            No doctors found matching &ldquo;{searchQuery}&rdquo; in {selectedSpecialty}.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedSpecialty("All");
            }}
            className="mt-3 text-xs font-bold text-[var(--brand-text)] hover:underline"
          >
            Clear filters and reset
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {displayedDoctors.map((doctor, index) => {
              const formattedSchedule = formatSchedule(doctor.schedule);

              return (
                <motion.div
                  key={doctor.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className="flex flex-col justify-between p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Doctor Top Avatar & Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <Link
                        href={`/doctors/${doctor.id}`}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] shadow-2xs hover:border-[var(--brand-border)] transition"
                      >
                        {doctor.imageUrl ? (
                          <Image
                            src={doctor.imageUrl}
                            alt={doctor.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-black text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                            Dr.
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        {/* Live Chamber Status Pill */}
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

                        <Link
                          href={`/doctors/${doctor.id}`}
                          className="text-base font-bold text-[var(--text-primary)] hover:text-[var(--brand-text)] transition truncate block"
                          title={doctor.name}
                        >
                          {doctor.name}
                        </Link>

                        {doctor.degrees && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={doctor.degrees}>
                            {doctor.degrees}
                          </p>
                        )}

                        <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]/50 mt-1.5 truncate max-w-full">
                          {doctor.specialization}
                        </span>
                      </div>
                    </div>

                    {/* Hospital & Chamber Location */}
                    {doctor.hospital && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mb-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doctor.hospital}</span>
                      </div>
                    )}

                    {/* Visiting Schedule Pill */}
                    {formattedSchedule && (
                      <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] mb-4 text-xs">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          <Clock className="w-3 h-3 text-[var(--brand-primary)]" />
                          <span>{t.schedule}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-snug font-medium">
                          {formattedSchedule}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    {/* Live Serial Counter */}
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {t.currentSerial}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-[var(--brand-text)]">
                            #{doctor.currentSerial || "1"}
                          </span>
                          <span className="text-[10px] text-slate-400">in chamber</span>
                        </div>
                      </div>

                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-[var(--border-subtle)]">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Live Queue</span>
                      </span>
                    </div>

                    {/* Action Row: View Profile & Conditional Book Button */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/doctors/${doctor.id}`}
                        className="py-2.5 px-3 rounded-xl border border-[var(--border-default)] hover:border-[var(--brand-border)] bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-semibold text-center transition flex-1 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Profile & Info</span>
                      </Link>

                      {!isStaffOrDoctor && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDoctorForBooking(doctor.id);
                            setIsBookingModalOpen(true);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-90 transition shadow-xs flex items-center justify-center gap-1 cursor-pointer flex-1"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Visit</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* "Show More" / "Show Less" Trigger */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-strong)]/40 hover:border-[var(--brand-primary)] text-xs font-bold text-[var(--text-primary)] hover:text-[var(--brand-text)] shadow-xs transition-all cursor-pointer group"
          >
            {isExpanded ? (
              <>
                <span>Show Less (Show First {initialLimit})</span>
                <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              </>
            ) : (
              <>
                <span>
                  Show More (+{filteredDoctors.length - initialLimit} More Physicians)
                </span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialDoctorId={selectedDoctorForBooking}
      />
    </div>
  );
}
