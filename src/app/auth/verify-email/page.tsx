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
} from "lucide-react";

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [verifying, setVerifying] = useState(Boolean(token));
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend state
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Change Email state
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
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
          setSuccessMsg(data.message || "Email verified successfully!");
        } else {
          setError(data.message || "Verification link is invalid or has expired.");
        }
      } catch {
        if (mounted) {
          setError("Network error while verifying email. Please try again.");
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
          setSuccessMsg("Your email is already verified! You can proceed to the dashboard.");
        } else {
          setSuccessMsg(data.message || `A fresh verification link was sent to ${email}`);
          setCooldown(60);
        }
      } else {
        setError(data.message || "Failed to resend verification email.");
      }
    } catch {
      setError("Network error while sending verification link. Please check your connection.");
    } finally {
      setResending(false);
    }
  };

  // 3. Handle Change Email
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !newEmail || !password || changingEmail) return;

    setChangingEmail(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/change-email", {
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
        setEmail(data.email || newEmail.trim().toLowerCase());
        setSuccessMsg(data.message || `Email updated to ${newEmail}. Verification link dispatched.`);
        setShowChangeEmail(false);
        setPassword("");
        setNewEmail("");
        setCooldown(60);
      } else {
        setError(data.message || "Failed to change email address.");
      }
    } catch {
      setError("Network error while updating email address.");
    } finally {
      setChangingEmail(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-sm shadow-xs">
            Rx
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              PPMS Clinical Suite
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Identity & Email Verification
            </p>
          </div>
        </div>
        <Link
          href="/auth/login"
          className="text-xs font-semibold text-slate-500 hover:text-[var(--brand-primary)] transition flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Login
        </Link>
      </div>

      {/* Main Body */}
      <div className="mt-6 space-y-6">
        {/* State A: Verifying Token */}
        {verifying && (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center mx-auto animate-spin">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Verifying Your Email Address...
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Please hold on while we validate your cryptographic verification token.
              </p>
            </div>
          </div>
        )}

        {/* State B: Successfully Verified */}
        {!verifying && verified && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Email Confirmed & Verified!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 max-w-sm mx-auto leading-relaxed">
                {successMsg ||
                  "Your email address has been authenticated. You now have full access to your clinical dashboard."}
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  router.push("/dashboard");
                  router.refresh();
                }}
                className="w-full min-h-[46px] rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                Continue to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Check Your Inbox
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                We sent a secure verification link to verify your identity before granting access to patient records and clinical tools.
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
                  Enter Your Registered Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 min-h-[44px] outline-none focus:border-[var(--brand-primary)]"
                />
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
                    Sending Fresh Link...
                  </>
                ) : cooldown > 0 ? (
                  `Resend available in ${cooldown}s`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend Verification Email
                  </>
                )}
              </button>

              {/* Instructions list */}
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Didn’t receive the confirmation email?
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Check your <strong>Spam</strong> or <strong>Junk</strong> folder.</li>
                  <li>Ensure your email service allows mail from our domain.</li>
                  <li>Wait 1-2 minutes or click resend link above.</li>
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
                  Mistyped email? Change address & resend
                </button>
              ) : (
                <form onSubmit={(e) => void handleChangeEmail(e)} className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Update Account Email Address
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowChangeEmail(false)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="correct-email@example.com"
                      required
                      className="w-full px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-slate-100 min-h-[42px] outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Account Password (to confirm identity)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full input-icon-left !pl-10 pr-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-slate-100 min-h-[42px] outline-none focus:border-[var(--brand-primary)]"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={changingEmail || !newEmail || !password}
                    className="w-full min-h-[42px] rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    {changingEmail ? "Updating & Disptaching..." : "Update Email & Resend"}
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
  return (
    <main className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs text-slate-500">
            Loading verification panel...
          </div>
        }
      >
        <VerifyEmailInner />
      </Suspense>
    </main>
  );
}
