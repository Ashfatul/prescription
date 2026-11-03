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
                    {language === "bn" ? "১০০% অফলাইন ও ইন্ট্রানেট উপযোগী" : "100% Intranet Ready"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium">
                    {language === "bn" ? "মাল্টি-পেজ A4 প্রিন্ট" : "Multi-Page A4 Print"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium">
                    {language === "bn" ? "১-ক্লিক ক্লিনিকাল প্রিসেট" : "1-Click Presets"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium">
                    {language === "bn" ? "৫টি আকর্ষণীয় থিম" : "5 Dynamic Themes"}
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
                {language === "bn" ? "সক্রিয় বিশেষজ্ঞ চেম্বার" : "Active specialist chambers"}
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
                {language === "bn" ? "ডিজিটাল স্বাস্থ্য রেকর্ড" : "Digital clinical records"}
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
                {language === "bn" ? "নিবন্ধিত হাসপাতাল ও ক্লিনিক" : "Active clinics & chambers"}
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
                {language === "bn" ? "ক্লিনিকাল ঔষধ তালিকা" : "Standard clinical drugs"}
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
              {language === "bn"
                ? "আপনার ক্লিনিকের সব প্রয়োজনীয় সুবিধা। শূন্য পুনরাবৃত্তি।"
                : "Everything Your Clinic Needs. Zero Redundant Interactions."}
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
                  {language === "bn" ? "ডোজ চিপস" : "Dosage Chips"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)]">
                  {language === "bn" ? "অটো-ফিল ডিরেকশন" : "Auto-fill Directions"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)]">
                  {language === "bn" ? "ঔষধ ক্যাটালগ" : "Formulary Search"}
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
                  {language === "bn" ? "টেমপ্লেট ডিজাইনার" : "WYSIWYG Designer"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/10">
                  {language === "bn" ? "ওয়াটারমার্ক সিল" : "Watermark"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/10">
                  {language === "bn" ? "A4 পেজিনেশন" : "Paginated Print"}
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
                  {language === "bn" ? "লাইভ সিরিয়াল" : "Live Token Ticker"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10">
                  {language === "bn" ? "লবি মনিটর" : "Next in Lobby"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10">
                  {language === "bn" ? "ভিড়মুক্ত চেম্বার" : "Zero Crowding"}
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
                  {language === "bn" ? "ফ্রন্ট ডেস্ক ও ট্রায়াজ ম্যানেজমেন্ট" : "Front Desk & Receptionist Triage"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {language === "bn"
                    ? "সরাসরি উপস্থিত রোগীদের দ্রুত নিবন্ধন, রক্তচাপ ও তাপমাত্রা রেকর্ড এবং তাৎক্ষণিক সিরিয়াল টিকিট প্রিন্টিং সুবিধা।"
                    : "Dedicated front desk portal for rapid walk-in registration, pre-consultation vitals recording, and instant ticket print."}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10">
                  {language === "bn" ? "রোগী চেক-ইন" : "Walk-in Intake"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10">
                  {language === "bn" ? "প্রাথমিক ভাইটালস" : "Pre-chamber Vitals"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10">
                  {language === "bn" ? "টোকেন প্রিন্ট" : "Token Printing"}
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
                  {language === "bn"
                    ? "ডিজিটাল প্রেসক্রিপশন ও ঔষধ রিমাইন্ডার"
                    : "Patient Electronic Prescriptions & Medication Reminders"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {language === "bn"
                    ? "রোগী নিরাপদে যেকোনো সময় প্রেসক্রিপশন দেখতে পারেন, ঔষধ সেবনের রিমাইন্ডার সেট করতে পারেন এবং চিকিৎসকের সাথে যুক্ত থাকতে পারেন।"
                    : "Patients securely access digital prescriptions, review revision histories, and configure automated medicine dosage schedules directly within their verified health portal."}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10">
                  {language === "bn" ? "ভার্সন হিস্ট্রি" : "Version History"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10">
                  {language === "bn" ? "ডোজ রিমাইন্ডার" : "Dosage Reminders"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10">
                  {language === "bn" ? "সহজ প্রিন্ট" : "Instant Print"}
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
                  {language === "bn" ? "কাস্টম সাবডোমেন" : "Subdomains"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10">
                  {language === "bn" ? "স্ট্রাইপ বিলিং" : "Stripe Billing"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10">
                  {language === "bn" ? "ভূমিকা ও অনুমতি" : "RBAC Access"}
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
              <span>{language === "bn" ? "কার্যপদ্ধতি ও ধাপসমূহ" : "End-to-End Chamber Ergonomics"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {language === "bn"
                ? "সহজ ৪-ধাপের দ্রুত ও আধুনিক ক্লিনিকাল সেবা"
                : "How It Works: Streamlined 4-Step Clinical Journey"}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {language === "bn"
                ? "ওয়েটিং রুমের ভিড় কমাতে, কাগজের ঝামেলা দূর করতে এবং ডাক্তারকে পূর্ব-প্রস্তুত তথ্য দিতে সহায়ক।"
                : "Designed to minimize waiting room clutter, eliminate manual paperwork, and provide doctors with pre-triaged patient vitals."}
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
                  {language === "bn" ? "ফ্রন্ট ডেস্ক / অনলাইন" : "Front Desk / Online"}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                {language === "bn" ? "রোগী গ্রহণ ও সিরিয়াল বরাদ্দ" : "Patient Intake & Serial Allocation"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === "bn"
                  ? "রোগী অনলাইনে বা সরাসরি এসে নিবন্ধন করেন। স্বয়ংক্রিয়ভাবে সিরিয়াল টিকিট তৈরি হয়ে ডাক্তারের সক্রিয় কিউতে যোগ হয়।"
                  : "Patients book online or check in with front desk receptionists. A serial ticket is automatically generated and added to the doctor's active queue."}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3 relative group hover:border-[var(--brand-border)] transition-all">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white font-black text-sm flex items-center justify-center shadow-xs">
                  02
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === "bn" ? "চেম্বার ট্রায়াজ" : "Pre-Chamber Triage"}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                {language === "bn" ? "প্রাথমিক স্বাস্থ্য পরীক্ষা (ভাইটালস)" : "Vitals Recording & Triage"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === "bn"
                  ? "কর্মী রক্তচাপ, পালস, তাপমাত্রা ও ওজন গ্রহণ করেন। ডাক্তার চেম্বারে ঢোকার আগেই সব ডেটা স্ক্রিনে পেয়ে যান।"
                  : "Staff record Blood Pressure, Pulse, Temperature, SpO2, and Weight. The doctor enters the chamber with patient baseline diagnostics ready on screen."}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3 relative group hover:border-[var(--brand-border)] transition-all">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white font-black text-sm flex items-center justify-center shadow-xs">
                  03
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === "bn" ? "প্রেসক্রিপশন রচনা" : "Doctor Prescribing"}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                {language === "bn" ? "দ্রুত ১-ক্লিক প্রেসক্রিপশন" : "Rapid 1-Click Prescribing"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === "bn"
                  ? "১-ক্লিকে প্রধান সমস্যা ও রোগ নির্ণয় নির্বাচন করুন। ঔষধ সিলেক্ট করলেই সঠিক মাত্রা ও সময়সূচী স্বয়ংক্রিয়ভাবে বসে যায়।"
                  : "Doctor chooses Chief Complaints and Diagnosis presets with 1 click. Medicines auto-populate dose frequencies and instructions without typing."}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3 relative group hover:border-[var(--brand-border)] transition-all">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white font-black text-sm flex items-center justify-center shadow-xs">
                  04
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === "bn" ? "প্রিন্ট ও সংরক্ষণ" : "Print & Archive"}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                {language === "bn" ? "A4 লেজার প্রিন্টিং ও শেয়ার" : "Multi-Page A4 Laser Printing"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === "bn"
                  ? "এক ক্লিকে প্রাতিষ্ঠানিক প্যাড, কিউআর কোড ও চিকিৎসকের স্বাক্ষর সহ ঝকঝকে A4 প্রেসক্রিপশন প্রিন্ট করুন।"
                  : "One click outputs a paginated A4 prescription with official hospital header, QR verification code, watermark insignia, and legal digital signature."}
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
                <span>{language === "bn" ? "চিকিৎসক তালিকা ও সময়সূচী" : "Clinical Directory & Visiting Schedules"}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {t.doctors}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                {language === "bn"
                  ? "চেম্বারের সময়সূচী, বর্তমান সিরিয়াল নম্বর দেখতে অথবা অ্যাপয়েন্টমেন্ট বুকিং করতে যেকোনো ডাক্তার নির্বাচন করুন।"
                  : "Select a doctor to view chamber timings, current live serial counter in chamber, or book a consultation appointment in advance."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <Link
                href="/doctors"
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] hover:bg-[var(--brand-primary)] hover:text-white transition font-bold text-xs border border-[var(--brand-border)]/60"
              >
                <span>{language === "bn" ? "সম্পূর্ণ ডিরেক্টরি দেখুন" : "Full Directory Page"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>{language === "bn" ? "সিরিয়াল চালু আছে" : "Queue Active"}</span>
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
                <span>{language === "bn" ? "২৪/৭ জরুরি স্বাস্থ্যসেবা ও অ্যাম্বুলেন্স" : "24/7 Clinical Emergency & Ambulance"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                {language === "bn"
                  ? "জরুরি চিকিৎসা সহায়তা বা অ্যাম্বুলেন্স প্রয়োজন?"
                  : "Need Immediate Medical Assistance or Ambulance?"}
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/80 max-w-xl">
                {language === "bn"
                  ? "আমাদের জরুরি বিভাগ ও আইসিইউ অ্যাম্বুলেন্স সপ্তাহের ৭ দিন ২৪ ঘণ্টাই সার্বক্ষণিকভাবে প্রস্তুত।"
                  : "Our emergency triage and intensive care ambulance coordination are operating 24 hours a day, 7 days a week."}
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
                {language === "bn" ? "বহির্বিভাগের সময়সূচী দেখুন" : "View OPD Chamber Hours"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
