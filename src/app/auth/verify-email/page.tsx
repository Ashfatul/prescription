"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Lock,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { AuthBrandingPanel } from "@/components/auth/auth-branding-panel";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { LanguageToggle } from "@/components/common/language-toggle";
import { useLanguage } from "@/lib/i18n/language-context";
import { notifyToast } from "@/lib/toast";

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");
  const [email, setEmail] = useState(emailParam || "");
  const [verifying, setVerifying] = useState(Boolean(token));
  const [verified, setVerified] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend state
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Change Email state
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);

  // 1. If token is present, attempt automatic verification
  useEffect(() => {
    if (!token) return;

    let mounted = true;
    const verifyToken = async () => {
      try {
        setVerifying(true);
        setError(null);
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!mounted) return;

        if (res.ok && data.success) {
          setVerified(true);
          setPendingApproval(Boolean(data.pendingApproval));
          setSuccessMsg(data.message || "Email verified successfully!");
          notifyToast(data.message || "Email verified successfully!", "success");
        } else {
          const message = data.message || "Verification link is invalid or has expired.";
          setError(message);
          notifyToast(message, "error");
        }
      } catch {
        if (mounted) {
          const message = "Network error while verifying email. Please try again.";
          setError(message);
          notifyToast(message, "error");
        }
      } finally {
        if (mounted) setVerifying(false);
      }
    };

    void verifyToken();
    return () => {
      mounted = false;
    };
  }, [token]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // 2. Handle Resend Verification Email
  const handleResend = async () => {
    if (!email || cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.alreadyVerified) {
          setVerified(true);
          setSuccessMsg("This email is already verified. You can log into your account now.");
        } else {
          setSuccessMsg(data.message || "A fresh verification link has been sent to your email!");
          notifyToast(data.message || "A fresh verification link has been sent to your email!", "success");
          setCooldown(60); // 60s cooldown
        }
      } else {
        const message = data.message || "Failed to resend verification email.";
        setError(message);
        notifyToast(message, "error");
      }
    } catch {
      const message = "Network error while sending verification email.";
      setError(message);
      notifyToast(message, "error");
    } finally {
      setResending(false);
    }
  };

  // 3. Handle Changing Email Address
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !password || changingEmail) return;

    setChangingEmail(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/change-email-unverified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: email,
          newEmail: newEmail.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEmail(newEmail);
        setSuccessMsg(data.message || `Email updated to ${newEmail}. Verification link dispatched.`);
        notifyToast(data.message || `Email updated to ${newEmail}. Verification link dispatched.`, "success");
        setShowChangeEmail(false);
        setPassword("");
        setNewEmail("");
        setCooldown(60);
      } else {
        const message = data.message || "Failed to change email address.";
        setError(message);
        notifyToast(message, "error");
      }
    } catch {
      const message = "Network error while updating email address.";
      setError(message);
      notifyToast(message, "error");
    } finally {
      setChangingEmail(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm space-y-6">
        {/* State A: Verifying Token */}
        {verifying && (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center mx-auto animate-spin">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.verifyingEmailAddress}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t.verifyingEmailNotice}
              </p>
            </div>
          </div>
        )}

        {/* State B: Successfully Verified */}
        {!verifying && verified && (
          <div className="text-center py-6 space-y-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
                pendingApproval
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {pendingApproval ? (
                <ShieldCheck className="w-9 h-9" />
              ) : (
                <CheckCircle2 className="w-9 h-9" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {pendingApproval ? t.emailConfirmedApproval : t.emailConfirmedSuccess}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 max-w-sm mx-auto leading-relaxed">
                {successMsg || t.emailAuthNotice}
              </p>
            </div>

            <div className="pt-4">
              {pendingApproval ? (
                <Link
                  href="/auth/login"
                  className="w-full min-h-[46px] rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("uiReturnToSignIn")}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    router.push("/dashboard");
                    router.refresh();
                  }}
                  className="w-full min-h-[46px] rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  {t("uiContinueToDashboard")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* State C: Pending Verification or Invalid Token with Resend/Change Email */}
        {!verifying && !verified && (
          <div className="space-y-5">
            {/* Icon & Title */}
            <div className="text-center space-y-2">
              <div className="relative w-16 h-16 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center mx-auto shadow-xs">
                <Mail className="w-8 h-8" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-primary)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--brand-primary)]" />
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.checkYourInbox}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {t("uiWeSentASecureVerification")}
              </p>
            </div>

            {/* Email Address Display Badge */}
            {email ? (
              <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {email}
                </span>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  {t("uiEnterYourRegisteredEmail")}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full input-icon-left !pl-11 pr-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 min-h-[46px] outline-none focus:border-[var(--brand-primary)]"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{successMsg}</span>
              </div>
            )}

            {/* Resend Action */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={!email || resending || cooldown > 0}
                className="w-full min-h-[46px] rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t("uiSendingFreshLink")}</span>
                  </>
                ) : cooldown > 0 ? (
                  language === "bn" ? `${cooldown} সেকেন্ড পর পুনরায় পাঠানো যাবে` : `Resend available in ${cooldown}s`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>{t.resendVerificationEmail}</span>
                  </>
                )}
              </button>

              {/* Instructions list */}
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {t.didNotReceiveEmail}
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>
                    {language === "bn" ? (
                      <>আপনার <strong>Spam</strong> বা <strong>Junk</strong> ফোল্ডার চেক করুন।</>
                    ) : (
                      <>Check your <strong>Spam</strong> or <strong>Junk</strong> folder.</>
                    )}
                  </li>
                  <li>
                    {t("uiEnsureYourEmailServiceAllows")}
                  </li>
                  <li>
                    {t("uiWaitMinutesOrClickResend")}
                  </li>
                </ul>
              </div>
            </div>

            {/* Change Email Toggle & Form */}
            <div className="pt-3 border-t border-[var(--border-subtle)]">
              {!showChangeEmail ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowChangeEmail(true);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="w-full text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center justify-center gap-1.5 py-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {t("uiMistypedEmailChangeAddressResend")}
                </button>
              ) : (
                <form onSubmit={(e) => void handleChangeEmail(e)} className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t.updateEmailAddress}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowChangeEmail(false)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      {t.newEmailAddress}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="correct-email@example.com"
                        required
                        className="w-full input-icon-left !pl-11 pr-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-slate-100 min-h-[44px] outline-none focus:border-[var(--brand-primary)]"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      {t("uiAccountPasswordToConfirmIdentity")}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full input-icon-left !pl-11 pr-11 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-slate-100 min-h-[44px] outline-none focus:border-[var(--brand-primary)]"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                        title={showPassword ? (t("uiHidePassword")) : (t("uiShowPassword"))}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={changingEmail || !newEmail || !password}
                    className="w-full min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    {changingEmail
                      ? (t("uiUpdatingDispatching"))
                      : (t("uiUpdateEmailResend"))}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  const { t, language } = useLanguage();

  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Desktop Informative Hero Panel (Left 5 Columns, Fixed / Sticky, Guaranteed No Scroll) */}
      <div className="lg:col-span-5 xl:col-span-5 hidden lg:flex flex-col sticky top-0 h-screen max-h-screen overflow-hidden">
        <AuthBrandingPanel
          badge={t("uiEmailAuthentication")}
          title={t("uiVerifyingClinicalCredentialsContacts")}
          highlightText={t("uiZeroCompromise2")}
          description={t("uiWeVerifyEmailAddressesTo")}
          features={[
            {
              icon: <ShieldCheck className="w-4 h-4 text-teal-400" />,
              title: t("uiVerifiedElectronicDispenseRxAlerts"),
            },
            {
              icon: <Lock className="w-4 h-4 text-emerald-400" />,
              title: t("uiCryptographicSingleUseVerificationTokens"),
            },
            {
              icon: <Sparkles className="w-4 h-4 text-sky-400" />,
              title: t("uiOneClickActivationDirectRedirection"),
            },
          ]}
        />
      </div>

      {/* Verification Interaction Panel (Right 7 Columns) */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 overflow-y-auto">
        {/* Top Navbar */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          {/* Mobile Brand */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-sm shadow-xs">
              Rx
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {t.appTitle}
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Mail className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>{t("uiEmailIdentityAuthentication")}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeCustomizer compact direction="down" align="right" />
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-slate-500 hover:text-[var(--brand-primary)] transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.login}</span>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="py-6 my-auto w-full">
          <Suspense
            fallback={
              <div className="p-6 max-w-md mx-auto rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs text-slate-500 text-center">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[var(--brand-primary)]" />
                {t("uiLoadingVerificationPanel")}
              </div>
            }
          >
            <VerifyEmailInner />
          </Suspense>
        </div>

        {/* Bottom Footer */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>{t("uiProtectedByHIPAABMDCCompliant2")}</span>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-[var(--brand-primary)] transition font-medium">
              {t.privacyPolicy}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--brand-primary)] transition font-medium">
              {t.termsOfService}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
