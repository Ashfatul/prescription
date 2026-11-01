"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth/auth-context";

export type AccentColor = "teal" | "blue" | "indigo" | "rose" | "slate";

const ACCENTS: { id: AccentColor; name: string; color: string; ring: string }[] = [
  { id: "teal", name: "Teal (Default)", color: "#0f766e", ring: "ring-teal-500" },
  { id: "blue", name: "Sapphire Blue", color: "#2563eb", ring: "ring-blue-500" },
  { id: "indigo", name: "Indigo", color: "#4f46e5", ring: "ring-indigo-500" },
  { id: "rose", name: "Rose", color: "#e11d48", ring: "ring-rose-500" },
  { id: "slate", name: "Slate", color: "#475569", ring: "ring-slate-500" },
];

const emptySubscribe = () => () => {};

function setClientCookie(name: string, value: string) {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

function updateAccentDom(newAccent: AccentColor) {
  if (typeof document === "undefined") return;
  if (newAccent === "teal") {
    document.documentElement.removeAttribute("data-accent");
  } else {
    document.documentElement.setAttribute("data-accent", newAccent);
  }
}

export interface ThemeCustomizerProps {
  compact?: boolean;
  direction?: "up" | "down" | "auto";
  align?: "left" | "right" | "auto";
}

export function ThemeCustomizer({
  compact = false,
  direction = "auto",
  align = "auto",
}: ThemeCustomizerProps) {
  const { theme, setTheme } = useTheme();
  const { user, updatePreferences } = useAuth();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const [accent, setAccent] = useState<AccentColor>(() => {
    if (typeof window === "undefined") return "teal";
    return (
      (document.documentElement.getAttribute("data-accent") as AccentColor) ||
      (localStorage.getItem("ppms-accent") as AccentColor) ||
      "teal"
    );
  });
  const [prevUserAccent, setPrevUserAccent] = useState(user?.accent);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [resolvedDir, setResolvedDir] = useState<"up" | "down">(
    direction === "up" ? "up" : "down"
  );
  const [resolvedAlign, setResolvedAlign] = useState<"left" | "right">(
    align === "left" ? "left" : "right"
  );

  const activeDir = direction !== "auto" ? direction : resolvedDir;
  const activeAlign = align !== "auto" ? align : resolvedAlign;

  const calculatePosition = () => {
    if (direction === "auto" && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setResolvedDir(spaceBelow < 280 ? "up" : "down");
    }
    if (align === "auto" && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.left;
      setResolvedAlign(spaceRight < 270 ? "right" : "left");
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Click outside listener (desktop mousedown and mobile touchstart)
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Sync if user preferences change from auth context without effect setState
  if (user?.accent && user.accent !== prevUserAccent) {
    setPrevUserAccent(user.accent);
    setAccent(user.accent as AccentColor);
  }

  // Listen to cross-component or cross-tab theme changes
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ accent?: string; theme?: string }>).detail;
      if (detail?.accent) {
        setAccent(detail.accent as AccentColor);
      }
    };
    window.addEventListener("ppms_theme_changed", handler);
    return () => window.removeEventListener("ppms_theme_changed", handler);
  }, []);

  const handleAccentChange = (newAccent: AccentColor) => {
    setAccent(newAccent);
    localStorage.setItem("ppms-accent", newAccent);
    setClientCookie("ppms_accent", newAccent);
    updateAccentDom(newAccent);

    if (user) {
      void updatePreferences({ accent: newAccent });
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    setClientCookie("ppms_theme", newTheme);

    if (user) {
      void updatePreferences({ theme: newTheme });
    }
  };

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  if (compact) {
    return (
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={handleToggle}
          title="Theme & Accent Settings"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
        >
          <span
            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: ACCENTS.find((a) => a.id === accent)?.color || "#0f766e" }}
          />
          <span className="capitalize hidden sm:inline">{theme === "system" ? "System" : theme}</span>
          <svg
            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
              activeDir === "up"
                ? isOpen ? "rotate-0" : "rotate-180"
                : isOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            className={`absolute z-50 w-64 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-3 ${
              activeDir === "up" ? "bottom-full mb-2" : "top-full mt-2"
            } ${
              activeAlign === "left" ? "left-0" : "right-0"
            }`}
          >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Appearance Mode
                </p>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  {(["light", "dark", "system"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleThemeChange(m)}
                      className={`py-1 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                        theme === m
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Accent Color
                </p>
                <div className="flex items-center justify-between gap-1.5 pt-0.5">
                  {ACCENTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAccentChange(item.id)}
                      title={item.name}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center cursor-pointer ${
                        accent === item.id ? "scale-110 ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: item.color }}
                    >
                      {accent === item.id && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Workspace Appearance</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Personalize contrast & accent palette</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
            Interface Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "light", label: "Light", icon: "☀️" },
              { id: "dark", label: "Dark", icon: "🌙" },
              { id: "system", label: "System", icon: "💻" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleThemeChange(m.id as "light" | "dark" | "system")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  theme === m.id
                    ? "border-[var(--brand-primary)] bg-[var(--brand-surface)] text-[var(--brand-text)] font-semibold shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
            Primary Accent Palette
          </label>
          <div className="grid grid-cols-5 gap-2">
            {ACCENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAccentChange(item.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                  accent === item.id
                    ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/80 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 capitalize truncate max-w-full">
                  {item.id}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
