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
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Password reset token is missing from the URL. Please use the link sent to your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
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
      } else {
        setError(data.message || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setError("Network error occurred while resetting password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
              Set New Password
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

      <div className="mt-6 space-y-6">
        {!success ? (
          <>
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center mx-auto shadow-xs">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Create New Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Enter your new password below. Ensure it is at least 8 characters long.
              </p>
            </div>

            {!token && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">
                  Missing reset token. Please open the link received in your email or request a new one.
                </span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  New Password (min 8 chars)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full input-icon-left !pl-11 pr-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 min-h-[46px] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full input-icon-left !pl-11 pr-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 min-h-[46px] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token || password.length < 8 || password !== confirmPassword}
                className="w-full min-h-[46px] rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    Save New Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-slate-500 hover:text-[var(--brand-primary)] transition"
              >
                Link expired or broken? <span className="font-bold underline">Request a new one</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Password Successfully Reset!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                Your account password has been updated. You can now log into your clinical dashboard using your new credentials.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="w-full min-h-[46px] rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs text-slate-500">
            Loading reset interface...
          </div>
        }
      >
        <ResetPasswordInner />
      </Suspense>
    </main>
  );
}
