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
  hospitalName = "Metropolitan Hospital",
  emergencyStatus = "24/7 OPD Chambers Open",
  opdVisitingHours = "08:00 AM - 10:00 PM",
  chamberDays = "Saturday - Thursday",
  emergencyHotline = "+880 2-8901234",
}: DoctorsHeroProps) {
  const { t, language } = useLanguage();

  return (
    <section className="w-full border-b border-[var(--border-subtle)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(15,118,110,0.10),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(20,184,166,0.12),transparent)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[var(--brand-text)] flex items-center gap-1 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.home}</span>
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
          <span className="font-semibold text-[var(--text-primary)]">{t.physiciansAndChambers}</span>
        </div>

        {/* Title & Live Status Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider border border-[var(--brand-border)]">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>
                {clinic
                  ? `${clinic.name} ${language === "bn" ? "বিশেষজ্ঞবৃন্দ" : "Specialists"}`
                  : t.outpatientChamberSpecialists}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              {clinic
                ? `${clinic.name} ${t.doctors}`
                : t.consultingPhysiciansSpecialists}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {clinic
                ? (language === "bn"
                    ? `${clinic.name}-এর চেম্বারের সময়সূচি, রুম নম্বর, যাচাইকৃত বিএমডিসি সনদ ও লাইভ সিরিয়াল কিউ দেখুন।`
                    : `View visiting schedules, chamber room numbers, verified BMDC registration credentials, and live chamber serial queues for ${clinic.name}.`)
                : (language === "bn"
                    ? `${hospitalName}-এর চেম্বারের সময়সূচি, রুম নম্বর, যাচাইকৃত বিএমডিসি সনদ ও লাইভ সিরিয়াল কিউ দেখুন।`
                    : `View visiting schedules, chamber room numbers, verified BMDC registration credentials, and live in-chamber serial tokens for ${hospitalName}.`)}
            </p>

            {clinic && (
              <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-[var(--brand-text)]">
                <span>
                  {language === "bn"
                    ? "শুধুমাত্র এই প্রতিষ্ঠানে নিয়মিত উপস্থিত অনুমোদিত চিকিৎসকদের প্রদর্শন করা হচ্ছে।"
                    : "Showing verified practitioners practicing strictly at this facility."}
                </span>
                <Link href="/doctors" className="underline hover:opacity-80">
                  {language === "bn" ? "সকল ক্লিনিক দেখুন" : "View all clinics"}
                </Link>
              </div>
            )}
          </div>

          {/* Dynamic Chamber Hours Badges */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>{emergencyStatus}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>
                {language === "bn" ? "সাক্ষাতের সময়:" : "Visiting Hours:"} <strong className="text-[var(--text-primary)]">{opdVisitingHours}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <CalendarDays className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>
                {language === "bn" ? "সাক্ষাতের দিন:" : "Days:"} <strong className="text-[var(--text-primary)]">{chamberDays}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Regulatory Assurance Strip */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t.bmdcVerifiedPhysicians}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>{t.liveQueueCallingScreens}</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[var(--brand-text)]">
            <PhoneCall className="w-4 h-4" />
            <span>{t.emergencyHotline}: {emergencyHotline}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
