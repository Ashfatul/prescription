import Link from "next/link";
import { Header } from "@/components/layout/header";
import { DoctorList } from "@/components/home/doctor-list";

export default function Home() {
  return (
    <div className="min-h-screen app-gradient">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <section className="mb-8 rounded-3xl border border-teal-200/60 bg-white/90 p-6 shadow-sm dark:border-teal-900/60 dark:bg-zinc-900/80">
          <p className="text-xs uppercase tracking-[0.25em] text-teal-700 dark:text-teal-300">
            PPMS
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Patient Prescription Management System
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
            Multi-role appointment and prescription platform with live serial updates, secure file upload,
            and printable prescription layout.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white" href="/auth/login">
              Login to Dashboard
            </Link>
            <a
              href="/api/public/doctors"
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
              target="_blank"
              rel="noreferrer"
            >
              View Public Doctors API
            </a>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Available Doctors</h2>
          <DoctorList />
        </section>
      </main>
    </div>
  );
}
