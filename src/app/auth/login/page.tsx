"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ppms.local");
  const [password, setPassword] = useState("Pass1234!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.success) {
      setError(data.message || "Login failed");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-4 dark:from-zinc-900 dark:via-zinc-950 dark:to-teal-950/30">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold">PPMS Login</h1>
        <p className="mt-2 text-sm text-zinc-500">Use seed account credentials to start quickly.</p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
