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
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AuthBrandingPanel } from "@/components/auth/auth-branding-panel";
import { ThemeCustomizer } from "@/components/common/theme-customizer";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

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
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm space-y-5">
        {!success ? (
          <>
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center mx-auto shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Create New Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Enter your new password below. Ensure it is at least 8 characters long.
              </p>
            </div>

            {!token && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">
                  Missing reset token. Please open the link received in your email.
                </span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
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
                    className="w-full input-icon-left !pl-11 pr-11 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 min-h-[44px] h-[44px] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full input-icon-left !pl-11 pr-11 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 min-h-[44px] h-[44px] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
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
                className="w-full min-h-[44px] rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Save New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-1">
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-slate-500 hover:text-[var(--brand-primary)] transition"
              >
                Link expired or broken? <span className="font-bold underline">Request a new one</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-3.5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Password Successfully Reset!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                Your account password has been updated. You can now log into your clinical dashboard using your new credentials.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="w-full min-h-[44px] rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
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
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Desktop Informative Hero Panel (Left 5 Columns, Fixed / Sticky, Guaranteed No Scroll) */}
      <div className="lg:col-span-5 xl:col-span-5 hidden lg:flex flex-col sticky top-0 h-screen max-h-screen overflow-hidden">
        <AuthBrandingPanel
          badge="Credentials Security"
          title="Update Account Credentials Securely"
          highlightText="Zero Compromise."
          description="Configure a resilient password for your clinical user account to protect sensitive patient records."
          features={[
            {
              icon: <Lock className="w-4 h-4 text-teal-400" />,
              title: "Modern Cryptographic Hashing Protection",
            },
            {
              icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
              title: "Automatic Legacy Session Invalidation",
            },
            {
              icon: <Sparkles className="w-4 h-4 text-sky-400" />,
              title: "Instant Multi-Chamber Credential Sync",
            },
          ]}
        />
      </div>

      {/* Reset Form Panel (Right 7 Columns) */}
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
            <KeyRound className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>Cryptographic Credential Reset</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeCustomizer compact direction="down" align="right" />
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-slate-500 hover:text-[var(--brand-primary)] transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="py-6 my-auto w-full">
          <Suspense
            fallback={
              <div className="p-6 max-w-md mx-auto rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs text-slate-500 text-center">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[var(--brand-primary)]" />
                Loading reset interface...
              </div>
            }
          >
            <ResetPasswordInner />
          </Suspense>
        </div>

        {/* Bottom Footer */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Protected by HIPAA & BMDC compliant security standards.</span>
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:text-[var(--brand-primary)] transition font-medium">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-[var(--brand-primary)] transition font-medium">
              Security Overview
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
