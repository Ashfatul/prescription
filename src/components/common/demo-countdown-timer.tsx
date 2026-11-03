"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { Clock, RotateCcw, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

type DemoStatus = {
  isDemoMode: boolean;
  lastResetAt: string | null;
  nextResetAt: string | null;
  remainingSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedTime: string;
  clinicName: string;
  clinicSlug: string;
};

interface DemoCountdownTimerProps {
  variant?: "floating" | "inline" | "banner";
  className?: string;
}

export function DemoCountdownTimer({ variant = "floating", className = "" }: DemoCountdownTimerProps) {
  const { t, language } = useLanguage();
  const isBn = language === "bn";
  const [status, setStatus] = useState<DemoStatus | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch demo status asynchronously
  const loadStatus = useCallback(() => {
    fetch("/api/demo/status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && json.data) {
          setStatus(json.data);
          setSecondsLeft(json.data.remainingSeconds);
        }
      })
      .catch((err) => {
        console.warn("Failed to retrieve demo status:", err);
      });
  }, []);

  useEffect(() => {
    loadStatus();
    const pollInterval = setInterval(loadStatus, 30000);
    return () => clearInterval(pollInterval);
  }, [loadStatus]);

  // Local 1-second interval countdown ticker
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          // Time reached 0, trigger status re-sync which will auto-reset
          void loadStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, loadStatus]);

  // Handle manual trigger reset
  const handleReset = () => {
    if (isPending) return;
    setResetMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/demo/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();
        if (json.success) {
          setResetMessage(t("uiSandboxRestoredToInitialDefault"));
          await loadStatus();
          setTimeout(() => {
            setResetMessage(null);
            window.location.reload();
          }, 1200);
        } else {
          setErrorMessage(json.message || (t("uiFailedToResetDemoData")));
        }
      } catch (err) {
        console.error("Manual demo reset failed:", err);
        setErrorMessage(t("uiNetworkErrorOccurredDuringReset"));
      }
    });
  };

  // If demo mode is not enabled or not yet loaded, render nothing
  if (!status || !status.isDemoMode) {
    return null;
  }

  // Format hours, minutes, seconds from secondsLeft
  const displaySecs = secondsLeft ?? status.remainingSeconds;
  const h = Math.floor(displaySecs / 3600);
  const m = Math.floor((displaySecs % 3600) / 60);
  const s = displaySecs % 60;
  const formattedCountdown = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  if (variant === "banner") {
    return (
      <div
        className={`w-full bg-[var(--brand-surface)] border-b border-[var(--brand-border)] text-[var(--text-primary)] px-4 py-2 text-xs font-medium transition-all ${className}`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
            <span className="font-bold text-[var(--brand-text)]">
              {status.clinicName} {t("uiSandbox")}
            </span>
            <span className="text-[var(--text-secondary)]">
              {t("uiAllDemoConsultationsQueuesAnd")}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 font-mono font-bold text-[var(--brand-text)] bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>{t("uiResetsIn")} {formattedCountdown}</span>
            </div>

            <button
              onClick={handleReset}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--brand-primary)] hover:opacity-90 text-white font-bold text-xs transition shadow-2xs disabled:opacity-60 cursor-pointer"
            >
              <RotateCcw className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
              <span>{isPending ? (t("uiResetting")) : (t("uiResetNow"))}</span>
            </button>
          </div>
        </div>

        {resetMessage && (
          <div className="mt-1.5 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{resetMessage}</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`rounded-2xl bg-[var(--brand-surface)]/80 border border-[var(--brand-border)] p-3.5 sm:p-4 text-xs space-y-2.5 ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[var(--brand-text)] tracking-wide">
              {status.clinicName} {t("uiDemoSandbox")}
            </span>
          </div>
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]">
            {t("uiHCycle")}
          </span>
        </div>

        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
          {t("uiModificationsMadeInThisDemo")}
        </p>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 font-mono font-bold text-[var(--text-primary)]">
            <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>{t("uiResetsIn")} <strong className="text-[var(--brand-text)]">{formattedCountdown}</strong></span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--brand-primary)] text-white hover:opacity-90 font-bold text-[11px] transition disabled:opacity-60 cursor-pointer shadow-2xs"
          >
            <RotateCcw className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
            <span>{isPending ? (t("uiRestoring")) : (t("uiResetToDefault"))}</span>
          </button>
        </div>

        {resetMessage && (
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{resetMessage}</span>
          </p>
        )}
        {errorMessage && (
          <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMessage}</span>
          </p>
        )}
      </div>
    );
  }

  // Floating Pill (Bottom Right)
  return (
    <aside
      aria-label={t("uiDemoEnvironmentStatus")}
      className={`fixed bottom-4 right-4 z-40 max-w-sm rounded-2xl bg-[var(--bg-elevated)] border border-[var(--brand-border)] p-3 text-xs shadow-xl ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-md transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center shrink-0 border border-[var(--brand-border)]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[var(--text-primary)] leading-tight">
                {status.clinicName}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]">
                {t("uiDemo")}
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] font-mono">
              {t("uiAutoResetIn")} <strong className="text-[var(--brand-text)]">{formattedCountdown}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          title={t("uiResetPPMSClinicDemoData")}
          className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] border border-[var(--border-default)] font-bold text-[11px] text-[var(--text-primary)] transition flex items-center gap-1.5 disabled:opacity-60 cursor-pointer shrink-0"
        >
          <RotateCcw className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
          <span>{isPending ? "..." : (t("uiReset"))}</span>
        </button>
      </div>

      {resetMessage && (
        <div className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border-t border-[var(--border-subtle)] pt-1.5">
          <CheckCircle2 className="w-3 h-3" />
          <span>{resetMessage}</span>
        </div>
      )}
    </aside>
  );
}
