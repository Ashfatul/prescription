"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { LanguageToggle } from "@/components/common/language-toggle";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSiteSettings } from "@/components/layout/providers";

export interface AuthShellProps {
  children: ReactNode;
  companion?: ReactNode;
  activeBadge?: string;
  deckMaxWidth?: "max-w-4xl" | "max-w-5xl" | "max-w-6xl";
}

export function AuthShell({
  children,
  companion,
  activeBadge,
  deckMaxWidth = "max-w-5xl",
}: AuthShellProps) {
  const { t } = useLanguage();
  const siteSettings = useSiteSettings();
  const [hospitalName, setHospitalName] = useState(siteSettings.hospitalName || "");
  const [hospitalTagline, setHospitalTagline] = useState(siteSettings.hospitalTagline || "");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data?.hospitalName) {
          setHospitalName(data.data.hospitalName);
        }
        if (data?.data?.hospitalTagline) {
          setHospitalTagline(data.data.hospitalTagline);
        }
      })
      .catch(() => { });
  }, []);

  const brandName = hospitalName || siteSettings.hospitalName || "PPMS";
  const brandTagline = hospitalTagline || siteSettings.hospitalTagline || t.authPlatformSubtitle;

  return (
    <div className="min-h-screen w-full bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col justify-between relative selection:bg-[var(--brand-primary)] selection:text-white overflow-x-hidden">
      {/* Ambient Lighting & Geometric Clinical Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 clinical-grid-bg [mask-image:radial-gradient(ellipse_75%_65%_at_50%_20%,#000_35%,transparent_100%)]" />
        <div className="absolute inset-0 hero-brand-glow" />
      </div>

      {/* Full-Bleed Top Bar with Calibrated 1440px Inner Rail */}
      <header className="relative z-10 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/85 backdrop-blur-xl">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Home">
              <div className="relative w-9 h-9 overflow-hidden rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)] shadow-2xs flex items-center justify-center shrink-0 group-hover:border-[var(--brand-primary)] transition-colors">
                <Image src="/icons/icon.svg" alt={brandName} fill sizes="36px" className="p-0.5" />
              </div>
              <div className="leading-none">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-extrabold tracking-tight text-[var(--text-primary)]">
                    {brandName}
                  </span>
                  {activeBadge && (
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]">
                      {activeBadge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[var(--text-muted)] font-medium hidden sm:block mt-0.5 truncate max-w-[260px]">
                  {brandTagline}
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">{t.authNodeSecure}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeCustomizer compact direction="down" align="right" />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--brand-primary)] text-xs font-semibold text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.authBackToPortal}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Console Deck */}
      <main className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 my-auto flex items-center justify-center">
        <div
          className={`w-full ${deckMaxWidth} rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--shadow-elevated)] overflow-hidden grid grid-cols-1 ${companion ? "lg:grid-cols-12" : ""
            }`}
        >
          {companion && (
            <aside className="lg:col-span-5 bg-[var(--bg-subtle)]/60 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              {companion}
            </aside>
          )}

          <section
            className={`${companion ? "lg:col-span-7" : "w-full"} p-6 sm:p-8 lg:p-10 flex flex-col justify-between`}
          >
            {children}
          </section>
        </div>
      </main>

      {/* Full-Bleed Footer with Calibrated 1440px Inner Rail */}
      <footer className="relative z-10 w-full border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/85 backdrop-blur-xl">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span>
              © {new Date().getFullYear()} {brandName}.
            </span>
            <span className="text-[var(--border-strong)] select-none">·</span>
            <span className="font-medium text-[var(--text-secondary)]">
              {t.prescriptionSuiteTag}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.authHipaaBmdcValidated}</span>
            </span>
            <Link href="/privacy" className="hover:text-[var(--brand-text)] transition-colors">
              {t.footerPrivacyPolicy}
            </Link>
            <Link href="/terms" className="hover:text-[var(--brand-text)] transition-colors">
              {t.footerTermsOfService}
            </Link>
            <Link href="/disclaimer" className="hover:text-[var(--brand-text)] transition-colors">
              {t.footerMedicalDisclaimer}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
