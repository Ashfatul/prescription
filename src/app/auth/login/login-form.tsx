"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

const DEMO_ACCOUNTS = [
  {
    role: "Super Admin",
    name: "Super Admin",
    email: "admin@ppms.local",
    password: "Pass1234!",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    icon: "👑",
  },
  {
    role: "Doctor",
    name: "Dr. Fahim Rahman",
    email: "doctor@ppms.local",
    password: "Pass1234!",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    icon: "🩺",
  },
  {
    role: "Patient",
    name: "Nusrat Jahan",
    email: "patient@ppms.local",
    password: "Pass1234!",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: "🧑",
  },
  {
    role: "Staff",
    name: "Front Desk Staff",
    email: "staff@ppms.local",
    password: "Pass1234!",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    icon: "🏥",
  },
];

export function LoginForm({ isDemoMode = true }: { isDemoMode?: boolean }) {
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!res.success) {
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] px-4 py-8 text-[var(--text-primary)]">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm dark:border-slate-800/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-sm shadow-xs">
              Rx
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              PPMS Clinical Login
            </h1>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 transition hover:text-[var(--brand-primary)] dark:text-slate-400"
          >
            ← Home
          </Link>
        </div>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {isDemoMode
            ? "Sign in with your credentials or select a demo clinical profile below."
            : "Sign in with your verified PPMS credentials."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@ppms.local"
              type="email"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              {error}
            </p>
          )}

          <button
            className="w-full rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-60 cursor-pointer"
            type="submit"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign in to Dashboard"}
          </button>
        </form>

        {isDemoMode && (
          <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                Quick Demo Login
              </span>
              <span className="rounded-full bg-[var(--brand-surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--brand-text)] border border-[var(--brand-border)]">
                Demo Mode ON
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Click any clinical profile for 1-click instant access:
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => performLogin(account.email, account.password)}
                  disabled={loading}
                  className="flex flex-col items-start rounded-2xl border border-slate-200/90 bg-[var(--bg-subtle)] p-3 text-left transition hover:border-[var(--brand-primary)] hover:shadow-xs disabled:opacity-60 dark:border-slate-800 cursor-pointer"
                >
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${account.badge}`}
                  >
                    <span>{account.icon}</span>
                    <span>{account.role}</span>
                  </span>
                  <span className="mt-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                    {account.name}
                  </span>
                  <span className="max-w-full truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
