"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { LanguageToggle } from "@/components/common/language-toggle";
import { useLanguage } from "@/lib/i18n/language-context";

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
  const [hospitalName, setHospitalName] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data?.hospitalName) {
          setHospitalName(data.data.hospitalName);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen w-full bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col justify-between relative selection:bg-[var(--brand-primary)] selection:text-white overflow-x-hidden">
      {/* Ambient Lighting & Geometric Clinical Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[var(--brand-primary)]/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Top Clinical Command Ribbon */}
      <header className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
        {/* Brand Identity & Node Telemetry */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-3 group" aria-label="Home">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 overflow-hidden rounded-xl bg-[var(--brand-surface)] border border-[var(--brand-border)] shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Image src="/icons/icon.svg" alt="System Logo" fill sizes="40px" className="p-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {hospitalName || "PPMS"}
                </span>
                {activeBadge && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]">
                    {activeBadge}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Patient Prescription Management System
              </span>
            </div>
          </Link>

          {/* Clinical Node Status Beacon */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">{t.authNodeSecure}</span>
          </div>
        </div>

        {/* Global Utilities */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <ThemeCustomizer compact direction="down" align="right" />
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--brand-primary)] text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.authBackToPortal}</span>
          </Link>
        </div>
      </header>

      {/* Main Console Deck */}
      <main className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 my-auto flex items-center justify-center">
        <div
          className={`w-full ${deckMaxWidth} rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl overflow-hidden grid grid-cols-1 ${
            companion ? "lg:grid-cols-12" : ""
          }`}
        >
          {/* Side Telemetry & Companion Wing */}
          {companion && (
            <aside className="lg:col-span-5 bg-[var(--bg-subtle)]/70 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              {companion}
            </aside>
          )}

          {/* Primary Form / Interaction Console */}
          <section className={`${companion ? "lg:col-span-7" : "w-full"} p-6 sm:p-8 lg:p-10 flex flex-col justify-between`}>
            {children}
          </section>
        </div>
      </main>

      {/* Bottom Legal & Compliance Footer */}
      <footer className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} {hospitalName || "PPMS"}.</span>
          <span className="text-slate-400 select-none">•</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">PPMS Clinical Suite v2.4</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HIPAA & BMDC Validated</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
          <Link href="/privacy" className="hover:text-[var(--brand-primary)] transition">
            {t.footerPrivacyPolicy}
          </Link>
          <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
          <Link href="/terms" className="hover:text-[var(--brand-primary)] transition">
            {t.footerTermsOfService}
          </Link>
          <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
          <Link href="/disclaimer" className="hover:text-[var(--brand-primary)] transition">
            {t.footerMedicalDisclaimer}
          </Link>
        </div>
      </footer>
    </div>
  );
}
