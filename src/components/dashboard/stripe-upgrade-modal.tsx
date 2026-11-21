"use client";

import { useEffect, useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { notifyToast } from "@/lib/toast";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  description: string | null;
  features: string[];
  isPopular?: boolean;
}

interface StripeUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId?: string | null;
  organizationId?: string;
  organizationName?: string;
}

export function StripeUpgradeModal({
  isOpen,
  onClose,
  currentPlanId,
  organizationId,
  organizationName,
}: StripeUpgradeModalProps) {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(currentPlanId || "");
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState("");
  const [initiatingStripe, setInitiatingStripe] = useState(false);
  const [, startTransition] = useTransition();

  // Load active plans
  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    fetch("/api/pricing-plans")
      .then((res) => res.json())
      .then((res) => {
        if (!ignore && res.success && Array.isArray(res.data)) {
          setPlans(res.data);
          setLoadingPlans(false);
          if (!selectedPlanId && res.data.length > 0) {
            const pop = res.data.find((p: PricingPlan) => p.isPopular);
            setSelectedPlanId(pop ? pop.id : res.data[0].id);
          }
        }
      })
      .catch(() => {
        if (!ignore) setLoadingPlans(false);
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, selectedPlanId]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !initiatingStripe) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, initiatingStripe, onClose]);

  if (!isOpen) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const handleStripeCheckout = () => {
    if (!selectedPlanId) {
      const message = t("uiSelectPlanToUpgrade", "Please select a plan to upgrade.");
      setError(message);
      notifyToast(message, "error");
      return;
    }
    setInitiatingStripe(true);
    setError("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: selectedPlanId,
            organizationId: organizationId,
          }),
        });
        const data = await res.json();

        if (data.success && data.url) {
          // Redirect to Stripe-hosted checkout (live or Stripe test keys).
          window.location.href = data.url;
          return;
        }

        const message =
          data.message ||
          t(
            "uiStripeCheckoutUnavailable",
            "Stripe Checkout is unavailable. Please check the Stripe server configuration."
          );
        setError(message);
        notifyToast(message, "error");
      } catch {
        const message = t("uiStripeConnectionError", "Network error while connecting to Stripe.");
        setError(message);
        notifyToast(message, "error");
      } finally {
        setInitiatingStripe(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="modal-header shrink-0 p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-gradient-to-r from-[var(--brand-surface)]/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("uiUpgradeClinicSubscription")}
              </h3>
              <p className="text-xs text-slate-500">
                {organizationName || t("uiActivateUnlimitedClinicalOperations")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={initiatingStripe}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body flex-1 overflow-y-auto p-6 space-y-6">
          {/* Plan selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.availableClinicSaaS}
            </label>
            {loadingPlans ? (
              <div className="h-28 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        setError("");
                      }}
                      className={`relative p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-[var(--brand-primary)] bg-[var(--brand-surface)]/40 shadow-xs ring-2 ring-[var(--brand-primary)]"
                          : "border-[var(--border-default)] hover:border-slate-300 dark:hover:border-slate-700 bg-[var(--bg-surface)]"
                      }`}
                    >
                      {plan.isPopular && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[var(--brand-primary)] text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                          {t.mostPopular}
                        </span>
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {plan.name}
                          </h4>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                          )}
                        </div>
                        <div className="flex items-baseline gap-1 my-2">
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            ${plan.price}
                          </span>
                          <span className="text-[10px] text-slate-400">/{plan.billingCycle}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {plan.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Secure payment via Stripe */}
          <div className="p-5 rounded-lg border-2 border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#635BFF] text-white flex items-center justify-center font-black text-xs shadow-xs">
                S
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.payWithStripeCheckout}
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t("uiPayViaStripeSAuthentic", "Secure payment powered by Stripe.")}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              disabled={initiatingStripe || loadingPlans}
              onClick={handleStripeCheckout}
              className="w-full min-h-[44px] rounded-xl bg-[#635BFF] hover:bg-[#5851EA] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {initiatingStripe ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("uiConnectingToStripeAPI")}
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  {t.payWithStripeCheckout} (${selectedPlan?.price || 49}/{selectedPlan?.billingCycle || "mo"})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer shrink-0 px-6 py-4 border-t border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={initiatingStripe}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
