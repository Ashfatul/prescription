"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
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
    const { t } = useLanguage();
    const { user, logout, loading } = useAuth();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [exploreOpen, setExploreOpen] = useState(false);
    const exploreRef = useRef<HTMLDivElement>(null);

    const mounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    );

    const [settings, setSettings] = useState<SimpleSettings>({
        supportEmail: "support@ppms.local",
        hospitalName: "",
    });

    const isLoggedIn = loggedIn !== undefined ? loggedIn : !!user;

    useEffect(() => {
        fetch("/api/settings")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.success && data?.data) {
                    setSettings({
                        supportEmail:
                            data.data.supportEmail || "support@ppms.local",
                        hospitalName: data.data.hospitalName || "",
                    });
                }
            })
            .catch(() => {
                // Fallback to default
            });
    }, []);

    // Close menus automatically on route change
    const [prevPathname, setPrevPathname] = useState(pathname);
    if (prevPathname !== pathname) {
        setPrevPathname(pathname);
        setMobileMenuOpen(false);
        setExploreOpen(false);
    }

    // Close Explore popover on outside click or Escape
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                exploreRef.current &&
                !exploreRef.current.contains(e.target as Node)
            ) {
                setExploreOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setExploreOpen(false);
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileMenuOpen]);

    // Smooth In-Page & Inter-Page Navigation Handler
    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        setExploreOpen(false);
        setMobileMenuOpen(false);

        if (href.startsWith("/#") || href.startsWith("#")) {
            const targetId = href.replace(/^\/?#/, "");
            if (pathname === "/") {
                e.preventDefault();
                setTimeout(() => {
                    const element = document.getElementById(targetId);
                    if (element) {
                        element.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });
                        window.history.pushState(null, "", `#${targetId}`);
                    }
                }, 40);
                return;
            }
        }
    };

    // Handle hash scrolling on mount or route change
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

    const onLogout = async () => {
        await logout();
    };

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    const primaryLinks = [
        { href: "/clinics", label: t.clinics },
        { href: "/doctors", label: t.doctors },
        { href: "/live-queue", label: t.liveQueue, live: true },
        { href: "/#features", label: t.navFeatures },
        { href: "/#how-it-works", label: t.navWorkflow },
        { href: "/#pricing", label: t.navPricing },
    ];

    const exploreLinks = [
        {
            href: "/staff",
            title: t.staff,
            desc: t.browseAllStaffDesc,
            icon: Users,
            badge: t.teamBadge,
        },
        {
            href: "/dashboard/templates",
            title: t.templateStudioNav,
            desc: t.customInsigniaLetterheadDesc,
            icon: Layers,
            badge: t.designBadge,
        },
        {
            href: "/dashboard/staff",
            title: t.receptionDesk,
            desc: t.queueCheckinTriageDesc,
            icon: ClipboardList,
            badge: t.roleStaff,
        },
        {
            href: "/auth/register",
            title: t.createAccount,
            desc: t.createFreePatientAccountDesc,
            icon: UserPlus,
        },
    ];

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/85 backdrop-blur-xl transition-colors">
                <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Left: Brand Identity */}
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 group shrink-0"
                        >
                            <div className="relative w-9 h-9 overflow-hidden rounded-lg border border-[var(--brand-border)]/70 shadow-2xs group-hover:border-[var(--brand-primary)] transition-colors shrink-0">
                                <Image
                                    src="/icons/icon.svg"
                                    alt={settings.hospitalName || "PPMS"}
                                    fill
                                    sizes="36px"
                                />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="font-extrabold tracking-tight text-[var(--text-primary)] text-sm sm:text-base whitespace-nowrap">
                                    {settings.hospitalName || "PPMS"}
                                </span>
                                <span className="hidden sm:inline-block text-[11px] font-medium text-[var(--text-muted)] mt-0.5 truncate max-w-[160px]">
                                    {t.prescriptionSuiteTag}
                                </span>
                            </div>
                        </Link>

                        {/* Center: Clean Direct Desktop Navigation Rail */}
                        <nav
                            aria-label="Primary navigation"
                            className="hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-lg bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]"
                        >
                            {primaryLinks.map((item) => {
                                const active =
                                    !item.href.includes("#") &&
                                    isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={(e) =>
                                            handleNavClick(e, item.href)
                                        }
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                                            active
                                                ? "bg-[var(--bg-surface)] text-[var(--brand-text)] shadow-2xs border border-[var(--border-subtle)]"
                                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60"
                                        }`}
                                    >
                                        {item.live && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                        )}
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}

                            {/* Compact Anchored Explore Mega-Popover */}
                            <div className="relative" ref={exploreRef}>
                                <button
                                    type="button"
                                    onClick={() => setExploreOpen((v) => !v)}
                                    aria-expanded={exploreOpen}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                        exploreOpen
                                            ? "bg-[var(--brand-surface)] text-[var(--brand-text)]"
                                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60"
                                    }`}
                                >
                                    <span>{t.navMore}</span>
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 transition-transform duration-150 ${
                                            exploreOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {exploreOpen && (
                                    <div className="absolute right-0 mt-3 w-[520px] rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-2xl p-3 z-50">
                                        <div className="grid grid-cols-2 gap-2">
                                            {exploreLinks.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={(e) =>
                                                            handleNavClick(
                                                                e,
                                                                item.href,
                                                            )
                                                        }
                                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-subtle)] transition-colors group"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center shrink-0 mt-0.5">
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-text)] transition-colors truncate">
                                                                    {item.title}
                                                                </span>
                                                                {item.badge && (
                                                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)]">
                                                                        {
                                                                            item.badge
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-0.5 leading-snug">
                                                                {item.desc}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>

                                        {/* Footer Support Bar inside Popover */}
                                        <div className="mt-2 pt-2.5 px-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                                            <a
                                                href={`mailto:${settings.supportEmail}`}
                                                className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--brand-text)] font-medium transition-colors"
                                            >
                                                <Mail className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                                                <span>
                                                    {t(
                                                        "uiPlatformSupport",
                                                        "Platform support",
                                                    )}
                                                    :{" "}
                                                    <strong className="text-[var(--text-primary)]">
                                                        {settings.supportEmail}
                                                    </strong>
                                                </span>
                                            </a>
                                            <Link
                                                href="/live-queue"
                                                onClick={(e) =>
                                                    handleNavClick(
                                                        e,
                                                        "/live-queue",
                                                    )
                                                }
                                                className="inline-flex items-center gap-1 font-semibold text-[var(--brand-text)] hover:underline"
                                            >
                                                <span>{t.liveTvDisplay}</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </nav>

                        {/* Right: Utilities & Authentication */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="hidden sm:flex items-center gap-1">
                                <ThemeCustomizer compact />
                                <LanguageToggle />
                            </div>

                            <div className="hidden sm:block h-5 w-px bg-[var(--border-subtle)] mx-0.5" />

                            {/* Authenticated User Chip */}
                            {user && (
                                <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs max-w-[160px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span className="font-semibold text-[var(--text-primary)] truncate">
                                        {user.name.split(" ")[0]}
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] shrink-0">
                                        {user.role}
                                    </span>
                                </div>
                            )}

                            {isLoggedIn ? (
                                <div className="flex items-center gap-1.5">
                                    <Link
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:opacity-95 transition-opacity whitespace-nowrap"
                                        href="/dashboard"
                                    >
                                        <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                                        <span className="hidden sm:inline">
                                            {t.dashboard}
                                        </span>
                                    </Link>
                                    <button
                                        className="rounded-lg border border-[var(--border-subtle)] p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                                        onClick={onLogout}
                                        type="button"
                                        title={t.logout}
                                        aria-label={t.logout}
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                !loading &&
                                pathname !== "/auth/login" && (
                                    <div className="flex items-center gap-1.5">
                                        <Link
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors whitespace-nowrap"
                                            href="/auth/login"
                                        >
                                            <LogIn className="w-3.5 h-3.5 sm:hidden" />
                                            <span className="hidden sm:inline">
                                                {t.login}
                                            </span>
                                        </Link>
                                        <Link
                                            href="/doctors"
                                            className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:opacity-95 transition-opacity whitespace-nowrap"
                                        >
                                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                                            <span>{t.bookAppointment}</span>
                                        </Link>
                                    </div>
                                )
                            )}

                            {/* Mobile Menu Trigger (< lg) */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen((v) => !v)}
                                aria-label={t.menu}
                                aria-expanded={mobileMenuOpen}
                                className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors cursor-pointer"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-4 h-4" />
                                ) : (
                                    <Menu className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile & Tablet Navigation Drawer */}
            {mounted &&
                mobileMenuOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[9999] lg:hidden flex flex-col bg-[var(--bg-app)]/98 backdrop-blur-xl overflow-y-auto">
                        {/* Drawer Top Bar */}
                        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 sm:px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                            <Link
                                href="/"
                                onClick={(e) => handleNavClick(e, "/")}
                                className="flex items-center gap-2.5"
                            >
                                <div className="relative w-9 h-9 overflow-hidden rounded-lg border border-[var(--brand-border)]">
                                    <Image
                                        src="/icons/icon.svg"
                                        alt={settings.hospitalName || "PPMS"}
                                        fill
                                        sizes="36px"
                                    />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="font-extrabold text-[var(--text-primary)] text-sm">
                                        {settings.hospitalName || "PPMS"}
                                    </span>
                                    <span className="text-[11px] text-[var(--text-muted)] mt-0.5">
                                        {t.navigationDirectory}
                                    </span>
                                </div>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                                <span>{t.close}</span>
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 px-4 sm:px-6 py-6 space-y-6 max-w-2xl mx-auto w-full">
                            {/* Section 1: Clinical Directory */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-[var(--text-muted)] px-1">
                                    {t.clinicalChambersCare}
                                </p>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    <Link
                                        href="/clinics"
                                        onClick={(e) =>
                                            handleNavClick(e, "/clinics")
                                        }
                                        className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-colors"
                                    >
                                        <Building2 className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                                            {t.clinics}
                                        </span>
                                    </Link>
                                    <Link
                                        href="/doctors"
                                        onClick={(e) =>
                                            handleNavClick(e, "/doctors")
                                        }
                                        className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-colors"
                                    >
                                        <Stethoscope className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                                            {t.doctors}
                                        </span>
                                    </Link>
                                    <Link
                                        href="/staff"
                                        onClick={(e) =>
                                            handleNavClick(e, "/staff")
                                        }
                                        className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-colors"
                                    >
                                        <Users className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                                            {t.staff}
                                        </span>
                                    </Link>
                                    <Link
                                        href="/live-queue"
                                        onClick={(e) =>
                                            handleNavClick(e, "/live-queue")
                                        }
                                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-colors"
                                    >
                                        <span className="flex items-center gap-3">
                                            <Tv className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                                            <span className="text-sm font-semibold text-[var(--text-primary)]">
                                                {t.liveTvDisplay}
                                            </span>
                                        </span>
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </Link>
                                </div>
                            </div>

                            {/* Section 2: Platform */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-[var(--text-muted)] px-1">
                                    {t.saasPlatformEngine}
                                </p>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    <Link
                                        href="/#features"
                                        onClick={(e) =>
                                            handleNavClick(e, "/#features")
                                        }
                                        className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                                    >
                                        <Sparkles className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                                            {t.navFeatures}
                                        </span>
                                    </Link>
                                    <Link
                                        href="/#how-it-works"
                                        onClick={(e) =>
                                            handleNavClick(e, "/#how-it-works")
                                        }
                                        className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                                    >
                                        <HelpCircle className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                                            {t.navWorkflow}
                                        </span>
                                    </Link>
                                    <Link
                                        href="/#pricing"
                                        onClick={(e) =>
                                            handleNavClick(e, "/#pricing")
                                        }
                                        className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                                    >
                                        <CreditCard className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                                            {t.pricingPlans}
                                        </span>
                                    </Link>
                                    <Link
                                        href="/dashboard/templates"
                                        onClick={(e) =>
                                            handleNavClick(
                                                e,
                                                "/dashboard/templates",
                                            )
                                        }
                                        className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                                    >
                                        <Layers className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                                            {t.templateStudioNav}
                                        </span>
                                    </Link>
                                </div>
                            </div>

                            {/* Preferences & Support */}
                            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                                        {t.systemPreferences}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <ThemeCustomizer
                                            compact
                                            direction="up"
                                            align="right"
                                        />
                                        <LanguageToggle />
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row gap-2">
                                    {isLoggedIn ? (
                                        <Link
                                            href="/dashboard"
                                            onClick={(e) =>
                                                handleNavClick(e, "/dashboard")
                                            }
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-semibold"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            <span>{t("uiGoToDashboard")}</span>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href="/auth/login"
                                                onClick={(e) =>
                                                    handleNavClick(
                                                        e,
                                                        "/auth/login",
                                                    )
                                                }
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-semibold"
                                            >
                                                <LogIn className="w-4 h-4" />
                                                <span>{t.signIn}</span>
                                            </Link>
                                            <Link
                                                href="/doctors"
                                                onClick={(e) =>
                                                    handleNavClick(
                                                        e,
                                                        "/doctors",
                                                    )
                                                }
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-semibold"
                                            >
                                                <Calendar className="w-4 h-4" />
                                                <span>{t.bookAppointment}</span>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}
