"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RecoveryCompanion } from "@/components/auth/recovery-companion";
import { useLanguage } from "@/lib/i18n/language-context";
import { notifyToast } from "@/lib/toast";

export default function ForgotPasswordPage() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@") || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
        notifyToast(data.message || t("uiPasswordResetLinkSent"), "success");
      } else {
        const message = data.message || "Failed to process password reset request.";
        setError(message);
        notifyToast(message, "error");
      }
    } catch {
      const message = "Network error while submitting request. Please try again.";
      setError(message);
      notifyToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      activeBadge={t("uiAccountSecurity")}
      companion={<RecoveryCompanion currentStep={submitted ? 2 : 1} />}
      deckMaxWidth="max-w-5xl"
    >
      <div className="w-full max-w-md mx-auto my-auto space-y-6">
        {!submitted ? (
          <>
            <div className="text-center sm:text-left space-y-1.5">
              <div className="w-12 h-12 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.forgotPassword}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t("uiEnterYourAccountEmailAddress")}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {t.emailAddress}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@hospital.org"
                    required
                    className="w-full input-icon-left !pl-11 pr-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 min-h-[44px] h-[44px] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full min-h-[44px] rounded-lg bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.submitting}</span>
                  </>
                ) : (
                  <>
                    <span>{t("uiSendResetInstructions")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-[var(--border-subtle)] text-center text-xs text-slate-500">
              <span>{t("uiRememberYourPassword")} </span>
              <Link
                href="/auth/login"
                className="font-bold text-[var(--brand-text)] hover:underline inline-flex items-center gap-1"
              >
                <span>{t.signIn}</span>
                <ArrowRight className="w-3 h-3" />
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
                {t("uiInstructionsDispatched")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {language === "bn"
                  ? `যদি এই অ্যাকাউন্টের সাথে মিল থাকে (${email}), তবে পাসওয়ার্ড রিসেট করার নির্দেশনা পাঠানো হয়েছে।`
                  : `If an active account matches ${email}, a password reset link has been dispatched.`}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{t("uiNextSteps")}</p>
              <p>{t("uiOpenYourInboxAndClick")}</p>
              <p>{t("uiIfYouDonTReceive")}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-[var(--brand-primary)] hover:underline py-2 cursor-pointer"
              >
                {t("uiTryAnotherEmailAddress")}
              </button>
              <Link
                href="/auth/login"
                className="sm:ml-auto px-4 py-2.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition"
              >
                {t("uiReturnToLogin")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
