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
          badge={t("uiClinicPatientOnboarding")}
          title={t("uiScaleYourPracticeWithNext")}
          highlightText={t("uiPaperlessInstant")}
          description={t("uiLaunchYourDigitalClinicOr")}
          features={[
            {
              icon: <Building2 className="w-4 h-4 text-teal-400" />,
              title: t("uiDayFreeClinicTrialNo"),
            },
            {
              icon: <Pill className="w-4 h-4 text-sky-400" />,
              title: t("uiSmartDrugFormularyAutoDosage"),
            },
            {
              icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
              title: t("uiIsolatedClinicMultiTenancyPatient"),
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
                {t("uiHealthcarePracticePlatform")}
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
          <span>{t("uiProtectedByHIPAABMDCCompliant")}</span>
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
