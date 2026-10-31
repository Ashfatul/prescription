"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { TemplateManager } from "@/components/dashboard/template-manager";
import { CatalogManager } from "@/components/dashboard/catalog-manager";

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

export function AdminDashboardView({ stats, users }: AdminDashboardViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTab = searchParams.get("tab");

  const activeTab: "overview" | "catalog" | "templates" =
    urlTab === "catalog" ? "catalog" : urlTab === "templates" ? "templates" : "overview";

  const handleTabChange = (tab: "overview" | "catalog" | "templates") => {
    router.replace(`/dashboard/admin?tab=${tab}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-xs font-bold">
              Administration Center
            </span>
            <span className="text-xs text-slate-400 font-medium">• Health Network HQ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage hospital network metrics, formulary catalog, and master prescription designs.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleTabChange("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "overview"
                ? "bg-[var(--brand-primary)] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            📊 Analytics & Users
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("catalog")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "catalog"
                ? "bg-[var(--brand-primary)] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            💊 Formulary Catalog
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("templates")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "templates"
                ? "bg-[var(--brand-primary)] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            🏥 Master Templates
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              { label: "Active Users", value: stats.users, icon: "👥", color: "from-blue-500 to-cyan-500" },
              { label: "Registered Doctors", value: stats.doctors, icon: "🩺", color: "from-teal-500 to-emerald-500" },
              { label: "Enrolled Patients", value: stats.patients, icon: "🏥", color: "from-indigo-500 to-violet-500" },
              { label: "Appointments", value: stats.appointments, icon: "🗓️", color: "from-amber-500 to-orange-500" },
              { label: "Prescriptions", value: stats.prescriptions, icon: "📝", color: "from-rose-500 to-pink-500" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{stat.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Live
                  </span>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </span>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* User Directory */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Hospital Directory & Access Accounts
                </h2>
                <p className="text-xs text-slate-500">
                  {users.length} verified accounts in database
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-[var(--brand-border)] transition-all"
                >
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {u.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shrink-0">
                    {u.role.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "catalog" && <CatalogManager />}

      {activeTab === "templates" && <TemplateManager />}
    </div>
  );
}
