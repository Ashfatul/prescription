"use client";

import { Lock, PhoneCall, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface RecoveryCompanionProps {
  currentStep?: 1 | 2 | 3;
}

export function RecoveryCompanion({ currentStep = 1 }: RecoveryCompanionProps) {
  const { t } = useLanguage();

  const steps = [
    { num: 1, title: t.authRecoveryStep1, desc: "Submit your account's registered email address" },
    { num: 2, title: t.authRecoveryStep2, desc: "Receive a time-limited 256-bit cryptographic link" },
    { num: 3, title: t.authRecoveryStep3, desc: "Establish new password & invalidate existing sessions" },
  ];

  return (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-[10px] font-bold uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            <span>{t.authRecoveryStepsTitle}</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {t("uiAccountSecurity")}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t("uiOurAccountRecoverySystemUses")}
          </p>
        </div>

        {/* 3 Step Sequence */}
        <div className="space-y-2.5">
          {steps.map((st) => {
            const isActive = st.num === currentStep;
            const isCompleted = st.num < currentStep;

            return (
              <div
                key={st.num}
                className={`p-3 rounded-xl border transition-all ${
                  isActive
                    ? "bg-[var(--bg-surface)] border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20 shadow-xs"
                    : "bg-[var(--bg-surface)]/60 border-[var(--border-subtle)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                      isActive
                        ? "bg-[var(--brand-primary)] text-white"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-[var(--bg-subtle)] text-slate-500"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {st.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-8 pt-1 leading-snug">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hospital IT Support Card */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
          <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
          <span>{t.authHelplineTitle}</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {t.authHelplineDesc}
        </p>
      </div>
    </div>
  );
}
