"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { RoleName } from "@prisma/client";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { LanguageToggle } from "@/components/common/language-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ChangePasswordCard } from "@/components/common/change-password-card";
import { TwoFactorAuthCard } from "@/components/common/two-factor-auth-card";
import { DemoCountdownTimer } from "@/components/common/demo-countdown-timer";
import { useAuth } from "@/lib/auth/auth-context";
import {
  BarChart3,
  Users,
  Shield,
  Pill,
  FlaskConical,
  FileCode2,
  PenLine,
  Clock,
  History,
  UserCog,
  FileText,
  Compass,
  ClipboardList,
  Building2,
  Megaphone,
  CreditCard,
  Sparkles,
  ShieldAlert,
  MessageSquare,
  Calendar,
  PanelLeft,
  PanelLeftClose,
  Mail,
  KeyRound,
  Tv,
  CheckCircle2,
  UserPlus,
  FileSearch,
} from "lucide-react";

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: {
      name: RoleName;
    };
  };
  children: React.ReactNode;
}

interface NavItem {
  section: string;
  label: string;
  href: string;
  tabKey: string;
  icon: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "main";

  const { logout } = useAuth();

  const onLogout = async () => {
    await logout();
  };

  const role = user.role.name;

  // Build navigation items grouped by semantic section
  const navItems: NavItem[] = [
    ...(role === RoleName.SUPER_ADMIN
      ? [
          {
            section: "Front Desk & Triage",
            label: "Reception Desk",
            href: "/dashboard/staff",
            tabKey: "reception",
            icon: <ClipboardList className="w-4 h-4" />,
          },
          {
            section: "System Overview",
            label: "System Analytics",
            href: "/dashboard/admin",
            tabKey: "main",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            section: "Multi-Clinic SaaS",
            label: "Subscription & Billing",
            href: "/dashboard/admin?tab=billing",
            tabKey: "billing",
            icon: <Sparkles className="w-4 h-4" />,
          },
          {
            section: "Multi-Clinic SaaS",
            label: "Clinics & Organizations",
            href: "/dashboard/admin?tab=organizations",
            tabKey: "organizations",
            icon: <Building2 className="w-4 h-4" />,
          },
          {
            section: "Multi-Clinic SaaS",
            label: "SaaS Pricing Plans",
            href: "/dashboard/admin?tab=pricing",
            tabKey: "pricing",
            icon: <CreditCard className="w-4 h-4" />,
          },
          {
            section: "Accounts & Security",
            label: "User Accounts",
            href: "/dashboard/admin?tab=users",
            tabKey: "users",
            icon: <Users className="w-4 h-4" />,
          },
          {
            section: "Accounts & Security",
            label: "Role & Permissions",
            href: "/dashboard/admin?tab=roles",
            tabKey: "roles",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            section: "Governance & Audit",
            label: "Hospital Broadcasts",
            href: "/dashboard/admin?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-4 h-4" />,
          },
          {
            section: "Governance & Audit",
            label: "Activity Audit Logs",
            href: "/dashboard/admin?tab=activity",
            tabKey: "activity",
            icon: <ShieldAlert className="w-4 h-4" />,
          },
          {
            section: "Communications & Mail",
            label: "Email Templates & SMTP",
            href: "/dashboard/admin?tab=email-templates",
            tabKey: "email-templates",
            icon: <Mail className="w-4 h-4" />,
          },
          {
            section: "Collaboration",
            label: "Clinical Chat Hub",
            href: "/dashboard/admin?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            section: "Medical Formulary",
            label: "Pharmaceutical Drugs",
            href: "/dashboard/admin?tab=catalog",
            tabKey: "catalog",
            icon: <Pill className="w-4 h-4" />,
          },
          {
            section: "Medical Formulary",
            label: "Diagnostic Lab Tests",
            href: "/dashboard/admin?tab=tests",
            tabKey: "tests",
            icon: <FlaskConical className="w-4 h-4" />,
          },
          {
            section: "Prescription Pad",
            label: "Prescription Designer",
            href: "/dashboard/admin?tab=templates",
            tabKey: "templates",
            icon: <FileCode2 className="w-4 h-4" />,
          },
          {
            section: "Configuration",
            label: "Hospital Settings",
            href: "/dashboard/admin?tab=settings",
            tabKey: "settings",
            icon: <Building2 className="w-4 h-4" />,
          },
        ]
      : []),

    ...(role === RoleName.ADMIN
      ? [
          {
            section: "Front Desk & Triage",
            label: "Reception Desk",
            href: "/dashboard/staff",
            tabKey: "reception",
            icon: <ClipboardList className="w-4 h-4" />,
          },
          {
            section: "Clinic Overview",
            label: "Clinic Analytics",
            href: "/dashboard/admin",
            tabKey: "main",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            section: "Subscription & Billing",
            label: "Subscription & Billing",
            href: "/dashboard/admin?tab=billing",
            tabKey: "billing",
            icon: <Sparkles className="w-4 h-4" />,
          },
          {
            section: "Accounts & Security",
            label: "Doctors & Staff Accounts",
            href: "/dashboard/admin?tab=users",
            tabKey: "users",
            icon: <Users className="w-4 h-4" />,
          },
          {
            section: "Accounts & Security",
            label: "Role & Permissions",
            href: "/dashboard/admin?tab=roles",
            tabKey: "roles",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            section: "Governance & Audit",
            label: "Clinic Broadcasts",
            href: "/dashboard/admin?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-4 h-4" />,
          },
          {
            section: "Governance & Audit",
            label: "Activity Audit Logs",
            href: "/dashboard/admin?tab=activity",
            tabKey: "activity",
            icon: <ShieldAlert className="w-4 h-4" />,
          },
          {
            section: "Collaboration",
            label: "Clinical Chat Hub",
            href: "/dashboard/admin?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            section: "Medical Formulary",
            label: "Pharmaceutical Drugs",
            href: "/dashboard/admin?tab=catalog",
            tabKey: "catalog",
            icon: <Pill className="w-4 h-4" />,
          },
          {
            section: "Medical Formulary",
            label: "Diagnostic Lab Tests",
            href: "/dashboard/admin?tab=tests",
            tabKey: "tests",
            icon: <FlaskConical className="w-4 h-4" />,
          },
          {
            section: "Prescription Pad",
            label: "Prescription Designer",
            href: "/dashboard/admin?tab=templates",
            tabKey: "templates",
            icon: <FileCode2 className="w-4 h-4" />,
          },
          {
            section: "Configuration",
            label: "Clinic Settings",
            href: "/dashboard/admin?tab=settings",
            tabKey: "settings",
            icon: <Building2 className="w-4 h-4" />,
          },
        ]
      : []),

    ...(role === RoleName.STAFF
      ? [
          {
            section: "Front Desk & Triage",
            label: "Fast Walk-in Check-in",
            href: "/dashboard/staff?tab=checkin",
            tabKey: "checkin",
            icon: <UserPlus className="w-4 h-4" />,
          },
          {
            section: "Front Desk & Triage",
            label: "Appointment Verifications",
            href: "/dashboard/staff?tab=verifications",
            tabKey: "verifications",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            section: "Front Desk & Triage",
            label: "Chamber Queue & Slips",
            href: "/dashboard/staff?tab=queue",
            tabKey: "queue",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            section: "Front Desk & Triage",
            label: "Patients & Lab Reports",
            href: "/dashboard/staff?tab=patients",
            tabKey: "patients",
            icon: <FileSearch className="w-4 h-4" />,
          },
          {
            section: "Doctor Rosters",
            label: "Visiting Schedules",
            href: "/dashboard/staff?tab=schedules",
            tabKey: "schedules",
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            section: "Waiting Hall Monitors",
            label: "Live TV Queue Display",
            href: "/live-queue",
            tabKey: "live-queue",
            icon: <Tv className="w-4 h-4" />,
          },
          {
            section: "Collaboration",
            label: "Clinical Chat",
            href: "/dashboard/staff?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            section: "Hospital Communications",
            label: "Hospital Bulletins",
            href: "/dashboard/staff?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-4 h-4" />,
          },
        ]
      : []),

    ...(role === RoleName.DOCTOR
      ? [
          {
            section: "Clinical Practice",
            label: "Chamber Queue",
            href: "/dashboard/doctor?tab=queue",
            tabKey: "queue",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            section: "Clinical Practice",
            label: "Write Prescription",
            href: "/dashboard/doctor",
            tabKey: "main",
            icon: <PenLine className="w-4 h-4" />,
          },
          {
            section: "Clinical Practice",
            label: "Prescription Archive",
            href: "/dashboard/doctor?tab=history",
            tabKey: "history",
            icon: <History className="w-4 h-4" />,
          },
          {
            section: "Clinical Practice",
            label: "Patient Lab Reports",
            href: "/dashboard/doctor?tab=reports",
            tabKey: "reports",
            icon: <FileSearch className="w-4 h-4" />,
          },
          {
            section: "Medical Formulary",
            label: "Pharmaceutical Drugs",
            href: "/dashboard/doctor?tab=catalog",
            tabKey: "catalog",
            icon: <Pill className="w-4 h-4" />,
          },
          {
            section: "Medical Formulary",
            label: "Diagnostic Lab Tests",
            href: "/dashboard/doctor?tab=tests",
            tabKey: "tests",
            icon: <FlaskConical className="w-4 h-4" />,
          },
          {
            section: "Waiting Hall Monitors",
            label: "Live TV Queue Display",
            href: "/live-queue",
            tabKey: "live-queue",
            icon: <Tv className="w-4 h-4" />,
          },
          {
            section: "Configuration",
            label: "Hospital Templates",
            href: "/dashboard/doctor?tab=templates",
            tabKey: "templates",
            icon: <FileCode2 className="w-4 h-4" />,
          },
          {
            section: "Configuration",
            label: "Chamber & Credentials",
            href: "/dashboard/doctor?tab=profile",
            tabKey: "profile",
            icon: <UserCog className="w-4 h-4" />,
          },
          {
            section: "Collaboration",
            label: "Clinical Chat",
            href: "/dashboard/doctor?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            section: "Hospital Communications",
            label: "Hospital Bulletins",
            href: "/dashboard/doctor?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-4 h-4" />,
          },
        ]
      : []),

    ...(role === RoleName.PATIENT
      ? [
          {
            section: "Healthcare Portal",
            label: "My Prescriptions",
            href: "/dashboard/patient",
            tabKey: "main",
            icon: <FileText className="w-4 h-4" />,
          },
          {
            section: "Healthcare Portal",
            label: "Medicine Reminders",
            href: "/dashboard/patient?tab=reminders",
            tabKey: "reminders",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            section: "Collaboration",
            label: "Chat with Doctor",
            href: "/dashboard/patient?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            section: "Hospital Communications",
            label: "Clinic Notices",
            href: "/dashboard/patient?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-4 h-4" />,
          },
        ]
      : []),

    {
      section: "Public Portal",
      label: "Find Doctors / Chambers",
      href: "/",
      tabKey: "public",
      icon: <Compass className="w-4 h-4" />,
    },
  ];

  // Group items by section
  const sections = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const getRoleBadge = (roleName: RoleName) => {
    switch (roleName) {
      case RoleName.SUPER_ADMIN:
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300";
      case RoleName.ADMIN:
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300";
      case RoleName.DOCTOR:
        return "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300";
      case RoleName.STAFF:
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getRoleTitle = (roleName: RoleName) => {
    switch (roleName) {
      case RoleName.SUPER_ADMIN:
        return "Super Admin (Platform)";
      case RoleName.ADMIN:
        return "Clinic Administrator";
      case RoleName.DOCTOR:
        return "Attending Physician";
      case RoleName.STAFF:
        return "Hospital Staff";
      default:
        return "Patient User";
    }
  };

  const sidebarElement = (
    <div className="flex flex-col h-full justify-between p-4 bg-[var(--bg-sidebar)] border-r border-slate-200/80 dark:border-slate-800/80">
      {/* Brand & Organization Header */}
      <div className="flex flex-col flex-1 min-h-0">
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 mb-4 shrink-0 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all group cursor-pointer"
          title="Return to Home Page"
        >
          <div className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[var(--brand-primary)]/20 group-hover:scale-105 transition-transform">
            Rx
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight group-hover:text-[var(--brand-text)] transition-colors">
              PPMS Clinical
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Medical Suite v2.0
            </p>
          </div>
        </Link>

        {/* Navigation Sections (Scrollable) */}
        <nav className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-5">
          {Object.entries(sections).map(([sectionName, items]) => (
            <div key={sectionName} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {sectionName}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isBaseMatch = pathname === item.href.split("?")[0];
                  const hasQuery = item.href.includes("?");
                  const isActive = hasQuery
                    ? isBaseMatch && activeTab === item.tabKey
                    : isBaseMatch && (!activeTab || activeTab === "main" || activeTab === item.tabKey);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] font-bold shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span className={isActive ? "text-[var(--brand-primary)]" : "text-slate-400"}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Area: Theme Switcher & User Profile Card */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
        {/* Appearance Control */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Appearance
          </span>
          <ThemeCustomizer compact direction="up" align="right" />
        </div>

        {/* User Card */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 ${getRoleBadge(
                role,
              )}`}
            >
              {getRoleTitle(role)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => setChangePasswordOpen(true)}
              className="text-[10px] font-semibold text-slate-500 hover:text-[var(--brand-primary)] flex items-center gap-1 cursor-pointer"
              title="Account Security, 2FA & Password"
            >
              <KeyRound className="w-3 h-3" />
              <span>Security</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="text-[11px] font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex">
      {/* Desktop Sidebar (Collapsible with Toggle Button) */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out ${
          desktopSidebarCollapsed
            ? "w-0 overflow-hidden opacity-0 pointer-events-none"
            : "w-72 opacity-100"
        }`}
      >
        {sidebarElement}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarElement}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-[var(--bg-surface)]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Open Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Sidebar Toggle Icon Button */}
            <button
              type="button"
              onClick={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
              className="hidden lg:flex items-center gap-1.5 p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={desktopSidebarCollapsed ? "Show Sidebar Menu" : "Hide Sidebar Menu"}
              aria-label="Toggle sidebar menu"
            >
              {desktopSidebarCollapsed ? (
                <PanelLeft className="w-5 h-5 text-[var(--brand-primary)]" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                EMR Cloud Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <LanguageToggle />
            <ThemeCustomizer compact direction="down" align="right" />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] font-bold text-xs flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden md:inline">
                {user.name}
              </span>
            </div>
          </div>
        </header>

        {/* Demo Environment Auto-Reset Banner */}
        <DemoCountdownTimer variant="banner" />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Account Security & 2FA Modal */}
      {changePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl relative animate-in zoom-in-95 modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl">
            <button
              type="button"
              onClick={() => setChangePasswordOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center text-xs font-bold transition cursor-pointer"
              title="Close modal"
            >
              ✕
            </button>
            <div className="modal-body flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <TwoFactorAuthCard />
              <ChangePasswordCard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
