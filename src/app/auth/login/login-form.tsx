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
  Sparkles,
} from "lucide-react";
import { AuthBrandingPanel } from "@/components/auth/auth-branding-panel";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { LanguageToggle } from "@/components/common/language-toggle";
import { DemoCountdownTimer } from "@/components/common/demo-countdown-timer";
import { useLanguage } from "@/lib/i18n/language-context";

const DEMO_ACCOUNTS = [
  {
    role: "Super Admin",
    name: "Super Admin",
    facility: "PPMS Clinic (Global Master)",
    email: "admin@ppms.local",
    password: "Pass1234!",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    icon: "👑",
    fullWidth: true,
  },
  {
    role: "Clinic Admin",
    name: "PPMS Clinic Admin",
    facility: "PPMS Clinic",
    email: "clinic.admin@ppms.local",
    password: "Pass1234!",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    icon: "🏢",
    fullWidth: false,
  },
  {
    role: "Doctor",
    name: "Dr. Fahim Rahman",
    facility: "PPMS Clinic",
    email: "doctor@ppms.local",
    password: "Pass1234!",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    icon: "🩺",
    fullWidth: false,
  },
  {
    role: "Staff",
    name: "PPMS Front Desk Staff",
    facility: "PPMS Clinic",
    email: "staff@ppms.local",
    password: "Pass1234!",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    icon: "🏥",
    fullWidth: false,
  },
  {
    role: "Patient",
    name: "Nusrat Jahan",
    facility: "PPMS Clinic",
    email: "patient@ppms.local",
    password: "Pass1234!",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: "🧑",
    fullWidth: false,
  },
];

export function LoginForm({ isDemoMode = true }: { isDemoMode?: boolean }) {
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

  // If user is already authenticated on the client, redirect to dashboard immediately
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

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
        router.push(`/auth/verify-email?email=${encodeURIComponent(res.email || loginEmail)}`);
        return;
      }
      setError(res.error || "Login failed");
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const cancel2FA = () => {
    setIs2FAChallenge(false);
    setTempToken("");
    setTwoFactorCode("");
    setError("");
  };

  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Desktop Informative Hero Panel (Left 5 Columns, Fixed / Sticky, Guaranteed No Scroll) */}
      <div className="lg:col-span-5 xl:col-span-5 hidden lg:flex flex-col sticky top-0 h-screen max-h-screen overflow-hidden">
        <AuthBrandingPanel
          badge={t("uiClinicalOperatingSystem")}
          title={t("uiIntelligentPrescriptionsForModernHealthcare")}
          highlightText={t("uiZeroFriction")}
          description={t("loginWorkspaceDescription")}
        />
      </div>

      {/* Authentication Form Panel (Right 7 Columns, Full Restored Content) */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 overflow-y-auto">
        {/* Top Navbar: Brand logo (mobile) & Home / Theme toggle */}
        <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-sm shadow-xs">
              Rx
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                PPMS Clinical
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Healthcare Operating System
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>{t("uiSecureEnterpriseSingleSignOn")}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeCustomizer compact direction="down" align="right" />
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-[var(--brand-primary)] transition flex items-center gap-1"
            >
              ← {t.home}
            </Link>
          </div>
        </div>

        {/* Center Card Content */}
        <div className="my-auto py-8 max-w-md w-full mx-auto space-y-6">
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
                    ? (t("uiEnterAnUnusedCharacterRecovery"))
                    : (language === "bn" ? `আপনার অথেনটিকেটর অ্যাপ থেকে ৬-সংখ্যার কোডটি প্রবেশ করান (${maskedEmail || "আপনার অ্যাকাউন্ট"})।` : `Enter the 6-digit code from your authenticator app for ${maskedEmail || "your account"}.`)}
                </p>
              </div>

              <form className="space-y-4" onSubmit={onVerify2FASubmit}>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {useBackupCode ? (t("uiRecoveryBackupCode")) : (t("uiDigitAuthenticatorCode"))}
                  </label>
                  <div className="relative">
                    <input
                      className={`w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[52px] h-[52px] ${
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
                  <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50 leading-relaxed">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={twoFactorLoading || !twoFactorCode.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-bold shadow-xs hover:opacity-95 transition-all disabled:opacity-60 cursor-pointer"
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
              <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t("uiVerifiedClinicalAccess")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.welcomeBack}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isDemoMode
                ? (t("uiSignInWithYourEmail"))
                : (t("uiSignInWithYourVerified"))}
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
                  className="w-full input-icon-left !pl-11 pr-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
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
                  className="w-full input-icon-left !pl-11 pr-11 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
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
              <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50 leading-relaxed">
                {error}
              </p>
            )}

            <button
              className="w-full rounded-xl bg-[var(--brand-primary)] hover:opacity-95 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
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

          {/* Account Registration Callouts */}
          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {t("uiNewToPPMSCreateAn")}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href="/auth/register?type=clinic"
                className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-surface)]/30 transition group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
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
                className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:border-rose-500/50 hover:bg-rose-500/5 transition group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition truncate">
                      {t("rolePatientPortal")}
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

          {/* Quick Demo Login Profiles */}
          {isDemoMode && (
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                    {t.demoProfilesTitle}
                  </span>
                </div>
                <span className="rounded-full bg-[var(--brand-surface)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--brand-text)] border border-[var(--brand-border)]">
                  {t("instantDemoAccess")}
                </span>
              </div>

              {/* 6-Hour Countdown Live Banner */}
              <DemoCountdownTimer variant="inline" />

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === "bn"
                  ? <>সরাসরি প্রবেশ করতে নিচের যে কোনো ডেমো প্রোফাইলে ক্লিক করুন (<strong className="text-[var(--text-primary)]">PPMS Clinic</strong> স্যান্ডবক্স):</>
                  : <>Click any profile below to sign in immediately to the <strong className="text-[var(--text-primary)]">PPMS Clinic</strong> sandbox facility:</>}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => performLogin(account.email, account.password)}
                    disabled={loading}
                    className={`flex flex-col items-start rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-3 text-left transition hover:border-[var(--brand-primary)] hover:shadow-xs disabled:opacity-60 cursor-pointer ${
                      account.fullWidth ? "col-span-2" : "col-span-1"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${account.badge}`}
                      >
                        <span>{account.icon}</span>
                        <span>{account.role}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate max-w-[150px]">
                        🏥 {account.facility}
                      </span>
                    </div>
                    <span className="mt-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 truncate w-full">
                      {account.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full">
                      {account.email}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Bottom Footer legal text */}
        <div className="pt-6 border-t border-[var(--border-subtle)] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} PPMS Clinical OS. {t("allRightsReserved")}</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-500" />
            {t("uiHipaaBMDCCompliant")}
          </span>
        </div>
      </div>
    </main>
  );
}
