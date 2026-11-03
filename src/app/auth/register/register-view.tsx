"use client";

import Link from "next/link";
import { RegisterForm } from "./register-form";
import { AuthBrandingPanel } from "@/components/auth/auth-branding-panel";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { LanguageToggle } from "@/components/common/language-toggle";
import { Sparkles, Building2, Pill, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function RegisterView() {
  const { t, language } = useLanguage();

  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Desktop Informative Hero Panel */}
      <div className="lg:col-span-5 xl:col-span-5 hidden lg:flex flex-col sticky top-0 h-screen max-h-screen overflow-hidden">
        <AuthBrandingPanel
          badge={language === "bn" ? "ক্লিনিক ও রোগী অনবোর্ডিং" : "Clinic & Patient Onboarding"}
          title={language === "bn" ? "আধুনিক প্রেসক্রিপশনের মাধ্যমে ক্লিনিক পরিচালনা করুন" : "Scale Your Practice with Next-Gen Prescribing"}
          highlightText={language === "bn" ? "ডিজিটাল ও তাত্ক্ষণিক।" : "Paperless & Instant."}
          description={language === "bn"
            ? "আপনার ডিজিটাল ক্লিনিক চালু করুন অথবা রোগী হিসেবে যুক্ত হোন। ডিজিটাল প্রেসক্রিপশন তৈরি করুন, রোগী সিরিয়াল নিয়ন্ত্রণ করুন এবং পূর্বের স্বাস্থ্য তথ্য সংরক্ষণ করুন।"
            : "Launch your digital clinic or join as a patient. Issue electronic prescriptions, manage multi-doctor consultation queues, and access patient health records."}
          features={[
            {
              icon: <Building2 className="w-4 h-4 text-teal-400" />,
              title: language === "bn" ? "১৪ দিনের ফ্রি ক্লিনিক ট্রায়াল (কার্ড ছাড়া)" : "14-Day Free Clinic Trial (No Card Needed)",
            },
            {
              icon: <Pill className="w-4 h-4 text-sky-400" />,
              title: language === "bn" ? "স্মার্ট ড্রাগ ক্যাটালগ ও অটো ডোজ ক্যালকুলেশন" : "Smart Drug Formulary & Auto Dosage Calculation",
            },
            {
              icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
              title: language === "bn" ? "নিরাপদ মাল্টি-টেন্যান্ট ক্লিনিক ও রোগী পোর্টাল" : "Isolated Clinic Multi-Tenancy & Patient Portal",
            },
          ]}
        />
      </div>

      {/* Registration Form Panel */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 overflow-y-auto">
        {/* Top Navbar */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          {/* Mobile Brand */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-sm shadow-xs">
              Rx
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                PPMS Clinical
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === "bn" ? "স্বাস্থ্যসেবা প্র্যাকটিস প্ল্যাটফর্ম" : "Healthcare Practice Platform"}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>{t.trialNotice}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeCustomizer compact direction="down" align="right" />
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-[var(--brand-primary)] transition flex items-center gap-1"
            >
              ← {t.home}
            </Link>
          </div>
        </div>

        {/* Form Container */}
        <div className="py-6 my-auto w-full max-w-2xl mx-auto">
          <RegisterForm />
        </div>

        {/* Bottom Footer Notice */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>{language === "bn" ? "বিএমডিসি ও স্বাস্থ্য নিরাপত্তা মানদণ্ড দ্বারা সুরক্ষিত।" : "Protected by HIPAA & BMDC compliant security standards."}</span>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hover:text-[var(--brand-primary)] transition font-medium">
              {t.signIn}
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[var(--brand-primary)] transition font-medium">
              {t.footerPrivacyPolicy}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
