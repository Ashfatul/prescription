"use client";

import { useEffect } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { AuthProvider, AuthUser } from "@/lib/auth/auth-context";
import { PwaRegister } from "@/components/common/pwa-register";
import { ToastProvider } from "@/components/common/toast-provider";

// Suppress React 19 false-positive warning for theme scripts
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    originalError.apply(console, args);
  };
}

function AccentSync({ initialAccent }: { initialAccent?: string }) {
  useEffect(() => {
    const saved = localStorage.getItem("ppms-accent") || initialAccent;
    const currentAttr = document.documentElement.getAttribute("data-accent");

    if (saved && saved !== "teal") {
      if (currentAttr !== saved) {
        document.documentElement.setAttribute("data-accent", saved);
      }
    } else {
      if (currentAttr) {
        document.documentElement.removeAttribute("data-accent");
      }
    }
  }, [initialAccent]);

  return null;
}

function ThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const detail = (event as CustomEvent<{ theme?: string }>).detail;
      if (detail?.theme) {
        setTheme(detail.theme);
      }
    };

    window.addEventListener("ppms_theme_changed", handleThemeChange);
    return () => window.removeEventListener("ppms_theme_changed", handleThemeChange);
  }, [setTheme]);

  return null;
}

export function Providers({
  children,
  initialUser,
  initialAccent,
  initialTheme = "system",
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
  initialAccent?: string;
  initialTheme?: string;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={initialTheme}
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider initialUser={initialUser}>
            <AccentSync initialAccent={initialAccent} />
            <ThemeSync />
            <PwaRegister />
            {children}
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
