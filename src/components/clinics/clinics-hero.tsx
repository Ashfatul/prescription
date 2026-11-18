"use client";

import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  Clock,
  PhoneCall,
  Activity,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface ClinicsHeroProps {
  clinicsCount: number;
  totalDoctors: number;
  emergencyHotline?: string;
}

export function ClinicsHero({
  clinicsCount,
  totalDoctors,
  emergencyHotline,
}: ClinicsHeroProps) {
  const { t, language } = useLanguage();

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
          <span className="font-semibold text-[var(--text-primary)]">
            {t.clinicsAndChambers}
          </span>
        </div>

        {/* Title & Compact Status Card */}
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 space-y-2.5">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-text)]">
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.accreditedHealthcareNetwork}</span>
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-[-0.03em] leading-tight">
              {t.registeredClinicsPolyclinics}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[60ch]">
              {t.clinicsDirectorySubtitle}
            </p>
          </div>

          {/* Right Metrics Cluster */}
          <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-2.5 text-xs">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {clinicsCount}{" "}
                {language === "bn"
                  ? "টি অনুমোদিত ক্লিনিক"
                  : clinicsCount === 1
                    ? "Verified Clinic"
                    : "Verified Clinics"}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              <Stethoscope className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>
                {t.practicingSpecialists}:{" "}
                <strong className="font-mono font-bold text-[var(--text-primary)]">
                  {totalDoctors}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Regulatory Assurance Strip */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t.bmdcRegulatedHipaa}</span>
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
                {t.centralMedicalHotline}: {emergencyHotline}
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
