"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Scale, AlertCircle, ArrowLeft, Printer } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function LegalNav({ title, lastUpdated }: { title?: string; lastUpdated?: string }) {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const links = [
    { href: "/privacy", label: language === "bn" ? "গোপনীয়তা ও স্বাস্থ্য ডেটা" : "Privacy & Health Data", icon: ShieldCheck },
    { href: "/terms", label: t.termsOfService, icon: Scale },
    { href: "/disclaimer", label: t.medicalDisclaimer, icon: AlertCircle },
  ];

  const defaultTitle = pathname === "/privacy"
    ? (language === "bn" ? "গোপনীয়তা নীতি ও স্বাস্থ্য ডেটা সুরক্ষা" : "Privacy Policy & Health Data Protection")
    : pathname === "/terms"
    ? (language === "bn" ? "সেবার শর্তাবলী ও ক্লিনিক্যাল ব্যবহারের চুক্তি" : "Terms of Service & Clinical Usage Agreement")
    : (language === "bn" ? "মেডিকেল ডিসক্লেইমার ও প্রেসক্রিপশন মানদণ্ড" : "Medical Disclaimer & Prescribing Standards");

  return (
    <div className="w-full bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb & Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[var(--brand-text)] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "হাসপাতাল হোমে ফিরে যান" : "Back to Hospital Home"}</span>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-subtle)] transition print:hidden cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === "bn" ? "আইনি নোটিশ প্রিন্ট করুন" : "Print Legal Notice"}</span>
          </button>
        </div>

        {/* Page Title & Last Updated Tag */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider border border-[var(--brand-border)]">
            <span>{language === "bn" ? "নিয়ন্ত্রক ও ক্লিনিকাল প্রশাসন" : "Regulatory & Clinical Governance"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {title || defaultTitle}
          </h1>
          <p className="text-xs text-slate-500">
            {language === "bn" ? "কার্যকর তারিখ:" : "Effective Date:"} {lastUpdated || (language === "bn" ? "১ নভেম্বর, ২০২৬" : "November 1, 2026")} • {language === "bn" ? "সংস্করণ ২.৪.০ (বিএমডিসি ও স্বাস্থ্য ডেটা সুরক্ষা মানদণ্ড)" : "Version 2.4.0 (BMDC & Data Protection Standard)"}
          </p>
        </div>

        {/* Legal Document Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-[var(--border-subtle)]">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "bg-[var(--bg-subtle)] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
