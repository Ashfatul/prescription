import Link from "next/link";
import { Header } from "@/components/layout/header";
import { DoctorList } from "@/components/home/doctor-list";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-10">
        {/* Modern Spacious Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-[var(--bg-surface)] p-8 sm:p-12 shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
              Smart Clinical Ecosystem
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Patient Prescription & Chamber Management System
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Engineered for busy clinics and hospitals. High-efficiency prescription generation, automated pharmaceutical catalog auto-fill, real-time live appointment queues, and multi-page professional print templates.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all"
                href="/auth/login"
              >
                <span>🚀 Access Clinical Dashboard</span>
              </Link>
              <a
                href="/api/public/doctors"
                className="px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-xs"
                target="_blank"
                rel="noreferrer"
              >
                Inspect Public API (JSON)
              </a>
            </div>
          </div>
        </section>

        {/* Available Doctors Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Consulting Physicians & Specialists
              </h2>
              <p className="text-xs text-slate-500">
                Live doctor directory, chamber visiting schedules, and live serial queue numbers.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start sm:self-auto">
              Real-time Active Queue
            </span>
          </div>

          <DoctorList />
        </section>
      </main>
    </div>
  );
}
