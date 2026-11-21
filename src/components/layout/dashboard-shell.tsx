"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { RoleName } from "@prisma/client";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { LanguageToggle } from "@/components/common/language-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useSiteSettings } from "@/components/layout/providers";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
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
  Tv,
  CheckCircle2,
  UserPlus,
  FileSearch,
  Languages,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
} from "lucide-react";

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: {
      name: RoleName;
    };
    organization?: {
      id?: string;
      name?: string;
      slug?: string;
      status?: string;
      plan?: {
        name?: string;
      } | null;
    } | null;
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

interface HoverTooltipState {
  label: string;
  sublabel?: string;
  top: number;
  left: number;
  isActive?: boolean;
}

const emptySubscribe = () => () => {};
const SIDEBAR_MINI_STORAGE_KEY = "ppms_sidebar_mini";
const SIDEBAR_MINI_EVENT = "ppms_sidebar_mini_change";

function subscribeMiniMode(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SIDEBAR_MINI_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SIDEBAR_MINI_EVENT, callback);
  };
}

function getMiniModeSnapshot(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_MINI_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const miniMode = useSyncExternalStore(
    subscribeMiniMode,
    getMiniModeSnapshot,
    () => false,
  );
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltipState | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "main";

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const { logout } = useAuth();
  const { t } = useLanguage();
  const siteSettings = useSiteSettings();

  const [systemName, setSystemName] = useState(siteSettings.hospitalName || "");
  const [systemTagline, setSystemTagline] = useState(siteSettings.hospitalTagline || "");

  const [subInfo, setSubInfo] = useState<{
    isSuperAdmin?: boolean;
    organizationName?: string;
    planName?: string;
    isTrial?: boolean;
    daysLeft?: number;
    usagePercent: {
      overall: number;
      doctors: number | null;
      staff: number | null;
      patients: number | null;
      prescriptions: number | null;
    };
    hasLimits: boolean;
  } | null>(null);

  const role = user.role.name;

  // Persist mini sidebar preference safely without hydration mismatch
  const toggleMiniMode = () => {
    setHoverTooltip(null);
    const next = !miniMode;
    try {
      localStorage.setItem(SIDEBAR_MINI_STORAGE_KEY, String(next));
      window.dispatchEvent(new Event(SIDEBAR_MINI_EVENT));
    } catch {
      // ignore storage errors
    }
  };

  // Close menus on route/tab navigation
  const routeKey = `${pathname}?${activeTab}`;
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey);
  if (prevRouteKey !== routeKey) {
    setPrevRouteKey(routeKey);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setHoverTooltip(null);
  }

  // Close top-nav user dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
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

  // Sync live settings
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res?.data?.hospitalName) {
          setSystemName(res.data.hospitalName);
        }
        if (res?.data?.hospitalTagline) {
          setSystemTagline(res.data.hospitalTagline);
        }
      })
      .catch(() => {});
  }, []);

  // Sync subscription quota info — patients pay per appointment only and are
  // never subject to a clinic subscription, so don't fetch or show quota data.
  const isPatient = role === RoleName.PATIENT;
  useEffect(() => {
    if (isPatient) return;
    fetch("/api/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res?.success && res.data) {
          const s = res.data;
          setSubInfo({
            isSuperAdmin: Boolean(s.isSuperAdmin || role === RoleName.SUPER_ADMIN),
            organizationName: s.organizationName,
            planName: s.plan?.name || (s.isTrial ? "Trial Package" : "Standard Plan"),
            isTrial: Boolean(s.isTrial),
            daysLeft: s.daysLeft,
            usagePercent: {
              overall: s.usagePercent?.overall ?? 0,
              doctors: s.usagePercent?.doctors ?? null,
              staff: s.usagePercent?.staff ?? null,
              patients: s.usagePercent?.patients ?? null,
              prescriptions: s.usagePercent?.prescriptions ?? null,
            },
            hasLimits: Boolean(
              s.limits?.maxDoctors ||
                s.limits?.maxStaff ||
                s.limits?.maxPatients ||
                s.limits?.maxPrescriptionsPerMonth,
            ),
          });
        }
      })
      .catch(() => {});
  }, [role, isPatient]);

  const onLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  // Show crisp floating hover tooltip in mini mode
  const showTooltip = (
    e: React.MouseEvent<HTMLElement>,
    label: string,
    sublabel?: string,
    isActive?: boolean,
  ) => {
    if (!miniMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverTooltip({
      label,
      sublabel,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
      isActive,
    });
  };

  const hideTooltip = () => {
    setHoverTooltip(null);
  };

  // Streamlined, cleanly grouped navigation items for every role
  const navItems: NavItem[] = [
    ...(role === RoleName.SUPER_ADMIN
      ? [
          {
            section: t.systemOverview,
            label: t.systemAnalytics,
            href: "/dashboard/admin",
            tabKey: "main",
            icon: <BarChart3 className="w-[18px] h-[18px]" />,
          },
          {
            section: t.systemOverview,
            label: t.receptionDesk,
            href: "/dashboard/staff",
            tabKey: "reception",
            icon: <ClipboardList className="w-[18px] h-[18px]" />,
          },
          {
            section: t.multiClinicSaaS,
            label: t.clinicsOrganizations,
            href: "/dashboard/admin?tab=organizations",
            tabKey: "organizations",
            icon: <Building2 className="w-[18px] h-[18px]" />,
          },
          {
            section: t.multiClinicSaaS,
            label: t.subscriptionBilling,
            href: "/dashboard/admin?tab=billing",
            tabKey: "billing",
            icon: <Sparkles className="w-[18px] h-[18px]" />,
          },
          {
            section: t.multiClinicSaaS,
            label: t.pricingPlans,
            href: "/dashboard/admin?tab=pricing",
            tabKey: "pricing",
            icon: <CreditCard className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionClinicalTools,
            label: t.pharmaceuticalDrugs,
            href: "/dashboard/admin?tab=catalog",
            tabKey: "catalog",
            icon: <Pill className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionClinicalTools,
            label: t.diagnosticLabTests,
            href: "/dashboard/admin?tab=tests",
            tabKey: "tests",
            icon: <FlaskConical className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionClinicalTools,
            label: t.prescriptionDesigner,
            href: "/dashboard/admin?tab=templates",
            tabKey: "templates",
            icon: <FileCode2 className="w-[18px] h-[18px]" />,
          },
          {
            section: t.governanceAudit,
            label: t.userAccounts,
            href: "/dashboard/admin?tab=users",
            tabKey: "users",
            icon: <Users className="w-[18px] h-[18px]" />,
          },
          {
            section: t.governanceAudit,
            label: t.rolesPermissions,
            href: "/dashboard/admin?tab=roles",
            tabKey: "roles",
            icon: <Shield className="w-[18px] h-[18px]" />,
          },
          {
            section: t.governanceAudit,
            label: t.activityLogs,
            href: "/dashboard/admin?tab=activity",
            tabKey: "activity",
            icon: <ShieldAlert className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionCommunication,
            label: t.clinicalChatHub,
            href: "/dashboard/admin?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionCommunication,
            label: t.announcements,
            href: "/dashboard/admin?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionCommunication,
            label: t.emailTemplates,
            href: "/dashboard/admin?tab=email-templates",
            tabKey: "email-templates",
            icon: <Mail className="w-[18px] h-[18px]" />,
          },
          {
            section: t.configuration,
            label: t.hospitalSettings,
            href: "/dashboard/admin?tab=settings",
            tabKey: "settings",
            icon: <Settings className="w-[18px] h-[18px]" />,
          },
          {
            section: t.configuration,
            label: t.languageManagement,
            href: "/dashboard/admin?tab=translations",
            tabKey: "translations",
            icon: <Languages className="w-[18px] h-[18px]" />,
          },
        ]
      : []),

    ...(role === RoleName.ADMIN
      ? [
          {
            section: t.systemOverview,
            label: t.clinicAnalytics,
            href: "/dashboard/admin",
            tabKey: "main",
            icon: <BarChart3 className="w-[18px] h-[18px]" />,
          },
          {
            section: t.systemOverview,
            label: t.receptionDesk,
            href: "/dashboard/staff",
            tabKey: "reception",
            icon: <ClipboardList className="w-[18px] h-[18px]" />,
          },
          {
            section: t.systemOverview,
            label: t.subscriptionBilling,
            href: "/dashboard/admin?tab=billing",
            tabKey: "billing",
            icon: <Sparkles className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionClinicalTools,
            label: t.pharmaceuticalDrugs,
            href: "/dashboard/admin?tab=catalog",
            tabKey: "catalog",
            icon: <Pill className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionClinicalTools,
            label: t.diagnosticLabTests,
            href: "/dashboard/admin?tab=tests",
            tabKey: "tests",
            icon: <FlaskConical className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionClinicalTools,
            label: t.prescriptionDesigner,
            href: "/dashboard/admin?tab=templates",
            tabKey: "templates",
            icon: <FileCode2 className="w-[18px] h-[18px]" />,
          },
          {
            section: t.governanceAudit,
            label: t.userAccounts,
            href: "/dashboard/admin?tab=users",
            tabKey: "users",
            icon: <Users className="w-[18px] h-[18px]" />,
          },
          {
            section: t.governanceAudit,
            label: t.rolesPermissions,
            href: "/dashboard/admin?tab=roles",
            tabKey: "roles",
            icon: <Shield className="w-[18px] h-[18px]" />,
          },
          {
            section: t.governanceAudit,
            label: t.activityLogs,
            href: "/dashboard/admin?tab=activity",
            tabKey: "activity",
            icon: <ShieldAlert className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionCommunication,
            label: t.clinicalChatHub,
            href: "/dashboard/admin?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionCommunication,
            label: t.announcements,
            href: "/dashboard/admin?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-[18px] h-[18px]" />,
          },
          {
            section: t.configuration,
            label: t.clinicSettings,
            href: "/dashboard/admin?tab=settings",
            tabKey: "settings",
            icon: <Settings className="w-[18px] h-[18px]" />,
          },
        ]
      : []),

    ...(role === RoleName.STAFF
      ? [
          {
            section: t.frontDeskTriage,
            label: t.fastWalkInCheckIn,
            href: "/dashboard/staff?tab=checkin",
            tabKey: "checkin",
            icon: <UserPlus className="w-[18px] h-[18px]" />,
          },
          {
            section: t.frontDeskTriage,
            label: t.appointmentVerifications,
            href: "/dashboard/staff?tab=verifications",
            tabKey: "verifications",
            icon: <CheckCircle2 className="w-[18px] h-[18px]" />,
          },
          {
            section: t.frontDeskTriage,
            label: t.chamberQueueSlips,
            href: "/dashboard/staff?tab=queue",
            tabKey: "queue",
            icon: <Clock className="w-[18px] h-[18px]" />,
          },
          {
            section: t.frontDeskTriage,
            label: t.patientsLabReports,
            href: "/dashboard/staff?tab=patients",
            tabKey: "patients",
            icon: <FileSearch className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionOperations,
            label: t.visitingSchedules,
            href: "/dashboard/staff?tab=schedules",
            tabKey: "schedules",
            icon: <Calendar className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionOperations,
            label: t.liveTvDisplay,
            href: "/live-queue",
            tabKey: "live-queue",
            icon: <Tv className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionCommunication,
            label: t.clinicalChat,
            href: "/dashboard/staff?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionCommunication,
            label: t.announcements,
            href: "/dashboard/staff?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-[18px] h-[18px]" />,
          },
        ]
      : []),

    ...(role === RoleName.DOCTOR
      ? [
          {
            section: t.clinicalPractice,
            label: t.writePrescription,
            href: "/dashboard/doctor",
            tabKey: "main",
            icon: <PenLine className="w-[18px] h-[18px]" />,
          },
          {
            section: t.clinicalPractice,
            label: t.currentSerial,
            href: "/dashboard/doctor?tab=queue",
            tabKey: "queue",
            icon: <Clock className="w-[18px] h-[18px]" />,
          },
          {
            section: t.clinicalPractice,
            label: t.prescriptionArchive,
            href: "/dashboard/doctor?tab=history",
            tabKey: "history",
            icon: <History className="w-[18px] h-[18px]" />,
          },
          {
            section: t.clinicalPractice,
            label: t.patientsLabReports,
            href: "/dashboard/doctor?tab=reports",
            tabKey: "reports",
            icon: <FileSearch className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionClinicalTools,
            label: t.pharmaceuticalDrugs,
            href: "/dashboard/doctor?tab=catalog",
            tabKey: "catalog",
            icon: <Pill className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionClinicalTools,
            label: t.diagnosticLabTests,
            href: "/dashboard/doctor?tab=tests",
            tabKey: "tests",
            icon: <FlaskConical className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionClinicalTools,
            label: t.hospitalTemplates,
            href: "/dashboard/doctor?tab=templates",
            tabKey: "templates",
            icon: <FileCode2 className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionCommunication,
            label: t.clinicalChat,
            href: "/dashboard/doctor?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionCommunication,
            label: t.announcements,
            href: "/dashboard/doctor?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-[18px] h-[18px]" />,
          },
          {
            section: t.configuration,
            label: t.liveTvDisplay,
            href: "/live-queue",
            tabKey: "live-queue",
            icon: <Tv className="w-[18px] h-[18px]" />,
          },
          {
            section: t.configuration,
            label: t.chamberCredentials,
            href: "/dashboard/doctor?tab=profile",
            tabKey: "profile",
            icon: <UserCog className="w-[18px] h-[18px]" />,
          },
        ]
      : []),

    ...(role === RoleName.PATIENT
      ? [
          {
            section: t.healthcarePortal,
            label: t.myPrescriptions,
            href: "/dashboard/patient",
            tabKey: "main",
            icon: <FileText className="w-[18px] h-[18px]" />,
          },
          {
            section: t.healthcarePortal,
            label: t.medicineReminders,
            href: "/dashboard/patient?tab=reminders",
            tabKey: "reminders",
            icon: <Clock className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionCommunication,
            label: t.clinicalChat,
            href: "/dashboard/patient?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-[18px] h-[18px]" />,
          },
          {
            section: t.sectionCommunication,
            label: t.clinicNotices,
            href: "/dashboard/patient?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-[18px] h-[18px]" />,
          },
        ]
      : []),

    {
      section: t.publicPortal,
      label: t.findDoctorsChambers,
      href: "/",
      tabKey: "public",
      icon: <Compass className="w-[18px] h-[18px]" />,
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
        return "bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20";
      case RoleName.ADMIN:
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20";
      case RoleName.DOCTOR:
        return "bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]";
      case RoleName.STAFF:
        return "bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20";
      default:
        return "bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]";
    }
  };

  const getRoleTitle = (roleName: RoleName) => {
    switch (roleName) {
      case RoleName.SUPER_ADMIN:
        return t.roleSuperAdmin;
      case RoleName.ADMIN:
        return t.roleClinicAdmin;
      case RoleName.DOCTOR:
        return t.roleDoctor;
      case RoleName.STAFF:
        return t.roleStaff;
      default:
        return t.rolePatient;
    }
  };

  // Role-aware Profile & Settings destinations for the top-nav account menu
  const profileHref =
    role === RoleName.DOCTOR
      ? "/dashboard/doctor?tab=profile"
      : role === RoleName.PATIENT
        ? "/dashboard/patient"
        : role === RoleName.STAFF
          ? "/dashboard/staff?tab=checkin"
          : "/dashboard/admin?tab=users";

  const settingsHref =
    role === RoleName.SUPER_ADMIN || role === RoleName.ADMIN
      ? "/dashboard/admin?tab=settings"
      : role === RoleName.DOCTOR
        ? "/dashboard/doctor?tab=templates"
        : role === RoleName.PATIENT
          ? "/dashboard/patient?tab=security"
          : "/dashboard/staff?tab=schedules";

  const brandName =
    systemName || siteSettings.hospitalName || user.organization?.name || "PPMS";
  const brandTagline =
    systemTagline || siteSettings.hospitalTagline || t.prescriptionSuiteTag;

  const userInitials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const renderSidebarContent = (isMini: boolean, isMobileDrawer = false) => (
    <div className="flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] select-none">
      {/* Sidebar Brand Header (h-16 aligned with Top Navbar) */}
      <div
        className={`h-16 shrink-0 border-b border-[var(--border-subtle)] flex items-center ${
          isMini ? "justify-center px-2" : "justify-between px-4"
        }`}
      >
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          onMouseEnter={(e) =>
            isMini ? showTooltip(e, brandName, t.returnToPublicSite) : undefined
          }
          onMouseLeave={hideTooltip}
          className={`flex items-center gap-2.5 min-w-0 group rounded-lg transition-colors ${
            isMini ? "p-1" : "py-1 pr-2"
          }`}
          title={isMini ? undefined : t.returnToPublicSite}
        >
          <div className="relative w-9 h-9 overflow-hidden rounded-lg border border-[var(--brand-border)]/70 shadow-2xs shrink-0 group-hover:border-[var(--brand-primary)] transition-colors">
            <Image src="/icons/icon.svg" alt={brandName} fill sizes="36px" />
          </div>
          {!isMini && (
            <div className="min-w-0 leading-none">
              <p className="text-sm font-extrabold tracking-tight text-[var(--text-primary)] truncate group-hover:text-[var(--brand-text)] transition-colors">
                {brandName}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] font-medium truncate mt-1">
                {brandTagline}
              </p>
            </div>
          )}
        </Link>

        {isMobileDrawer && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={t.close}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Compact Clinic Quota Strip — clinic staff only, never patients */}
      {role !== RoleName.SUPER_ADMIN && !isPatient && subInfo && (
        <div className={`shrink-0 ${isMini ? "px-2 pt-3 pb-1" : "px-3 pt-3 pb-1"}`}>
          {isMini ? (
            <Link
              href={role === RoleName.ADMIN ? "/dashboard/admin?tab=billing" : "#"}
              onMouseEnter={(e) =>
                showTooltip(
                  e,
                  subInfo.planName || t.subscriptionBilling,
                  `${subInfo.usagePercent.overall}% ${t.quotaCapUsed}`,
                )
              }
              onMouseLeave={hideTooltip}
              className={`w-11 h-9 mx-auto rounded-lg flex items-center justify-center font-mono text-[11px] font-bold border transition-colors ${
                subInfo.usagePercent.overall >= 90
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                  : subInfo.usagePercent.overall >= 75
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                    : "bg-[var(--brand-surface)] text-[var(--brand-text)] border-[var(--brand-border)]"
              }`}
            >
              {subInfo.usagePercent.overall}%
            </Link>
          ) : (
            <Link
              href={role === RoleName.ADMIN ? "/dashboard/admin?tab=billing" : "#"}
              onClick={() => setMobileMenuOpen(false)}
              className="block p-3 rounded-xl bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-colors space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {subInfo.organizationName ||
                      user.organization?.name ||
                      t.clinicFacility}
                  </p>
                  <p className="text-[11px] font-medium text-[var(--brand-text)] truncate">
                    {subInfo.planName}
                    {subInfo.isTrial && subInfo.daysLeft !== undefined
                      ? ` · ${subInfo.daysLeft}d`
                      : ""}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-[var(--text-primary)] shrink-0">
                  {subInfo.usagePercent.overall}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    subInfo.usagePercent.overall >= 90
                      ? "bg-rose-500"
                      : subInfo.usagePercent.overall >= 75
                        ? "bg-amber-500"
                        : "bg-[var(--brand-primary)]"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, subInfo.usagePercent.overall))}%`,
                  }}
                />
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Primary Scrollable Navigation (Full Height, Clean Sections, Mini-Rail Aware) */}
      <nav
        aria-label="Workspace navigation"
        onScroll={hideTooltip}
        className={`flex-1 overflow-y-auto overflow-x-hidden py-4 ${
          isMini ? "px-2 space-y-3" : "px-3 space-y-5"
        }`}
      >
        {Object.entries(sections).map(([sectionName, items], sectionIdx) => (
          <div key={sectionName} className="space-y-1">
            {isMini ? (
              sectionIdx > 0 && (
                <div className="w-6 h-px bg-[var(--border-subtle)] mx-auto my-2" />
              )
            ) : (
              <p className="px-3 pb-1 text-[11px] font-semibold text-[var(--text-muted)] tracking-tight">
                {sectionName}
              </p>
            )}

            <div className="space-y-0.5">
              {items.map((item) => {
                const isBaseMatch = pathname === item.href.split("?")[0];
                const hasQuery = item.href.includes("?");
                const isActive = hasQuery
                  ? isBaseMatch && activeTab === item.tabKey
                  : isBaseMatch &&
                    (!activeTab || activeTab === "main" || activeTab === item.tabKey);

                return (
                  <Link
                    key={`${item.href}-${item.tabKey}`}
                    href={item.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      hideTooltip();
                    }}
                    onMouseEnter={(e) =>
                      isMini
                        ? showTooltip(e, item.label, sectionName, isActive)
                        : undefined
                    }
                    onMouseLeave={hideTooltip}
                    aria-label={isMini ? item.label : undefined}
                    className={`relative flex items-center rounded-lg transition-colors group ${
                      isMini
                        ? "w-11 h-10 mx-auto justify-center"
                        : "gap-3 px-3 py-2 text-[13px]"
                    } ${
                      isActive
                        ? "bg-[var(--brand-surface)] text-[var(--brand-text)] font-semibold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]/80 font-medium"
                    }`}
                  >
                    {/* Sleek Active Left Accent Bar */}
                    {isActive && (
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-[var(--brand-primary)] ${
                          isMini ? "h-5" : "h-5"
                        }`}
                      />
                    )}

                    <span
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? "text-[var(--brand-primary)]"
                          : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {!isMini && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex">
      {/* Desktop Sidebar: Smoothly switches between Expanded (264px) & Mini Icon Rail (72px) */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 z-30 transition-[width] duration-200 ease-out ${
          miniMode ? "w-[72px]" : "w-[264px]"
        }`}
      >
        {renderSidebarContent(miniMode, false)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel (Always Full Width) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderSidebarContent(false, true)}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Top Workspace Bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Left: Sidebar Mode Controls & Live Workspace Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/60 text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors cursor-pointer"
              title={t.openNavigationMenu}
              aria-label={t.openNavigationMenu}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop Expanded / Mini Rail Toggle */}
            <button
              type="button"
              onClick={toggleMiniMode}
              className="hidden lg:inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-border)] hover:bg-[var(--brand-surface)]/60 transition-colors cursor-pointer"
              title={miniMode ? t.expandSidebar : t.collapseSidebar}
              aria-label={miniMode ? t.expandSidebar : t.collapseSidebar}
            >
              {miniMode ? (
                <PanelLeft className="w-4 h-4 text-[var(--brand-primary)]" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Status & Plan Indicators */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t("emrCloudActive", "EMR Cloud Active")}</span>
              </span>

              {role === RoleName.SUPER_ADMIN ? (
                <span
                  className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${getRoleBadge(
                    role,
                  )}`}
                >
                  {getRoleTitle(role)}
                </span>
              ) : !isPatient && subInfo ? (
                <Link
                  href={role === RoleName.ADMIN ? "/dashboard/admin?tab=billing" : "#"}
                  className="hidden md:inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--brand-border)] transition-colors"
                  title={`${subInfo.planName} · ${t.overallLimitUsed}: ${subInfo.usagePercent.overall}%`}
                >
                  <span className="truncate max-w-[130px] text-[var(--text-primary)]">
                    {subInfo.planName}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      subInfo.usagePercent.overall >= 90
                        ? "text-rose-500"
                        : subInfo.usagePercent.overall >= 75
                          ? "text-amber-500"
                          : "text-[var(--brand-text)]"
                    }`}
                  >
                    {subInfo.usagePercent.overall}%
                  </span>
                </Link>
              ) : null}
            </div>
          </div>

          {/* Right: Notifications, Language, Theme, and User Account Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell />
            <LanguageToggle />
            <ThemeCustomizer compact direction="down" align="right" />

            <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />

            {/* User Account Dropdown Trigger & Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  userMenuOpen
                    ? "bg-[var(--bg-subtle)] border-[var(--brand-border)]"
                    : "bg-transparent border-transparent hover:bg-[var(--bg-subtle)]/80 hover:border-[var(--border-subtle)]"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] font-bold text-xs flex items-center justify-center">
                    {userInitials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface)]" />
                </div>

                <div className="hidden md:flex flex-col items-start text-left leading-tight max-w-[150px]">
                  <span className="text-xs font-semibold text-[var(--text-primary)] truncate w-full">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] truncate w-full">
                    {getRoleTitle(role)}
                  </span>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-150 hidden sm:block ${
                    userMenuOpen ? "rotate-180 text-[var(--brand-text)]" : ""
                  }`}
                />
              </button>

              {/* Anchored Account Dropdown Popover */}
              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-72 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-2xl overflow-hidden z-50"
                >
                  {/* User Identity & Email Header */}
                  <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)] text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {userInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                            {user.name}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${getRoleBadge(
                            role,
                          )}`}
                        >
                          {getRoleTitle(role)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] pt-1">
                      <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      <span className="truncate font-mono text-[11px]">
                        {user.email}
                      </span>
                    </div>

                    {user.organization?.name && role !== RoleName.SUPER_ADMIN && (
                      <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--brand-text)]">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{user.organization.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Primary Account Actions */}
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href={profileHref}
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                    >
                      <User className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>{t.profile}</span>
                    </Link>

                    <Link
                      href={settingsHref}
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>{t.settings}</span>
                    </Link>

                    <Link
                      href="/dashboard/notifications"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                    >
                      <Bell className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>{t.notifications}</span>
                    </Link>
                  </div>

                  {/* Logout Footer */}
                  <div className="p-1.5 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={onLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1920px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Zero-Clipping Floating Hover Tooltip ("Hover Toast") for Mini Sidebar */}
      {mounted &&
        miniMode &&
        hoverTooltip &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: hoverTooltip.top,
              left: hoverTooltip.left,
              transform: "translateY(-50%)",
            }}
            className="pointer-events-none z-[9999] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] shadow-xl whitespace-nowrap"
          >
            {/* Subtle Left Pointer Caret */}
            <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-[var(--bg-elevated)] border-l border-b border-[var(--border-default)]" />
            {hoverTooltip.isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] shrink-0" />
            )}
            <div className="relative flex flex-col leading-tight">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {hoverTooltip.label}
              </span>
              {hoverTooltip.sublabel && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  {hoverTooltip.sublabel}
                </span>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
