"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  PhoneCall, 
  Clock, 
  MapPin, 
  Lock, 
  FileText, 
  AlertCircle, 
  Activity, 
  Mail, 
  Scale, 
  HeartHandshake,
  CheckCircle2
} from "lucide-react";
import { HospitalSettings, DEFAULT_HOSPITAL_SETTINGS } from "@/features/settings/settings.service";
import { useLanguage } from "@/lib/i18n/language-context";

export function Footer({ initialSettings }: { initialSettings?: HospitalSettings }) {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<HospitalSettings>(
    initialSettings || DEFAULT_HOSPITAL_SETTINGS
  );

  useEffect(() => {
    if (!initialSettings) {
      fetch("/api/settings")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && data?.data) {
            setSettings(data.data);
          }
        })
        .catch(() => {});
    }
  }, [initialSettings]);

  return (
    <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-slate-600 dark:text-slate-400">
      {/* Top Clinical Accreditation & Emergency Bar */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/60 py-3.5">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">
                {t("uiClinicalHealthNetwork")}
                <strong>{settings.hospitalName} ({settings.hospitalBranch})</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {t.footerLegalFormatVerified}
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                {t.footerEncryptedHealth}
              </span>
              <a
                href={`tel:${settings.emergencyHotline}`}
                className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                {t.emergencyHotline}: {settings.emergencyHotline}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Content Area */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          
          {/* Column 1: Hospital Brand & System Overview (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-hover)] text-white flex items-center justify-center font-black text-base shadow-sm ring-2 ring-[var(--brand-border)]/50 group-hover:scale-105 transition-all">
                Rx
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg">
                    PPMS
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] font-bold text-[10px] tracking-wider uppercase border border-[var(--brand-border)]/60">
                    Clinical OS
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {settings.hospitalName} • Prescriptions
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 max-w-md">
              {t("uiTheHighVelocityClinicalPrescribing")}
            </p>

            {/* Compliance Badges */}
            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] font-medium text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {t.bmdcCompliantBadge}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] font-medium text-slate-700 dark:text-slate-300">
                <Lock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                {t.cloudHybridBadge}
              </span>
            </div>
          </div>

          {/* Column 2: Clinical Suites */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>{t.footerClinicalSuites}</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-[var(--brand-text)] transition flex items-center gap-1.5">
                  <span>{t.footerDoctorPad}</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/staff" className="hover:text-[var(--brand-text)] transition flex items-center gap-1.5">
                  <span>{t.footerFrontDeskTriage}</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/templates" className="hover:text-[var(--brand-text)] transition flex items-center gap-1.5">
                  <span>{t.footerTemplateStudio}</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-[var(--brand-text)] transition flex items-center gap-1.5">
                  <span>{t.footerFormularyCatalog}</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin?tab=settings" className="hover:text-[var(--brand-text)] transition flex items-center gap-1.5">
                  <span>{t.footerHospitalAdminSettings}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Patient Care & Directory */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>{t.footerPatientServices}</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/clinics" className="hover:text-[var(--brand-text)] transition flex items-center gap-1.5 font-semibold text-[var(--brand-text)]">
                  <span>{t.footerRegisteredClinics}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]">
                    {t.all}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-[var(--brand-text)] transition flex items-center gap-1.5">
                  {t.footerConsultingPhysicians}
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-[var(--brand-text)] transition flex items-center gap-1.5">
                  <span>{t.footerClinicalStaff}</span>
                </Link>
              </li>
              <li>
                <Link href="/live-queue" className="hover:text-[var(--brand-text)] transition flex items-center gap-1.5">
                  <span>{t.footerLiveTvMonitor}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard/patient" className="hover:text-[var(--brand-text)] transition">
                  {t.footerPatientPortal}
                </Link>
              </li>
              <li>
                <a
                  href="/api/public/doctors"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--brand-text)] transition"
                >
                  {t.footerDoctorApi}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Governance */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>{t.footerLegalGovernance}</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link 
                  href="/privacy" 
                  className="hover:text-[var(--brand-text)] transition flex items-center gap-1.5 font-medium"
                >
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span>{t.footerPrivacyPolicy}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="hover:text-[var(--brand-text)] transition flex items-center gap-1.5 font-medium"
                >
                  <Scale className="w-3 h-3 text-slate-400" />
                  <span>{t.footerTermsOfService}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/disclaimer" 
                  className="hover:text-[var(--brand-text)] transition flex items-center gap-1.5 font-medium"
                >
                  <AlertCircle className="w-3 h-3 text-slate-400" />
                  <span>{t.footerMedicalDisclaimer}</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Dynamic Emergency Notice Callout Strip */}
        <div className="mt-10 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>{t.footerEmergencyNotice}:</strong> {settings.emergencyNotice}
            </span>
          </div>
          <a
            href={`tel:${settings.emergencyHotline}`}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition"
          >
            {t.emergencyHotline}: {settings.emergencyHotline}
          </a>
        </div>

        {/* Dynamic Contact & Chamber Info Bar */}
        <div className="mt-8 pt-8 border-t border-[var(--border-subtle)] grid sm:grid-cols-3 gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
            <span className="truncate">{settings.hospitalAddress}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
            <span>{t.footerOpdVisitingHours}: <strong className="text-[var(--text-primary)]">{settings.opdVisitingHours}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
            <span className="truncate">{t("uiSupport")}{settings.supportEmail}</span>
          </div>
        </div>

        {/* Bottom Legal Copyright & Live Health Status Bar */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} {settings.hospitalName}. {t.allRightsReserved}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <Link href="/privacy" className="text-slate-500 hover:text-[var(--text-primary)] transition">
              {t.footerPrivacyPolicy}
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link href="/terms" className="text-slate-500 hover:text-[var(--text-primary)] transition">
              {t.footerTermsOfService}
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link href="/disclaimer" className="text-slate-500 hover:text-[var(--text-primary)] transition">
              {t.footerMedicalDisclaimer}
            </Link>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.footerAllServicesOperational}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
