"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className="rounded-lg border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      type="button"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
