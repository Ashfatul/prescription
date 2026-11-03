"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, DatabaseZap, LockKeyhole, ShieldAlert, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEMO_RESET_CONFIRMATION } from "@/features/demo/demo-reset.constants";

export function SecureDemoResetPanel({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isSuperAdmin) return null;

  const closeDialog = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    setPassword("");
    setConfirmation("");
    setAcknowledged(false);
    setError(null);
  };

  const openDialog = () => {
    setSuccess(false);
    setError(null);
    setIsOpen(true);
  };

  const resetDatabase = async () => {
    if (
      isSubmitting ||
      !password ||
      confirmation !== DEMO_RESET_CONFIRMATION ||
      !acknowledged
    ) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/demo/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmation }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setError(payload.message || t("uiDemoDatabaseResetFailed"));
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => window.location.reload(), 1400);
    } catch {
      setError(t("uiNetworkErrorOccurredDuringReset"));
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    Boolean(password) &&
    confirmation === DEMO_RESET_CONFIRMATION &&
    acknowledged &&
    !isSubmitting;

  return (
    <>
      <section className="rounded-3xl border border-rose-300/70 bg-[var(--bg-surface)] p-6 shadow-sm dark:border-rose-900/70">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <DatabaseZap className="h-6 w-6" />
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                  {t("uiDemoModeOnly")}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <LockKeyhole className="h-3 w-3" />
                  {t("uiSuperAdminReauthenticationRequired")}
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                {t("uiSecureDemoDatabaseReset")}
              </h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[var(--text-secondary)]">
                {t("uiSecureDemoDatabaseResetDescription")}
              </p>
              <p className="mt-2 text-[11px] font-semibold text-[var(--text-muted)]">
                {t("uiResetKeepsDemoReferenceData")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openDialog}
            className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          >
            <ShieldAlert className="h-4 w-4" />
            {t("uiOpenSecureReset")}
          </button>
        </div>
      </section>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-sm sm:items-center"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="secure-demo-reset-title"
            className="flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col rounded-3xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex shrink-0 items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 id="secure-demo-reset-title" className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  {t("uiConfirmSecureDemoReset")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {t("uiSecureDemoResetWarning")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                disabled={isSubmitting}
                aria-label={t.close}
                className="rounded-xl p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain pr-1">
              <div className="rounded-2xl border border-rose-300/60 bg-rose-500/5 p-4 text-xs leading-relaxed text-[var(--text-secondary)] dark:border-rose-900/70">
                <p className="font-bold text-rose-700 dark:text-rose-300">{t("uiDataToBeRemoved")}</p>
                <p className="mt-1">{t("uiResetDeletesUsersAndClinicalData")}</p>
                <p className="mt-1">{t("uiResetPreservesDemoAndReferenceData")}</p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  {t("uiAccountPasswordToConfirmIdentity")}
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="min-h-[48px] w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  {t("uiTypeConfirmationPhrase")}
                </span>
                <input
                  type="text"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder={DEMO_RESET_CONFIRMATION}
                  autoComplete="off"
                  spellCheck={false}
                  className="min-h-[48px] w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 font-mono text-sm uppercase tracking-wide text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                />
                <span className="mt-1.5 block text-[11px] text-[var(--text-muted)]">
                  {t("uiEnterExactPhrase")} {" "}
                  <code className="font-mono font-bold text-[var(--text-secondary)]">{DEMO_RESET_CONFIRMATION}</code>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 p-4">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--brand-primary)]"
                />
                <span className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  {t("uiIUnderstandDemoResetIrreversible")}
                </span>
              </label>

              {error && (
                <p className="rounded-2xl border border-rose-300/70 bg-rose-500/10 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/70 dark:text-rose-300">
                  {error}
                </p>
              )}

              {success && (
                <p className="flex items-center gap-2 rounded-2xl border border-emerald-300/70 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:border-emerald-900/70 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {t("uiDemoDatabaseResetComplete")}
                </p>
              )}

            </div>

            <div className="mt-5 flex shrink-0 flex-col-reverse gap-3 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isSubmitting}
                  className="min-h-[46px] rounded-2xl border border-[var(--border-default)] px-5 text-sm font-bold text-[var(--text-secondary)] transition hover:bg-[var(--bg-subtle)] disabled:opacity-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => void resetDatabase()}
                  disabled={!canSubmit}
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <DatabaseZap className="h-4 w-4" />
                  {isSubmitting ? t("uiResetting") : t("uiClearDemoDatabase")}
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
