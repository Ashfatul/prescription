"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface CustomDatePickerProps {
  value?: string; // Format: YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string; // Format: YYYY-MM-DD
  maxDate?: string; // Format: YYYY-MM-DD
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  quickPresets?: boolean;
}

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_NAMES_BN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const DAYS_OF_WEEK_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAYS_OF_WEEK_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

function parseISODate(isoStr?: string): Date | null {
  if (!isoStr) return null;
  const parts = isoStr.split("-");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
}

function formatToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(isoStr?: string, isBn?: boolean): string {
  const d = parseISODate(isoStr);
  if (!d) return "";
  return d.toLocaleDateString(isBn ? "bn-BD" : "en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CustomDatePicker({
  value,
  onChange,
  label,
  placeholder,
  minDate,
  maxDate,
  disabled = false,
  required = false,
  error,
  className = "",
  quickPresets = true,
}: CustomDatePickerProps) {
  const { t, language } = useLanguage();
  const isBn = language === "bn";
  const effectivePlaceholder = placeholder || (t("uiSelectDate"));
  const monthNames = isBn ? MONTH_NAMES_BN : MONTH_NAMES_EN;
  const daysOfWeek = isBn ? DAYS_OF_WEEK_BN : DAYS_OF_WEEK_EN;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseISODate(value);
  const initialViewDate = selectedDate || new Date();
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    if (value) {
      const parsed = parseISODate(value);
      if (parsed) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
  }

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Calculate calendar grid for current viewYear and viewMonth
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
    const day = daysInPrevMonth - firstDayOfMonth + i + 1;
    return {
      date: new Date(viewYear, viewMonth - 1, day),
      isCurrentMonth: false,
    };
  });

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      date: new Date(viewYear, viewMonth, day),
      isCurrentMonth: true,
    };
  });

  const totalDisplayed = prevMonthDays.length + currentMonthDays.length;
  const remaining = (7 - (totalDisplayed % 7)) % 7;
  const nextMonthDays = Array.from({ length: remaining }, (_, i) => {
    const day = i + 1;
    return {
      date: new Date(viewYear, viewMonth + 1, day),
      isCurrentMonth: false,
    };
  });

  const allCalendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (date: Date) => {
    const iso = formatToISO(date);
    onChange(iso);
    setIsOpen(false);
  };

  const handleApplyPreset = (daysOffset: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    const iso = formatToISO(target);
    onChange(iso);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
    setIsOpen(false);
  };

  // Helper to check if a date is today
  const todayISO = formatToISO(new Date());

  // Helper to check min/max date boundary
  const isDateDisabled = (d: Date) => {
    const iso = formatToISO(d);
    if (minDate && iso < minDate) return true;
    if (maxDate && iso > maxDate) return true;
    return false;
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-all text-sm outline-none cursor-pointer select-none min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px] ${
          disabled
            ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
            : isOpen
            ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20 bg-[var(--bg-surface)] shadow-xs"
            : error
            ? "border-red-500 bg-red-50/20"
            : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--brand-border)]"
        }`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {value ? (
            <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {formatDisplayDate(value, isBn)}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 truncate">{effectivePlaceholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              title={t("uiClearDate")}
              className="hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-[var(--bg-subtle)] transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <CalendarIcon className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Interactive Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 p-4 w-[320px] sm:w-[350px] rounded-3xl border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 flex flex-col space-y-3">
          
          {/* Calendar Header: Month, Year Jumpers, and Steppers */}
          <div className="flex items-center justify-between gap-1 pb-2 border-b border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300 transition cursor-pointer"
              aria-label={t("uiPreviousMonth")}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
              <span className="px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] text-xs font-black tracking-tight text-slate-800 dark:text-slate-100">
                {monthNames[viewMonth]} {viewYear}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300 transition cursor-pointer"
              aria-label={t("uiNextMonth")}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets (e.g. for Clinical Scheduling) */}
          {quickPresets && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              <button
                type="button"
                onClick={() => handleApplyPreset(0)}
                className="px-2 py-1 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] font-semibold transition shrink-0 cursor-pointer"
              >
                {t("uiToday2")}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(1)}
                className="px-2 py-1 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] font-semibold transition shrink-0 cursor-pointer"
              >
                {t("uiTomorrow")}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(3)}
                className="px-2 py-1 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] font-semibold transition shrink-0 cursor-pointer"
              >
                {t("uiDays3")}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(7)}
                className="px-2 py-1 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] font-semibold transition shrink-0 cursor-pointer"
              >
                {t("uiWeek")}
              </button>
            </div>
          )}

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {daysOfWeek.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Matrix */}
          <div className="grid grid-cols-7 gap-1">
            {allCalendarDays.map(({ date, isCurrentMonth }, idx) => {
              const iso = formatToISO(date);
              const isSelected = value === iso;
              const isToday = todayISO === iso;
              const isDisabled = isDateDisabled(date);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(date)}
                  className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl text-xs font-semibold flex items-center justify-center transition cursor-pointer relative ${
                    isDisabled
                      ? "opacity-25 cursor-not-allowed"
                      : isSelected
                      ? "bg-[var(--brand-primary)] text-white font-bold shadow-xs scale-105"
                      : !isCurrentMonth
                      ? "text-slate-400 dark:text-slate-600 hover:bg-[var(--bg-subtle)]"
                      : "text-slate-800 dark:text-slate-200 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)]"
                  } ${isToday && !isSelected ? "ring-2 ring-[var(--brand-primary)]/40 font-bold" : ""}`}
                >
                  <span>{date.getDate()}</span>
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--brand-primary)]" />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
