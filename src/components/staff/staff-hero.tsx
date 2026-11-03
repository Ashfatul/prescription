"use client";

import Link from "next/link";
import {
  Users,
  ArrowLeft,
  Clock,
  PhoneCall,
  Activity,
  ShieldCheck,
  Building2,
  ClipboardList,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface StaffHeroProps {
  staffCount: number;
  clinicsCount: number;
  emergencyHotline?: string;
}

export function StaffHero({
  staffCount,
  clinicsCount,
  emergencyHotline = "+880 2-8901234",
}: StaffHeroProps) {
  const { t, language } = useLanguage();

  return (
    <section className="w-full border-b border-[var(--border-subtle)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(14,165,233,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(56,189,248,0.14),transparent)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[var(--brand-text)] flex items-center gap-1 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.home}</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-[var(--text-primary)]">{t.clinicalStaffAndTeams}</span>
        </div>

        {/* Title & Live Status Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider border border-sky-500/20">
              <Users className="w-3.5 h-3.5" />
              <span>{t.hospitalOperationsCareStaff}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.clinicalStaffHealthcareTeam}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.staffDirectoryDetailedSubtitle}
            </p>
          </div>

          {/* Dynamic Badges */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-bold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {staffCount}{" "}
                {language === "bn" ? "জন সক্রিয় কর্মী" : "Active Staff Members"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Building2 className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>
                {t.clinicsRepresented}: <strong className="text-[var(--text-primary)]">{clinicsCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>
                {t.frontDeskSupport}: <strong className="text-[var(--text-primary)]">{emergencyHotline}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Regulatory Assurance Strip */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t.verifiedStaffProfiles}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-sky-500" />
            <span>{t.receptionTriageQueueCoord}</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[var(--brand-text)]">
            <PhoneCall className="w-4 h-4" />
            <span>{t.centralMedicalHotline}: {emergencyHotline}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
