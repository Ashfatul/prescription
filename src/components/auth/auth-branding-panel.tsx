"use client";

import { ShieldCheck, Sparkles, Pill, Building2, Clock } from "lucide-react";

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
  stats?: Array<{ label: string; value: string }>;
}

const DEFAULT_FEATURES: FeaturePoint[] = [
  {
    icon: <Pill className="w-4 h-4 text-teal-400" />,
    title: "Instant 1-Click Clinical Prescribing",
  },
  {
    icon: <Building2 className="w-4 h-4 text-sky-400" />,
    title: "Dedicated Multi-Clinic Tenant Isolation",
  },
  {
    icon: <Clock className="w-4 h-4 text-amber-400" />,
    title: "Real-Time Patient Queues & Portal",
  },
];

const DEFAULT_STATS = [
  { label: "Digital Rx", value: "50k+" },
  { label: "Doctors", value: "1,200+" },
  { label: "Uptime", value: "99.98%" },
];

export function AuthBrandingPanel({
  badge = "Clinical Operating System",
  title = "Intelligent Prescriptions for Modern Healthcare",
  highlightText,
  description = "A unified clinical workspace connecting hospital administrators, physicians, triage staff, and patients with zero friction.",
  features = DEFAULT_FEATURES,
  stats = DEFAULT_STATS,
}: AuthBrandingPanelProps) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between h-screen max-h-screen sticky top-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-8 xl:p-12 text-white select-none">
      {/* Decorative Subtle Background Glows */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-teal-500/12 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-20 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl" />

      {/* Decorative Grid Lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Top Header: Brand Identity */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-teal-500/20">
            Rx
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-white block leading-tight">
              PPMS Clinical OS
            </span>
            <span className="text-[10px] text-teal-300/80 font-medium">
              Healthcare Practice Platform
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>v2.4 Production</span>
        </div>
      </div>

      {/* Center Hero: Value Proposition (Concise & Punchy) */}
      <div className="relative z-10 my-auto py-4 space-y-4 max-w-lg">
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-teal-300 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>{badge}</span>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-2xl xl:text-3xl font-black tracking-tight text-white leading-tight">
            {title}{" "}
            {highlightText && (
              <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent">
                {highlightText}
              </span>
            )}
          </h2>
          {description && (
            <p className="text-xs xl:text-sm text-slate-300/90 leading-relaxed max-w-md">
              {description}
            </p>
          )}
        </div>

        {/* Feature Highlights: Clean, compact 1-line items */}
        <div className="space-y-2 pt-1">
          {features.slice(0, 3).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
              <div className="w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/25 text-teal-400 flex items-center justify-center shrink-0">
                {feat.icon}
              </div>
              <span className="font-semibold text-slate-200 truncate">{feat.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer: Stats & Security Seal (Single Line) */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 space-y-2.5">
        <div className="flex items-center gap-6">
          {stats.slice(0, 3).map((st, i) => (
            <div key={i} className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-white font-mono">
                {st.value}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {st.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>HIPAA & BMDC Compliant • 256-Bit SSL Encryption</span>
        </div>
      </div>
    </div>
  );
}
