"use client";

import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { TOAST_EVENT, ToastDetail, ToastType } from "@/lib/toast";

type ToastItem = ToastDetail & { id: number };

const TOAST_DURATION = 5000;

const typeStyles: Record<ToastType, { icon: typeof Info; color: string; badge: string }> = {
  success: { icon: CheckCircle2, color: "var(--color-success)", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  error: { icon: AlertCircle, color: "var(--color-danger)", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  warning: { icon: AlertTriangle, color: "var(--color-warning)", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  info: { icon: Info, color: "var(--color-info)", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      if (!detail?.message || !detail.type) return;

      setToasts((current) => [
        ...current.filter((toast) => toast.message !== detail.message),
        { ...detail, id: Date.now() + Math.random() },
      ].slice(-4));
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  useEffect(() => {
    if (!toasts.length) return;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, TOAST_DURATION),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts]);

  const dismiss = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex max-w-none flex-col items-end gap-3 sm:left-auto sm:right-6 sm:max-w-[min(28rem,calc(100vw-3rem))]"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => {
          const style = typeStyles[toast.type];
          const Icon = style.icon;

          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              style={{ borderLeftColor: style.color, borderLeftWidth: "4px" }}
              className="pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3.5 sm:p-4 text-sm text-[var(--text-primary)] shadow-[var(--shadow-elevated)] motion-safe:animate-in motion-safe:slide-in-from-top-2"
            >
              <div className={`mt-0.5 p-1 rounded-md shrink-0 ${style.badge}`}>
                <Icon className="h-4 w-4" style={{ color: style.color }} aria-hidden="true" />
              </div>
              <p className="min-w-0 flex-1 break-words text-xs sm:text-sm font-medium leading-relaxed">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded-lg p-1 text-[var(--text-muted)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label={t.close}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
