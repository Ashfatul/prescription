"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TemplateManager } from "@/components/dashboard/template-manager";
import { CatalogManager } from "@/components/dashboard/catalog-manager";
import { UserManager } from "@/components/dashboard/user-manager";
import { RolePermissionManager } from "@/components/dashboard/role-permission-manager";
import { Users, Pill, FileCode2, Shield, ArrowRight, UserPlus } from "lucide-react";

interface AdminDashboardViewProps {
  stats: {
    users: number;
    doctors: number;
    patients: number;
    appointments: number;
    prescriptions: number;
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

type TabKey = "overview" | "users" | "catalog" | "tests" | "templates" | "roles";

export function AdminDashboardView({ stats, users }: AdminDashboardViewProps) {
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
      : "overview";

  return (
    <div className="space-y-6">
      {/* Overview View */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-primary)] text-xs font-bold">
                Administration Center
              </span>
              <span className="text-xs text-[var(--text-muted)] font-medium">• Clinical Care Network HQ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              System Administration & Analytics
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Real-time hospital network performance metrics, registered clinicians, patient volumes, and master health catalog.
            </p>
          </div>

          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              { label: "Active Users", value: stats.users, icon: "👥" },
              { label: "Registered Doctors", value: stats.doctors, icon: "🩺" },
              { label: "Enrolled Patients", value: stats.patients, icon: "🏥" },
              { label: "Appointments", value: stats.appointments, icon: "🗓️" },
              { label: "Prescriptions", value: stats.prescriptions, icon: "📝" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{stat.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Live
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
                <span>User Accounts CRUD</span>
                <ArrowRight className="h-4 w-4 transition transform group-hover:translate-x-1" />
              </h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Create doctors, patients, staff. Edit credentials, reset passwords & delete accounts.
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
                <span>Formulary Catalog</span>
                <ArrowRight className="h-4 w-4 transition transform group-hover:translate-x-1" />
              </h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Manage global medicines catalog, dosages, timings and diagnostic test investigations.
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
                <span>Prescription Designer</span>
                <ArrowRight className="h-4 w-4 transition transform group-hover:translate-x-1" />
              </h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Watermark behind logo, drag text anywhere, custom fonts, offsets and visibility toggles.
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
                <span>Role Permissions Matrix</span>
                <ArrowRight className="h-4 w-4 transition transform group-hover:translate-x-1" />
              </h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Checkbox-based access control for SUPER_ADMIN, DOCTOR, STAFF, and PATIENT roles.
              </p>
            </Link>
          </div>

          {/* User Directory Preview */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Hospital Directory & Access Accounts
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {users.length} verified accounts in database
                </p>
              </div>

              <Link
                href="/dashboard/admin?tab=users"
                className="flex items-center gap-1.5 rounded-xl bg-[var(--brand-primary)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-110"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Manage All Accounts
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
    </div>
  );
}
