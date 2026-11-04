"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { 
  Calendar, 
  Menu, 
  X, 
  Mail,
  LayoutDashboard, 
  LogOut, 
  Sparkles, 
  Stethoscope, 
  HelpCircle, 
  LogIn, 
  ChevronDown, 
  ClipboardList, 
  CreditCard, 
  UserPlus, 
  ArrowRight, 
  ShieldCheck, 
  Tv,
  Building2,
  Users,
  Layers,
} from "lucide-react";
import { LanguageToggle } from "@/components/common/language-toggle";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth/auth-context";

interface SimpleSettings {
  supportEmail?: string;
  hospitalName?: string;
}

const emptySubscribe = () => () => {};

export function Header({ loggedIn }: { loggedIn?: boolean }) {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { user, logout, loading } = useAuth();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  
  const [settings, setSettings] = useState<SimpleSettings>({
    supportEmail: "support@ppms.local",
    hospitalName: "CareFlow OS",
  });

  const isLoggedIn = loggedIn !== undefined ? loggedIn : !!user;

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.data) {
          setSettings({
            supportEmail: data.data.supportEmail || "support@ppms.local",
            hospitalName: data.data.hospitalName || "CareFlow OS",
          });
        }
      })
      .catch(() => {
        // Fallback to default
      });
  }, []);

  // Smooth Menu Controllers
  const closeMenu = (callback?: () => void) => {
    setIsClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setIsClosing(false);
      callback?.();
    }, 200); // 200ms smooth fade/scale transition
  };

  const openMenu = () => {
    setIsClosing(false);
    setMenuOpen(true);
  };

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  // Close menu automatically on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setIsClosing(false);
  }

  // Smooth In-Page & Inter-Page Navigation Handler
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#") || href.startsWith("#")) {
      const targetId = href.replace(/^\/?#/, "");
      if (pathname === "/") {
        e.preventDefault();
        closeMenu(() => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            window.history.pushState(null, "", `#${targetId}`);
          }
        });
        return;
      }
    }
    closeMenu();
  };

  // Handle hash scrolling on page mount or route change
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const elem = document.getElementById(id);
      if (elem) {
        setTimeout(() => {
          elem.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    }
  }, [pathname]);

  // Handle escape key and lock body scroll when full-screen menu is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen && !isClosing) {
        closeMenu();
      }
    };
    if (menuOpen && !isClosing) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, isClosing]);

  const onLogout = async () => {
    await logout();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md transition-all shadow-2xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3 flex-nowrap min-w-0">
            
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 overflow-hidden rounded-2xl shadow-sm ring-2 ring-[var(--brand-border)]/50 group-hover:scale-105 transition-all shrink-0">
                  <Image src="/icons/icon.svg" alt="CareFlow OS" fill sizes="40px" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base sm:text-lg whitespace-nowrap">
                      {settings.hospitalName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] font-bold text-[9px] sm:text-[10px] tracking-wider uppercase border border-[var(--brand-border)]/60">
                      Clinic Operations Platform
                    </span>
                  </div>
                  <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                    Prescription Suite
                  </span>
                </div>
              </Link>
              {/* Center: Streamlined Menu Button - Triggers Directory Takeover */}
              <div className="flex items-center">
                {/* Modern "Menu" Button with Icon - Triggers Full-Screen Menu */}
                <button
                  type="button"
                  onClick={toggleMenu}
                  className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all border shadow-2xs cursor-pointer group ${
                    menuOpen && !isClosing
                      ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm"
                      : "bg-[var(--bg-subtle)] hover:bg-[var(--brand-surface)] text-slate-800 dark:text-slate-200 hover:text-[var(--brand-text)] border-[var(--border-subtle)] hover:border-[var(--brand-border)]"
                  }`}
                  aria-label="Toggle navigation directory menu"
                  aria-expanded={menuOpen && !isClosing}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                    menuOpen && !isClosing ? "bg-white/20 text-white" : "bg-[var(--brand-surface)] text-[var(--brand-text)]"
                  }`}>
                    {menuOpen && !isClosing ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
                  </div>
                  <span className="tracking-tight">{t.menu}</span>
                  <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${menuOpen && !isClosing ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>


            {/* Right: Controls & User Authentication */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Customizers: Theme & Language */}
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <ThemeCustomizer compact />
                <LanguageToggle />
              </div>

              {/* Authenticated User Status */}
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
                      className="flex items-center gap-1 rounded-xl border border-[var(--border-default)] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[var(--bg-subtle)] transition-all cursor-pointer whitespace-nowrap"
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
                      <span className="hidden sm:inline">{t.bookAppointment}</span>
                      <span className="sm:hidden">{t.bookNow}</span>
                    </Link>
                  </div>
                )
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MODERN FULL-SCREEN MENU TAKEOVER (Rendered directly via React Portal)     */}
      {/* ========================================================================= */}
      {mounted && menuOpen && createPortal(
        <div 
          className={`fixed inset-0 z-[99999] w-screen h-screen bg-[var(--bg-app)]/98 backdrop-blur-2xl flex flex-col justify-between overflow-y-auto transition-all duration-200 ease-out ${
            isClosing 
              ? "opacity-0 scale-[0.98] pointer-events-none" 
              : "opacity-100 scale-100 animate-in fade-in duration-200"
          }`}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className={`pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(15,118,110,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(20,184,166,0.18),transparent)] transition-opacity duration-200 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`} />

          {/* Full-Screen Menu Topbar */}
          <div className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-md sticky top-0 z-10 shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
              
              {/* Brand Logo */}
              <Link 
                href="/" 
                onClick={(e) => handleNavClick(e, "/")}
                className="flex items-center gap-2.5 group cursor-pointer"
              >
                <div className="relative w-10 h-10 overflow-hidden rounded-2xl shadow-sm ring-2 ring-[var(--brand-border)]/50 group-hover:scale-105 transition-all">
                  <Image src="/icons/icon.svg" alt="CareFlow OS" fill sizes="40px" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black tracking-tight text-slate-900 dark:text-white text-lg">
                    {settings.hospitalName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Navigation Directory
                  </span>
                </div>
              </Link>

              {/* Close Button with Keyboard Shortcut Badge */}
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-[var(--bg-subtle)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
                  <span>{t.pressEscToClose}</span>
                </span>

                <button
                  type="button"
                  onClick={() => closeMenu()}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--bg-subtle)] hover:bg-[var(--brand-surface)] text-slate-700 dark:text-slate-200 hover:text-[var(--brand-text)] border border-[var(--border-subtle)] hover:border-[var(--brand-border)] font-bold text-xs transition cursor-pointer shadow-xs"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.close}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Full-Screen Menu Body: Modern 3-Column Structured Layout */}
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 relative z-1">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Column 1: Clinical Directory & Care (4 Clean Items) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-subtle)]">
                  <div className="w-8 h-8 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                      {t.clinicalChambersCare}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {t.directoryOfClinicsDesc}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Link
                    href="/clinics"
                    onClick={(e) => handleNavClick(e, "/clinics")}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)]/60 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-all group flex items-start gap-3.5 shadow-2xs block"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[var(--brand-text)] flex items-center gap-1.5">
                          <span>{t.clinics}</span>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]">
                            {t.all}
                          </span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[var(--brand-text)] transition-transform" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.browseAllClinicsDesc}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/doctors"
                    onClick={(e) => handleNavClick(e, "/doctors")}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)]/60 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-all group flex items-start gap-3.5 shadow-2xs block"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] text-[var(--brand-primary)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[var(--brand-text)]">
                          {t.doctors}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[var(--brand-text)] transition-transform" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.browseAllDoctorsDesc}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/staff"
                    onClick={(e) => handleNavClick(e, "/staff")}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)]/60 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-all group flex items-start gap-3.5 shadow-2xs block"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[var(--brand-text)] flex items-center gap-1.5">
                          <span>{t.staff}</span>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]">
                            Team
                          </span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[var(--brand-text)] transition-transform" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.browseAllStaffDesc}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/live-queue"
                    onClick={(e) => handleNavClick(e, "/live-queue")}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)]/60 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-all group flex items-start gap-3.5 shadow-2xs block"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-primary)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <Tv className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[var(--brand-text)] flex items-center gap-1.5">
                          <span>{t.liveTvDisplay}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[var(--brand-text)] transition-transform" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.liveTvCallingDesc}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Column 2: SaaS Platform & Prescribing Suite (4 Clean Items) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-subtle)]">
                  <div className="w-8 h-8 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                      {t.saasPlatformEngine}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {t.prescriptionArchitectureDesc}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Link
                    href="/#features"
                    onClick={(e) => handleNavClick(e, "/#features")}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)]/60 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-all group flex items-start gap-3.5 shadow-2xs block cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] text-[var(--brand-primary)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[var(--brand-text)]">
                          {t.prescriptionCapabilities}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[var(--brand-text)] transition-transform" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.drugFormularyCapabilitiesDesc}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/#pricing"
                    onClick={(e) => handleNavClick(e, "/#pricing")}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)]/60 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-all group flex items-start gap-3.5 shadow-2xs block cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] text-[var(--brand-primary)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[var(--brand-text)]">
                          {t.pricingPlans}
                        </span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Plans
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.pricingPlansNavDesc}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/#how-it-works"
                    onClick={(e) => handleNavClick(e, "/#how-it-works")}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)]/60 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-all group flex items-start gap-3.5 shadow-2xs block cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] text-[var(--brand-primary)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[var(--brand-text)]">
                          {t.stepByStepPrescribing}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[var(--brand-text)] transition-transform" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.zeroRedundancyWorkflowDesc}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/templates"
                    onClick={(e) => handleNavClick(e, "/dashboard/templates")}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)]/60 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-all group flex items-start gap-3.5 shadow-2xs block cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] text-[var(--brand-primary)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[var(--brand-text)]">
                          {t.templateStudioNav}
                        </span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          Design
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.customInsigniaLetterheadDesc}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Column 3: Portals, Access & Support (4 Clean Items) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-subtle)]">
                  <div className="w-8 h-8 rounded-xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                      {t.portalsAccessSupport}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {t.patientMedicalAccountsDesc}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Link
                    href="/auth/login"
                    onClick={(e) => handleNavClick(e, "/auth/login")}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)]/60 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-all group flex items-start gap-3.5 shadow-2xs block"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] text-[var(--brand-primary)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <LogIn className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[var(--brand-text)]">
                          {t.signIn}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[var(--brand-text)] transition-transform" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.secureAuthStaffDesc}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/staff"
                    onClick={(e) => handleNavClick(e, "/dashboard/staff")}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)]/60 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-all group flex items-start gap-3.5 shadow-2xs block"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] text-[var(--brand-primary)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[var(--brand-text)]">
                          {t.receptionDesk}
                        </span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                          {t.roleStaff}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.queueCheckinTriageDesc}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/auth/register"
                    onClick={(e) => handleNavClick(e, "/auth/register")}
                    className="p-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--brand-surface)]/60 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-all group flex items-start gap-3.5 shadow-2xs block"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] text-[var(--brand-primary)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[var(--brand-text)]">
                          {t.createAccount}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[var(--brand-text)] transition-transform" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.createFreePatientAccountDesc}
                      </p>
                    </div>
                  </Link>

                  {/* Platform support contact */}
                  <a
                    href={`mailto:${settings.supportEmail}`}
                    className="p-4 rounded-2xl bg-[var(--brand-surface)]/60 hover:bg-[var(--brand-surface)] border border-[var(--brand-border)] transition-all group flex items-start gap-3.5 shadow-2xs block"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] text-[var(--brand-primary)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[var(--brand-text)] transition-colors">
                          {t("uiPlatformSupport", "Platform support")}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[var(--brand-primary)] text-white shrink-0 shadow-2xs">
                          {settings.supportEmail}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t("uiReportIssuesSuggestionsFeatureRequests", "Report product issues, suggestions, security concerns, or feature requests.")}
                      </p>
                    </div>
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Full-Screen Menu Bottom Bar */}
          <div className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-md shrink-0 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">{t.systemPreferences}</span>
                <ThemeCustomizer compact direction="up" align="left" />
                <LanguageToggle />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <Link 
                  href="/terms" 
                  onClick={(e) => handleNavClick(e, "/terms")}
                  className="hover:text-[var(--brand-text)] transition"
                >
                  {t.termsOfService}
                </Link>
                <span>•</span>
                <Link 
                  href="/privacy" 
                  onClick={(e) => handleNavClick(e, "/privacy")}
                  className="hover:text-[var(--brand-text)] transition"
                >
                  {t.privacyPolicy}
                </Link>
                <span>•</span>
                <Link 
                  href="/disclaimer" 
                  onClick={(e) => handleNavClick(e, "/disclaimer")}
                  className="hover:text-[var(--brand-text)] transition"
                >
                  {t.medicalDisclaimer}
                </Link>
              </div>

              <div>
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={(e) => handleNavClick(e, "/dashboard")}
                    className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition inline-flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{t("uiGoToDashboard")}</span>
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={(e) => handleNavClick(e, "/auth/login")}
                    className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition inline-flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t("uiSignInToEMR")}</span>
                  </Link>
                )}
              </div>

            </div>
          </div>

        </div>,
        document.body
      )}
    </>
  );
}
