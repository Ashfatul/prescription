"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CreditCard,
  Edit,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

type PricingPlanItem = {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  description?: string | null;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
};

export function SaasPricingManager() {
  const [plans, setPlans] = useState<PricingPlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlanItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(49);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [description, setDescription] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const fetchPlans = () => {
    setLoading(true);
    fetch("/api/pricing-plans?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setPlans(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/pricing-plans?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setPlans(data.data);
        }
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
    setEditingPlan(null);
    setName("");
    setPrice(49);
    setBillingCycle("monthly");
    setDescription("");
    setFeaturesText(
      "Up to 2 Doctor Accounts\n500 Prescriptions / month\nDrug Formulary Access\nA4 Printouts\nEmail Support"
    );
    setIsPopular(false);
    setIsActive(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (plan: PricingPlanItem) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPrice(plan.price);
    setBillingCycle(plan.billingCycle || "monthly");
    setDescription(plan.description || "");
    setFeaturesText(Array.isArray(plan.features) ? plan.features.join("\n") : "");
    setIsPopular(plan.isPopular);
    setIsActive(plan.isActive);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const featuresArray = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      const endpoint = editingPlan
        ? `/api/pricing-plans/${editingPlan.id}`
        : "/api/pricing-plans";
      const method = editingPlan ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          billingCycle,
          description,
          features: featuresArray,
          isPopular,
          isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchPlans();
      } else {
        setError(data.message || "Failed to save pricing plan.");
      }
    } catch {
      setError("Network error saving pricing plan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this pricing plan?")) return;
    try {
      const res = await fetch(`/api/pricing-plans/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPlans((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.message || "Cannot delete plan.");
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              SaaS Pricing & Product Plans
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Configure subscription tiers, monthly pricing, feature checklists, and landing page highlights.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pricing Tier</span>
        </button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--brand-primary)] mb-2" />
          <span>Loading SaaS plans...</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-slate-400">
          No pricing plans configured.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-7 rounded-3xl bg-[var(--bg-surface)] border transition flex flex-col justify-between space-y-6 shadow-xs relative ${
                plan.isPopular
                  ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20"
                  : "border-[var(--border-subtle)]"
              } ${!plan.isActive ? "opacity-60 border-dashed" : ""}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--brand-primary)] text-white font-bold text-[10px] tracking-wide uppercase flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  <span>Most Popular Tier</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      plan.isActive
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {plan.isActive ? "Active on Landing Page" : "Hidden"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      /{plan.billingCycle || "month"}
                    </span>
                  </div>
                  {plan.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {plan.description}
                    </p>
                  )}
                </div>

                {/* Features list */}
                <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Included Features
                  </span>
                  <ul className="space-y-1.5">
                    {Array.isArray(plan.features) &&
                      plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openEditModal(plan)}
                  className="px-3.5 py-1.5 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                  title="Delete Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingPlan ? `Edit Plan: ${editingPlan.name}` : "Create SaaS Pricing Plan"}
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Starter Clinic"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Price (USD / mo) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Essential tools for solo practitioners & private consultancies."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  Feature Checklist (1 Feature per line) *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Up to 5 Doctor Accounts&#10;Unlimited Prescriptions&#10;Live Chamber Queue&#10;QR Code Sharing&#10;24/7 Priority Support"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-default)] text-slate-900 dark:text-white resize-none font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 rounded-2xl bg-[var(--bg-subtle)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="w-4 h-4 accent-[var(--brand-primary)]"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Badge as Popular
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[var(--brand-primary)]"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Live on Landing Page
                  </span>
                </label>
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
                  {submitting ? "Saving..." : "Save Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
