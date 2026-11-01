"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Activity, 
  Calendar, 
  Menu, 
  X, 
  PhoneCall, 
  LayoutDashboard, 
  LogOut, 
  Sparkles,
  Stethoscope,
  HelpCircle,
  LogIn
} from "lucide-react";
import { LanguageToggle } from "@/components/common/language-toggle";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";

interface SimpleSettings {
  emergencyHotline?: string;
  emergencyStatus?: string;
  hospitalName?: string;
}

export function Header({ loggedIn }: { loggedIn?: boolean }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SimpleSettings>({
    emergencyHotline: "10678",
    emergencyStatus: "OPD 24/7 Active",
    hospitalName: "PPMS Clinical",
  });

  const isLoggedIn = loggedIn !== undefined ? loggedIn : !!user;

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.data) {
          setSettings({
            emergencyHotline: data.data.emergencyHotline || "10678",
            emergencyStatus: data.data.emergencyStatus || "OPD 24/7 Active",
            hospitalName: data.data.hospitalName || "PPMS Clinical",
          });
        }
      })
      .catch(() => {
        // Fallback to default
      });
  }, []);

  const onLogout = async () => {
    await logout();
  };

  const navLinks = [
    { label: "Doctors", href: "/doctors", icon: Stethoscope },
    { label: "Features", href: "/#features", icon: Sparkles },
    { label: "How It Works", href: "/#how-it-works", icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-md transition-all shadow-2xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4 flex-nowrap min-w-0">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-hover)] text-white flex items-center justify-center font-black text-sm sm:text-base shadow-sm ring-2 ring-[var(--brand-border)]/50 group-hover:scale-105 transition-all shrink-0">
                <span>Rx</span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base sm:text-lg whitespace-nowrap">
                    PPMS
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] font-bold text-[9px] sm:text-[10px] tracking-wider uppercase border border-[var(--brand-border)]/60">
                    Clinical
                  </span>
                </div>
                <span className="hidden xl:inline-block text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                  Prescription Suite
                </span>
              </div>
            </Link>

            {/* Dynamic Active Chamber Pill (Visible on 2xl) */}
            <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold whitespace-nowrap">
              <Activity className="w-3 h-3 animate-pulse shrink-0" />
              <span>{settings.emergencyStatus}</span>
            </div>
          </div>

          {/* Center: Streamlined Desktop Navigation (Only 3 concise links) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-[var(--brand-surface)] text-[var(--brand-text)] font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:text-[var(--brand-text)] hover:bg-[var(--brand-surface)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-70 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Controls & User State (No overflow or wrapping) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Dynamic Emergency Hotline (Visible on xl+) */}
            <a
              href={`tel:${settings.emergencyHotline}`}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-[var(--brand-border)] transition-all shrink-0"
              title="Hospital Emergency Hotline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="whitespace-nowrap">Hotline: <strong>{settings.emergencyHotline}</strong></span>
            </a>

            {/* Compact Customizers */}
            <div className="flex items-center gap-1 shrink-0">
              <ThemeCustomizer compact />
              <LanguageToggle />
            </div>

            {/* Authenticated User Pill */}
            {user && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs shrink-0 max-w-[150px]">
                <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user.name.split(" ")[0]}
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--brand-surface)] text-[var(--brand-text)] shrink-0">
                  {user.role}
                </span>
              </div>
            )}

            {/* Actions: Logged In vs Logged Out */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--brand-primary)] px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white shadow-xs hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
                  href="/dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t.dashboard}</span>
                </Link>
                <button
                  className="rounded-xl border border-[var(--border-subtle)] p-1.5 sm:p-2 text-slate-600 dark:text-slate-400 hover:bg-[var(--bg-subtle)] hover:text-rose-500 transition-all cursor-pointer shrink-0"
                  onClick={onLogout}
                  type="button"
                  title={t.logout}
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              !loading && pathname !== "/auth/login" && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    className="flex items-center gap-1 rounded-xl border border-[var(--border-default)] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[var(--bg-subtle)] transition-all cursor-pointer whitespace-nowrap"
                    href="/auth/login"
                  >
                    <LogIn className="w-3.5 h-3.5 sm:hidden" />
                    <span className="hidden sm:inline">{t.login}</span>
                  </Link>
                  <Link
                    href="/doctors"
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--brand-primary)] px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white shadow-xs hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">Book Consultation</span>
                    <span className="sm:hidden">Doctors</span>
                  </Link>
                </div>
              )
            )}

            {/* Mobile Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-slate-700 dark:text-slate-300 hover:bg-[var(--bg-subtle)] transition-all shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="grid gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-[var(--brand-surface)] text-[var(--brand-text)] font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-70" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <Link
              href="/dashboard/staff"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-[var(--bg-subtle)] transition-all"
            >
              <span>Reception & Triage Desk</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
            <a
              href={`tel:${settings.emergencyHotline}`}
              className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Hotline: {settings.emergencyHotline}</span>
            </a>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{settings.emergencyStatus}</span>
            </div>
          </div>

          {!isLoggedIn && (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-[var(--border-default)] text-slate-800 dark:text-slate-200"
              >
                {t.login}
              </Link>
              <Link
                href="/doctors"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-[var(--brand-primary)] text-white shadow-xs"
              >
                Browse All Doctors & Chambers
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
