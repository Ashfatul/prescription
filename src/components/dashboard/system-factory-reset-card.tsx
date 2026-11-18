"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  RotateCw,
  X,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function SystemFactoryResetCard() {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const REQUIRED_PHRASE = "WIPE EVERYTHING";
  const phraseMatches = confirmationText.trim() === REQUIRED_PHRASE;
  const canSubmit = password.length >= 8 && phraseMatches && !submitting;

  const handleOpenModal = () => {
    setPassword("");
    setConfirmationText("");
    setErrorMsg(null);
    setSuccessMsg(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/settings/factory-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          confirmationText: confirmationText.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || json.message || "Failed to execute factory reset.");
        setSubmitting(false);
        return;
      }

      setSuccessMsg(t.uiResetSuccessRedirecting);
      setTimeout(() => {
        window.location.href = json.redirectUrl || "/setup";
      }, 1200);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Network error executing factory reset.");
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Danger Zone Main Card */}
      <div id="danger-zone" className="p-6 sm:p-8 rounded-lg border border-red-500/25 bg-red-500/5 dark:bg-red-950/15 space-y-5 transition-colors scroll-mt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30">
                {t.uiSuperAdminOnly}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-red-700 dark:text-red-400">
              {t.uiDangerZoneTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {t.uiDangerZoneDesc}
            </p>
          </div>
        </div>

        {/* Warning Items List */}
        <div className="p-4 sm:p-5 rounded-lg bg-[var(--bg-surface)] border border-red-500/20 space-y-2 text-xs">
          <div className="flex items-start gap-2.5 text-red-700 dark:text-red-300">
            <span className="font-bold shrink-0">✕</span>
            <span>{t.uiDangerWarning1}</span>
          </div>
          <div className="flex items-start gap-2.5 text-red-700 dark:text-red-300">
            <span className="font-bold shrink-0">✕</span>
            <span>{t.uiDangerWarning2}</span>
          </div>
          <div className="flex items-start gap-2.5 text-red-700 dark:text-red-300">
            <span className="font-bold shrink-0">✕</span>
            <span>{t.uiDangerWarning3}</span>
          </div>
        </div>

        {/* Trigger Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 hover:shadow-lg transition-all cursor-pointer min-h-[44px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.uiStartFactoryReset}</span>
          </button>
        </div>
      </div>

      {/* Multi-Step Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-lg border border-red-500/30 bg-[var(--bg-surface)] p-6 sm:p-8 shadow-2xl text-[var(--text-primary)] space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                    {t.uiConfirmFactoryResetTitle}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t.uiIrreversibleDestructive}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCloseModal}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error or Success Alert */}
            {errorMsg && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleExecuteReset} className="space-y-5">
              {/* Step 1: Admin Password */}
              <div className="space-y-2 p-4 rounded-lg bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    {t.uiStep1PasswordVerification}
                  </span>
                  {password.length >= 8 && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {t.uiReady}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.uiEnterMasterPasswordPlaceholder}
                    className="w-full pl-10 pr-11 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all min-h-[44px]"
                  />
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 cursor-pointer focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step 2: Phrase Confirmation */}
              <div className="space-y-2 p-4 rounded-lg bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    {t.uiStep2TypeConfirmation}
                  </span>
                  {phraseMatches && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {t.uiMatched}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {t.uiTypePhraseInstruction} <code className="font-mono font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{REQUIRED_PHRASE}</code>
                </p>
                <input
                  type="text"
                  required
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={REQUIRED_PHRASE}
                  className={`w-full px-4 py-3 rounded-lg border bg-[var(--bg-surface)] text-sm font-mono tracking-wider transition-all min-h-[44px] focus:outline-none ${
                    phraseMatches
                      ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "border-[var(--border-default)] focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-[var(--text-primary)]"
                  }`}
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-secondary)] transition-all cursor-pointer min-h-[42px] disabled:opacity-50"
                >
                  {t.uiCancel}
                </button>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-bold shadow-md transition-all cursor-pointer min-h-[42px] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>{t.uiWipingSystem}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{t.uiExecuteFactoryReset}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
