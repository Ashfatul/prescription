"use client";

import { useLanguage } from "@/lib/i18n/language-context";

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: string;
}) {
  const { t, language } = useLanguage();

  return (
    <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        {icon && <span className="text-xl">{icon}</span>}
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {t("uiMetric")}
        </span>
      </div>
      <div>
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}
