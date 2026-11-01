"use client";

import { useEffect, useState, useTransition } from "react";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  Zap,
  Lock,
  AlertTriangle,
} from "lucide-react";

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
  onSuccess?: () => void;
}

export function StripeUpgradeModal({
  isOpen,
  onClose,
  currentPlanId,
  organizationId,
  organizationName,
  onSuccess,
}: StripeUpgradeModalProps) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(currentPlanId || "");
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Card form state
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

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
      if (e.key === "Escape" && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  // Quick auto-fill test cards
  const handleAutoFillTestCard = () => {
    setCardHolder("Dr. John Dorian");
    setCardNumber("4242 4242 4242 4242");
    setExpiry("12/28");
    setCvc("888");
    setError("");
  };

  const handleCardNumberChange = (value: string) => {
    const raw = value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (value: string) => {
    const raw = value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  const handleCvcChange = (value: string) => {
    const raw = value.replace(/\D/g, "").slice(0, 4);
    setCvc(raw);
  };

  // Detect card brand
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s+/g, "");
    if (clean.startsWith("4")) return "Visa";
    if (clean.startsWith("51") || clean.startsWith("55") || clean.startsWith("22")) return "Mastercard";
    if (clean.startsWith("34") || clean.startsWith("37")) return "Amex";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) {
      setError("Please select a plan to upgrade.");
      return;
    }
    if (!cardNumber.trim() || cardNumber.replace(/\s+/g, "").length < 15) {
      setError("Please enter a valid 16-digit card number.");
      return;
    }
    if (!expiry.trim() || expiry.length < 5) {
      setError("Please enter card expiry in MM/YY format.");
      return;
    }
    if (!cvc.trim() || cvc.length < 3) {
      setError("Please enter a valid 3 or 4-digit CVC security code.");
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            planId: selectedPlanId,
            cardHolder: cardHolder.trim() || undefined,
            cardNumber,
            expiry,
            cvc,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setSuccess(true);
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 2400);
        } else {
          setError(data.error || data.message || "Stripe sandbox transaction failed.");
        }
      } catch {
        setError("Network communication error. Please try again.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-gradient-to-r from-[var(--brand-surface)]/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Upgrade Clinic Subscription
              </h3>
              <p className="text-xs text-slate-500">
                {organizationName ? `Empower ${organizationName}` : "Activate unlimited clinical operations"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {success ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                Subscription Activated!
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Payment processed via Stripe Sandbox. Your clinic is now on the{" "}
                <strong className="text-[var(--brand-primary)]">{selectedPlan?.name}</strong> plan with active subscription.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Subscription Status: ACTIVE</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Select Plan */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Select SaaS Package
                </label>
                {loadingPlans ? (
                  <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {plans.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-[var(--brand-primary)] bg-[var(--brand-surface)]/40 shadow-xs ring-2 ring-[var(--brand-primary)]"
                              : "border-[var(--border-default)] hover:border-slate-300 dark:hover:border-slate-700 bg-[var(--bg-surface)]"
                          }`}
                        >
                          {plan.isPopular && (
                            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[var(--brand-primary)] text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                              Popular
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

              {/* Step 2: Stripe Sandbox Payment Information */}
              <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Stripe Sandbox Payment
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                      Sandbox Mode
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillTestCard}
                    className="text-xs font-bold text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Auto-Fill Test Card</span>
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Doctor or Clinic Administrator"
                      className="w-full px-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Card Number
                      </label>
                      {getCardBrand() && (
                        <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase">
                          {getCardBrand()}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="4242  4242  4242  4242"
                        className="w-full pl-10 pr-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm font-mono tracking-wider text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                        Expires (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        placeholder="MM / YY"
                        className="w-full px-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                        CVC Security Code
                      </label>
                      <input
                        type="password"
                        value={cvc}
                        onChange={(e) => handleCvcChange(e.target.value)}
                        placeholder="123"
                        className="w-full px-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>256-bit Encrypted SSL Sandbox</span>
                  </div>
                  <span>Test Cards: 4242 4242...</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Stripe Sandbox...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pay ${selectedPlan?.price || 49} & Upgrade Clinic</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
