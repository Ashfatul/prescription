import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";
import { AuthBrandingPanel } from "@/components/auth/auth-branding-panel";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { Sparkles, Building2, Pill, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Registration - PPMS Clinical Suite",
  description: "Register a new clinic or create a patient health account to access electronic prescriptions and lab reports.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Desktop Informative Hero Panel (Left 5 Columns, Fixed / Sticky, Guaranteed No Scroll) */}
      <div className="lg:col-span-5 xl:col-span-5 hidden lg:flex flex-col sticky top-0 h-screen max-h-screen overflow-hidden">
        <AuthBrandingPanel
          badge="Clinic & Patient Onboarding"
          title="Scale Your Practice with Next-Gen Prescribing"
          highlightText="Paperless & Instant."
          description="Launch your digital clinic or join as a patient. Issue electronic prescriptions, manage multi-doctor consultation queues, and access patient health records."
          features={[
            {
              icon: <Building2 className="w-4 h-4 text-teal-400" />,
              title: "14-Day Free Clinic Trial (No Card Needed)",
            },
            {
              icon: <Pill className="w-4 h-4 text-sky-400" />,
              title: "Smart Drug Formulary & Auto Dosage Calculation",
            },
            {
              icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
              title: "Isolated Clinic Multi-Tenancy & Patient Portal",
            },
          ]}
        />
      </div>

      {/* Registration Form Panel (Right 7 Columns) */}
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
                Healthcare Practice Platform
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>14-Day Free Trial • Instant Deployment</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeCustomizer compact direction="down" align="right" />
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-[var(--brand-primary)] transition flex items-center gap-1"
            >
              ← Home
            </Link>
          </div>
        </div>

        {/* Form Container */}
        <div className="py-6 my-auto w-full max-w-2xl mx-auto">
          <RegisterForm />
        </div>

        {/* Bottom Footer Notice */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Protected by HIPAA & BMDC compliant security standards.</span>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hover:text-[var(--brand-primary)] transition font-medium">
              Sign In
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-[var(--brand-primary)] transition font-medium">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
