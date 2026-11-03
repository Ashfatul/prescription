"use client";

import { ShieldCheck, Pill, Building2, Clock, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface FeaturePoint {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

export interface AuthBrandingPanelProps {
  badge?: string;
  title?: string;
  highlightText?: string;
  description?: string;
  features?: FeaturePoint[];
}

export function AuthBrandingPanel({
  badge,
  title,
  highlightText,
  description,
  features,
}: AuthBrandingPanelProps) {
  const { language } = useLanguage();

  const defaultBadge = badge || (language === "bn" ? "ক্লিনিকাল অপারেটিং সিস্টেম" : "Clinical Operating System");
  const defaultTitle = title || (language === "bn" ? "আধুনিক স্বাস্থ্যসেবার ডিজিটাল প্ল্যাটফর্ম" : "Unified Platform for Healthcare Practice");
  const defaultDesc = description || (language === "bn"
    ? "হাসপাতাল প্রশাসক, চিকিৎসক, ট্রায়াজ স্টাফ এবং রোগীদের সংযোগকারী আধুনিক স্বাস্থ্য প্ল্যাটফর্ম।"
    : "A streamlined workspace connecting hospital administrators, consulting physicians, triage staff, and patients with zero redundant data entry.");

  const defaultPillars: FeaturePoint[] = [
    {
      icon: <Pill className="w-4 h-4 text-teal-400" />,
      title: language === "bn" ? "দ্রুত ১-ক্লিক প্রেসক্রিপশন" : "Fast 1-Click Clinical Prescribing",
      description: language === "bn"
        ? "স্বয়ংক্রিয় ঔষধ তালিকা, ডোজ ও নির্দেশিকা এবং নিখুঁত A4 প্রিন্ট।"
        : "Auto-populating drug formulary, dosage directions, and multi-page A4 printouts.",
    },
    {
      icon: <Clock className="w-4 h-4 text-teal-400" />,
      title: language === "bn" ? "লাইভ চেম্বার সিরিয়াল ও ট্রায়াজ" : "Live Chamber Queue & Triage",
      description: language === "bn"
        ? "রিয়েল-টাইম রোগী কলিং, টোকেন প্রিন্ট এবং ওয়েটিং ডিসপ্লে।"
        : "Real-time doctor calling serials, walk-in token printing, and patient display screens.",
    },
    {
      icon: <Building2 className="w-4 h-4 text-teal-400" />,
      title: language === "bn" ? "সকলের জন্য স্বতন্ত্র প্রবেশাধিকার" : "Multi-Role Clinical Workspaces",
      description: language === "bn"
        ? "অ্যাডমিন, চিকিৎসক, স্টাফ এবং রোগীর জন্য আলাদা ও সুরক্ষিত ড্যাশবোর্ড।"
        : "Dedicated interfaces for Super Admins, Clinic Admins, Doctors, Staff, and Patients.",
    },
  ];

  const activeFeatures = features || defaultPillars;
  return (
    <div className="relative hidden lg:flex flex-col justify-between h-screen max-h-screen sticky top-0 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-8 xl:p-12 text-white select-none">
      {/* Decorative Subtle Background Mesh & Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-teal-600/10 blur-3xl overflow-hidden" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Header: Brand Identity */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-base shadow-md shadow-teal-500/20">
            Rx
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white block leading-tight">
              PPMS Clinical OS
            </span>
            <span className="text-[11px] text-teal-300/80 font-medium">
              Patient Prescription Management System
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{language === "bn" ? "সিস্টেম সক্রিয়" : "System Active"}</span>
        </div>
      </div>

      {/* Center Hero: Value Proposition (Clear, Real, Modern) */}
      <div className="relative z-10 my-auto py-6 space-y-6 max-w-lg">
        {defaultBadge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-teal-300 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>{defaultBadge}</span>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-2xl xl:text-3xl font-black tracking-tight text-white leading-tight">
            {defaultTitle}{" "}
            {highlightText && (
              <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                {highlightText}
              </span>
            )}
          </h2>
          {defaultDesc && (
            <p className="text-xs xl:text-sm text-slate-300 leading-relaxed font-normal">
              {defaultDesc}
            </p>
          )}
        </div>

        {/* Real System Pillars */}
        <div className="space-y-3 pt-2">
          {activeFeatures.slice(0, 3).map((feat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify gap-3 backdrop-blur-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                {feat.icon}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-white tracking-tight">{feat.title}</h3>
                {feat.description && (
                  <p className="text-[11px] text-slate-400 leading-snug">{feat.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer: Compliance & Architectural Standards */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 space-y-2">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{language === "bn" ? "মাল্টি-টেন্যান্ট ক্লিনিক সাপোর্ট" : "Multi-Tenant Clinic Scoping"}</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{language === "bn" ? "A4 পেজিনেটেড অনুমোদিত Rx" : "A4 Paginated Legal Rx"}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{language === "bn" ? "ভূমিকা-ভিত্তিক প্রবেশাধিকার • বিএমডিসি মানসম্পন্ন ফরম্যাট" : "Role-Based Access Control • BMDC Practice Standard Format"}</span>
        </div>
      </div>
    </div>
  );
}
