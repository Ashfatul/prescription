"use client";

import { createContext, useContext, useEffect } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { AuthProvider, AuthUser } from "@/lib/auth/auth-context";
import { PwaRegister } from "@/components/common/pwa-register";
import { ToastProvider } from "@/components/common/toast-provider";

export interface PublicSiteSettings {
  hospitalName: string;
  hospitalTagline?: string;
  supportEmail: string;
}

const SiteSettingsContext = createContext<PublicSiteSettings>({
  hospitalName: "",
  hospitalTagline: "",
  supportEmail: "support@ppms.local",
});

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

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
  initialSiteSettings,
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
  initialAccent?: string;
  initialTheme?: string;
  initialSiteSettings?: PublicSiteSettings;
}) {
  const siteSettings: PublicSiteSettings = initialSiteSettings || {
    hospitalName: "",
    hospitalTagline: "",
    supportEmail: "support@ppms.local",
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={initialTheme}
      enableSystem
      disableTransitionOnChange
    >
      <SiteSettingsContext.Provider value={siteSettings}>
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
      </SiteSettingsContext.Provider>
    </ThemeProvider>
  );
}
