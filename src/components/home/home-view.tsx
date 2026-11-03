"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Layers,
  PhoneCall,
  Pill,
  Printer,
  Sparkles,
  Stethoscope,
  Tv,
  Users,
} from "lucide-react";
import { DoctorList } from "@/components/home/doctor-list";
import { PricingSection, PricingPlanProps } from "@/components/home/pricing-section";
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
  const isLoggedIn = !!user;

  return (
    <main className="flex-1 w-full overflow-hidden">
      {/* ========================================================= */}
      {/* HERO SECTION - CLEAN CLINICAL ARCHITECTURE                */}
      {/* ========================================================= */}
      <section className="relative w-full overflow-hidden border-b border-[var(--border-subtle)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(15,118,110,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(20,184,166,0.15),transparent)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-14 sm:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Clinical Value Proposition */}
            <div className="lg:col-span-12 space-y-6 text-center">
              {/* Micro-badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold tracking-wide uppercase shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                <span>{t.heroBadge}</span>
                <span className="text-slate-400 dark:text-slate-500 font-normal">•</span>
                <span>{t.heroBmdcBadge}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12] text-center">
                {t.heroTitlePart1}{" "}
                <br />
                <span className="bg-gradient-to-r from-[var(--brand-primary)] via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                  {t.heroTitlePart2}
                </span>{" "}
                {t.heroTitlePart3}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal text-center">
                {t.heroSubtitle}
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {isLoggedIn && user ? (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>🚀 {t.enterClinicalSuite}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>🚀 {t.accessClinicalDashboard}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                <a
                  href="#doctors"
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-[var(--border-strong)]/40 bg-[var(--bg-surface)] text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-text)] transition-all shadow-2xs"
                >
                  <Calendar className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>{t.bookSpecialist}</span>
                </a>

                <Link
                  href="/live-queue"
                  className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-xs sm:text-sm font-bold text-[var(--brand-text)] hover:border-[var(--brand-primary)] transition"
                >
                  <Tv className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>{t.liveChamberMonitor}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Trust & Spec Chips */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[var(--border-subtle)] text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium">
                    {t("uiIntranetReady")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium">
                    {t("uiMultiPageA4Print")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium">
                    {t("uiClickPresets")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium">
                    {t("uiDynamicThemes")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* STATS & PERFORMANCE TICKER (LIVE SYSTEM METRICS)          */}
      {/* ========================================================= */}
      <section className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-8">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[var(--brand-text)] tracking-tight font-mono">
                {totalDoctors}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.statTotalDoctors}
              </div>
              <p className="text-[11px] text-slate-400">
                {t("uiActiveSpecialistChambers")}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {totalPrescriptions}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.statTotalPrescriptions}
              </div>
              <p className="text-[11px] text-slate-400">
                {t("uiDigitalClinicalRecords")}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[var(--brand-text)] tracking-tight font-mono">
                {totalClinics}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.statTotalClinics}
              </div>
              <p className="text-[11px] text-slate-400">
                {t("uiActiveClinicsChambers")}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {totalMedicines}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.statTotalMedicines}
              </div>
              <p className="text-[11px] text-slate-400">
                {t("uiStandardClinicalDrugs")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FEATURES SHOWCASE SECTION                                 */}
      {/* ========================================================= */}
      <section id="features" className="w-full py-16 sm:py-24 bg-[var(--bg-app)] scroll-mt-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider border border-[var(--brand-border)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.whyChooseTitle}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("uiEverythingYourClinicNeedsZero")}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {t.whyChooseSubtitle}
            </p>
          </div>

          {/* 6 Core Feature Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group space-y-4 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
                <Pill className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-grow-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.feature1Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.feature1Desc}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-[var(--brand-text)]">
                <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)]">
                  {t("uiDosageChips")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)]">
                  {t("uiAutoFillDirections")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)]">
                  {t("uiFormularySearch")}
                </span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group space-y-4 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-grow-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.feature3Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.feature3Desc}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                <span className="px-2 py-0.5 rounded-md bg-sky-500/10">
                  {t("uiWysiwygDesigner")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/10">
                  {t("uiWatermark")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/10">
                  {t("uiPaginatedPrint")}
                </span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group space-y-4 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-grow-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.feature2Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.feature2Desc}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10">
                  {t("uiLiveTokenTicker")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10">
                  {t("uiNextInLobby")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10">
                  {t("uiZeroCrowding")}
                </span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group space-y-4 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-grow-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("uiFrontDeskReceptionistTriage")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t("uiDedicatedFrontDeskPortalFor")}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10">
                  {t("uiWalkInIntake")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10">
                  {t("uiPreChamberVitals")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10">
                  {t("uiTokenPrinting")}
                </span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group space-y-4 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-grow-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("rolePatientElectronicPrescriptionsAndMedicationReminders")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t("rolePatientsSecurelyAccessDigitalPrescriptionsReviewRevisionHistoriesAndConfigureAutomatedMedicineDosageSchedule")}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10">
                  {t("uiVersionHistory")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10">
                  {t("uiDosageReminders")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10">
                  {t("uiInstantPrint")}
                </span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group space-y-4 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-grow-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.feature4Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.feature4Desc}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10">
                  {t("uiSubdomains")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10">
                  {t("uiStripeBilling")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10">
                  {t("uiRbacAccess")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* HOW TO USE / CLINICAL WORKFLOW SECTION                    */}
      {/* ========================================================= */}
      <section id="how-it-works" className="w-full py-16 sm:py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] scroll-mt-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider border border-[var(--brand-border)]">
              <Layers className="w-3.5 h-3.5" />
              <span>{t("uiEndToEndChamberErgonomics")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("uiHowItWorksStreamlinedStep")}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {t("uiDesignedToMinimizeWaitingRoom")}
            </p>
          </div>

          {/* 4 Step Workflow Sequence */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3 relative group hover:border-[var(--brand-border)] transition-all">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white font-black text-sm flex items-center justify-center shadow-xs">
                  01
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("uiFrontDeskOnline")}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                {t("rolePatientIntakeAndSerialAllocation")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("rolePatientsBookOnlineOrCheckInWithFrontDeskReceptionistsASerialTicketIsAutomaticallyGenerated")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3 relative group hover:border-[var(--brand-border)] transition-all">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white font-black text-sm flex items-center justify-center shadow-xs">
                  02
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("uiPreChamberTriage")}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                {t("uiVitalsRecordingTriage")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("uiStaffRecordBloodPressurePulse")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3 relative group hover:border-[var(--brand-border)] transition-all">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white font-black text-sm flex items-center justify-center shadow-xs">
                  03
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("roleDoctorPrescribing")}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                {t("uiRapidClickPrescribing")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("roleDoctorChoosesChiefComplaintsAndDiagnosisPresetsWithClickMedicinesAutoPopulateDoseFrequenciesAndInstructions")}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3 relative group hover:border-[var(--brand-border)] transition-all">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white font-black text-sm flex items-center justify-center shadow-xs">
                  04
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("uiPrintArchive")}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                {t("uiMultiPageA4LaserPrinting")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("uiOneClickOutputsAPaginated")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CONSULTING PHYSICIANS & SPECIALISTS (LARGE LIST WITH SEE ALL) */}
      {/* ========================================================= */}
      <section id="doctors" className="w-full py-16 sm:py-24 bg-[var(--bg-app)] scroll-mt-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider border border-[var(--brand-border)]">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{t("uiClinicalDirectoryVisitingSchedules")}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {t.doctors}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                {t("uiSelectADoctorToView")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <Link
                href="/doctors"
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] hover:bg-[var(--brand-primary)] hover:text-white transition font-bold text-xs border border-[var(--brand-border)]/60"
              >
                <span>{t("uiFullDirectoryPage")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>{t("uiQueueActive")}</span>
              </span>
            </div>
          </div>

          {/* Doctor List Component with Search, Specialty Filter, and See All Toggle */}
          <DoctorList initialLimit={6} />
        </div>
      </section>

      {/* ========================================================= */}
      {/* SAAS PRODUCT PRICING TIERS SECTION                        */}
      {/* ========================================================= */}
      <PricingSection initialPlans={pricingPlans} />

      {/* ========================================================= */}
      {/* EMERGENCY & HOSPITAL HOTLINE BANNER                       */}
      {/* ========================================================= */}
      <section className="w-full border-y border-[var(--border-subtle)] bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white py-12 sm:py-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/30">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t("uiClinicalEmergencyAmbulance")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                {t("uiNeedImmediateMedicalAssistanceOr")}
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/80 max-w-xl">
                {t("uiOurEmergencyTriageAndIntensive")}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`tel:${settings.emergencyHotline}`}
                className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm sm:text-base shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <PhoneCall className="w-5 h-5 text-teal-600" />
                <span>
                  {t.emergencyHotline}: <strong>{settings.emergencyHotline}</strong>
                </span>
              </a>
              <Link
                href="/doctors"
                className="px-6 py-4 rounded-2xl border border-teal-400/30 hover:border-teal-400 text-teal-100 hover:text-white font-bold text-xs sm:text-sm transition"
              >
                {t("uiViewOPDChamberHours")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
