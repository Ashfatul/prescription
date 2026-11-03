"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "bn" : "en")}
      type="button"
      className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] hover:border-[var(--brand-border)] text-xs font-bold text-[var(--text-primary)] transition cursor-pointer shadow-2xs shrink-0"
      title={language === "en" ? "Switch language to বাংলা" : "Switch language to English"}
      aria-label="Toggle language between English and Bengali"
    >
      <Globe className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
      <span>{language === "en" ? "বাংলা" : "ENG"}</span>
    </button>
  );
}
