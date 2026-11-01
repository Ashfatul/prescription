"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Scale, AlertCircle, ArrowLeft, Printer } from "lucide-react";

export function LegalNav({ title, lastUpdated }: { title: string; lastUpdated?: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/privacy", label: "Privacy & Health Data", icon: ShieldCheck },
    { href: "/terms", label: "Terms of Service", icon: Scale },
    { href: "/disclaimer", label: "Medical Disclaimer", icon: AlertCircle },
  ];

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
            <span>Back to Hospital Home</span>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-subtle)] transition print:hidden"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Legal Notice</span>
          </button>
        </div>

        {/* Page Title & Last Updated Tag */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider border border-[var(--brand-border)]">
            <span>Regulatory & Clinical Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500">
            Effective Date: {lastUpdated || "November 1, 2026"} • Version 2.4.0 (BMDC & Data Protection Standard)
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
