"use client";

import { ShieldCheck, Sparkles, CheckCircle2, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface RegisterCompanionProps {
  mode: "clinic" | "patient";
  clinicSlug?: string;
  slugStatus?: "idle" | "checking" | "available" | "unavailable";
}

export function RegisterCompanion({ mode, clinicSlug, slugStatus }: RegisterCompanionProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col justify-between h-full space-y-6">
      {/* Top Header */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>{mode === "clinic" ? t.registerClinicTitle : t.patientPortalTitle}</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {mode === "clinic"
              ? (t("uiScaleYourPracticeWithNext"))
              : (t("uiAccessYourPrescriptionsMedicineReminders"))}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {mode === "clinic"
              ? (t("uiLaunchYourDigitalClinicOr"))
              : (t("uiPatientsSecurelyAccessDigitalPrescriptions"))}
          </p>
        </div>

        {/* Dynamic Telemetry Showcase */}
        {mode === "clinic" ? (
          <div className="space-y-3">
            {/* Live Subdomain Telemetry */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>Subdomain Target</span>
                </span>
                {slugStatus === "available" && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Live Verified
                  </span>
                )}
              </div>
              <div className="p-2 rounded-lg bg-[var(--bg-subtle)] font-mono text-xs text-[var(--brand-text)] truncate flex items-center justify-between">
                <span>
                  https://{clinicSlug ? clinicSlug.toLowerCase() : "yourclinic"}.ppms.io
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Isolated PostgreSQL multi-tenant partition for your medical practice.
              </p>
            </div>

            {/* Trial & Setup Checklist */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Included in 14-Day Free Trial:
              </span>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Unlimited doctor chambers & schedules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Waiting room live TV queue monitor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>A4 custom clinic letterhead & logo print</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Complete pharmaceutical formulary</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Your Personal Health Passport:
              </span>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Access lifetime electronic prescriptions without paper loss</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Automated dosage notifications & medication reminders</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>Diagnostic lab reports archive & appointment booking</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compliance seal */}
      <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Strictly adheres to BMDC practice guidelines & HIPAA data privacy.</span>
      </div>
    </div>
  );
}
