export type ScheduleData = {
  days?: string[] | string;
  startTime?: string;
  endTime?: string;
  hours?: string;
  chamber?: string;
  [key: string]: unknown;
};

export const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const WEEK_DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export interface DoctorScheduleEvaluation {
  isAvailableToday: boolean;
  isAvailableOnDate: boolean;
  selectedDayName: string;
  todayDayName: string;
  activeDays: string[]; // e.g. ["Sun", "Mon", "Tue"]
  dayStatusList: Array<{
    day: string; // "Sun"
    fullDay: string; // "Sunday"
    isActive: boolean;
    isToday: boolean;
    isSelected: boolean;
  }>;
  formattedHours: string;
  chamberName: string | null;
  nextAvailableDay: string | null;
  summaryNotice: string;
  emergencyDisclaimer: string;
}

export const EMERGENCY_SCHEDULE_DISCLAIMER =
  "Chamber visiting hours and days are subject to adjustment during clinical emergencies, unannounced surgery rounds, or hospital duty calls.";

/**
 * Normalizes day string representations (e.g. "Sat", "saturday", "Saturday") to standard short day ("Sat").
 */
function normalizeDayShort(day: string): string | null {
  const d = day.trim().toLowerCase();
  if (d.startsWith("sun")) return "Sun";
  if (d.startsWith("mon")) return "Mon";
  if (d.startsWith("tue")) return "Tue";
  if (d.startsWith("wed")) return "Wed";
  if (d.startsWith("thu")) return "Thu";
  if (d.startsWith("fri")) return "Fri";
  if (d.startsWith("sat")) return "Sat";
  return null;
}

/**
 * Extract an array of standard short days (e.g. ["Sun", "Mon", "Wed"]) from scheduleJson and/or visitingHours.
 */
export function extractActiveScheduleDays(
  schedule?: ScheduleData | null,
  visitingHours?: string | null
): string[] {
  const activeSet = new Set<string>();

  if (schedule?.days) {
    if (Array.isArray(schedule.days)) {
      for (const d of schedule.days) {
        if (typeof d === "string") {
          const norm = normalizeDayShort(d);
          if (norm) activeSet.add(norm);
        }
      }
    } else if (typeof schedule.days === "string") {
      const parts = schedule.days.split(/[,/&-]/);
      for (const p of parts) {
        const norm = normalizeDayShort(p);
        if (norm) activeSet.add(norm);
      }
    }
  }

  // If no days in scheduleJson, inspect visitingHours (e.g., "Sat - Thu: 5:00 PM - 9:30 PM")
  if (activeSet.size === 0 && visitingHours) {
    const lower = visitingHours.toLowerCase();
    if (lower.includes("daily") || lower.includes("everyday") || lower.includes("all days")) {
      return [...WEEK_DAYS_SHORT];
    }

    // Check for range like "Sat - Thu" or "Saturday to Thursday"
    const rangeMatch = visitingHours.match(
      /(sun|mon|tue|wed|thu|fri|sat)[a-z]*\s*(?:-|to)\s*(sun|mon|tue|wed|thu|fri|sat)[a-z]*/i
    );
    if (rangeMatch) {
      const startDay = normalizeDayShort(rangeMatch[1]);
      const endDay = normalizeDayShort(rangeMatch[2]);
      if (startDay && endDay) {
        const order = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
        const startIndex = order.indexOf(startDay);
        const endIndex = order.indexOf(endDay);
        if (startIndex !== -1 && endIndex !== -1) {
          if (startIndex <= endIndex) {
            for (let i = startIndex; i <= endIndex; i++) activeSet.add(order[i]);
          } else {
            // wraps around
            for (let i = startIndex; i < order.length; i++) activeSet.add(order[i]);
            for (let i = 0; i <= endIndex; i++) activeSet.add(order[i]);
          }
        }
      }
    } else {
      // Individual days mentioned
      for (const short of WEEK_DAYS_SHORT) {
        if (lower.includes(short.toLowerCase())) {
          activeSet.add(short);
        }
      }
    }
  }

  // Default fallback if doctor has no specified schedule: Weekdays Sun-Thu
  if (activeSet.size === 0) {
    return ["Sun", "Mon", "Tue", "Wed", "Thu"];
  }

  // Return in regular week order Sun-Sat
  return WEEK_DAYS_SHORT.filter((d) => activeSet.has(d));
}

/**
 * Extract clean formatted visiting hours (e.g., "09:00 AM - 01:00 PM")
 */
export function extractFormattedHours(
  schedule?: ScheduleData | null,
  visitingHours?: string | null
): string {
  if (schedule?.startTime && schedule?.endTime) {
    return `${schedule.startTime} - ${schedule.endTime}`;
  }
  if (schedule?.hours) {
    return String(schedule.hours);
  }
  if (visitingHours) {
    // If it contains a colon with time e.g. "Sat - Thu: 5:00 PM - 9:30 PM", extract time portion
    const timeMatch = visitingHours.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
    if (timeMatch) return timeMatch[1];
    return visitingHours;
  }
  return "09:00 AM - 01:00 PM";
}

/**
 * Comprehensive evaluator for a doctor's schedule, checking against today and an optionally selected date.
 */
export function evaluateDoctorSchedule(
  schedule?: ScheduleData | null,
  visitingHours?: string | null,
  selectedDateStr?: string | null,
  chamberFallback?: string | null
): DoctorScheduleEvaluation {
  const activeDays = extractActiveScheduleDays(schedule, visitingHours);
  const formattedHours = extractFormattedHours(schedule, visitingHours);
  const chamberName = (schedule?.chamber as string) || chamberFallback || null;

  const now = new Date();
  const todayDayIndex = now.getDay(); // 0 is Sunday
  const todayShort = WEEK_DAYS_SHORT[todayDayIndex];
  const todayDayName = WEEK_DAYS[todayDayIndex];

  const isAvailableToday = activeDays.includes(todayShort);

  // Evaluate selected date
  let selectedDateObj = now;
  if (selectedDateStr) {
    // Parse YYYY-MM-DD cleanly in local timezone
    const parts = selectedDateStr.split("-").map(Number);
    if (parts.length === 3) {
      selectedDateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }

  const selectedDayIndex = selectedDateObj.getDay();
  const selectedShort = WEEK_DAYS_SHORT[selectedDayIndex];
  const selectedDayName = WEEK_DAYS[selectedDayIndex];

  const isAvailableOnDate = activeDays.includes(selectedShort);

  // Compute next available day if not available today
  let nextAvailableDay: string | null = null;
  if (!isAvailableToday && activeDays.length > 0) {
    for (let offset = 1; offset <= 7; offset++) {
      const nextIndex = (todayDayIndex + offset) % 7;
      const nextShort = WEEK_DAYS_SHORT[nextIndex];
      if (activeDays.includes(nextShort)) {
        nextAvailableDay = offset === 1 ? "Tomorrow" : WEEK_DAYS[nextIndex];
        break;
      }
    }
  }

  const dayStatusList = WEEK_DAYS_SHORT.map((short, idx) => ({
    day: short,
    fullDay: WEEK_DAYS[idx],
    isActive: activeDays.includes(short),
    isToday: idx === todayDayIndex,
    isSelected: idx === selectedDayIndex,
  }));

  const activeDaysFormatted = activeDays.join(", ");
  const summaryNotice = isAvailableOnDate
    ? `Available for in-chamber consultation on ${selectedDayName}s (${formattedHours}).`
    : `Doctor does not hold regular chamber on ${selectedDayName}s. Regular visiting days: ${activeDaysFormatted}.`;

  return {
    isAvailableToday,
    isAvailableOnDate,
    selectedDayName,
    todayDayName,
    activeDays,
    dayStatusList,
    formattedHours,
    chamberName,
    nextAvailableDay,
    summaryNotice,
    emergencyDisclaimer: EMERGENCY_SCHEDULE_DISCLAIMER,
  };
}
