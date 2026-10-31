"use client";

import { useLanguage } from "@/lib/i18n/language-context";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      className="rounded-lg border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
      onClick={() => setLanguage(language === "en" ? "bn" : "en")}
      type="button"
    >
      {language === "en" ? "বাংলা" : "English"}
    </button>
  );
}
