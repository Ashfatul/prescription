"use client";

import { useLanguage } from "@/lib/i18n/language-context";

export function LoadingFallback({ message }: { message?: string }) {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          {message || (t("uiLoadingClinicalWorkspace"))}
        </p>
      </div>
    </div>
  );
}
