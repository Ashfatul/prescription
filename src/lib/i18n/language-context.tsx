"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  BUILT_IN_LANGUAGES,
  dictionary,
  Language,
  TranslationKey,
  Dictionary,
} from "@/lib/i18n/dictionary";

export type LanguageOption = {
  code: string;
  name: string;
  nativeName: string;
  direction: string;
  isActive: boolean;
  isSystem: boolean;
  translationCount?: number;
};

export interface TranslationFunction {
  (key: TranslationKey | (string & {}), fallback?: string): string;
}

export type Translator = TranslationFunction & Dictionary;

type LangContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translator;
  languages: LanguageOption[];
  refreshTranslations: () => Promise<void>;
  translationsLoading: boolean;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "en";
    }
    try {
      return localStorage.getItem("ppms_lang") || "en";
    } catch {
      return "en";
    }
  });
  const [languages, setLanguages] = useState<LanguageOption[]>([...BUILT_IN_LANGUAGES]);
  const [remoteTranslations, setRemoteTranslations] = useState<Record<string, Record<string, string>>>({});
  const [translationsLoading, setTranslationsLoading] = useState(false);

  const loadLanguage = useCallback(async (lang: string) => {
    try {
      const response = await fetch(`/api/i18n?language=${encodeURIComponent(lang)}`, {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.success || !payload.data) return;

      setLanguages(payload.data.languages || [...BUILT_IN_LANGUAGES]);
      setRemoteTranslations((current) => ({
        ...current,
        [payload.data.language || lang]: payload.data.translations || {},
      }));
    } catch {
      // The source-controlled locale files remain available when the database is offline.
    }
  }, []);

  const refreshTranslations = useCallback(async () => {
    setTranslationsLoading(true);
    try {
      await loadLanguage(language);
    } finally {
      setTranslationsLoading(false);
    }
  }, [language, loadLanguage]);

  useEffect(() => {
    // Loading a remote locale is an external synchronization effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshTranslations();
  }, [refreshTranslations]);

  useEffect(() => {
    const selectedLanguage = languages.find((item) => item.code === language);
    document.documentElement.lang = language;
    document.documentElement.dir = selectedLanguage?.direction === "rtl" ? "rtl" : "ltr";
  }, [language, languages]);

  const updateLanguage = useCallback((lang: Language) => {
    try {
      localStorage.setItem("ppms_lang", lang);
      document.cookie = `ppms_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore in restricted browser environments
    }
    setLanguage(lang);
    void loadLanguage(lang);
  }, [loadLanguage]);

  const value = useMemo(() => {
    const fallbackDict = {
      ...dictionary.en,
      ...(remoteTranslations.en || {}),
    } as Record<string, string>;
    const activeDict = {
      ...fallbackDict,
      ...((dictionary as unknown as Record<string, Record<string, string>>)[language] || {}),
      ...(remoteTranslations[language] || {}),
    };

    const translate = ((key: string, fallback?: string): string => {
      if (activeDict[key] !== undefined && activeDict[key] !== "") return activeDict[key];
      if (fallbackDict[key] !== undefined && fallbackDict[key] !== "") return fallbackDict[key];
      return fallback !== undefined ? fallback : key;
    }) as unknown as Translator;

    // Attach all dictionary keys directly on the translate function for direct property access (e.g. t.doctors)
    Object.assign(translate, activeDict);

    return {
      language,
      setLanguage: updateLanguage,
      t: translate,
      languages,
      refreshTranslations,
      translationsLoading,
    };
  }, [language, languages, refreshTranslations, remoteTranslations, translationsLoading, updateLanguage]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
