"use client";

import { useTheme } from "next-themes";
import { useLanguage } from "@/lib/i18n/language-context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t, language } = useLanguage();

  return (
    <button
      className="rounded-lg border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      type="button"
      aria-label={t("uiToggleTheme")}
    >
      {theme === "dark"
        ? (t("uiLight2"))
        : (t("uiDark2"))}
    </button>
  );
}
