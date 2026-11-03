"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { dictionary, Language, TranslationKey, Dictionary } from "@/lib/i18n/dictionary";

export interface TranslationFunction {
  (key: TranslationKey | (string & {}), fallback?: string): string;
}

export type Translator = TranslationFunction & Dictionary;

type LangContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translator;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "en";
    }
    try {
      const saved = localStorage.getItem("ppms_lang") as Language | null;
      return saved === "bn" ? "bn" : "en";
    } catch {
      return "en";
    }
  });

  const updateLanguage = (lang: Language) => {
    try {
      localStorage.setItem("ppms_lang", lang);
      document.cookie = `ppms_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore in restricted browser environments
    }
    setLanguage(lang);
  };

  const value = useMemo(() => {
    const activeDict = dictionary[language] || dictionary.en;
    const fallbackDict = dictionary.en;

    const translate = ((key: string, fallback?: string): string => {
      if (key in activeDict) {
        return (activeDict as Record<string, string>)[key];
      }
      if (key in fallbackDict) {
        return (fallbackDict as Record<string, string>)[key];
      }
      return fallback !== undefined ? fallback : key;
    }) as unknown as Translator;

    // Attach all dictionary keys directly on the translate function for direct property access (e.g. t.doctors)
    Object.assign(translate, activeDict);

    return {
      language,
      setLanguage: updateLanguage,
      t: translate,
    };
  }, [language]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
