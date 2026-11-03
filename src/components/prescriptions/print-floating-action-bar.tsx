"use client";

import Link from "next/link";
import { PrintButton } from "@/components/common/print-button";
import { LanguageToggle } from "@/components/common/language-toggle";
import { useLanguage } from "@/lib/i18n/language-context";

export interface PrintFloatingActionBarProps {
  id: string;
  isHistorical: boolean;
  currentVersion: number;
  activeVersion: number;
  displayDate: string | Date;
  changeReason?: string | null;
  versions?: { id: string; versionNumber: number }[];
}

export function PrintFloatingActionBar({
  id,
  isHistorical,
  currentVersion,
  activeVersion,
  displayDate,
  changeReason,
  versions = [],
}: PrintFloatingActionBarProps) {
  const { t, language } = useLanguage();

  return (
    <>
      {/* Historical Version Notice (Hidden in Print) */}
      {isHistorical && (
        <div className="mx-auto mb-4 flex max-w-4xl flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-4 text-xs text-amber-900 dark:text-amber-200 shadow-sm print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold text-sm">
                {language === "bn"
                  ? `সংরক্ষিত স্ন্যাপশট প্রদর্শিত হচ্ছে: সংস্করণ ${currentVersion}`
                  : `Viewing Historical Snapshot: Version ${currentVersion}`}
              </p>
              <p className="text-amber-800/90 dark:text-amber-300/80 text-[11px] mt-0.5">
                {language === "bn"
                  ? `${new Date(displayDate).toLocaleDateString("bn-BD")} তারিখে সংরক্ষিত ${changeReason ? `• "${changeReason}"` : ""}। সর্বশেষ সক্রিয় প্রেসক্রিপশন:`
                  : `Archived on ${new Date(displayDate).toLocaleDateString()} ${changeReason ? `• "${changeReason}"` : ""}. The latest active prescription is`}{" "}
                <strong>{language === "bn" ? `সংস্করণ ${activeVersion}` : `Version ${activeVersion}`}</strong>.
              </p>
            </div>
          </div>
          <Link
            href={`/prescriptions/${id}/print`}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition shadow-xs text-xs"
          >
            {language === "bn" ? `সর্বশেষ সংস্করণে যান v${activeVersion}` : `Switch to Latest v${activeVersion}`}
          </Link>
        </div>
      )}

      {/* Floating Action Bar - Hidden in Print */}
      <div className="mx-auto mb-6 flex max-w-4xl flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white px-5 py-3 shadow-md print:hidden dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/doctor"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {t("uiBackToDashboard")}
          </Link>
          <span className="text-xs text-zinc-500">
            Rx ID: <code className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{id}</code>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold">
            {language === "bn" ? `সংস্করণ ${currentVersion}` : `Version ${currentVersion}`}{" "}
            {isHistorical
              ? (t("uiArchivedSnapshot"))
              : (t("uiLatestActive"))}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Version Switcher if multiple versions exist */}
          {versions.length > 1 && (
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
              <span className="text-[11px] font-bold text-zinc-500 px-2 uppercase tracking-wider">
                {t("uiRevisions2")}
              </span>
              {versions.map((ver) => {
                const isSelected = ver.versionNumber === currentVersion;
                return (
                  <Link
                    key={ver.id}
                    href={`/prescriptions/${id}/print?version=${ver.versionNumber}`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      isSelected
                        ? "bg-[var(--brand-primary)] text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    v{ver.versionNumber}
                  </Link>
                );
              })}
            </div>
          )}

          <LanguageToggle />
          <PrintButton />
        </div>
      </div>
    </>
  );
}
