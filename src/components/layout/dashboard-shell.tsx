"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { RoleName } from "@prisma/client";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { LanguageToggle } from "@/components/common/language-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ChangePasswordCard } from "@/components/common/change-password-card";
import { TwoFactorAuthCard } from "@/components/common/two-factor-auth-card";
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
  KeyRound,
  Tv,
  CheckCircle2,
  UserPlus,
  FileSearch,
  Languages,
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

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "main";

  const { logout } = useAuth();
  const { t } = useLanguage();

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
    counts?: {
      doctors: number;
      staff: number;
      patients: number;
      prescriptionsThisMonth: number;
    };
    limits?: {
      maxDoctors: number | null;
      maxStaff: number | null;
      maxPatients: number | null;
      maxPrescriptionsPerMonth: number | null;
    };
    hasLimits: boolean;
  } | null>(null);

  const role = user.role.name;

  useEffect(() => {
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
            counts: s.counts,
            limits: s.limits,
            hasLimits: Boolean(
              s.limits?.maxDoctors ||
              s.limits?.maxStaff ||
              s.limits?.maxPatients ||
              s.limits?.maxPrescriptionsPerMonth
            ),
          });
        }
      })
      .catch(() => {});
  }, [role]);

  const onLogout = async () => {
    await logout();
  };

  // Build navigation items grouped by semantic section
  const navItems: NavItem[] = [
    ...(role === RoleName.SUPER_ADMIN
      ? [
          {
            section: t.frontDeskTriage,
            label: t.receptionDesk,
            href: "/dashboard/staff",
            tabKey: "reception",
            icon: <ClipboardList className="w-4 h-4" />,
          },
          {
            section: t.systemOverview,
            label: t.systemAnalytics,
            href: "/dashboard/admin",
            tabKey: "main",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            section: t.multiClinicSaaS,
            label: t.subscriptionBilling,
            href: "/dashboard/admin?tab=billing",
            tabKey: "billing",
            icon: <Sparkles className="w-4 h-4" />,
          },
          {
            section: t.multiClinicSaaS,
            label: t.clinicsOrganizations,
            href: "/dashboard/admin?tab=organizations",
            tabKey: "organizations",
            icon: <Building2 className="w-4 h-4" />,
          },
          {
            section: t.multiClinicSaaS,
            label: t.pricingPlans,
            href: "/dashboard/admin?tab=pricing",
            tabKey: "pricing",
            icon: <CreditCard className="w-4 h-4" />,
          },
          {
            section: t.accountsSecurity,
            label: t.userAccounts,
            href: "/dashboard/admin?tab=users",
            tabKey: "users",
            icon: <Users className="w-4 h-4" />,
          },
          {
            section: t.accountsSecurity,
            label: t.rolesPermissions,
            href: "/dashboard/admin?tab=roles",
            tabKey: "roles",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            section: t.governanceAudit,
            label: t.announcements,
            href: "/dashboard/admin?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-4 h-4" />,
          },
          {
            section: t.governanceAudit,
            label: t.activityLogs,
            href: "/dashboard/admin?tab=activity",
            tabKey: "activity",
            icon: <ShieldAlert className="w-4 h-4" />,
          },
          {
            section: t.emailTemplates,
            label: t.emailTemplates,
            href: "/dashboard/admin?tab=email-templates",
            tabKey: "email-templates",
            icon: <Mail className="w-4 h-4" />,
          },
          {
            section: t.clinicalChatHub,
            label: t.clinicalChatHub,
            href: "/dashboard/admin?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            section: t.medicalFormulary,
            label: t.pharmaceuticalDrugs,
            href: "/dashboard/admin?tab=catalog",
            tabKey: "catalog",
            icon: <Pill className="w-4 h-4" />,
          },
          {
            section: t.medicalFormulary,
            label: t.diagnosticLabTests,
            href: "/dashboard/admin?tab=tests",
            tabKey: "tests",
            icon: <FlaskConical className="w-4 h-4" />,
          },
          {
            section: t.prescriptionPad,
            label: t.prescriptionDesigner,
            href: "/dashboard/admin?tab=templates",
            tabKey: "templates",
            icon: <FileCode2 className="w-4 h-4" />,
          },
           {
             section: t.configuration,
             label: t.hospitalSettings,
             href: "/dashboard/admin?tab=settings",
             tabKey: "settings",
             icon: <Building2 className="w-4 h-4" />,
           },
           {
             section: t.configuration,
             label: t.languageManagement,
             href: "/dashboard/admin?tab=translations",
             tabKey: "translations",
             icon: <Languages className="w-4 h-4" />,
           },
        ]
      : []),

    ...(role === RoleName.ADMIN
      ? [
          {
            section: t.frontDeskTriage,
            label: t.receptionDesk,
            href: "/dashboard/staff",
            tabKey: "reception",
            icon: <ClipboardList className="w-4 h-4" />,
          },
          {
            section: t.systemOverview,
            label: t.clinicAnalytics,
            href: "/dashboard/admin",
            tabKey: "main",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            section: t.subscriptionBilling,
            label: t.subscriptionBilling,
            href: "/dashboard/admin?tab=billing",
            tabKey: "billing",
            icon: <Sparkles className="w-4 h-4" />,
          },
          {
            section: t.accountsSecurity,
            label: t.userAccounts,
            href: "/dashboard/admin?tab=users",
            tabKey: "users",
            icon: <Users className="w-4 h-4" />,
          },
          {
            section: t.accountsSecurity,
            label: t.rolesPermissions,
            href: "/dashboard/admin?tab=roles",
            tabKey: "roles",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            section: t.governanceAudit,
            label: t.announcements,
            href: "/dashboard/admin?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-4 h-4" />,
          },
          {
            section: t.governanceAudit,
            label: t.activityLogs,
            href: "/dashboard/admin?tab=activity",
            tabKey: "activity",
            icon: <ShieldAlert className="w-4 h-4" />,
          },
          {
            section: t.clinicalChatHub,
            label: t.clinicalChatHub,
            href: "/dashboard/admin?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            section: t.medicalFormulary,
            label: t.pharmaceuticalDrugs,
            href: "/dashboard/admin?tab=catalog",
            tabKey: "catalog",
            icon: <Pill className="w-4 h-4" />,
          },
          {
            section: t.medicalFormulary,
            label: t.diagnosticLabTests,
            href: "/dashboard/admin?tab=tests",
            tabKey: "tests",
            icon: <FlaskConical className="w-4 h-4" />,
          },
          {
            section: t.prescriptionPad,
            label: t.prescriptionDesigner,
            href: "/dashboard/admin?tab=templates",
            tabKey: "templates",
            icon: <FileCode2 className="w-4 h-4" />,
          },
          {
            section: t.configuration,
            label: t.clinicSettings,
            href: "/dashboard/admin?tab=settings",
            tabKey: "settings",
            icon: <Building2 className="w-4 h-4" />,
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
            icon: <UserPlus className="w-4 h-4" />,
          },
          {
            section: t.frontDeskTriage,
            label: t.appointmentVerifications,
            href: "/dashboard/staff?tab=verifications",
            tabKey: "verifications",
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            section: t.frontDeskTriage,
            label: t.chamberQueueSlips,
            href: "/dashboard/staff?tab=queue",
            tabKey: "queue",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            section: t.frontDeskTriage,
            label: t.patientsLabReports,
            href: "/dashboard/staff?tab=patients",
            tabKey: "patients",
            icon: <FileSearch className="w-4 h-4" />,
          },
          {
            section: t.doctorRosters,
            label: t.visitingSchedules,
            href: "/dashboard/staff?tab=schedules",
            tabKey: "schedules",
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            section: t.waitingHallMonitors,
            label: t.liveTvDisplay,
            href: "/live-queue",
            tabKey: "live-queue",
            icon: <Tv className="w-4 h-4" />,
          },
          {
            section: t.clinicalChatHub,
            label: t.clinicalChat,
            href: "/dashboard/staff?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            section: t.governanceAudit,
            label: t.announcements,
            href: "/dashboard/staff?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-4 h-4" />,
          },
        ]
      : []),

    ...(role === RoleName.DOCTOR
      ? [
          {
            section: t.clinicalPractice,
            label: t.currentSerial,
            href: "/dashboard/doctor?tab=queue",
            tabKey: "queue",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            section: t.clinicalPractice,
            label: t.writePrescription,
            href: "/dashboard/doctor",
            tabKey: "main",
            icon: <PenLine className="w-4 h-4" />,
          },
          {
            section: t.clinicalPractice,
            label: t.prescriptionArchive,
            href: "/dashboard/doctor?tab=history",
            tabKey: "history",
            icon: <History className="w-4 h-4" />,
          },
          {
            section: t.clinicalPractice,
            label: t.patientsLabReports,
            href: "/dashboard/doctor?tab=reports",
            tabKey: "reports",
            icon: <FileSearch className="w-4 h-4" />,
          },
          {
            section: t.medicalFormulary,
            label: t.pharmaceuticalDrugs,
            href: "/dashboard/doctor?tab=catalog",
            tabKey: "catalog",
            icon: <Pill className="w-4 h-4" />,
          },
          {
            section: t.medicalFormulary,
            label: t.diagnosticLabTests,
            href: "/dashboard/doctor?tab=tests",
            tabKey: "tests",
            icon: <FlaskConical className="w-4 h-4" />,
          },
          {
            section: t.waitingHallMonitors,
            label: t.liveTvDisplay,
            href: "/live-queue",
            tabKey: "live-queue",
            icon: <Tv className="w-4 h-4" />,
          },
          {
            section: t.configuration,
            label: t.hospitalTemplates,
            href: "/dashboard/doctor?tab=templates",
            tabKey: "templates",
            icon: <FileCode2 className="w-4 h-4" />,
          },
          {
            section: t.configuration,
            label: t.chamberCredentials,
            href: "/dashboard/doctor?tab=profile",
            tabKey: "profile",
            icon: <UserCog className="w-4 h-4" />,
          },
          {
            section: t.clinicalChatHub,
            label: t.clinicalChat,
            href: "/dashboard/doctor?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            section: t.governanceAudit,
            label: t.announcements,
            href: "/dashboard/doctor?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-4 h-4" />,
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
            icon: <FileText className="w-4 h-4" />,
          },
          {
            section: t.healthcarePortal,
            label: t.medicineReminders,
            href: "/dashboard/patient?tab=reminders",
            tabKey: "reminders",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            section: t.clinicalChatHub,
            label: t.clinicalChat,
            href: "/dashboard/patient?tab=chat",
            tabKey: "chat",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            section: t.governanceAudit,
            label: t.clinicNotices,
            href: "/dashboard/patient?tab=announcements",
            tabKey: "announcements",
            icon: <Megaphone className="w-4 h-4" />,
          },
        ]
      : []),

    {
      section: t.publicPortal,
      label: t.findDoctorsChambers,
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

  const sidebarElement = (
    <div className="flex flex-col h-full justify-between p-4 bg-[var(--bg-sidebar)] border-r border-slate-200/80 dark:border-slate-800/80">
      {/* Brand & Organization Header */}
      <div className="flex flex-col flex-1 min-h-0">
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 mb-3 shrink-0 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all group cursor-pointer"
          title="Return to Home Page"
        >
          <div className="relative w-10 h-10 overflow-hidden rounded-2xl shadow-md shadow-[var(--brand-primary)]/20 group-hover:scale-105 transition-transform">
            <Image src="/icons/icon.svg" alt="CareFlow" fill sizes="40px" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight group-hover:text-[var(--brand-text)] transition-colors">
              CareFlow
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Medical Suite v2.0
            </p>
          </div>
        </Link>

        {/* Organization / Subscription / System Status Area */}
        {role === RoleName.SUPER_ADMIN ? (
          <div className="mx-1 mb-4 p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-slate-500/5 to-purple-500/5 dark:from-purple-950/40 dark:via-slate-900/40 dark:to-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs shrink-0 space-y-2.5">
            {/* Header: Status & Role */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  {t.roleSuperAdmin || "Super Admin"}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-700/60 font-mono">
                ∞ {t.unlimitedQuota}
              </span>
            </div>

            {/* Platform Scope & Authority Info */}
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {t.rootSystemOperator}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                {t.fullSystemAccessUnlimited}
              </p>
            </div>

            {/* Informative System Capabilities Strip */}
            <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-purple-100 dark:border-purple-900/40 text-[9px]">
              <div className="px-2 py-1 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-purple-100/80 dark:border-purple-900/30 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium truncate">{t.clinicsOrganizations}</span>
                <span className="font-bold text-purple-700 dark:text-purple-300 ml-1">Full</span>
              </div>
              <div className="px-2 py-1 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-purple-100/80 dark:border-purple-900/30 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium truncate">{t.security}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-1">Root</span>
              </div>
            </div>
          </div>
        ) : subInfo ? (
          <div className="mx-1 mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 shrink-0">
            {/* Clinic & Plan Header */}
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {subInfo.organizationName || user.organization?.name || t.clinicFacility}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] font-semibold text-[var(--brand-primary)] truncate">
                    {subInfo.planName}
                  </span>
                  {subInfo.isTrial && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                      {subInfo.daysLeft !== undefined ? `${subInfo.daysLeft}d left` : "Trial"}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`text-xs font-black font-mono shrink-0 px-2 py-0.5 rounded-lg ${
                  subInfo.usagePercent.overall >= 90
                    ? "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border border-red-200/60"
                    : subInfo.usagePercent.overall >= 75
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/60"
                    : "bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]"
                }`}
                title={t.overallQuotaUsage}
              >
                {subInfo.usagePercent.overall}%
              </span>
            </div>

            {/* Quota Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
                <span>{t.overallQuotaUsage}</span>
                <span className="font-bold">{subInfo.usagePercent.overall}% {t.quotaCapUsed}</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    subInfo.usagePercent.overall >= 90
                      ? "bg-red-500"
                      : subInfo.usagePercent.overall >= 75
                      ? "bg-amber-500"
                      : "bg-[var(--brand-primary)]"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, subInfo.usagePercent.overall))}%` }}
                />
              </div>
            </div>

            {/* Informative Quota Metrics Grid */}
            {subInfo.counts && subInfo.limits && (
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                <div className="p-1.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[9px] text-slate-400 font-medium truncate">{t.registeredDoctors}</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {subInfo.counts.doctors}
                    <span className="text-[9px] font-normal text-slate-400">
                      /{subInfo.limits.maxDoctors ?? "∞"}
                    </span>
                  </p>
                </div>
                <div className="p-1.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[9px] text-slate-400 font-medium truncate">{t("uiStaffDesk", "Staff")}</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {subInfo.counts.staff}
                    <span className="text-[9px] font-normal text-slate-400">
                      /{subInfo.limits.maxStaff ?? "∞"}
                    </span>
                  </p>
                </div>
                <div className="p-1.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[9px] text-slate-400 font-medium truncate">{t.patientsEnrolled}</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {subInfo.counts.patients}
                    <span className="text-[9px] font-normal text-slate-400">
                      /{subInfo.limits.maxPatients ?? "∞"}
                    </span>
                  </p>
                </div>
                <div className="p-1.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[9px] text-slate-400 font-medium truncate">{t.prescriptionsThisMonth}</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {subInfo.counts.prescriptionsThisMonth}
                    <span className="text-[9px] font-normal text-slate-400">
                      /{subInfo.limits.maxPrescriptionsPerMonth ?? "∞"}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {role === RoleName.ADMIN && (
              <Link
                href="/dashboard/admin?tab=billing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-[10px] font-bold text-[var(--brand-primary)] hover:underline pt-0.5"
              >
                <span>{t.viewClinicSubscription}</span>
                <span>→</span>
              </Link>
            )}
          </div>
        ) : null}

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
            {t.appearance}
          </span>
          <ThemeCustomizer compact direction="up" align="right" />
        </div>

        {/* User Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            {/* User Avatar with Initials & Online Status */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-slate-800 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>

            {/* Name, Email, & Role Badge */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5 mb-0.5">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${getRoleBadge(
                    role,
                  )}`}
                >
                  {getRoleTitle(role)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              {user.organization?.name && role !== RoleName.SUPER_ADMIN && (
                <p className="text-[10px] font-medium text-[var(--brand-primary)] truncate mt-0.5">
                  {user.organization.name}
                </p>
              )}
            </div>
          </div>

          {/* Action Row: Security / 2FA & Logout */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/70 dark:border-slate-800/70">
            <button
              type="button"
              onClick={() => setChangePasswordOpen(true)}
              className="text-[11px] font-semibold text-slate-500 hover:text-[var(--brand-primary)] dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition cursor-pointer"
              title="Account Security, 2FA & Password"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{t.security}</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="text-[11px] font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
              title={t.logout}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>{t.logout}</span>
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
                {t("emrCloudActive", "EMR Cloud Active")}
              </span>

              {role === RoleName.SUPER_ADMIN ? (
                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60">
                  {t.roleSuperAdmin || "Super Admin"}
                </span>
              ) : subInfo ? (
                <Link
                  href={role === RoleName.ADMIN ? "/dashboard/admin?tab=billing" : "#"}
                  className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[var(--brand-border)] transition"
                  title={`${subInfo.planName} • ${t.overallLimitUsed}: ${subInfo.usagePercent.overall}%`}
                >
                  <span className="truncate max-w-[120px] font-bold">{subInfo.planName}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span
                    className={`font-mono text-[10px] font-extrabold ${
                      subInfo.usagePercent.overall >= 90
                        ? "text-red-500"
                        : subInfo.usagePercent.overall >= 75
                        ? "text-amber-500"
                        : "text-[var(--brand-primary)]"
                    }`}
                  >
                    {subInfo.usagePercent.overall}%
                  </span>
                </Link>
              ) : null}
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
