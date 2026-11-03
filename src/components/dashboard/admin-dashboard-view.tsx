"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TemplateManager } from "@/components/dashboard/template-manager";
import { CatalogManager } from "@/components/dashboard/catalog-manager";
import { UserManager } from "@/components/dashboard/user-manager";
import { RolePermissionManager } from "@/components/dashboard/role-permission-manager";
import { SettingsManager } from "@/components/dashboard/settings-manager";
import { OrganizationManager } from "@/components/dashboard/organization-manager";
import { SaasPricingManager } from "@/components/dashboard/saas-pricing-manager";
import { ActivityLogViewer } from "@/components/dashboard/activity-log-viewer";
import { AnnouncementsManager } from "@/components/dashboard/announcements-manager";
import { AnnouncementsBanner } from "@/components/dashboard/announcements-banner";
import { ClinicalChat } from "@/components/dashboard/clinical-chat";
import { TrialCountdownBanner } from "@/components/dashboard/trial-countdown-banner";
import { ClinicSubscriptionView } from "@/components/dashboard/clinic-subscription-view";
import { EmailTemplateManager } from "@/components/dashboard/email-template-manager";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Users,
  Pill,
  FileCode2,
  Shield,
  ArrowRight,
  UserPlus,
  Activity,
  TrendingUp,
  Stethoscope,
} from "lucide-react";

interface AdminDashboardViewProps {
  stats: {
    users: number;
    doctors: number;
    patients: number;
    appointments: number;
    prescriptions: number;
    topMedicines?: Array<{ name: string; count: number; percentage: number }>;
    topDiagnoses?: Array<{ name: string; count: number; percentage: number }>;
    sampleSize?: number;
  };
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: {
      name: string;
    };
  }>;
}

type TabKey =
  | "overview"
  | "users"
  | "catalog"
  | "tests"
  | "templates"
  | "roles"
  | "settings"
  | "organizations"
  | "pricing"
  | "billing"
  | "activity"
  | "announcements"
  | "email-templates"
  | "chat";

export function AdminDashboardView({ stats, users }: AdminDashboardViewProps) {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");

  const activeTab: TabKey =
    urlTab === "users"
      ? "users"
      : urlTab === "catalog"
      ? "catalog"
      : urlTab === "tests"
      ? "tests"
      : urlTab === "templates"
      ? "templates"
      : urlTab === "roles"
      ? "roles"
      : urlTab === "settings"
      ? "settings"
      : urlTab === "organizations"
      ? "organizations"
      : urlTab === "pricing"
      ? "pricing"
      : urlTab === "billing"
      ? "billing"
      : urlTab === "activity"
      ? "activity"
      : urlTab === "announcements"
      ? "announcements"
      : urlTab === "email-templates"
      ? "email-templates"
      : urlTab === "chat"
      ? "chat"
      : "overview";

  return (
    <div className="space-y-6">
      {/* Live Free Trial Countdown Banner */}
      <TrialCountdownBanner />

      {/* Overview View */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Active Broadcast Announcements Banner */}
          <AnnouncementsBanner />

          {/* Top Banner */}
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-primary)] text-xs font-bold">
                {currentUser?.role === "SUPER_ADMIN"
                  ? (language === "bn" ? "প্ল্যাটফর্ম হেডকোয়ার্টার" : "Platform HQ Executive")
                  : (language === "bn" ? "ক্লিনিক প্রশাসন কেন্দ্র" : "Clinic Administration Center")}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                • {currentUser?.organizationName || (language === "bn" ? "কেয়ার নেটওয়ার্ক" : "Care Network")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {currentUser?.role === "SUPER_ADMIN"
                ? t.adminOverviewTitle
                : `${currentUser?.organizationName || "Clinic"} ${language === "bn" ? "ড্যাশবোর্ড ও পরিসংখ্যান" : "Dashboard & Analytics"}`}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {currentUser?.role === "SUPER_ADMIN"
                ? t.adminOverviewSubtitle
                : (language === "bn"
                    ? "রিয়েল-টাইম ক্লিনিক পারফরম্যান্স মেট্রিক্স, চিকিৎসক, তালিকাভুক্ত রোগী এবং নিজস্ব ক্যাটালগ ব্যবস্থাপনা।"
                    : "Real-time clinic performance metrics, attending physicians, registered patients, and dedicated formulary catalog.")}
            </p>
          </div>

          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              { label: language === "bn" ? "সক্রিয় ব্যবহারকারী" : "Active Users", value: stats.users, icon: "👥" },
              { label: language === "bn" ? "নিবন্ধিত চিকিৎসক" : "Registered Doctors", value: stats.doctors, icon: "🩺" },
              { label: language === "bn" ? "তালিকাভুক্ত রোগী" : "Enrolled Patients", value: stats.patients, icon: "🏥" },
              { label: t.appointments, value: stats.appointments, icon: "🗓️" },
              { label: t.prescriptions, value: stats.prescriptions, icon: "📝" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{stat.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {language === "bn" ? "লাইভ" : "Live"}
                  </span>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    {stat.value}
                  </span>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Clinical Intelligence: Top Prescribed Drugs & Prevalent Diagnoses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Prescribed Medications */}
            <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {language === "bn" ? "সর্বাধিক প্রেসক্রাইবকৃত ঔষধ" : "Top Prescribed Drugs"}
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {language === "bn" ? "সকল চেম্বারে সর্বাধিক সুপারিশকৃত প্রয়োজনীয় ঔষধ" : "Most frequent medications issued across all clinical chambers"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--brand-surface)] text-[var(--brand-text)]">
                  {language === "bn" ? "ফার্মাসিউটিক্যাল পরিসংখ্যান" : "Formulary Insights"}
                </span>
              </div>

              {stats.topMedicines && stats.topMedicines.length > 0 ? (
                <div className="space-y-3">
                  {stats.topMedicines.map((item, idx) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">{idx + 1}.</span>
                          <span>{item.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[var(--brand-text)]">
                            {item.count} {language === "bn" ? "টি প্রেসক্রিপশন" : "prescriptions"}
                          </span>
                          <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                            ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-500"
                          style={{ width: `${Math.max(item.percentage, 8)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                  <Activity className="w-6 h-6 mx-auto mb-1 opacity-40" />
                  <span>{language === "bn" ? "কোনো প্রেসক্রিপশন তথ্য পাওয়া যায়নি।" : "No prescription medication data recorded yet."}</span>
                </div>
              )}
            </div>

            {/* Prevalent Clinical Diagnoses */}
            <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {language === "bn" ? "প্রচলিত রোগনির্ণয় (Dx)" : "Prevalent Diagnoses"}
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {language === "bn" ? "চিকিৎসক কর্তৃক রেকর্ডকৃত প্রধান স্বাস্থ্য সমস্যাসমূহ" : "Primary clinical conditions recorded by physicians"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {language === "bn" ? "রোগতত্ত্ব" : "Epidemiology"}
                </span>
              </div>

              {stats.topDiagnoses && stats.topDiagnoses.length > 0 ? (
                <div className="space-y-3">
                  {stats.topDiagnoses.map((item, idx) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5 truncate max-w-[220px]">
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">{idx + 1}.</span>
                          <span className="truncate">{item.name}</span>
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            {item.count} {language === "bn" ? "টি ঘটনা" : "cases"}
                          </span>
                          <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                            ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${Math.max(item.percentage, 8)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                  <Activity className="w-6 h-6 mx-auto mb-1 opacity-40" />
                  <span>{language === "bn" ? "কোনো রোগনির্ণয় তথ্য পাওয়া যায়নি।" : "No clinical diagnoses recorded yet."}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Management Hub Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/admin?tab=users"
              className="group rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm transition hover:border-[var(--brand-primary)] block"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] flex items-center justify-between">
                <span>{t.userAccounts}</span>
                <ArrowRight className="h-4 w-4 transition transform group-hover:translate-x-1" />
              </h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {language === "bn" ? "চিকিৎসক, রোগী ও স্টাফ তৈরি করুন। ক্রেডেনশিয়াল ও পাসওয়ার্ড রিসেট করুন।" : "Create doctors, patients, staff. Edit credentials, reset passwords & delete accounts."}
              </p>
            </Link>

            <Link
              href="/dashboard/admin?tab=catalog"
              className="group rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm transition hover:border-[var(--brand-primary)] block"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Pill className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] flex items-center justify-between">
                <span>{t.medicalFormulary}</span>
                <ArrowRight className="h-4 w-4 transition transform group-hover:translate-x-1" />
              </h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {language === "bn" ? "ঔষধের ব্র্যান্ড, জেনেরিক, সেবনবিধি এবং ল্যাব টেস্টসমূহ পরিচালনা করুন।" : "Manage global medicines catalog, dosages, timings and diagnostic test investigations."}
              </p>
            </Link>

            <Link
              href="/dashboard/admin?tab=templates"
              className="group rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm transition hover:border-[var(--brand-primary)] block"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <FileCode2 className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] flex items-center justify-between">
                <span>{t.prescriptionDesigner}</span>
                <ArrowRight className="h-4 w-4 transition transform group-hover:translate-x-1" />
              </h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {language === "bn" ? "লোগো, ওয়াটারমার্ক, কাস্টম ফন্ট ও অবস্থান অনুযায়ী প্রেসক্রিপশন সাজান।" : "Watermark behind logo, drag text anywhere, custom fonts, offsets and visibility toggles."}
              </p>
            </Link>

            <Link
              href="/dashboard/admin?tab=roles"
              className="group rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm transition hover:border-[var(--brand-primary)] block"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] flex items-center justify-between">
                <span>{t.rolesPermissions}</span>
                <ArrowRight className="h-4 w-4 transition transform group-hover:translate-x-1" />
              </h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {language === "bn" ? "অ্যাডমিন, চিকিৎসক, স্টাফ ও রোগীদের এক্সেস নিয়ন্ত্রণ ম্যাট্রিক্স।" : "Checkbox-based access control for SUPER_ADMIN, DOCTOR, STAFF, and PATIENT roles."}
              </p>
            </Link>
          </div>

          {/* User Directory Preview */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {language === "bn" ? "হাসপাতাল ডিরেক্টরি ও অ্যাকাউন্ট" : "Hospital Directory & Access Accounts"}
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {users.length} {language === "bn" ? "টি যাচাইকৃত অ্যাকাউন্ট" : "verified accounts in database"}
                </p>
              </div>

              <Link
                href="/dashboard/admin?tab=users"
                className="flex items-center gap-1.5 rounded-xl bg-[var(--brand-primary)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-110"
              >
                <UserPlus className="h-3.5 w-3.5" />
                {language === "bn" ? "সকল অ্যাকাউন্ট পরিচালনা" : "Manage All Accounts"}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.slice(0, 9).map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 hover:border-[var(--brand-primary)] transition-all"
                >
                  <div className="truncate">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {u.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">{u.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-subtle)] text-[var(--text-secondary)] shrink-0">
                    {u.role.name}
                  </span>
                </div>
              ))}
            </div>

            {users.length > 9 && (
              <div className="pt-2 text-center">
                <Link
                  href="/dashboard/admin?tab=users"
                  className="text-xs font-bold text-[var(--brand-primary)] hover:underline"
                >
                  View and manage all {users.length} accounts →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab Content (Full CRUD) */}
      {activeTab === "users" && <UserManager />}

      {/* Pharmaceutical Drugs */}
      {activeTab === "catalog" && <CatalogManager initialTab="medicines" />}

      {/* Diagnostic Lab Tests */}
      {activeTab === "tests" && <CatalogManager initialTab="tests" />}

      {/* Prescription Designer Tab Content */}
      {activeTab === "templates" && <TemplateManager />}

      {/* Role Permissions Tab Content */}
      {activeTab === "roles" && <RolePermissionManager />}

      {/* Hospital & Chamber Settings Tab Content */}
      {activeTab === "settings" && <SettingsManager />}

      {/* Multi-Clinic SaaS Organizations Tab */}
      {activeTab === "organizations" && (
        currentUser?.role === "SUPER_ADMIN" ? (
          <OrganizationManager />
        ) : (
          <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center space-y-2">
            <p className="text-base font-bold text-[var(--text-primary)]">
              {language === "bn" ? "অননুমোদিত প্রবেশাধিকার" : "Restricted Access"}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {language === "bn"
                ? "মাল্টি-ক্লিনিক SaaS প্রতিষ্ঠান ডিরেক্টরি শুধুমাত্র প্ল্যাটফর্ম সুপার অ্যাডমিনিস্ট্রেটরদের জন্য নির্ধারিত।"
                : "Multi-clinic SaaS organization directory is only accessible by platform Super Administrators."}
            </p>
          </div>
        )
      )}

      {/* SaaS Product Pricing Plans Tab */}
      {activeTab === "pricing" && (
        currentUser?.role === "SUPER_ADMIN" ? (
          <SaasPricingManager />
        ) : (
          <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center space-y-2">
            <p className="text-base font-bold text-[var(--text-primary)]">
              {language === "bn" ? "অননুমোদিত প্রবেশাধিকার" : "Restricted Access"}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {language === "bn"
                ? "SaaS প্যাকেজ মূল্য নির্ধারণ শুধুমাত্র প্ল্যাটফর্ম সুপার অ্যাডমিনিস্ট্রেটরদের জন্য সংরক্ষিত।"
                : "SaaS Pricing tier configuration is reserved for platform Super Administrators."}
            </p>
          </div>
        )
      )}

      {/* Clinic SaaS Subscription & Billing Tab */}
      {activeTab === "billing" && <ClinicSubscriptionView />}

      {/* System Activity Audit Log Tab */}
      {activeTab === "activity" && <ActivityLogViewer />}

      {/* Broadcast Announcements Tab */}
      {activeTab === "announcements" && (
        <AnnouncementsManager canManage={true} userRole={currentUser?.role || "ADMIN"} />
      )}

      {/* Communications & Email Templates Tab */}
      {activeTab === "email-templates" && (
        currentUser?.role === "SUPER_ADMIN" ? (
          <EmailTemplateManager />
        ) : (
          <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center space-y-2">
            <p className="text-base font-bold text-[var(--text-primary)]">
              {language === "bn" ? "অননুমোদিত প্রবেশাধিকার" : "Restricted Access"}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {language === "bn"
                ? "গ্লোবাল ইমেইল টেমপ্লেট প্রণয়ন শুধুমাত্র প্ল্যাটফর্ম সুপার অ্যাডমিনিস্ট্রেটরদের জন্য সংরক্ষিত।"
                : "Global email template authoring is reserved for platform Super Administrators."}
            </p>
          </div>
        )
      )}

      {/* Clinical Chat Tab */}
      {activeTab === "chat" && currentUser && (
        <ClinicalChat currentUserId={currentUser.id} />
      )}
    </div>
  );
}
