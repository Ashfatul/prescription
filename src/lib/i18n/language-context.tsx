"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { dictionary, Language } from "@/lib/i18n/dictionary";

type LangContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Record<keyof typeof dictionary.en, string>;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "en";
    }
    const saved = localStorage.getItem("ppms_lang") as Language | null;
    return saved === "bn" ? "bn" : "en";
  });

  const updateLanguage = (lang: Language) => {
    localStorage.setItem("ppms_lang", lang);
    setLanguage(lang);
  };

  const value = useMemo(
    () => ({ language, setLanguage: updateLanguage, t: dictionary[language] }),
    [language],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
