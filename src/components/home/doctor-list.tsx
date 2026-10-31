"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/common/card";
import { useLanguage } from "@/lib/i18n/language-context";

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
    const timer = setInterval(load, 7000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (!doctors.length) {
    return (
      <Card>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">No doctors available right now.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {doctors.map((doctor, index) => {
        const formattedSchedule = formatSchedule(doctor.schedule);

        return (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.07 }}
          >
            <Card className="h-full">
              <div className="flex gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  {doctor.imageUrl ? (
                    <Image src={doctor.imageUrl} alt={doctor.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">Dr</div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-semibold">{doctor.name}</h3>
                  <p className="text-sm text-zinc-500">{doctor.specialization}</p>

                  {formattedSchedule && (
                    <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{t.schedule}: </span>
                      {formattedSchedule}
                    </p>
                  )}

                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                      {t.currentSerial}: {doctor.currentSerial || "-"}
                    </span>
                    <span className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
                      {t.availability}: {doctor.available ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
