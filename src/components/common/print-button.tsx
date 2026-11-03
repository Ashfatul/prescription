"use client";

import { useLanguage } from "@/lib/i18n/language-context";

export function PrintButton() {
  const { t } = useLanguage();

  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-95 cursor-pointer"
    >
      <span>🖨️</span>
      <span>{t.printSavePdf}</span>
    </button>
  );
}
