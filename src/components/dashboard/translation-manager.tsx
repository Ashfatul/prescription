"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Languages, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import { useLanguage, LanguageOption } from "@/lib/i18n/language-context";

type TranslationResponse = {
  languages: LanguageOption[];
  englishKeys: string[];
  englishTranslations: Record<string, string>;
  overrides: Record<string, string>;
  translations: Record<string, string>;
};

const translationFieldClassName =
  "rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)]";

export function TranslationManager() {
  const { t, refreshTranslations, translationsLoading } = useLanguage();
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [englishKeys, setEnglishKeys] = useState<string[]>([]);
  const [englishValues, setEnglishValues] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [selectedCode, setSelectedCode] = useState("en");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customEnglishValues, setCustomEnglishValues] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState({ key: "", english: "", translation: "" });
  const [newLanguage, setNewLanguage] = useState({ code: "", name: "", nativeName: "", direction: "ltr" });

  const loadBundle = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/i18n?language=${encodeURIComponent(code)}`, { cache: "no-store" });
      const payload = (await response.json()) as { success?: boolean; data?: TranslationResponse; message?: string };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message || t.translationSaveError);
      }
      setLanguages(payload.data.languages);
      setEnglishKeys(payload.data.englishKeys);
      setEnglishValues(payload.data.englishTranslations);
      const selectedLanguage = payload.data.languages.find((item) => item.code === code);
      setValues(selectedLanguage?.isSystem ? payload.data.translations : payload.data.overrides);
      setCustomEnglishValues({});
    } catch (err) {
      setError(err instanceof Error ? err.message : t.translationSaveError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Loading a selected locale is an external synchronization effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadBundle(selectedCode);
    // The selected language is intentionally the only request dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCode]);

  const filteredKeys = useMemo(() => {
    const query = search.trim().toLowerCase();
    return englishKeys.filter((key) => {
      if (!query) return true;
      return key.toLowerCase().includes(query) || (englishValues[key] || "").toLowerCase().includes(query);
    });
  }, [englishKeys, englishValues, search]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/i18n/${encodeURIComponent(selectedCode)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          translations: values,
          englishTranslations: selectedCode === "en" ? values : customEnglishValues,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || t.translationSaveError);
      if (selectedCode === "en") setEnglishValues(values);
      setMessage(t.translationsSaved);
      await refreshTranslations();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.translationSaveError);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLanguage = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/i18n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLanguage),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || t.languageCreateError);
      setNewLanguage({ code: "", name: "", nativeName: "", direction: "ltr" });
      setMessage(t.languageCreated);
      setSelectedCode(payload.data.language || newLanguage.code.trim());
      await refreshTranslations();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.languageCreateError);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLanguage = async () => {
    if (selectedCode === "en" || selectedCode === "bn") return;
    if (!window.confirm(t.deleteLanguageConfirm)) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/i18n/${encodeURIComponent(selectedCode)}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || t.translationSaveError);
      setSelectedCode("en");
      await refreshTranslations();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.translationSaveError);
    } finally {
      setSaving(false);
    }
  };

  const selectedLanguage = languages.find((item) => item.code === selectedCode);

  const handleAddKey = (event: React.FormEvent) => {
    event.preventDefault();
    const key = newKey.key.trim();
    const english = newKey.english.trim();
    if (!key || !english || englishKeys.includes(key)) return;

    setEnglishKeys((current) => [...current, key].sort());
    setEnglishValues((current) => ({ ...current, [key]: english }));
    setCustomEnglishValues((current) => ({ ...current, [key]: english }));
    setValues((current) => ({ ...current, [key]: newKey.translation.trim() }));
    setNewKey({ key: "", english: "", translation: "" });
    setMessage(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)]">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">{t.languageManagement}</h1>
              <p className="mt-1 max-w-2xl text-xs text-[var(--text-secondary)]">{t.languageManagementDescription}</p>
            </div>
          </div>
          {selectedLanguage && (
            <span className="rounded-full bg-[var(--brand-surface)] px-3 py-1 text-[10px] font-bold text-[var(--brand-text)]">
              {selectedLanguage.isSystem ? t.builtInLanguage : t.customLanguage}
            </span>
          )}
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> {message}
        </div>
      )}
      {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t.translationLanguage}</label>
            <div className="space-y-2">
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setSelectedCode(item.code)}
                  className={`flex min-h-12 w-full items-center justify-between rounded-2xl border px-4 text-left transition ${selectedCode === item.code ? "border-[var(--brand-primary)] bg-[var(--brand-surface)]" : "border-[var(--border-subtle)] hover:border-[var(--brand-border)]"}`}
                >
                  <span>
                    <span className="block text-sm font-bold text-[var(--text-primary)]">{item.nativeName}</span>
                    <span className="block text-[11px] text-[var(--text-muted)]">{item.name} · {item.code}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--text-muted)]">{item.translationCount || 0}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateLanguage} className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">{t.createLanguage}</h2>
            <input value={newLanguage.code} onChange={(event) => setNewLanguage((current) => ({ ...current, code: event.target.value }))} placeholder={t.languageCodePlaceholder} className={`w-full ${translationFieldClassName}`} required pattern="[a-z]{2,8}(-[A-Z]{2})?" />
            <input value={newLanguage.name} onChange={(event) => setNewLanguage((current) => ({ ...current, name: event.target.value }))} placeholder={t.languageName} className={`w-full ${translationFieldClassName}`} required />
            <input value={newLanguage.nativeName} onChange={(event) => setNewLanguage((current) => ({ ...current, nativeName: event.target.value }))} placeholder={t.nativeLanguageName} className={`w-full ${translationFieldClassName}`} />
            <CustomSelect
              label={t.textDirection}
              value={newLanguage.direction}
              onChange={(value) => setNewLanguage((current) => ({ ...current, direction: value }))}
              options={[{ value: "ltr", label: t.leftToRight }, { value: "rtl", label: t.rightToLeft }]}
              searchable={false}
              allowClear={false}
            />
            <button type="submit" disabled={saving} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-primary)] px-4 text-xs font-bold text-white disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t.createLanguage}
            </button>
          </form>
        </aside>

        <section className="min-w-0 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{selectedLanguage?.nativeName || selectedCode}</h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{t.translationFallbackNotice}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.searchTranslationKeys} className={`min-w-[220px] ${translationFieldClassName}`} />
              <button type="button" onClick={() => void handleSave()} disabled={saving || loading || translationsLoading} className="flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--brand-primary)] px-4 text-xs font-bold text-white disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t.saveTranslations}
              </button>
              {selectedLanguage && !selectedLanguage.isSystem && (
                <button type="button" onClick={() => void handleDeleteLanguage()} disabled={saving} className="flex min-h-11 items-center gap-2 rounded-2xl border border-rose-500/30 px-4 text-xs font-bold text-rose-600 disabled:opacity-50">
                  <Trash2 className="h-4 w-4" /> {t.deleteLanguage}
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleAddKey} className="mb-5 grid gap-2 rounded-2xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 lg:grid-cols-[1.1fr_1fr_1fr_auto] lg:items-end">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{t.translationKey}</label>
              <input value={newKey.key} onChange={(event) => setNewKey((current) => ({ ...current, key: event.target.value }))} placeholder={t.newKeyPlaceholder} className={`w-full ${translationFieldClassName}`} pattern="[A-Za-z0-9_.-]+" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{t.englishText}</label>
              <input value={newKey.english} onChange={(event) => setNewKey((current) => ({ ...current, english: event.target.value }))} placeholder={t.englishSource} className={`w-full ${translationFieldClassName}`} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{t.translationText}</label>
              <input value={newKey.translation} onChange={(event) => setNewKey((current) => ({ ...current, translation: event.target.value }))} placeholder={selectedLanguage?.nativeName || t.translationValue} className={`w-full ${translationFieldClassName}`} />
            </div>
            <button type="submit" className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--brand-primary)] px-4 text-xs font-bold text-[var(--brand-text)] hover:bg-[var(--brand-primary)] hover:text-white">
              <Plus className="h-4 w-4" /> {t.addKey}
            </button>
          </form>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-2 text-xs text-[var(--text-muted)]"><Loader2 className="h-4 w-4 animate-spin" /> {t.loadingTranslations}</div>
          ) : filteredKeys.length === 0 ? (
            <div className="py-16 text-center text-xs text-[var(--text-muted)]">{t.noTranslationKeys}</div>
          ) : (
            <div className="space-y-3">
              {filteredKeys.map((key) => (
                <div key={key} className="grid gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4 lg:grid-cols-[180px_1fr_1fr]">
                  <div className="min-w-0">
                    <code className="break-words text-[11px] font-bold text-[var(--brand-text)]">{key}</code>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{t.englishSource}</label>
                    <p className="min-h-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-3 text-xs text-[var(--text-secondary)]">{englishValues[key] || key}</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{t.translationValue}</label>
                    <textarea
                      value={values[key] || ""}
                      onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                      rows={2}
                      className={`w-full resize-y ${translationFieldClassName} px-3 py-2 text-xs`}
                      aria-label={`${selectedLanguage?.nativeName || selectedCode}: ${key}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
