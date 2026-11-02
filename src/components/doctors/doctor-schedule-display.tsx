"use client";

import { useMemo } from "react";
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import {
  ScheduleData,
  evaluateDoctorSchedule,
  EMERGENCY_SCHEDULE_DISCLAIMER,
} from "@/lib/doctor-schedule";

interface DoctorScheduleDisplayProps {
  schedule?: ScheduleData | null;
  visitingHours?: string | null;
  selectedDate?: string | null;
  chamber?: string | null;
  compact?: boolean;
  showEmergencyNotice?: boolean;
}

export function DoctorScheduleDisplay({
  schedule,
  visitingHours,
  selectedDate,
  chamber,
  compact = false,
  showEmergencyNotice = true,
}: DoctorScheduleDisplayProps) {
  const evalResult = useMemo(() => {
    return evaluateDoctorSchedule(schedule, visitingHours, selectedDate, chamber);
  }, [schedule, visitingHours, selectedDate, chamber]);

  if (compact) {
    return (
      <div className="space-y-1.5">
        {/* Availability Status Badge */}
        <div className="flex items-center gap-2">
          {evalResult.isAvailableToday ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Available Today
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Next: {evalResult.nextAvailableDay || "Next Schedule"}
            </span>
          )}

          <span className="text-[10px] text-slate-500 flex items-center gap-1 truncate font-mono">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            {evalResult.formattedHours}
          </span>
        </div>

        {/* 7-Day Mini Pill Strip */}
        <div className="flex items-center gap-1">
          {evalResult.dayStatusList.map((d) => (
            <span
              key={d.day}
              title={`${d.fullDay}: ${d.isActive ? "Visiting Day" : "Off Day"}`}
              className={`w-6 h-5 rounded-md text-[9px] flex items-center justify-center font-bold tracking-tight transition-all ${
                d.isActive
                  ? "bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] font-extrabold"
                  : "bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border border-transparent opacity-60"
              } ${d.isToday ? "ring-1.5 ring-[var(--brand-primary)]" : ""}`}
            >
              {d.day.slice(0, 2)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2.5 text-xs">
      {/* Top Header Strip: Status & Hours */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {evalResult.isAvailableToday ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Chamber Open Today
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Next: {evalResult.nextAvailableDay || "Next Visiting Day"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
          <span>{evalResult.formattedHours}</span>
        </div>
      </div>

      {/* 7-Day Visual Schedule Strip */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          <span>Weekly Visiting Days</span>
          <span className="text-[9px] lowercase font-normal opacity-80">(ring indicates today)</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {evalResult.dayStatusList.map((d) => (
            <div
              key={d.day}
              title={`${d.fullDay}: ${d.isActive ? `Consultation (${evalResult.formattedHours})` : "Chamber Closed"}`}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-center border transition-all ${
                d.isActive
                  ? "bg-[var(--brand-surface)] border-[var(--brand-border)] text-[var(--brand-text)] font-extrabold shadow-2xs"
                  : "bg-slate-100/60 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 text-slate-400 opacity-60"
              } ${d.isToday ? "ring-2 ring-[var(--brand-primary)] font-black" : ""}`}
            >
              <span className="text-[10px] uppercase font-bold leading-none">{d.day}</span>
              {/* <span className="text-[8px] mt-0.5 leading-none opacity-80">
                {d.isActive ? "Open" : "Off"}
              </span> */}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Status Notice (if date provided) */}
      {selectedDate && (
        <div
          className={`p-2.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
            evalResult.isAvailableOnDate
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
          }`}
        >
          {evalResult.isAvailableOnDate ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold block">
              {evalResult.isAvailableOnDate
                ? `✓ Confirmed Visiting Day (${evalResult.selectedDayName})`
                : `⚠️ Regular Off-Day Notice (${evalResult.selectedDayName})`}
            </span>
            <p className="text-[10px] opacity-90 mt-0.5">{evalResult.summaryNotice}</p>
          </div>
        </div>
      )}

      {/* Clinical Emergency Notice */}
      {showEmergencyNotice && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 italic flex items-center gap-1.5 pt-0.5 border-t border-[var(--border-subtle)]/70">
          <ShieldAlert className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{EMERGENCY_SCHEDULE_DISCLAIMER}</span>
        </p>
      )}
    </div>
  );
}
