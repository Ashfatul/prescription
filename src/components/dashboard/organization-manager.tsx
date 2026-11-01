"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  DollarSign,
  Edit,
  Layers,
  Loader2,
  Plus,
  Stethoscope,
  X,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";

const inputClasses =
  "w-full px-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]";

type OrgItem = {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "TRIAL" | "SUSPENDED";
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
  const [status, setStatus] = useState<"ACTIVE" | "TRIAL" | "SUSPENDED">("ACTIVE");

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
              <span className="text-xs font-bold uppercase tracking-wider">Clinics & Hospitals</span>
              <Building2 className="w-4 h-4 text-[var(--brand-primary)]" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics.totalOrganizations}
            </div>
            <p className="text-[11px] text-slate-400">Partitioned multi-tenant clinics</p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Physicians & Staff</span>
              <Stethoscope className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics.totalDoctors} <span className="text-xs font-normal text-slate-400">Docs / {metrics.totalStaff} Staff</span>
            </div>
            <p className="text-[11px] text-slate-400">Active medical professionals</p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Prescriptions</span>
              <Layers className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics.totalPrescriptions}
            </div>
            <p className="text-[11px] text-slate-400">Across all connected clinics</p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">SaaS Active MRR</span>
              <DollarSign className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-black text-[var(--brand-text)]">
              ${metrics.estimatedMrr}
              <span className="text-xs font-normal text-slate-400">/mo</span>
            </div>
            <p className="text-[11px] text-slate-400">Estimated recurring software revenue</p>
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
              SaaS Multi-Clinic Management Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Super Administrator console to provision, partition, and monitor hospital branches and independent clinics.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Clinic</span>
        </button>
      </div>

      {/* Organizations Table */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--brand-primary)] mb-2" />
            <span>Loading SaaS clinic tenants...</span>
          </div>
        ) : orgs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No clinics configured yet. Click Provision New Clinic to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Clinic / Organization</th>
                  <th className="py-3.5 px-4">Identifier Slug</th>
                  <th className="py-3.5 px-4">SaaS Tier Plan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Doctors / Users</th>
                  <th className="py-3.5 px-4">Prescriptions</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {orgs.map((org) => (
                  <tr key={org.id} className="hover:bg-[var(--bg-subtle)]/40 transition">
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <div>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                          {org.name}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {org.contactEmail || org.contactPhone || "No contact info"}
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
                        <span className="text-slate-400 italic">No plan</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          org.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : org.status === "TRIAL"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {org.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <strong>{org._count.users}</strong> members
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <strong>{org._count.prescriptions}</strong> generated
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(org)}
                        className="px-3 py-1.5 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-slate-700 dark:text-slate-300 font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
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
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingOrg ? `Manage Clinic: ${editingOrg.name}` : "Provision New Clinic Organization"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Clinic / Hospital Name *
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
                    Tenant Slug Identifier *
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

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    SaaS Pricing Plan
                  </label>
                  <CustomSelect
                    value={planId}
                    onChange={(val) => setPlanId(val)}
                    options={plans.map((p) => ({
                      value: p.id,
                      label: `${p.name} ($${p.price}/mo)`,
                    }))}
                    placeholder="Select pricing plan..."
                    searchable={false}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Tenant Status
                  </label>
                  <CustomSelect
                    value={status}
                    onChange={(val) => setStatus(val as "ACTIVE" | "TRIAL" | "SUSPENDED")}
                    options={[
                      { value: "ACTIVE", label: "ACTIVE", badge: "Live" },
                      { value: "TRIAL", label: "TRIAL (14 Days)", badge: "Trial" },
                      { value: "SUSPENDED", label: "SUSPENDED", badge: "Locked" },
                    ]}
                    searchable={false}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Official Contact Email
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
                    Chamber Phone
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
                  Physical Address & Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 7, Uttara, Dhaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-default)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white font-bold"
                >
                  {submitting ? "Saving..." : editingOrg ? "Update Clinic" : "Create Organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
