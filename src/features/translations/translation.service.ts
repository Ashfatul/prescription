import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { BUILT_IN_LANGUAGES, dictionary } from "@/lib/i18n/dictionary";

export type TranslationMap = Record<string, string>;

export type TranslationLanguageInfo = {
  code: string;
  name: string;
  nativeName: string;
  direction: string;
  isActive: boolean;
  isSystem: boolean;
  translationCount: number;
};

const LANGUAGE_CODE_PATTERN = /^[a-z]{2,8}(?:-[A-Z]{2})?$/;

function validateLanguageCode(code: string) {
  if (!LANGUAGE_CODE_PATTERN.test(code)) {
    throw new AppError("Language code must look like en, bn, es, or pt-BR", 400);
  }
}

function normalizeEntries(input: unknown): TranslationMap {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(input).filter(
      ([key, value]) => key.trim().length > 0 && typeof value === "string",
    ),
  );
}

function staticLanguageInfo(): TranslationLanguageInfo[] {
  return BUILT_IN_LANGUAGES.map((language) => ({
    code: language.code,
    name: language.name,
    nativeName: language.nativeName,
    direction: "ltr",
    isActive: true,
    isSystem: true,
    translationCount: Object.keys(dictionary[language.code]).length,
  }));
}

function getStaticDictionary(code: string): TranslationMap {
  return ((dictionary as unknown) as Record<string, TranslationMap>)[code] || {};
}

function mergeLanguageEntries(
  code: string,
  english: TranslationMap,
  databaseEntries: TranslationMap,
): TranslationMap {
  return { ...english, ...getStaticDictionary(code), ...databaseEntries };
}

async function readDatabaseLanguages() {
  return db.translationLanguage.findMany({
    where: { isActive: true },
    include: { translations: true },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  });
}

export async function getTranslationCatalog() {
  const databaseLanguages = await readDatabaseLanguages();
  const databaseByCode = new Map(databaseLanguages.map((language) => [language.code, language]));
  const englishDatabaseEntries = Object.fromEntries(
    (databaseByCode.get("en")?.translations || []).map((entry) => [entry.key, entry.value]),
  );
  const english = { ...dictionary.en, ...englishDatabaseEntries } as TranslationMap;

  const languageMap = new Map<string, TranslationLanguageInfo>();
  for (const language of staticLanguageInfo()) {
    const databaseLanguage = databaseByCode.get(language.code);
    languageMap.set(language.code, {
      ...language,
      name: databaseLanguage?.name || language.name,
      nativeName: databaseLanguage?.nativeName || language.nativeName,
      direction: databaseLanguage?.direction || language.direction,
      translationCount: Object.keys(
        mergeLanguageEntries(
          language.code,
          english,
          Object.fromEntries(
            (databaseLanguage?.translations || []).map((entry) => [entry.key, entry.value]),
          ),
        ),
      ).length,
    });
  }

  for (const language of databaseLanguages) {
    if (!languageMap.has(language.code)) {
      languageMap.set(language.code, {
        code: language.code,
        name: language.name,
        nativeName: language.nativeName || language.name,
        direction: language.direction,
        isActive: language.isActive,
        isSystem: language.isSystem,
        translationCount: Object.keys(english).length,
      });
    }
  }

  const languages = Array.from(languageMap.values());
  languages.sort((a, b) => (a.code === "en" ? -1 : b.code === "en" ? 1 : a.name.localeCompare(b.name)));

  return { languages, englishKeys: Object.keys(english) };
}

export async function getTranslationBundle(code = "en") {
  const catalog = await getTranslationCatalog();
  const selected = catalog.languages.find((language) => language.code === code) || catalog.languages[0];
  const [selectedLanguage, englishLanguage] = await Promise.all([
    selected
      ? db.translationLanguage.findUnique({
          where: { code: selected.code },
          include: { translations: true },
        })
      : null,
    db.translationLanguage.findUnique({
      where: { code: "en" },
      include: { translations: true },
    }),
  ]);

  const english = {
    ...dictionary.en,
    ...Object.fromEntries((englishLanguage?.translations || []).map((entry) => [entry.key, entry.value])),
  } as TranslationMap;
  const entries = Object.fromEntries(
    (selectedLanguage?.translations || []).map((entry) => [entry.key, entry.value]),
  );

  return {
    language: selected?.code || "en",
    languages: catalog.languages,
    englishKeys: catalog.englishKeys,
    englishTranslations: english,
    overrides: entries,
    translations: mergeLanguageEntries(selected?.code || "en", english, entries),
  };
}

export async function createTranslationLanguage(input: {
  code: string;
  name: string;
  nativeName?: string;
  direction?: string;
  translations?: unknown;
  englishTranslations?: unknown;
}) {
  const code = input.code.trim();
  validateLanguageCode(code);
  const name = input.name.trim();
  if (!name) throw new AppError("Language name is required", 400);

  const existing = await db.translationLanguage.findUnique({ where: { code } });
  if (existing) throw new AppError("This language code already exists", 409);

  const language = await db.translationLanguage.create({
    data: {
      code,
      name,
      nativeName: input.nativeName?.trim() || name,
      direction: input.direction === "rtl" ? "rtl" : "ltr",
      isSystem: false,
    },
  });

  await saveTranslationEntries(language.id, normalizeEntries(input.translations));
  await saveEnglishEntries(normalizeEntries(input.englishTranslations));
  return getTranslationBundle(code);
}

async function saveTranslationEntries(languageId: string, entries: TranslationMap) {
  const pairs = Object.entries(entries).filter(([, value]) => value.trim().length > 0);
  if (!pairs.length) return;

  await db.$transaction(
    pairs.map(([key, value]) =>
      db.translationEntry.upsert({
        where: { languageId_key: { languageId, key } },
        create: { languageId, key, value },
        update: { value },
      }),
    ),
  );
}

async function saveEnglishEntries(entries: TranslationMap) {
  if (!Object.keys(entries).length) return;
  const language = await db.translationLanguage.upsert({
    where: { code: "en" },
    create: { code: "en", name: "English", nativeName: "English", isSystem: true },
    update: {},
  });
  await saveTranslationEntries(language.id, entries);
}

export async function updateTranslationLanguage(
  code: string,
  input: {
    name?: string;
    nativeName?: string;
    direction?: string;
    translations?: unknown;
    englishTranslations?: unknown;
  },
) {
  validateLanguageCode(code);
  const language = await db.translationLanguage.upsert({
    where: { code },
    create: {
      code,
      name: input.name?.trim() || code,
      nativeName: input.nativeName?.trim() || input.name?.trim() || code,
      direction: input.direction === "rtl" ? "rtl" : "ltr",
      isSystem: code === "en" || code === "bn",
    },
    update: {
      ...(input.name?.trim() ? { name: input.name.trim() } : {}),
      ...(input.nativeName?.trim() ? { nativeName: input.nativeName.trim() } : {}),
      ...(input.direction ? { direction: input.direction === "rtl" ? "rtl" : "ltr" } : {}),
    },
  });

  await saveTranslationEntries(language.id, normalizeEntries(input.translations));
  await saveEnglishEntries(normalizeEntries(input.englishTranslations));
  return getTranslationBundle(code);
}

export async function deleteTranslationLanguage(code: string) {
  validateLanguageCode(code);
  if (code === "en" || code === "bn") {
    throw new AppError("Built-in languages cannot be deleted", 400);
  }
  await db.translationLanguage.delete({ where: { code } });
  return { deleted: true };
}
