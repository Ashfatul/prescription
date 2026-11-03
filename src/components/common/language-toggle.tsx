"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

export function LanguageToggle() {
  const { language, languages, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = languages.find((item) => item.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        type="button"
        className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] hover:border-[var(--brand-border)] text-xs font-bold text-[var(--text-primary)] transition cursor-pointer shadow-2xs shrink-0"
        title={t.selectLanguage}
        aria-label={t.selectLanguage}
        aria-expanded={open}
      >
        <Globe className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
        <span>{current?.nativeName || language}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-36 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1.5 shadow-lg">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLanguage(item.code);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${item.code === language ? "bg-[var(--brand-surface)] text-[var(--brand-text)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"}`}
            >
              <span>{item.nativeName}</span>
              <span className="ml-3 text-[10px] uppercase opacity-60">{item.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
