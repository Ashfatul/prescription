"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { TOAST_EVENT, ToastDetail, ToastType } from "@/lib/toast";

type ToastItem = ToastDetail & { id: number };

const TOAST_DURATION = 5000;

const typeStyles: Record<ToastType, { icon: typeof Info; color: string }> = {
  success: { icon: CheckCircle2, color: "var(--color-success)" },
  error: { icon: AlertCircle, color: "var(--color-danger)" },
  info: { icon: Info, color: "var(--color-info)" },
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
              className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-primary)] shadow-[var(--shadow-elevated)] motion-safe:animate-in motion-safe:slide-in-from-top-2"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: style.color }} aria-hidden="true" />
              <p className="min-w-0 flex-1 break-words leading-5">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded-lg p-1 text-[var(--text-muted)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
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
