"use client";

import Link from "next/link";
import {
  Stethoscope,
  ArrowLeft,
  Clock,
  PhoneCall,
  Activity,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface DoctorsHeroProps {
  clinic?: {
    name: string;
    slug: string;
  } | null;
  hospitalName?: string;
  emergencyStatus?: string;
  opdVisitingHours?: string;
  chamberDays?: string;
  emergencyHotline?: string;
}

export function DoctorsHero({
  clinic,
  hospitalName = "",
  emergencyStatus = "24/7 OPD Chambers Open",
  opdVisitingHours = "08:00 AM - 10:00 PM",
  chamberDays = "Saturday - Thursday",
  emergencyHotline,
}: DoctorsHeroProps) {
  const { t, language } = useLanguage();
  const displayHospital = hospitalName || "PPMS";

  return (
    <section className="relative w-full overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="pointer-events-none absolute inset-0 clinical-grid-bg [mask-image:radial-gradient(ellipse_75%_80%_at_50%_0%,#000_35%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 hero-brand-glow" />

      <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Link
            href="/"
            className="hover:text-[var(--brand-text)] inline-flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.home}</span>
          </Link>
          <span>/</span>
          {clinic && (
            <>
              <Link
                href={`/clinics/${clinic.slug}`}
                className="hover:text-[var(--brand-text)] transition-colors truncate max-w-[180px]"
              >
                {clinic.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="font-semibold text-[var(--text-primary)]">
            {t.physiciansAndChambers}
          </span>
        </div>

        {/* Split Title & Schedule Summary */}
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 space-y-2.5">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-text)]">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>
                {clinic
                  ? `${clinic.name} ${t("uiSpecialists")}`
                  : t.outpatientChamberSpecialists}
              </span>
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-[-0.03em] leading-tight">
              {clinic
                ? `${clinic.name} ${t.doctors}`
                : t.consultingPhysiciansSpecialists}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[60ch]">
              {clinic
                ? language === "bn"
                  ? `${clinic.name}-এর চেম্বারের সময়সূচি, রুম নম্বর, যাচাইকৃত বিএমডিসি সনদ ও লাইভ সিরিয়াল কিউ দেখুন।`
                  : `View visiting schedules, chamber room numbers, verified BMDC registration credentials, and live chamber serial queues for ${clinic.name}.`
                : language === "bn"
                  ? `${displayHospital}-এর চেম্বারের সময়সূচি, রুম নম্বর, যাচাইকৃত বিএমডিসি সনদ ও লাইভ সিরিয়াল কিউ দেখুন।`
                  : `View visiting schedules, chamber room numbers, verified BMDC registration credentials, and live in-chamber serial tokens for ${displayHospital}.`}
            </p>

            {clinic && (
              <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-[var(--brand-text)]">
                <span>
                  {t("uiShowingVerifiedPractitionersPracticingStrictly")}
                </span>
                <Link href="/doctors" className="underline hover:opacity-80">
                  {t("uiViewAllClinics")}
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-wrap lg:flex-col items-start lg:items-end gap-2 text-xs">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>{emergencyStatus}</span>
            </div>
            <div className="flex flex-wrap lg:justify-end gap-x-4 gap-y-1 text-[11px] text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>
                  {t("uiVisitingHours2")}{" "}
                  <strong className="text-[var(--text-primary)]">
                    {opdVisitingHours}
                  </strong>
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>
                  {t("uiDays2")}{" "}
                  <strong className="text-[var(--text-primary)]">
                    {chamberDays}
                  </strong>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Regulatory Assurance Strip */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t.bmdcVerifiedPhysicians}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>{t.liveQueueCallingScreens}</span>
          </span>
          {emergencyHotline && (
            <a
              href={`tel:${emergencyHotline}`}
              className="inline-flex items-center gap-1.5 font-semibold text-[var(--brand-text)] hover:underline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>
                {t.emergencyHotline}: {emergencyHotline}
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
