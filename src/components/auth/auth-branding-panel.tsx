"use client";

import { ShieldCheck, Pill, Building2, Clock, CheckCircle2 } from "lucide-react";

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

const SYSTEM_PILLARS: FeaturePoint[] = [
  {
    icon: <Pill className="w-4 h-4 text-teal-400" />,
    title: "Fast 1-Click Clinical Prescribing",
    description: "Auto-populating drug formulary, dosage directions, and multi-page A4 printouts.",
  },
  {
    icon: <Clock className="w-4 h-4 text-teal-400" />,
    title: "Live Chamber Queue & Triage",
    description: "Real-time doctor calling serials, walk-in token printing, and patient display screens.",
  },
  {
    icon: <Building2 className="w-4 h-4 text-teal-400" />,
    title: "Multi-Role Clinical Workspaces",
    description: "Dedicated interfaces for Super Admins, Clinic Admins, Doctors, Staff, and Patients.",
  },
];

export function AuthBrandingPanel({
  badge = "Clinical Operating System",
  title = "Unified Platform for Healthcare Practice",
  highlightText,
  description = "A streamlined workspace connecting hospital administrators, consulting physicians, triage staff, and patients with zero redundant data entry.",
  features = SYSTEM_PILLARS,
}: AuthBrandingPanelProps) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between h-screen max-h-screen sticky top-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-8 xl:p-12 text-white select-none">
      {/* Decorative Subtle Background Mesh & Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-teal-600/10 blur-3xl" />
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
          <span>System Active</span>
        </div>
      </div>

      {/* Center Hero: Value Proposition (Clear, Real, Modern) */}
      <div className="relative z-10 my-auto py-6 space-y-6 max-w-lg">
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-teal-300 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>{badge}</span>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-2xl xl:text-3xl font-black tracking-tight text-white leading-tight">
            {title}{" "}
            {highlightText && (
              <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                {highlightText}
              </span>
            )}
          </h2>
          {description && (
            <p className="text-xs xl:text-sm text-slate-300 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>

        {/* Real System Pillars */}
        <div className="space-y-3 pt-2">
          {features.slice(0, 3).map((feat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 backdrop-blur-xs"
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
            <span>Multi-Tenant Clinic Scoping</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>A4 Paginated Legal Rx</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Role-Based Access Control • BMDC Practice Standard Format</span>
        </div>
      </div>
    </div>
  );
}
