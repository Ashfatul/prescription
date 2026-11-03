import { en } from "@/lib/i18n/locales/en";
import { bn } from "@/lib/i18n/locales/bn";
import { uiEn, uiBn } from "@/lib/i18n/locales/ui";

/**
 * Source-controlled locale files. Database translations are merged at runtime
 * by the translation service and LanguageProvider.
 */
export const dictionary = {
  en: { ...en, ...uiEn },
  bn: { ...bn, ...uiBn },
} as const;

export type BuiltInLanguage = keyof typeof dictionary;
export type Language = string;
export type Dictionary = typeof en;
export type TranslationKey = keyof Dictionary;

export const BUILT_IN_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", direction: "ltr", isActive: true, isSystem: true },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", direction: "ltr", isActive: true, isSystem: true },
] as const;
