"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
    ShieldCheck,
    Clock,
    MapPin,
    Lock,
    FileText,
    AlertCircle,
    Activity,
    Mail,
    Scale,
    HeartHandshake,
    CheckCircle2,
    PhoneCall,
} from "lucide-react";
import {
    HospitalSettings,
    DEFAULT_HOSPITAL_SETTINGS,
} from "@/features/settings/settings.service";
import { useLanguage } from "@/lib/i18n/language-context";

export function Footer({
    initialSettings,
}: {
    initialSettings?: HospitalSettings;
}) {
    const { t } = useLanguage();
    const [settings, setSettings] = useState<HospitalSettings>(
        initialSettings || DEFAULT_HOSPITAL_SETTINGS,
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
        <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]">
            {/* Top Clinical Accreditation & Status Bar */}
            <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 py-3">
                <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-[var(--text-primary)]">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span className="font-medium">
                                {t("uiPPMSPlatform")}{" "}
                                <strong className="font-bold">
                                    {settings.hospitalName}
                                </strong>
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[var(--text-muted)] font-medium">
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                {t.footerLegalFormatVerified}
                            </span>
                            <span className="hidden sm:inline-flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                                {t.footerEncryptedHealth}
                            </span>
                            {settings.supportEmail && (
                                <a
                                    href={`mailto:${settings.supportEmail}`}
                                    className="inline-flex items-center gap-1.5 font-semibold text-[var(--brand-text)] hover:underline"
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    {t("uiPlatformSupport", "Platform support")}
                                    : {settings.supportEmail}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Multi-Column Architectural Footer */}
            <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
                    {/* Brand Overview & Chamber Contact (5 cols) */}
                    <div className="lg:col-span-5 space-y-5">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2.5 group"
                        >
                            <div className="relative w-9 h-9 overflow-hidden rounded-lg border border-[var(--brand-border)]/70 shadow-2xs shrink-0">
                                <Image
                                    src="/icons/icon.svg"
                                    alt={settings.hospitalName || "PPMS"}
                                    fill
                                    sizes="36px"
                                />
                            </div>
                            <div className="flex flex-col leading-none">
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold tracking-tight text-[var(--text-primary)] text-base">
                                        {settings.hospitalName || "PPMS"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] font-semibold text-[10px] border border-[var(--brand-border)]/60">
                                        {t.clinicOperationsPlatform}
                                    </span>
                                </div>
                                <span className="text-[11px] font-medium text-[var(--text-muted)] mt-1">
                                    {settings.hospitalName} ·{" "}
                                    {t.prescriptionsSuffix}
                                </span>
                            </div>
                        </Link>

                        <p className="text-xs leading-relaxed text-[var(--text-secondary)] max-w-[46ch]">
                            {t("uiTheHighVelocityClinicalPrescribing")}
                        </p>

                        {/* Compact Contact Metadata */}
                        <div className="space-y-2 text-xs text-[var(--text-muted)] pt-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                                <span className="truncate">
                                    {settings.hospitalAddress}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                                <span>
                                    {t.footerOpdVisitingHours}:{" "}
                                    <strong className="font-semibold text-[var(--text-primary)]">
                                        {settings.opdVisitingHours}
                                    </strong>
                                </span>
                            </div>
                        </div>

                        {/* Compliance Chips */}
                        <div className="flex flex-wrap gap-2 text-[11px]">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)]">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                {t.bmdcCompliantBadge}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)]">
                                <Lock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                                {t.cloudHybridBadge}
                            </span>
                        </div>
                    </div>

                    {/* Clinical Suites (2 cols) */}
                    <div className="lg:col-span-2 space-y-3">
                        <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                            <span>{t.footerClinicalSuites}</span>
                        </h3>
                        <ul className="space-y-2.5 text-xs">
                            <li>
                                <Link
                                    href="/dashboard"
                                    className="hover:text-[var(--brand-text)] transition-colors"
                                >
                                    {t.footerDoctorPad}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/staff"
                                    className="hover:text-[var(--brand-text)] transition-colors"
                                >
                                    {t.footerFrontDeskTriage}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/templates"
                                    className="hover:text-[var(--brand-text)] transition-colors"
                                >
                                    {t.footerTemplateStudio}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/admin"
                                    className="hover:text-[var(--brand-text)] transition-colors"
                                >
                                    {t.footerFormularyCatalog}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/admin?tab=settings"
                                    className="hover:text-[var(--brand-text)] transition-colors"
                                >
                                    {t.footerHospitalAdminSettings}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Patient Care & Directory (3 cols) */}
                    <div className="lg:col-span-3 space-y-3">
                        <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                            <HeartHandshake className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                            <span>{t.footerPatientServices}</span>
                        </h3>
                        <ul className="space-y-2.5 text-xs">
                            <li>
                                <Link
                                    href="/clinics"
                                    className="hover:text-[var(--brand-text)] transition-colors inline-flex items-center gap-1.5 font-semibold text-[var(--brand-text)]"
                                >
                                    <span>{t.footerRegisteredClinics}</span>
                                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]">
                                        {t.all}
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/doctors"
                                    className="hover:text-[var(--brand-text)] transition-colors"
                                >
                                    {t.footerConsultingPhysicians}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/staff"
                                    className="hover:text-[var(--brand-text)] transition-colors"
                                >
                                    {t.footerClinicalStaff}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/live-queue"
                                    className="hover:text-[var(--brand-text)] transition-colors inline-flex items-center gap-1.5"
                                >
                                    <span>{t.footerLiveTvMonitor}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/patient"
                                    className="hover:text-[var(--brand-text)] transition-colors"
                                >
                                    {t.footerPatientPortal}
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="/api/public/doctors"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-[var(--brand-text)] transition-colors"
                                >
                                    {t.footerDoctorApi}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Governance (2 cols) */}
                    <div className="lg:col-span-2 space-y-3">
                        <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                            <Scale className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                            <span>{t.footerLegalGovernance}</span>
                        </h3>
                        <ul className="space-y-2.5 text-xs">
                            <li>
                                <Link
                                    href="/privacy"
                                    className="hover:text-[var(--brand-text)] transition-colors inline-flex items-center gap-1.5"
                                >
                                    <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                    <span>{t.footerPrivacyPolicy}</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="hover:text-[var(--brand-text)] transition-colors inline-flex items-center gap-1.5"
                                >
                                    <Scale className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                    <span>{t.footerTermsOfService}</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/disclaimer"
                                    className="hover:text-[var(--brand-text)] transition-colors inline-flex items-center gap-1.5"
                                >
                                    <AlertCircle className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                    <span>{t.footerMedicalDisclaimer}</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Dynamic Emergency Notice Strip */}
                <div className="mt-10 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-300">
                    <div className="flex items-start sm:items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                        <span>
                            <strong>{t.footerEmergencyNotice}:</strong>{" "}
                            {settings.emergencyNotice}
                        </span>
                    </div>
                    <a
                        href={`tel:${settings.emergencyHotline}`}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors"
                    >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>
                            {t.emergencyHotline}: {settings.emergencyHotline}
                        </span>
                    </a>
                </div>

                {/* Bottom Legal Copyright & System Status Bar */}
                <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <p className="text-[var(--text-muted)] text-center sm:text-left">
                        &copy; {new Date().getFullYear()}{" "}
                        {settings.hospitalName}. {t.allRightsReserved}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                        <Link
                            href="/privacy"
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            {t.footerPrivacyPolicy}
                        </Link>
                        <Link
                            href="/terms"
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            {t.footerTermsOfService}
                        </Link>
                        <Link
                            href="/disclaimer"
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            {t.footerMedicalDisclaimer}
                        </Link>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-primary)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t.footerAllServicesOperational}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
