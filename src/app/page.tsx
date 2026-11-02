import Link from "next/link";
import { 
  Activity, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  HeartPulse, 
  Layers, 
  Microscope, 
  PhoneCall, 
  Pill, 
  Printer, 
  ShieldCheck, 
  Sparkles, 
  Stethoscope, 
  Tv,
  Users, 
  Zap 
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DoctorList } from "@/components/home/doctor-list";
import { PricingSection } from "@/components/home/pricing-section";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { getHospitalSettings } from "@/features/settings/settings.service";
import { listPricingPlans } from "@/features/pricing/pricing.service";

export default async function Home() {
  const [user, settings, rawPlans] = await Promise.all([
    getCurrentUserFromCookie(),
    getHospitalSettings(),
    listPricingPlans(true),
  ]);
  const isLoggedIn = !!user;

  const pricingPlans = rawPlans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    billingCycle: p.billingCycle,
    description: p.description,
    features: Array.isArray(p.features) ? (p.features as string[]) : [],
    isPopular: p.isPopular,
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] selection:bg-[var(--brand-primary)] selection:text-white flex flex-col">
      {/* Front Page Header */}
      <Header loggedIn={isLoggedIn} />

      <main className="flex-1 w-full overflow-hidden">
        {/* ========================================================= */}
        {/* HERO SECTION - CLEAN CLINICAL ARCHITECTURE                */}
        {/* ========================================================= */}
        <section className="relative w-full overflow-hidden border-b border-[var(--border-subtle)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(15,118,110,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(20,184,166,0.15),transparent)]">
          {/* Subtle Ambient Background Mesh */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-14 sm:pb-24">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Clinical Value Proposition */}
              <div className="lg:col-span-12 space-y-6 text-center">
                {/* Micro-badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold tracking-wide uppercase shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                  <span>Next-Gen Hospital Operating System</span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">•</span>
                  <span>BMDC Compliant</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-6xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12] text-center">
                  Intelligent Prescribing.{" "} <br/>
                  <span className="bg-gradient-to-r from-[var(--brand-primary)] via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                    Zero Redundancy.
                  </span>{" "}
                  Instant Care.
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-full font-normal text-center">
                  The clinical prescribing suite built for high-velocity physicians, polyclinics, and hospitals. Write complete, legal multi-page prescriptions in under 20 seconds with 1-click clinical presets, auto-populating formulary dosage, and laser-ready A4 printouts.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {isLoggedIn && user ? (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>🚀 Enter Clinical Suite</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>🚀 Access Clinical Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}

                  <a
                    href="#doctors"
                    className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-[var(--border-strong)]/40 bg-[var(--bg-surface)] text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-text)] transition-all shadow-2xs"
                  >
                    <Calendar className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>Book Specialist</span>
                  </a>

                  <Link
                    href="/live-queue"
                    className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-xs sm:text-sm font-bold text-[var(--brand-text)] hover:border-[var(--brand-primary)] transition"
                  >
                    <Tv className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>Live Chamber Monitor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Trust & Spec Chips */}
                <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[var(--border-subtle)] text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium">100% Intranet Ready</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium">Multi-Page A4 Print</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium">1-Click Presets</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium">5 Dynamic Themes</span>
                  </div>
                </div>
              </div>



            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* STATS & PERFORMANCE TICKER                                */}
        {/* ========================================================= */}
        <section className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-8">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-[var(--brand-text)] tracking-tight">
                  99.98%
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Chamber Uptime
                </div>
                <p className="text-[11px] text-slate-400">Zero downtime clinic connectivity</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  &lt; 20s
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Prescription Speed
                </div>
                <p className="text-[11px] text-slate-400">From vitals intake to printout</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-[var(--brand-text)] tracking-tight">
                  15+
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Clinical Modules
                </div>
                <p className="text-[11px] text-slate-400">Integrated hospital intelligence</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  100%
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  BMDC Format Adherence
                </div>
                <p className="text-[11px] text-slate-400">Laser-ready multi-page A4 format</p>
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
                <span>Engineered for Clinical Speed & Absolute Accuracy</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Everything Your Clinic Needs. Zero Redundant Interactions.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Every component is crafted around doctor ergonomics, rapid typing relief, real-time patient queue dispatch, and clinical governance.
              </p>
            </div>

            {/* 6 Core Feature Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
                  <Pill className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Fast Prescribing Pad with 1-Click Presets
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Auto-populating pharmaceutical formulary, dosage frequency chips (1+0+1, 1+1+1), duration chips, and instant lifestyle advice. Write complex prescriptions in seconds.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-[var(--brand-text)]">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)]">Dosage Chips</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)]">Auto-fill Directions</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)]">Formulary Search</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
                  <Printer className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Interactive A4 Template Designer
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Full WYSIWYG prescription designer with live zoom (40%-140%), behind-text logo watermarks, custom floating text stamps, doctor header overrides, and multi-page pagination.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/10">WYSIWYG Designer</span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/10">Watermark Logos</span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/10">Paginated Print</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Real-Time Chamber Queue Dispenser
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Real-time serial tracking. Doctors advance tokens with one click, reception monitors waiting patients, and patients view live chamber progress on public displays.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10">Live Token Ticker</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10">Next in Lobby</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10">Zero Crowding</span>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Front Desk & Receptionist Triage
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Dedicated front desk portal at <code className="text-xs font-mono">/dashboard/staff</code> for rapid walk-in registration, pre-consultation vitals recording, and instant ticket print.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10">Walk-in Intake</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10">Pre-chamber Vitals</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10">Token Printing</span>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
                  <Microscope className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Diagnostic Reports & Scan Attachments
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Attach radiology scans, ultrasound PDFs, pathology results, and blood panels directly to the digital prescription for permanent historical tracking and consultation review.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10">Radiology Imaging</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10">Pathology PDFs</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10">Cloud Stored</span>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md transition-all group space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Clinical Analytics & Drug Intelligence
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Real-time epidemiologic trends, top prescribed molecules with formulary share %, prevalent clinical diagnoses, and patient footfall analytics across hospital blocks.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/10">Formulary Share %</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/10">Disease Prevalence</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/10">Patient Volume</span>
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
                <span>End-to-End Chamber Ergonomics</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                How It Works: Streamlined 4-Step Clinical Journey
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Designed to minimize waiting room clutter, eliminate manual paperwork, and provide doctors with pre-triaged patient vitals.
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
                    Front Desk / Online
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                  Patient Intake & Serial Allocation
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Patients book online or check in with front desk receptionists. A serial ticket is automatically generated and added to the doctor&apos;s active queue.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3 relative group hover:border-[var(--brand-border)] transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white font-black text-sm flex items-center justify-center shadow-xs">
                    02
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pre-Chamber Triage
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                  Vitals Recording & Triage
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Staff record Blood Pressure, Pulse, Temperature, SpO2, and Weight. The doctor enters the chamber with patient baseline diagnostics ready on screen.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3 relative group hover:border-[var(--brand-border)] transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white font-black text-sm flex items-center justify-center shadow-xs">
                    03
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Doctor Prescribing
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                  Rapid 1-Click Prescribing
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Doctor chooses Chief Complaints and Diagnosis presets with 1 click. Medicines auto-populate dose frequencies and instructions without typing.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-subtle)] space-y-3 relative group hover:border-[var(--brand-border)] transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white font-black text-sm flex items-center justify-center shadow-xs">
                    04
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Print & Archive
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
                  Multi-Page A4 Laser Printing
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  One click outputs a paginated A4 prescription with official hospital header, QR verification code, watermark insignia, and legal digital signature.
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
                  <span>Clinical Directory & Visiting Schedules</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  Consulting Physicians & Specialists
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                  Select a doctor to view chamber timings, current live serial counter in chamber, or book a consultation appointment in advance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <Link
                  href="/doctors"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] hover:bg-[var(--brand-primary)] hover:text-white transition font-bold text-xs border border-[var(--brand-border)]/60"
                >
                  <span>Full Directory Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>Queue Active</span>
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
                  <span>24/7 Clinical Emergency & Ambulance</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  Need Immediate Medical Assistance or Ambulance?
                </h2>
                <p className="text-xs sm:text-sm text-teal-100/80 max-w-xl">
                  Our emergency triage and intensive care ambulance coordination are operating 24 hours a day, 7 days a week.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href={`tel:${settings.emergencyHotline}`}
                  className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm sm:text-base shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <PhoneCall className="w-5 h-5 text-teal-600" />
                  <span>Call Emergency: <strong>{settings.emergencyHotline}</strong></span>
                </a>
                <Link
                  href="/doctors"
                  className="px-6 py-4 rounded-2xl border border-teal-400/30 hover:border-teal-400 text-teal-100 hover:text-white font-bold text-xs sm:text-sm transition"
                >
                  View OPD Chamber Hours
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Clinical Multi-Column Footer */}
      <Footer initialSettings={settings} />
    </div>
  );
}
