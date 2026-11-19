"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Building2,
  HeartPulse,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Shield,
  KeyRound,
} from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginCompanion } from "@/components/auth/login-companion";
import { useLanguage } from "@/lib/i18n/language-context";
import { notifyToast } from "@/lib/toast";
import { getDashboardPathForRole } from "@/lib/auth/rbac";

export function LoginForm() {
  const router = useRouter();
  const { user, login, verify2FALogin, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2FA Verification Challenge State
  const [is2FAChallenge, setIs2FAChallenge] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // If user is already authenticated on the client, redirect to role dashboard immediately
  useEffect(() => {
    if (!authLoading && user) {
      const target = getDashboardPathForRole(user.role);
      window.location.href = target;
    }
  }, [user, authLoading]);

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setError("");
    setEmail(loginEmail);
    setPassword(loginPassword);

    const res = await login(loginEmail, loginPassword);
    setLoading(false);

    if (res.requires2FA) {
      setIs2FAChallenge(true);
      setTempToken(res.tempToken || "");
      setMaskedEmail(res.maskedEmail || loginEmail);
      setTwoFactorCode("");
      setError("");
      return;
    }

    if (!res.success) {
      if (res.requireVerification) {
        notifyToast(res.error || t("uiPleaseVerifyYourEmail"), "error");
        router.push(`/auth/verify-email?email=${encodeURIComponent(res.email || loginEmail)}`);
        return;
      }
      setError(res.error || "Login failed");
      notifyToast(res.error || "Login failed", "error");
      return;
    }

    notifyToast(t("uiLoginSuccessful"), "success");
    const target = getDashboardPathForRole(res.user?.role || user?.role);
    window.location.href = target;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void performLogin(email, password);
  };

  const onVerify2FASubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim() || twoFactorLoading) return;

    setTwoFactorLoading(true);
    setError("");

    const res = await verify2FALogin(tempToken, twoFactorCode.trim());
    setTwoFactorLoading(false);

    if (!res.success) {
      setError(res.error || "Invalid verification code.");
      notifyToast(res.error || "Invalid verification code.", "error");
      return;
    }

    notifyToast(t("uiLoginSuccessful"), "success");
    const target = getDashboardPathForRole(res.user?.role || user?.role);
    window.location.href = target;
  };

  const cancel2FA = () => {
    setIs2FAChallenge(false);
    setTempToken("");
    setTwoFactorCode("");
    setError("");
  };

  return (
    <AuthShell
      activeBadge={t("uiVerifiedClinicalAccess")}
      companion={<LoginCompanion />}
      deckMaxWidth="max-w-5xl"
    >
      <div className="w-full max-w-md mx-auto my-auto space-y-6">
        {is2FAChallenge ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>{t.twoFactorAuthentication}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {t("securityCheck", "Security Check")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {useBackupCode
                  ? t("uiEnterAnUnusedCharacterRecovery")
                  : language === "bn"
                  ? `আপনার অথেনটিকেটর অ্যাপ থেকে ৬-সংখ্যার কোডটি প্রবেশ করান (${maskedEmail || "আপনার অ্যাকাউন্ট"})।`
                  : `Enter the 6-digit code from your authenticator app for ${maskedEmail || "your account"}.`}
              </p>
            </div>

            <form className="space-y-4" onSubmit={onVerify2FASubmit}>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {useBackupCode ? t("uiRecoveryBackupCode") : t("uiDigitAuthenticatorCode")}
                </label>
                <div className="relative">
                  <input
                    className={`w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[52px] h-[52px] ${
                      useBackupCode
                        ? "px-4 font-mono text-center tracking-[0.15em] text-lg font-bold"
                        : "px-4 font-mono text-center tracking-[0.3em] text-2xl font-bold"
                    }`}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder={useBackupCode ? "XXXX-XXXX" : "000000"}
                    maxLength={useBackupCode ? 9 : 6}
                    autoFocus
                    required
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50 leading-relaxed">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={twoFactorLoading || !twoFactorCode.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-bold shadow-xs hover:opacity-95 transition-all disabled:opacity-60 cursor-pointer"
              >
                {twoFactorLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t.verifying}</span>
                  </>
                ) : (
                  <>
                    <span>{t.verifyAndSignIn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setUseBackupCode(!useBackupCode);
                    setTwoFactorCode("");
                    setError("");
                  }}
                  className="text-[var(--brand-primary)] font-semibold hover:underline cursor-pointer"
                >
                  {useBackupCode ? t.useTotpCode : t.useBackupCode}
                </button>

                <button
                  type="button"
                  onClick={cancel2FA}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t("uiBackToLogin")}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Login Header */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t("uiVerifiedClinicalAccess")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {t.welcomeBack}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t("uiSignInWithYourVerified")}
              </p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              {/* Email Field with Icon */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t.emailAddress}
                </label>
                <div className="relative">
                  <input
                    className="w-full input-icon-left !pl-11 pr-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[44px] h-[44px]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.authEmailPlaceholder}
                    type="email"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Password Field with Show/Hide Toggle & Icon */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t.password}
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer"
                  >
                    {t.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    className="w-full input-icon-left !pl-11 pr-11 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[44px] h-[44px]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    required
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

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50 leading-relaxed">
                  {error}
                </p>
              )}

              <button
                className="w-full rounded-lg bg-[var(--brand-primary)] hover:opacity-95 min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t.pleaseWait}</span>
                  </>
                ) : (
                  <>
                    <span>{t.signIn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Account Registration Pathways */}
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block text-center sm:text-left">
                {t("uiNewToPPMSCreateAn")}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Link
                  href="/auth/register?type=clinic"
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-surface)]/30 transition group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[var(--brand-text)] transition truncate">
                        {t("registerClinicBtn")}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {t("uiDayFreeTrialNoCard")}
                    </p>
                  </div>
                </Link>

                <Link
                  href="/auth/register?type=patient"
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:border-rose-500/50 hover:bg-rose-500/5 transition group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition truncate">
                        {t("uiPatientPortal")}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {t("patientPortalDesc")}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthShell>
  );
}
