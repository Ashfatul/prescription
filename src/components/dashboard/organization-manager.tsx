"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  Layers,
  Loader2,
  Plus,
  Stethoscope,
  X,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import { useLanguage } from "@/lib/i18n/language-context";

const inputClasses =
  "w-full px-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]";

type OrgItem = {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED" | "PENDING_APPROVAL";
  isApproved?: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  createdAt: string;
  plan?: {
    id: string;
    name: string;
    price: number;
  } | null;
  _count: {
    users: number;
    appointments: number;
    prescriptions: number;
  };
};

type SaaSMetrics = {
  totalOrganizations: number;
  totalUsers: number;
  totalDoctors: number;
  totalStaff: number;
  totalPatients: number;
  totalPrescriptions: number;
  estimatedMrr: number;
};

type PlanOption = {
  id: string;
  name: string;
  price: number;
};

export function OrganizationManager() {
  const { t, language } = useLanguage();
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [metrics, setMetrics] = useState<SaaSMetrics | null>(null);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrgItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [planId, setPlanId] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "TRIAL" | "SUSPENDED" | "PENDING_APPROVAL">("ACTIVE");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING_APPROVAL" | "ACTIVE" | "TRIAL" | "SUSPENDED">("ALL");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvalSuccess, setApprovalSuccess] = useState<string | null>(null);

  const handleApprove = async (orgId: string, orgName: string) => {
    setApprovingId(orgId);
    setApprovalSuccess(null);
    try {
      const res = await fetch(`/api/organizations/${orgId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrgs((prev) =>
          prev.map((o) =>
            o.id === orgId
              ? { ...o, status: "ACTIVE" as const, isApproved: true }
              : o
          )
        );
        setApprovalSuccess(`Clinic "${orgName}" approved & activated successfully! A confirmation email has been dispatched.`);
      } else {
        alert(data.message || "Failed to approve clinic");
      }
    } catch {
      alert("Network error approving clinic");
    } finally {
      setApprovingId(null);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orgsRes, metricsRes, plansRes] = await Promise.all([
        fetch("/api/organizations").then((r) => r.json()),
        fetch("/api/organizations/metrics").then((r) => r.json()),
        fetch("/api/pricing-plans?all=true").then((r) => r.json()),
      ]);

      if (orgsRes.success && Array.isArray(orgsRes.data)) setOrgs(orgsRes.data);
      if (metricsRes.success && metricsRes.data) setMetrics(metricsRes.data);
      if (plansRes.success && Array.isArray(plansRes.data)) setPlans(plansRes.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch("/api/organizations").then((r) => r.json()),
      fetch("/api/organizations/metrics").then((r) => r.json()),
      fetch("/api/pricing-plans?all=true").then((r) => r.json()),
    ])
      .then(([orgsRes, metricsRes, plansRes]) => {
        if (!isMounted) return;
        if (orgsRes.success && Array.isArray(orgsRes.data)) setOrgs(orgsRes.data);
        if (metricsRes.success && metricsRes.data) setMetrics(metricsRes.data);
        if (plansRes.success && Array.isArray(plansRes.data)) setPlans(plansRes.data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    setEditingOrg(null);
    setName("");
    setSlug("");
    setPlanId(plans[0]?.id || "");
    setContactEmail("");
    setContactPhone("");
    setAddress("");
    setStatus("ACTIVE");
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (org: OrgItem) => {
    setEditingOrg(org);
    setName(org.name);
    setSlug(org.slug);
    setPlanId(org.plan?.id || plans[0]?.id || "");
    setContactEmail(org.contactEmail || "");
    setContactPhone(org.contactPhone || "");
    setAddress(org.address || "");
    setStatus(org.status);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const endpoint = editingOrg ? `/api/organizations/${editingOrg.id}` : "/api/organizations";
      const method = editingOrg ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          planId: planId || undefined,
          contactEmail: contactEmail || undefined,
          contactPhone: contactPhone || undefined,
          address: address || undefined,
          status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchData();
      } else {
        setError(data.message || "Failed to save organization.");
      }
    } catch {
      setError("Network error saving clinic organization.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SaaS Global Metrics KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">{t.clinicsAndHospitals}</span>
              <Building2 className="w-4 h-4 text-[var(--brand-primary)]" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics.totalOrganizations}
            </div>
            <p className="text-[11px] text-slate-400">
              {t("uiPartitionedMultiTenantClinics")}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">{t.physiciansAndStaff}</span>
              <Stethoscope className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics.totalDoctors} <span className="text-xs font-normal text-slate-400">
                {t("uiDocs")} / {metrics.totalStaff} {t("uiStaff2")}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {t("uiActiveMedicalProfessionals")}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">{t.totalPrescriptionsCount}</span>
              <Layers className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics.totalPrescriptions}
            </div>
            <p className="text-[11px] text-slate-400">
              {t("uiAcrossAllConnectedClinics")}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">{t.saasActiveMrr}</span>
              <DollarSign className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-black text-[var(--brand-text)]">
              ${metrics.estimatedMrr}
              <span className="text-xs font-normal text-slate-400">/mo</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {t("uiEstimatedRecurringSoftwareRevenue")}
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.multiClinicHubTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {t.multiClinicHubSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.provisionNewClinic}</span>
        </button>
      </div>

      {/* Success Notification */}
      {approvalSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{approvalSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setApprovalSuccess(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 cursor-pointer text-xs"
          >
            {t("uiDismiss")}
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            statusFilter === "ALL"
              ? "bg-[var(--brand-primary)] text-white shadow-xs"
              : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-subtle)]"
          }`}
        >
          {t("uiAllClinics")} ({orgs.length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("PENDING_APPROVAL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            statusFilter === "PENDING_APPROVAL"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-subtle)]"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.approvalRequiredBadge}</span>
          {orgs.filter((o) => o.status === "PENDING_APPROVAL" || o.isApproved === false).length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {orgs.filter((o) => o.status === "PENDING_APPROVAL" || o.isApproved === false).length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("ACTIVE")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            statusFilter === "ACTIVE"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-subtle)]"
          }`}
        >
          {t.activeStatus} ({orgs.filter((o) => o.status === "ACTIVE" && o.isApproved !== false).length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("TRIAL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            statusFilter === "TRIAL"
              ? "bg-sky-600 text-white shadow-xs"
              : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-subtle)]"
          }`}
        >
          {t("uiFreeTrial")} ({orgs.filter((o) => o.status === "TRIAL").length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("SUSPENDED")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            statusFilter === "SUSPENDED"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-slate-600 dark:text-slate-300 hover:bg-[var(--bg-subtle)]"
          }`}
        >
          {t.suspendedStatus} ({orgs.filter((o) => o.status === "SUSPENDED").length})
        </button>
      </div>

      {/* Organizations Table */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--brand-primary)] mb-2" />
            <span>{t("uiLoadingSaaSClinicTenants")}</span>
          </div>
        ) : orgs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            {t("uiNoClinicsConfiguredYetClick")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">{t("uiClinicOrganization")}</th>
                  <th className="py-3.5 px-4">{t("uiIdentifierSlug")}</th>
                  <th className="py-3.5 px-4">{t("uiSaasTierPlan")}</th>
                  <th className="py-3.5 px-4">{t.statusLabel}</th>
                  <th className="py-3.5 px-4">{t("roleDoctorsUsers")}</th>
                  <th className="py-3.5 px-4">{t.prescriptions}</th>
                  <th className="py-3.5 px-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {orgs
                  .filter((org) => {
                    if (statusFilter === "ALL") return true;
                    if (statusFilter === "PENDING_APPROVAL") {
                      return org.status === "PENDING_APPROVAL" || org.isApproved === false;
                    }
                    return org.status === statusFilter;
                  })
                  .map((org) => (
                  <tr key={org.id} className="hover:bg-[var(--bg-subtle)]/40 transition">
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <div>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                          {org.name}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {org.contactEmail || org.contactPhone || (t("uiNoContactInfo"))}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {org.slug}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {org.plan ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] font-bold text-[11px]">
                          {org.plan.name} (${org.plan.price}/mo)
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">{t("uiNoPlan")}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {org.status === "PENDING_APPROVAL" || org.isApproved === false ? (
                        <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 w-fit">
                          <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{t.approvalRequiredBadge}</span>
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            org.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : org.status === "TRIAL"
                              ? "bg-sky-500/10 text-sky-600"
                              : "bg-rose-500/10 text-rose-600"
                          }`}
                        >
                          {org.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <strong>{org._count.users}</strong> {t("uiMembers2")}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <strong>{org._count.prescriptions}</strong> {t("uiGenerated")}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {(org.status === "PENDING_APPROVAL" || org.isApproved === false) && (
                          <button
                            type="button"
                            disabled={approvingId === org.id}
                            onClick={() => handleApprove(org.id, org.name)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {approvingId === org.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>{t("uiApproveActivate")}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(org)}
                          className="px-3 py-1.5 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-700 dark:text-slate-300 font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{t.edit}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingOrg ? `${t("uiManageClinic")}: ${editingOrg.name}` : (t("uiProvisionNewClinicOrganization"))}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-body flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                    {error}
                  </div>
                )}

                <div className="grid sm:grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                      {t("uiClinicHospitalName2")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Care Family Polyclinic"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!editingOrg) {
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                        }
                      }}
                      className={inputClasses}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                      {t("uiTenantSlugIdentifier")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. care-polyclinic"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className={`${inputClasses} font-mono`}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                      {t("uiSaasPricingPlan")}
                    </label>
                    <CustomSelect
                      value={planId}
                      onChange={(val) => setPlanId(val)}
                      options={plans.map((p) => ({
                        value: p.id,
                        label: `${p.name} ($${p.price}/mo)`,
                      }))}
                      placeholder={t("uiSelectPricingPlan")}
                      searchable={false}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                      {t.statusLabel}
                    </label>
                    <CustomSelect
                      value={status}
                      onChange={(val) => setStatus(val as "ACTIVE" | "TRIAL" | "SUSPENDED" | "PENDING_APPROVAL")}
                      options={[
                        { value: "ACTIVE", label: t("uiActive"), badge: "Live" },
                        { value: "TRIAL", label: t("uiTrialDays"), badge: "Trial" },
                        { value: "PENDING_APPROVAL", label: t("uiPendingAPPROVAL"), badge: "Review" },
                        { value: "SUSPENDED", label: t("uiSuspended"), badge: "Locked" },
                      ]}
                      searchable={false}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                      {t.emailColumn}
                    </label>
                    <input
                      type="email"
                      placeholder="admin@clinic.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className={inputClasses}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                      {t.phoneColumn}
                    </label>
                    <input
                      type="tel"
                      placeholder="+880 1711-234567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    {t.fullPhysicalAddress}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 7, Uttara, Dhaka"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="modal-footer shrink-0 flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-default)] text-slate-600 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white font-bold cursor-pointer hover:opacity-90 disabled:opacity-50 transition shadow-xs"
                >
                  {submitting ? (t("uiSaving")) : editingOrg ? (t("uiUpdateClinic")) : (t("uiCreateOrganization"))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
