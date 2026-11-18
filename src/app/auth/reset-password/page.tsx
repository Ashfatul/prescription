"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RecoveryCompanion } from "@/components/auth/recovery-companion";
import { useLanguage } from "@/lib/i18n/language-context";
import { notifyToast } from "@/lib/toast";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { t } = useLanguage();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      const message = "Password reset token is missing from the URL. Please use the link sent to your email.";
      setError(message);
      notifyToast(message, "error");
      return;
    }

    if (password.length < 8) {
      const message = "Password must be at least 8 characters long.";
      setError(message);
      notifyToast(message, "error");
      return;
    }

    if (password !== confirmPassword) {
      const message = "Passwords do not match. Please re-enter.";
      setError(message);
      notifyToast(message, "error");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        notifyToast(data.message || t("uiPasswordSuccessfullyReset"), "success");
      } else {
        const message = data.message || "Failed to reset password. The link may have expired.";
        setError(message);
        notifyToast(message, "error");
      }
    } catch {
      const message = "Network error occurred while resetting password. Please try again.";
      setError(message);
      notifyToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto space-y-6">
      {!success ? (
        <>
          <div className="text-center sm:text-left space-y-1.5">
            <div className="w-12 h-12 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("uiCreateNewPassword")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("uiEnterYourNewPasswordBelow")}
            </p>
          </div>

          {!token && (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">
                {t("uiMissingResetTokenPleaseOpen")}
              </span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t.newPassword} ({t("uiMinChars")})
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full input-icon-left !pl-11 pr-11 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 min-h-[44px] h-[44px] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {t.confirmNewPassword}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full input-icon-left !pl-11 pr-11 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 min-h-[44px] h-[44px] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token || password.length < 8 || password !== confirmPassword}
              className="w-full min-h-[44px] rounded-lg bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.saving}</span>
                </>
              ) : (
                <>
                  <span>{t.updatePassword}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[var(--border-subtle)] text-center text-xs text-slate-500">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-slate-500 hover:text-[var(--brand-primary)] transition"
            >
              {t("uiLinkExpiredOrBroken")}{" "}
              <span className="font-bold underline">{t("uiRequestANewOne")}</span>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center sm:text-left py-2 space-y-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("uiPasswordSuccessfullyReset")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {t("uiYourAccountPasswordHasBeen")}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="w-full min-h-[44px] rounded-lg bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <span>{t.signIn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();

  return (
    <AuthShell
      activeBadge={t("uiCredentialsSecurity")}
      companion={<RecoveryCompanion currentStep={3} />}
      deckMaxWidth="max-w-5xl"
    >
      <Suspense
        fallback={
          <div className="p-8 max-w-md mx-auto text-xs text-slate-500 text-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[var(--brand-primary)]" />
            <p>{t("uiLoadingResetInterface")}</p>
          </div>
        }
      >
        <ResetPasswordInner />
      </Suspense>
    </AuthShell>
  );
}
