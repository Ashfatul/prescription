"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, LayoutDashboard, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";

interface ErrorViewProps {
  code: string | number;
  codeColor?: "brand" | "danger" | "warning" | "rose";
  title: string;
  description: string;
  onReset?: () => void;
  isDashboardScoped?: boolean;
}

export function ErrorView({
  code,
  codeColor = "brand",
  title,
  description,
  onReset,
  isDashboardScoped = false,
}: ErrorViewProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();

  const colorClasses = {
    brand: "text-[var(--brand-primary)]",
    danger: "text-red-600 dark:text-red-500",
    warning: "text-amber-600 dark:text-amber-500",
    rose: "text-rose-600 dark:text-rose-500",
  }[codeColor];

  const containerClasses = isDashboardScoped
    ? "w-full min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center p-4 sm:p-6"
    : "w-full h-screen max-h-screen overflow-hidden flex flex-col items-center justify-center text-center bg-[var(--bg-app)] text-[var(--text-primary)] p-4 sm:p-6 transition-colors";

  return (
    <main className={containerClasses}>
      {/* Width-limited content container with NO card background or visible border */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
        {/* Large Error Code */}
        <div
          className={`text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter select-none leading-none ${colorClasses}`}
        >
          {code}
        </div>

        {/* Medium Error Message */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-5 sm:mt-6 mb-3">
          {title}
        </h1>

        {/* Normal Error Description */}
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed mb-8">
          {description}
        </p>

        {/* Actions: Return Homepage, If Logged-in Dashboard, and Back Button */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Return Homepage */}
          <Link
            href="/"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-semibold text-sm shadow-md shadow-[var(--brand-primary)]/20 transition-all hover:shadow-lg active:scale-[0.98] min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>{t.uiBackToHome}</span>
          </Link>

          {/* If Logged In: Dashboard Button */}
          {user && (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold text-sm transition-all hover:border-[var(--brand-border)] active:scale-[0.98] min-h-[44px]"
            >
              <LayoutDashboard className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>{t.uiGoToDashboard}</span>
            </Link>
          )}

          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] font-medium text-sm transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.uiGoBack}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
