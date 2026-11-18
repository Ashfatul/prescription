"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { RoleName } from "@prisma/client";
import {
  Shield,
  Stethoscope,
  UserCheck,
  Heart,
  Search,
  Save,
  RotateCcw,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  Code,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
  CheckCircle2,
  XCircle,
  Layers,
} from "lucide-react";
import {
  PermissionDefinition,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/lib/auth/permissions";
import { useLanguage } from "@/lib/i18n/language-context";
import { notifyToast } from "@/lib/toast";

interface RolePermissionsData {
  categories: string[];
  availablePermissions: PermissionDefinition[];
  roles: Record<string, string[]>;
}

const ALL_ROLES = [
  RoleName.SUPER_ADMIN,
  RoleName.ADMIN,
  RoleName.DOCTOR,
  RoleName.STAFF,
  RoleName.PATIENT,
];

export function RolePermissionManager() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<RolePermissionsData | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [initialRolePermissions, setInitialRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters, Search & Role View
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedRoleView, setSelectedRoleView] = useState<RoleName | "ALL">("ALL");
  const [showDevGuide, setShowDevGuide] = useState(false);

  // Dynamic role metadata with dual-locale translations
  const getRoleMeta = useCallback(
    (role: RoleName) => {
      switch (role) {
        case RoleName.SUPER_ADMIN:
          return {
            label: t.roleSuperAdmin || "Super Admin",
            shortLabel: "Super",
            icon: Shield,
            color: "text-amber-600 bg-amber-500/10 border-amber-500/30 dark:text-amber-400",
            desc: t.uiSuperAdminDesc,
          };
        case RoleName.ADMIN:
          return {
            label: t.roleClinicAdmin || "Clinic Administrator",
            shortLabel: "Admin",
            icon: Shield,
            color: "text-purple-600 bg-purple-500/10 border-purple-500/30 dark:text-purple-400",
            desc: t.uiClinicAdminDesc,
          };
        case RoleName.DOCTOR:
          return {
            label: t.roleDoctor || "Physician / Doctor",
            shortLabel: "Doctor",
            icon: Stethoscope,
            color: "text-teal-600 bg-teal-500/10 border-teal-500/30 dark:text-teal-400",
            desc: t.uiDoctorDesc,
          };
        case RoleName.STAFF:
          return {
            label: t.roleStaff || "Clinical Staff",
            shortLabel: "Staff",
            icon: UserCheck,
            color: "text-blue-600 bg-blue-500/10 border-blue-500/30 dark:text-blue-400",
            desc: t.uiStaffDesc,
          };
        case RoleName.PATIENT:
          return {
            label: t.rolePatient || "Patient",
            shortLabel: "Patient",
            icon: Heart,
            color: "text-rose-600 bg-rose-500/10 border-rose-500/30 dark:text-rose-400",
            desc: t.uiPatientDesc,
          };
      }
    },
    [t],
  );

  // Fetch permissions from API
  const fetchPermissions = useCallback(() => {
    fetch("/api/roles/permissions")
      .then((res) => {
        if (!res.ok) throw new Error(t.uiErrorFetchingPermissions);
        return res.json();
      })
      .then((json) => {
        const payload: RolePermissionsData = json.data;
        setData(payload);
        setRolePermissions(payload.roles);
        setInitialRolePermissions(JSON.parse(JSON.stringify(payload.roles)));
      })
      .catch((err: unknown) => {
        const errMsg = err instanceof Error ? err.message : t.uiErrorFetchingPermissions;
        setMessage({ type: "error", text: errMsg });
        notifyToast(errMsg, "error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [t]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Compute dirty/unsaved state
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(rolePermissions) !== JSON.stringify(initialRolePermissions);
  }, [rolePermissions, initialRolePermissions]);

  // Toggle single permission for a role
  const handleToggle = (role: RoleName, permissionId: string) => {
    setRolePermissions((prev) => {
      const currentList = prev[role] || [];
      const hasIt = currentList.includes(permissionId);
      const nextList = hasIt
        ? currentList.filter((p) => p !== permissionId)
        : [...currentList, permissionId];
      return {
        ...prev,
        [role]: nextList,
      };
    });
  };

  // Grant or Revoke all permissions in a category for a specific role
  const handleToggleCategory = (role: RoleName, category: string, grant: boolean) => {
    if (!data) return;
    const catPermIds = data.availablePermissions
      .filter((p) => p.category === category)
      .map((p) => p.id);

    setRolePermissions((prev) => {
      const currentList = prev[role] || [];
      let nextList: string[];
      if (grant) {
        nextList = Array.from(new Set([...currentList, ...catPermIds]));
      } else {
        nextList = currentList.filter((id) => !catPermIds.includes(id));
      }
      return {
        ...prev,
        [role]: nextList,
      };
    });
  };

  // Grant or Revoke all permissions in a category for all 5 roles
  const handleToggleCategoryForAllRoles = (category: string, grant: boolean) => {
    if (!data) return;
    const catPermIds = data.availablePermissions
      .filter((p) => p.category === category)
      .map((p) => p.id);

    setRolePermissions((prev) => {
      const updated: Record<string, string[]> = { ...prev };
      for (const r of ALL_ROLES) {
        const currentList = updated[r] || [];
        if (grant) {
          updated[r] = Array.from(new Set([...currentList, ...catPermIds]));
        } else {
          updated[r] = currentList.filter((id) => !catPermIds.includes(id));
        }
      }
      return updated;
    });
  };

  // Reset to factory defaults
  const handleResetToDefaults = () => {
    if (confirm(t.uiResetPermissionsConfirm)) {
      setRolePermissions(JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS)));
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    setRolePermissions(JSON.parse(JSON.stringify(initialRolePermissions)));
  };

  // Save changes to API
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/roles/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: rolePermissions }),
      });
      if (!res.ok) throw new Error(t.uiFailedToSavePermissions);
      const json = await res.json();
      setRolePermissions(json.data.roles);
      setInitialRolePermissions(JSON.parse(JSON.stringify(json.data.roles)));
      setMessage({ type: "success", text: t.uiPermissionsSavedSuccess });
      notifyToast(t.uiPermissionsSavedSuccess, "success");
      setTimeout(() => setMessage(null), 4000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : t.uiFailedToSavePermissions;
      setMessage({ type: "error", text: errMsg });
      notifyToast(errMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Filtered permissions list
  const filteredPermissions = useMemo(() => {
    if (!data) return [];
    return data.availablePermissions.filter((perm) => {
      const matchesCategory =
        selectedCategory === "ALL" || perm.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        perm.label.toLowerCase().includes(q) ||
        perm.id.toLowerCase().includes(q) ||
        perm.description.toLowerCase().includes(q) ||
        perm.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [data, selectedCategory, searchQuery]);

  // Group filtered permissions by category
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionDefinition[]> = {};
    for (const perm of filteredPermissions) {
      if (!groups[perm.category]) groups[perm.category] = [];
      groups[perm.category].push(perm);
    }
    return groups;
  }, [filteredPermissions]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center shadow-xs">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[var(--brand-primary)] border-t-transparent" />
        <p className="text-sm font-semibold text-[var(--text-secondary)]">
          {t.uiLoadingRolePermissions}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-primary)] shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {t.roleMatrixTitle}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {t.roleMatrixSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowDevGuide(!showDevGuide)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] cursor-pointer"
          >
            <Code className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
            {t("uiDeveloperGuide")}
            {showDevGuide ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-subtle)] hover:text-rose-600 cursor-pointer"
            title="Reset to recommended default baseline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("uiResetDefaults")}
          </button>

          {hasUnsavedChanges && (
            <button
              onClick={handleDiscardChanges}
              className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 cursor-pointer dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
            >
              {t.discardChanges}
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition ${
              hasUnsavedChanges
                ? "bg-[var(--brand-primary)] hover:brightness-110 cursor-pointer animate-pulse"
                : "bg-slate-400 opacity-60 cursor-not-allowed dark:bg-slate-700"
            }`}
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? (t("uiSaving")) : hasUnsavedChanges ? (t("uiSaveChanges")) : t.saved}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-semibold ${
            message.type === "success"
              ? "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-teal-300"
              : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Developer Instructions Card (Collapsible) */}
      {showDevGuide && (
        <div className="rounded-3xl border border-teal-500/20 bg-teal-50/40 p-6 shadow-sm dark:bg-teal-950/10">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-teal-950 dark:text-teal-200">
                  {t("uiDeveloperGuideAddingFutureFeature")}
                </h3>
                <p className="mt-0.5 text-xs text-teal-800/80 dark:text-teal-400/80">
                  {t("uiOurPermissionArchitectureUsesA")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-teal-500/20 bg-white/70 p-3.5 dark:bg-slate-900/60">
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                    {t("uiStepOpenRegistry")}
                  </span>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {t("uiNavigateTo")}{" "}
                    <code className="rounded bg-teal-100 px-1 py-0.5 text-[11px] font-mono dark:bg-teal-950">src/lib/auth/permissions.ts</code>.
                  </p>
                </div>

                <div className="rounded-2xl border border-teal-500/20 bg-white/70 p-3.5 dark:bg-slate-900/60">
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                    {t("uiStepAddDefinition")}
                  </span>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {language === "bn" ? (
                      <>
                        <code className="rounded bg-teal-100 px-1 py-0.5 text-[11px] font-mono dark:bg-teal-950">AVAILABLE_PERMISSIONS</code>-এ{" "}
                        <code className="font-mono text-[11px]">id, label, category, description</code> সহ নতুন এন্ট্রি যুক্ত করুন।
                      </>
                    ) : (
                      <>
                        Append your permission entry to <code className="rounded bg-teal-100 px-1 py-0.5 text-[11px] font-mono dark:bg-teal-950">AVAILABLE_PERMISSIONS</code> with <code className="font-mono text-[11px]">id, label, category, description</code>.
                      </>
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-teal-500/20 bg-white/70 p-3.5 dark:bg-slate-900/60">
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                    {t("uiStepAutoDiscovery")}
                  </span>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {language === "bn" ? (
                      <>
                        কোনো বাড়তি ইউআই কোড ছাড়াই নতুন পারমিশনটি এই ম্যাট্রিক্সে প্রদর্শিত হবে এবং <code className="font-mono text-[11px]">requirePermission()</code> এর মাধ্যমে প্রয়োগ করা যাবে।
                      </>
                    ) : (
                      <>
                        Zero UI code needed! The new permission instantly renders in this checkbox matrix and can be enforced via <code className="font-mono text-[11px]">requirePermission()</code>.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-teal-500/15 bg-slate-900 p-4 font-mono text-[11px] text-teal-300">
                <p className="text-slate-400">{"// Example in src/lib/auth/permissions.ts:"}</p>
                <p className="mt-1 text-emerald-400">
                  &#123; id: &quot;telehealth:start_call&quot;, label: &quot;Start Video Consultation&quot;, category: &quot;Clinical Prescriptions&quot;, description: &quot;Enables doctors to initiate live telehealth consultations.&quot; &#125;,
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Summary Metric Cards: Fully Responsive 5-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {ALL_ROLES.map((role) => {
          const meta = getRoleMeta(role);
          const Icon = meta.icon;
          const assignedCount = (rolePermissions[role] || []).length;
          const totalCount = data?.availablePermissions.length || 0;
          const pct = totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0;
          const isSelected = selectedRoleView === role;

          return (
            <div
              key={role}
              onClick={() => setSelectedRoleView(isSelected ? "ALL" : role)}
              className={`flex flex-col justify-between rounded-3xl border bg-[var(--bg-surface)] p-4.5 shadow-xs transition-all cursor-pointer hover:border-[var(--brand-primary)] ${
                isSelected
                  ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/25 bg-[var(--brand-surface)]/20 shadow-md"
                  : "border-[var(--border-subtle)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${meta.color} shrink-0`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate block">
                      {meta.label}
                    </span>
                    <span className="block text-[10px] text-[var(--text-muted)] font-mono">
                      {role}
                    </span>
                  </div>
                </div>

                <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] font-bold text-[var(--text-secondary)] shrink-0">
                  {pct}%
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>{t("uiAssignedPermissions")}</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {assignedCount} / {totalCount}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Category Filter Suite */}
      <div className="space-y-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
        {/* Full-Width Spacious Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("uiSearchPermissionsByCapabilityName")}
              className="w-full min-h-[44px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)] py-2.5 input-icon-left !pl-11 pr-10 text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:border-[var(--brand-primary)] focus:bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Matches Counter & Reset */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]">
              <span>{t.matching}:</span>
              <span className="font-bold text-[var(--brand-primary)]">
                {filteredPermissions.length}
              </span>
              <span className="text-[var(--text-muted)]">
                / {data?.availablePermissions.length || 0}
              </span>
            </div>

            {(searchQuery || selectedCategory !== "ALL" || selectedRoleView !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                  setSelectedRoleView("ALL");
                }}
                className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 cursor-pointer dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills (Full Width Row with clear category navigation) */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t("uiFilterByCategory")}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {selectedCategory === "ALL" ? (t("uiShowingAllCategories")) : `${t("uiFiltered")}: ${selectedCategory}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-app)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
              }`}
            >
              {t.allCategories} ({data?.availablePermissions.length || 0})
            </button>
            {data?.categories.map((cat) => {
              const count = data.availablePermissions.filter((p) => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-[var(--brand-primary)] text-white shadow-xs"
                      : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-app)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role View Filter Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedRoleView("ALL")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRoleView === "ALL"
                ? "bg-[var(--brand-primary)] text-white shadow-xs"
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t.uiAllRolesMatrix}</span>
          </button>

          {ALL_ROLES.map((role) => {
            const meta = getRoleMeta(role);
            const Icon = meta.icon;
            const isSelected = selectedRoleView === role;
            return (
              <button
                key={role}
                onClick={() => setSelectedRoleView(role)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        {selectedRoleView === "ALL" && (
          <span className="text-[11px] text-[var(--text-muted)] hidden xl:inline-flex items-center gap-1.5 px-3">
            <span>← {t.uiHorizontalScrollHint} →</span>
          </span>
        )}
      </div>

      {/* View Mode 1: All 5 Roles Matrix (Structured Responsive Table) */}
      {selectedRoleView === "ALL" && (
        <div className="overflow-x-auto rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm scrollbar-thin">
          <div className="min-w-[960px] w-full">
            {/* Sticky Table Header */}
            <div className="sticky top-16 z-20 flex items-center border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 px-6 py-4 text-xs font-bold text-[var(--text-secondary)] shadow-xs backdrop-blur-md">
              <div className="w-[380px] lg:w-[440px] shrink-0 sticky left-0 z-30 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] pr-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span className="uppercase tracking-wider">{t.permissionCapability}</span>
                </div>
              </div>

              {/* Exactly 5 equal columns: Super Admin, Clinic Admin, Doctor, Staff, Patient */}
              <div className="flex-1 grid grid-cols-5 text-center">
                {ALL_ROLES.map((role) => {
                  const meta = getRoleMeta(role);
                  const Icon = meta.icon;
                  return (
                    <div key={role} className="flex flex-col items-center justify-center gap-1 px-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-xl border ${meta.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-full">
                        {meta.label}
                      </span>
                      <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                        {role}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grouped Permissions Content */}
            {Object.entries(groupedPermissions).length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--text-muted)]">
                {t("uiNoPermissionsMatchingYourSearch")}
              </div>
            ) : (
              Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="border-b border-[var(--border-subtle)] last:border-b-0">
                  {/* Category Group Header */}
                  <div className="flex items-center justify-between gap-4 bg-[var(--bg-subtle)]/75 px-6 py-3 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-primary)]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        {category}
                      </span>
                      <span className="rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
                        {perms.length} {t("uiCapabilities")}
                      </span>
                    </div>

                    {/* Category Quick Batch Actions for all 5 roles */}
                    <div className="flex items-center gap-1.5 text-[11px] shrink-0">
                      <span className="text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider mr-1">
                        {t.grantAllIn}:
                      </span>
                      {ALL_ROLES.map((r) => {
                        const meta = getRoleMeta(r);
                        return (
                          <button
                            key={r}
                            onClick={() => handleToggleCategory(r, category, true)}
                            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition cursor-pointer shadow-2xs"
                            title={`Grant all ${category} capabilities to ${meta.label}`}
                          >
                            +{meta.shortLabel}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handleToggleCategoryForAllRoles(category, true)}
                        className="rounded-lg border border-[var(--brand-primary)]/40 bg-[var(--brand-surface)] px-2.5 py-1 text-[10px] font-bold text-[var(--brand-primary)] hover:brightness-110 transition cursor-pointer shadow-2xs"
                        title={`Grant all ${category} capabilities to ALL 5 roles`}
                      >
                        +All
                      </button>
                    </div>
                  </div>

                  {/* Permission Rows */}
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {perms.map((perm) => {
                      return (
                        <div
                          key={perm.id}
                          className="flex items-center px-6 py-3.5 transition hover:bg-[var(--bg-subtle)]/30"
                        >
                          {/* Left: Permission Info (sticky on horizontal scroll) */}
                          <div className="w-[380px] lg:w-[440px] shrink-0 sticky left-0 z-10 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] pr-4 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--text-primary)]">
                                {perm.label}
                              </span>
                              <code className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-subtle)]/40">
                                {perm.id}
                              </code>
                            </div>
                            <p className="mt-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                              {perm.description}
                            </p>
                          </div>

                          {/* Right: Checkboxes for each of the 5 roles */}
                          <div className="flex-1 grid grid-cols-5 items-center text-center">
                            {ALL_ROLES.map((role) => {
                              const isAssigned = (rolePermissions[role] || []).includes(perm.id);
                              const meta = getRoleMeta(role);

                              return (
                                <div key={role} className="flex items-center justify-center">
                                  <label
                                    className={`group flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-all ${
                                      isAssigned
                                        ? "border-[var(--brand-primary)] bg-[var(--brand-surface)] text-[var(--brand-primary)] shadow-xs scale-105"
                                        : "border-[var(--border-subtle)] bg-[var(--bg-app)] text-transparent hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface)]"
                                    }`}
                                    title={`${isAssigned ? "Revoke" : "Grant"} ${perm.label} for ${meta.label}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isAssigned}
                                      onChange={() => handleToggle(role, perm.id)}
                                      className="sr-only"
                                    />
                                    {isAssigned ? (
                                      <CheckSquare className="h-5 w-5" />
                                    ) : (
                                      <Square className="h-5 w-5 text-[var(--border-subtle)] group-hover:text-[var(--text-muted)]" />
                                    )}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* View Mode 2: Single Role Focused View */}
      {selectedRoleView !== "ALL" && (
        <div className="space-y-4">
          {/* Active Role Header Banner */}
          {(() => {
            const meta = getRoleMeta(selectedRoleView);
            const Icon = meta.icon;
            const assignedCount = (rolePermissions[selectedRoleView] || []).length;
            const totalCount = data?.availablePermissions.length || 0;
            const pct = totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0;

            return (
              <div className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl border ${meta.color} flex items-center justify-center shrink-0 shadow-xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        {meta.label}
                      </h3>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                        {selectedRoleView}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {meta.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {assignedCount} / {totalCount} ({pct}%)
                    </span>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {t.uiTotalAssignedCapabilities}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRoleView("ALL")}
                    className="px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-app)] text-xs font-bold text-[var(--text-secondary)] transition-all cursor-pointer"
                  >
                    {t.uiViewMatrix}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Capabilities Grouped by Category in Focused Mode */}
          {Object.entries(groupedPermissions).length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)] rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              {t("uiNoPermissionsMatchingYourSearch")}
            </div>
          ) : (
            Object.entries(groupedPermissions).map(([category, perms]) => (
              <div key={category} className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm overflow-hidden">
                {/* Category Header */}
                <div className="flex items-center justify-between gap-3 bg-[var(--bg-subtle)]/75 px-6 py-3.5 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-primary)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      {category}
                    </span>
                    <span className="rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
                      {perms.length} {t("uiCapabilities")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleCategory(selectedRoleView, category, true)}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-all cursor-pointer shadow-2xs"
                    >
                      {t.uiGrantAllInCategory}
                    </button>
                    <button
                      onClick={() => handleToggleCategory(selectedRoleView, category, false)}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px] font-bold text-[var(--text-secondary)] hover:text-red-600 hover:border-red-400 transition-all cursor-pointer shadow-2xs"
                    >
                      {t.uiRevokeAllInCategory}
                    </button>
                  </div>
                </div>

                {/* Capability Rows */}
                <div className="divide-y divide-[var(--border-subtle)]">
                  {perms.map((perm) => {
                    const isAssigned = (rolePermissions[selectedRoleView] || []).includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleToggle(selectedRoleView, perm.id)}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-subtle)]/30 transition-all cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--text-primary)]">
                              {perm.label}
                            </span>
                            <code className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-subtle)]/40">
                              {perm.id}
                            </code>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {perm.description}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              isAssigned
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-2xs"
                                : "bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                            }`}
                          >
                            {isAssigned ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{t.uiPermissionGranted}</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                <span>{t.uiPermissionRestricted}</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bottom Sticky Action Bar if changes pending */}
      {hasUnsavedChanges && (
        <div className="sticky bottom-4 z-40 flex items-center justify-between rounded-2xl border border-[var(--brand-primary)]/40 bg-[var(--bg-elevated)] p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-[var(--brand-primary)]" />
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {t.unsavedChanges}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscardChanges}
              className="rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              {t.discardChanges}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 cursor-pointer"
            >
              {saving ? (t("uiSaving")) : t.saveChangesBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}