"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n/language-context";

function AccentSync() {
  useEffect(() => {
    const saved = localStorage.getItem("ppms-accent");
    if (saved && saved !== "teal") {
      document.documentElement.setAttribute("data-accent", saved);
    } else {
      document.documentElement.removeAttribute("data-accent");
    }
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <AccentSync />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}

