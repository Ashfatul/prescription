"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

type QueueItem = {
  id: string;
  serialNumber: number;
  status: string;
  patient: {
    user: {
      name: string;
    };
  };
};

type QueueResponse = {
  currentSerial: number;
  total: number;
  queue: QueueItem[];
};

export function DoctorQueue({ doctorId }: { doctorId: string }) {
  const [data, setData] = useState<QueueResponse | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/doctors/${doctorId}/queue`);
        if (!res.ok) return;
        const payload = await res.json();
        if (active && payload.success && payload.data) {
          setData(payload.data);
        }
      } catch (err) {
        console.error("Failed to load doctor queue:", err);
      }
    };

    void load();
    const timer = setInterval(load, 6000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [doctorId]);

  if (!data) {
    return (
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t.currentSerial}
          </h3>
          <p className="text-xs text-slate-500">
            {t("uiRealTimeRoomCallSequence")}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">
            {t("uiNowCalling")}
          </span>
          <span className="text-2xl font-black text-[var(--brand-text)] font-mono">
            #{data.currentSerial || "1"}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {data.queue.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">
            {t("waitingRoomEmpty")}
          </p>
        ) : (
          data.queue.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition ${
                item.serialNumber === data.currentSerial
                  ? "bg-[var(--brand-surface)] border-[var(--brand-border)] font-bold text-[var(--brand-text)] shadow-xs"
                  : "bg-[var(--bg-app)] border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold font-mono">
                  #{item.serialNumber}
                </span>
                <span className="font-semibold">{item.patient.user.name}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {item.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
