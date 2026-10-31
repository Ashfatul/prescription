"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setError("");
    setEmail(loginEmail);
    setPassword(loginPassword);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.message || "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void performLogin(email, password);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-4 py-8 dark:from-zinc-900 dark:via-zinc-950 dark:to-teal-950/30">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">PPMS Login</h1>
          <Link
            href="/"
            className="text-xs text-zinc-500 transition hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
          >
            ← Back to Home
          </Link>
        </div>

        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {isDemoMode
            ? "Sign in with your credentials or select a demo user below."
            : "Sign in with your PPMS credentials."}
        </p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              type="email"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-70"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {isDemoMode && (
          <div className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Quick Demo Login
              </span>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-medium text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                Demo Mode ON
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Click any profile for 1-click login:
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => performLogin(account.email, account.password)}
                  disabled={loading}
                  className="flex flex-col items-start rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-left transition hover:border-teal-500 hover:bg-teal-50/50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-teal-600 dark:hover:bg-zinc-800"
                >
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${account.badge}`}
                  >
                    <span>{account.icon}</span>
                    <span>{account.role}</span>
                  </span>
                  <span className="mt-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {account.name}
                  </span>
                  <span className="max-w-full truncate text-[11px] text-zinc-500 dark:text-zinc-400">
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
