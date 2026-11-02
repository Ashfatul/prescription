import { Metadata } from "next";
import Link from "next/link";
import { 
  Stethoscope, 
  ArrowLeft, 
  Clock, 
  PhoneCall, 
  Activity, 
  CalendarDays, 
  ShieldCheck 
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DoctorList } from "@/components/home/doctor-list";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";
import { DemoCountdownTimer } from "@/components/common/demo-countdown-timer";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Consulting Physicians & Specialists Directory | PPMS",
  description: "Browse registered hospital physicians, specialist chambers, visiting hours, and real-time live serial queues.",
};

export const dynamic = "force-dynamic";

interface DoctorsPageProps {
  searchParams?: Promise<{
    clinic?: string;
    search?: string;
  }>;
}

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const [user, settings, sParams] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
    searchParams ? await searchParams : Promise.resolve({} as { clinic?: string; search?: string }),
  ]);

  const clinicSlug = sParams?.clinic;
  const clinic = clinicSlug
    ? await db.organization.findUnique({
        where: { slug: clinicSlug },
        select: { name: true, slug: true, address: true },
      })
    : null;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Header loggedIn={!!user} />

      <main className="flex-1 w-full">
        {/* Top Directory Hero Banner */}
        <section className="w-full border-b border-[var(--border-subtle)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(15,118,110,0.10),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(20,184,166,0.12),transparent)]">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-[var(--brand-text)] flex items-center gap-1 transition">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <span>/</span>
              {clinic && (
                <>
                  <Link href={`/clinics/${clinic.slug}`} className="hover:text-[var(--brand-text)] transition truncate max-w-[150px]">
                    {clinic.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="font-semibold text-[var(--text-primary)]">Physicians & Chambers</span>
            </div>

            {/* Title & Live Status Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider border border-[var(--brand-border)]">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{clinic ? `${clinic.name} Specialists` : "Outpatient & Chamber Specialists"}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {clinic ? `${clinic.name} Doctors` : "Consulting Physicians & Specialists"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {clinic
                    ? `View visiting schedules, chamber room numbers, verified BMDC registration credentials, and live chamber serial queues for ${clinic.name}.`
                    : `View visiting schedules, chamber room numbers, verified BMDC registration credentials, and live in-chamber serial tokens for ${settings.hospitalName}.`}
                </p>

                {clinic && (
                  <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-[var(--brand-text)]">
                    <span>Showing verified practitioners practicing strictly at this facility.</span>
                    <Link href="/doctors" className="underline hover:opacity-80">
                      View all clinics
                    </Link>
                  </div>
                )}
              </div>

              {/* Dynamic Chamber Hours Badges */}
              <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>{settings.emergencyStatus}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>Visiting Hours: <strong className="text-[var(--text-primary)]">{settings.opdVisitingHours}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <CalendarDays className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>Days: <strong className="text-[var(--text-primary)]">{settings.chamberDays}</strong></span>
                </div>
              </div>
            </div>

            {/* Regulatory Assurance Strip */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>BMDC Verified Physicians</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Real-Time Serial Number Tracking</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-[var(--brand-text)]">
                <PhoneCall className="w-4 h-4" />
                <span>Emergency Hotline: {settings.emergencyHotline}</span>
              </span>
            </div>
          </div>
        </section>

        {/* Directory Content Area */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <DoctorList initialLimit={9} clinicSlug={clinicSlug} />
        </section>
      </main>

      <DemoCountdownTimer variant="floating" />
      <Footer initialSettings={settings} />
    </div>
  );
}
