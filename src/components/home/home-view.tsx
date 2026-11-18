"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  PhoneCall,
  Pill,
  Printer,
  Stethoscope,
  Tv,
  ShieldCheck,
  Building2,
  FileText,
  Clock,
  Globe,
} from "lucide-react";
import { DoctorList } from "@/components/home/doctor-list";
import {
  PricingSection,
  PricingPlanProps,
} from "@/components/home/pricing-section";
import { ClinicalStudioPreview } from "@/components/home/clinical-studio-preview";
import { HospitalSettings } from "@/features/settings/settings.service";
import { useLanguage } from "@/lib/i18n/language-context";

interface HomeViewProps {
  user: { id: string; name: string; email: string; role: string } | null;
  settings: HospitalSettings;
  pricingPlans: PricingPlanProps[];
  totalDoctors: number;
  totalPrescriptions: number;
  totalClinics: number;
  totalMedicines: number;
}

export function HomeView({
  user,
  settings,
  pricingPlans,
  totalDoctors,
  totalPrescriptions,
  totalClinics,
  totalMedicines,
}: HomeViewProps) {
  const { t, language } = useLanguage();
  const isBn = language === "bn";
  const isLoggedIn = !!user;

  const telemetryItems = [
    {
      value: totalDoctors,
      label: t.statTotalDoctors,
      desc: t("uiActiveSpecialistChambers"),
      icon: Stethoscope,
      accent: true,
    },
    {
      value: totalPrescriptions,
      label: t.statTotalPrescriptions,
      desc: t("uiDigitalClinicalRecords"),
      icon: FileText,
      accent: false,
    },
    {
      value: totalClinics,
      label: t.statTotalClinics,
      desc: t("uiActiveClinicsChambers"),
      icon: Building2,
      accent: true,
    },
    {
      value: totalMedicines,
      label: t.statTotalMedicines,
      desc: t("uiStandardClinicalDrugs"),
      icon: Pill,
      accent: false,
    },
  ];

  const workflowSteps = [
    {
      num: "01",
      tag: t("uiFrontDeskOnline"),
      title: t("uiPatientIntakeSerialAllocation"),
      desc: t("uiPatientsBookOnlineOrCheck"),
    },
    {
      num: "02",
      tag: t("uiPreChamberTriage"),
      title: t("uiVitalsRecordingTriage"),
      desc: t("uiStaffRecordBloodPressurePulse"),
    },
    {
      num: "03",
      tag: t("uiDoctorPrescribing"),
      title: t("uiRapidClickPrescribing"),
      desc: t("uiDoctorChoosesChiefComplaintsAnd"),
    },
    {
      num: "04",
      tag: t("uiPrintArchive"),
      title: t("uiMultiPageA4LaserPrinting"),
      desc: t("uiOneClickOutputsAPaginated"),
    },
  ];

  return (
    <main className="flex-1 w-full overflow-x-clip">
      {/* ========================================================= */}
      {/* HERO SECTION: ARCHITECTURAL 5 / 7 SPLIT COMMAND BENCH     */}
      {/* ========================================================= */}
      <section className="relative w-full overflow-hidden bg-[var(--bg-app)]">
        {/* Subtle Architectural Grid & Brand Atmospheric Glow */}
        <div className="pointer-events-none absolute inset-0 clinical-grid-bg [mask-image:radial-gradient(ellipse_80%_75%_at_50%_20%,#000_40%,transparent_100%)]" />
        <div className="pointer-events-none absolute inset-0 hero-brand-glow" />

        <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-20">
          <div className="grid lg:grid-cols-12 gap-10 xl:gap-12 items-center">
            {/* Left Rail: Crisp Clinical Editorial Copy (5 cols) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {/* Minimal Live Indicator */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>{t.landingHeroPill}</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-5xl xl:text-[3.4rem] font-black tracking-[-0.035em] text-[var(--text-primary)] leading-[1.06]">
                {t.heroTitlePart1}{" "}
                <span className="text-[var(--brand-text)]">
                  {t.heroTitlePart2}
                </span>{" "}
                {t.heroTitlePart3}
              </h1>

              {/* Concise Clinical Subtitle */}
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-[50ch]">
                {t.heroSubtitle}
              </p>

              {/* Primary Action Cluster */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {isLoggedIn && user ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-semibold shadow-sm hover:opacity-95 transition-opacity"
                  >
                    <span>{t.enterClinicalSuite}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-semibold shadow-sm hover:opacity-95 transition-opacity"
                  >
                    <span>{t.accessClinicalDashboard}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                <Link
                  href="/live-queue"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-text)] transition-colors"
                >
                  <Tv className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>{t.liveChamberMonitor}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </Link>

                <a
                  href="#doctors"
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t.bookSpecialist}</span>
                </a>
              </div>

              {/* 2x2 Precision Capability Spec Grid */}
              <div className="pt-5 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium">{t.landingPrescribeSpeed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium">{t.landingA4PrintReady}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium">{t.landingOfflineReady}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium">{t.landingZeroDowntime}</span>
                </div>
              </div>
            </div>

            {/* Right Stage: Interactive Split-Pane Clinical Studio Workbench (7 cols) */}
            <div className="lg:col-span-7 w-full">
              <ClinicalStudioPreview />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTEGRATED ARCHITECTURAL TELEMETRY LEDGER RAIL            */}
        {/* ========================================================= */}
        <div className="relative w-full border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
              {telemetryItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="py-5 px-3 sm:px-6 first:pl-0 last:pr-0 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--brand-text)] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                            item.accent
                              ? "text-[var(--brand-text)]"
                              : "text-[var(--text-primary)]"
                          }`}
                        >
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CAPABILITIES BENTO MATRIX: 2-ZONE WIDESCREEN ARCHITECTURE */}
      {/* ========================================================= */}
      <section
        id="features"
        className="w-full py-16 sm:py-24 bg-[var(--bg-app)] scroll-mt-20"
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Split Widescreen Section Header */}
          <div className="grid lg:grid-cols-12 gap-4 lg:gap-8 items-end border-b border-[var(--border-subtle)] pb-8">
            <div className="lg:col-span-7 space-y-2">
              <p className="text-xs font-semibold text-[var(--brand-text)]">
                {t.landingPillarsTitle}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-[-0.03em] text-[var(--text-primary)] leading-tight max-w-[26ch]">
                {t("uiEverythingYourClinicNeedsZero")}
              </h2>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed lg:ml-auto max-w-[48ch]">
                {t.landingPillarsSubtitle}
              </p>
            </div>
          </div>

          {/* 4-Card Asymmetric Bento Matrix (No Hollow Stretched Slabs) */}
          <div className="grid gap-5 lg:grid-cols-12">
            {/* Pillar 1: Fast Prescription Pad (7 cols -> 2-Zone Horizontal Split on xl+) */}
            <div className="lg:col-span-7 p-6 sm:p-7 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-subtle)] grid xl:grid-cols-12 gap-6 items-stretch">
              <div className="xl:col-span-6 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--brand-surface)] text-[var(--brand-text)]">
                      {t.subMinuteRxBadge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                    {t.feature1Title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {t.feature1Desc}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-[var(--brand-text)]">
                  <span className="px-2.5 py-1 rounded-md bg-[var(--brand-surface)]">
                    {t("uiDosageChips")}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[var(--brand-surface)]">
                    {t("uiAutoFillDirections")}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[var(--brand-surface)]">
                    {t("uiFormularySearch")}
                  </span>
                </div>
              </div>

              {/* Right Visual Artifact: Formulary Auto-Fill Preview */}
              <div className="xl:col-span-6 p-4 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2.5 border-b border-[var(--border-subtle)]">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{t("uiFormularySearch")}</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[var(--brand-text)]">
                      Maxpro 20mg
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">
                        Cap. Maxpro 20mg
                      </span>
                      <span className="text-[11px] font-mono text-[var(--brand-text)] font-bold">
                        {isBn ? "১+০+১" : "1+0+1"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                        {isBn ? "ক্যাপসুল" : "Capsule"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)]">
                        {isBn ? "খাবারের ৩০ মিনিট পূর্বে" : "30m before meal"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                        {isBn ? "১৪ দিন" : "14 Days"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-[var(--text-muted)] block">
                    {t.quickDoseFrequencies}
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px] font-semibold">
                    {["1+0+1", "1+1+1", "0+0+1", "1+0+0"].map((freq, idx) => (
                      <span
                        key={freq}
                        className={`py-1.5 text-center rounded-md border ${
                          idx === 0
                            ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                            : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
                        }`}
                      >
                        {freq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2: Waiting Room TV & Live Queue (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-7 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-subtle)] flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Tv className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {t.liveTokenDisplayBadge}
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  {t.feature2Title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t.feature2Desc}
                </p>
              </div>

              {/* Queue Display Micro-Screen */}
              <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{t.nowCallingLabel}</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {t.room302Label}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black font-mono text-[var(--brand-primary)]">
                    #14
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">
                    {t("uiDrFahimRahman")}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10">
                  {t("uiLiveTokenTicker")}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10">
                  {t("uiNextInLobby")}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10">
                  {t("uiZeroCrowding")}
                </span>
              </div>
            </div>

            {/* Pillar 3: Multi-Page A4 Laser Print Engine (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-7 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-subtle)] flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                    <Printer className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    {t.bmdcA4StandardBadge}
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  {t.feature3Title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t.feature3Desc}
                </p>
              </div>

              {/* Miniature A4 Paginated Print Preview */}
              <div className="p-4 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                    <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>{t.clinicLetterheadEngineTitle}</span>
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] shrink-0">
                    {t.pageOneOfTwo}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {t.clinicLetterheadEngineDesc}
                </p>
                <div className="pt-2 border-t border-dashed border-[var(--border-default)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span className="font-mono">A4 · 210 × 297mm</span>
                  <span className="font-semibold text-[var(--text-secondary)]">
                    {t.verifiedSignatureLabel}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                <span className="px-2.5 py-1 rounded-md bg-sky-500/10">
                  {t("uiWysiwygDesigner")}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-sky-500/10">
                  {t("uiWatermark")}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-sky-500/10">
                  {t("uiPaginatedPrint")}
                </span>
              </div>
            </div>

            {/* Pillar 4: Multi-Tenant Clinic Architecture (7 cols -> 2-Zone Horizontal Split on xl+) */}
            <div className="lg:col-span-7 p-6 sm:p-7 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-subtle)] grid xl:grid-cols-12 gap-6 items-stretch">
              <div className="xl:col-span-6 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      {t.multiTenantSaasBadge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                    {t.feature4Title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {t.feature4Desc}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  <span className="px-2.5 py-1 rounded-md bg-rose-500/10">
                    {t("uiSubdomains")}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-rose-500/10">
                    {t("uiStripeBilling")}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-rose-500/10">
                    {t("uiRbacAccess")}
                  </span>
                </div>
              </div>

              {/* Right Visual Artifact: Isolated Multi-Tenant Directory Panel */}
              <div className="xl:col-span-6 p-4 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--border-subtle)]">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                    <Globe className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>{t.autonomousClinicPortalsTitle}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                    {t.isolatedSchemaBadge}
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      host: "carewell.ppms.io",
                      roles: "Admin · Doctor · Staff",
                    },
                    {
                      host: "metro-heart.ppms.io",
                      roles: "Admin · Doctor · Reception",
                    },
                  ].map((tenant) => (
                    <div
                      key={tenant.host}
                      className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-semibold text-[var(--text-primary)] block truncate">
                          https://{tenant.host}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] block truncate">
                          {tenant.roles}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{t.activeTenantStatus}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* HOW IT WORKS: 4-COL STICKY INTRO + 8-COL 2x2 PIPELINE     */}
      {/* ========================================================= */}
      <section
        id="how-it-works"
        className="w-full py-16 sm:py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] scroll-mt-20"
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 xl:gap-14 items-start">
            {/* Sticky Left Editorial Column (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <p className="text-xs font-semibold text-[var(--brand-text)]">
                {t("uiEndToEndChamberErgonomics")}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-[-0.03em] text-[var(--text-primary)] leading-tight">
                {t("uiHowItWorksStreamlinedStep")}
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-[44ch]">
                {t("uiDesignedToMinimizeWaitingRoom")}
              </p>
              <div className="pt-2 flex flex-wrap gap-2.5">
                <Link
                  href="/live-queue"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] hover:bg-[var(--brand-primary)] hover:text-white text-xs font-semibold transition-colors"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>{t.openLiveQueueAction}</span>
                </Link>
                <Link
                  href="/clinics"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] text-xs font-semibold transition-colors"
                >
                  <span>{t.exploreClinicsAction}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right 2x2 Connected Pipeline Grid (8 cols) */}
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
              {workflowSteps.map((step) => (
                <div
                  key={step.num}
                  className="p-6 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-9 h-9 rounded-lg bg-[var(--brand-primary)] text-white font-mono font-bold text-sm flex items-center justify-center">
                      {step.num}
                    </span>
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      {step.tag}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CONSULTING PHYSICIANS & SPECIALISTS DIRECTORY             */}
      {/* ========================================================= */}
      <section
        id="doctors"
        className="w-full py-16 sm:py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] scroll-mt-20"
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Split Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-[var(--brand-text)]">
                {t("uiClinicalDirectoryVisitingSchedules")}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-[-0.03em] text-[var(--text-primary)]">
                {t.doctors}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] max-w-[56ch]">
                {t("uiSelectADoctorToView")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>{t("uiQueueActive")}</span>
              </span>
              <Link
                href="/doctors"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-text)] transition-colors font-semibold text-xs border border-[var(--border-default)]"
              >
                <span>{t("uiFullDirectoryPage")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Live Dynamic Doctor Directory */}
          <DoctorList initialLimit={6} />
        </div>
      </section>

      {/* ========================================================= */}
      {/* SAAS PRODUCT PRICING TIERS SECTION                        */}
      {/* ========================================================= */}
      <PricingSection initialPlans={pricingPlans} />

      {/* ========================================================= */}
      {/* EMERGENCY DISPATCH & HOSPITAL HOTLINE BAND                */}
      {/* ========================================================= */}
      <section className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-app)] py-14 sm:py-20">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-xl bg-slate-950 text-white border border-slate-800 p-7 sm:p-10 lg:p-12">
            {/* Accent radial highlight derived from active brand palette */}
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse 65% 80% at 85% 50%, var(--brand-primary), transparent 70%)",
              }}
            />

            <div className="relative grid lg:grid-cols-12 gap-8 items-center">
              {/* Left Copy (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-white/90 text-xs font-semibold border border-white/15">
                  <PhoneCall className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>{t("uiClinicalEmergencyAmbulance")}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-[-0.03em] text-white max-w-[26ch]">
                  {t("uiNeedImmediateMedicalAssistanceOr")}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-[56ch]">
                  {t("uiOurEmergencyTriageAndIntensive")}
                </p>
              </div>

              {/* Right Structured Dispatch Card (5 cols) */}
              <div className="lg:col-span-5">
                <div className="p-5 sm:p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-300 pb-3 border-b border-white/10">
                    <span className="font-semibold text-white">
                      {t.directDispatchLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                      <span>{settings.opdVisitingHours}</span>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <a
                      href={`tel:${settings.emergencyHotline}`}
                      className="flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-lg bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                      <span>
                        {t.emergencyHotline}:{" "}
                        <strong className="font-mono">
                          {settings.emergencyHotline}
                        </strong>
                      </span>
                    </a>
                    <Link
                      href="/doctors"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-lg border border-white/20 hover:border-white/40 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                    >
                      <span>{t("uiViewOPDChamberHours")}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
