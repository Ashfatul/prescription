"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { AuthBrandingPanel } from "@/components/auth/auth-branding-panel";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { LanguageToggle } from "@/components/common/language-toggle";
import { useLanguage } from "@/lib/i18n/language-context";

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
      } else {
        setError(data.message || "Failed to process password reset request.");
      }
    } catch {
      setError("Network error while submitting request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Desktop Informative Hero Panel (Left 5 Columns, Fixed / Sticky, Guaranteed No Scroll) */}
      <div className="lg:col-span-5 xl:col-span-5 hidden lg:flex flex-col sticky top-0 h-screen max-h-screen overflow-hidden">
        <AuthBrandingPanel
          badge="Account Security"
          title="Secure Access Recovery for Healthcare Teams"
          highlightText="Zero Compromise."
          description="Our account recovery system uses single-use cryptographic tokens with rate limiting to safeguard sensitive medical and prescription records."
          features={[
            {
              icon: <KeyRound className="w-4 h-4 text-teal-400" />,
              title: "Cryptographic Single-Use Reset Tokens",
            },
            {
              icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
              title: "OWASP-Compliant Account Enumeration Defense",
            },
            {
              icon: <Sparkles className="w-4 h-4 text-sky-400" />,
              title: "Comprehensive Security & IP Audit Logging",
            },
          ]}
        />
      </div>

      {/* Auth Interaction Panel (Right 7 Columns) */}
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
                PPMS Clinical
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Healthcare Operating System
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>Cryptographic Account Recovery</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeCustomizer compact direction="down" align="right" />
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-slate-500 hover:text-[var(--brand-primary)] transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.signIn}</span>
            </Link>
          </div>
        </div>

        {/* Content Card Area */}
        <div className="py-6 my-auto w-full max-w-md mx-auto">
          <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm space-y-5">
            {!submitted ? (
              <>
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center mx-auto shadow-xs">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {t.forgotPassword}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    {language === "bn"
                      ? "আপনার নিবন্ধিত ইমেইল ঠিকানা প্রদান করুন, আমরা পাসওয়ার্ড রিসেট করার নিরাপদ লিংক পাঠাব।"
                      : "Enter your account email address and we’ll dispatch a secure, single-use password reset link."}
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{error}</span>
                  </div>
                )}

                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      {t.emailAddress}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@hospital.org"
                        required
                        className="w-full input-icon-left !pl-11 pr-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 min-h-[44px] h-[44px] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full min-h-[44px] rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t.submitting}</span>
                      </>
                    ) : (
                      <>
                        <span>{language === "bn" ? "রিসেট লিংক পাঠান" : "Send Reset Instructions"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-1">
                  <Link
                    href="/auth/login"
                    className="text-xs font-medium text-slate-500 hover:text-[var(--brand-primary)] transition"
                  >
                    {language === "bn" ? "পাসওয়ার্ড মনে পড়েছে? " : "Remember your password? "}
                    <span className="font-bold underline">{t.signIn}</span>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-2 space-y-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {language === "bn" ? "ইমেইল পাঠানো হয়েছে" : "Instructions Dispatched"}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    {language === "bn"
                      ? `যদি এই অ্যাকাউন্টের সাথে মিল থাকে (${email}), তবে পাসওয়ার্ড রিসেট করার নির্দেশনা পাঠানো হয়েছে।`
                      : `If an active account matches ${email}, a password reset link has been dispatched.`}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-slate-500 dark:text-slate-400 text-left space-y-1 leading-relaxed">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{language === "bn" ? "পরবর্তী করণীয়:" : "Next Steps:"}</p>
                  <p>{language === "bn" ? "১. আপনার ইনবক্স চেক করে ১ ঘণ্টার মধ্যে লিংকে ক্লিক করুন।" : "1. Open your inbox and click the reset link within 1 hour."}</p>
                  <p>{language === "bn" ? "২. ইমেইল না পেলে স্প্যাম বা জাঙ্ক ফোল্ডার চেক করুন।" : "2. If you don't receive an email, check your Spam or Junk folder."}</p>
                </div>

                <div className="pt-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-semibold text-[var(--brand-primary)] hover:underline py-1 cursor-pointer"
                  >
                    {language === "bn" ? "অন্য ইমেইল দিয়ে চেষ্টা করুন" : "Try another email address"}
                  </button>
                  <Link
                    href="/auth/login"
                    className="w-full min-h-[42px] rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition"
                  >
                    {language === "bn" ? "লগইনে ফিরে যান" : "Return to Login"}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>{language === "bn" ? "বিএমডিসি ও স্বাস্থ্য নিরাপত্তা মানদণ্ড দ্বারা সুরক্ষিত।" : "Protected by HIPAA & BMDC compliant security standards."}</span>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-[var(--brand-primary)] transition font-medium">
              {t.footerPrivacyPolicy}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--brand-primary)] transition font-medium">
              {t.footerTermsOfService}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
