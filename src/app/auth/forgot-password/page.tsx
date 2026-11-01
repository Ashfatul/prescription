"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
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
    <main className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm">
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
                Account Recovery & Security
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

        {/* Content */}
        <div className="mt-6 space-y-6">
          {!submitted ? (
            <>
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center mx-auto shadow-xs">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Forgot Password?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Enter your account email address and we’ll dispatch a secure password reset link.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doctor@hospital.org"
                      required
                      className="w-full input-icon-left !pl-11 pr-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 min-h-[46px] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full min-h-[46px] rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending Instructions...
                    </>
                  ) : (
                    <>
                      Send Reset Instructions
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <Link
                  href="/auth/login"
                  className="text-xs font-medium text-slate-500 hover:text-[var(--brand-primary)] transition"
                >
                  Remember your password? <span className="font-bold underline">Sign in</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Instructions Dispatched
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                  If an active PPMS account matches <strong className="text-slate-900 dark:text-white font-mono">{email}</strong>, a password reset link has been dispatched to that inbox.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-slate-500 dark:text-slate-400 text-left space-y-1 leading-relaxed">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Next Steps:</p>
                <p>1. Open your inbox and click the reset link within 1 hour.</p>
                <p>2. If you don&apos;t receive an email, check your Spam or Junk folder.</p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-semibold text-[var(--brand-primary)] hover:underline py-1.5 cursor-pointer"
                >
                  Try another email address
                </button>
                <Link
                  href="/auth/login"
                  className="w-full min-h-[44px] rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
