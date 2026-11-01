"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { StripeUpgradeModal } from "./stripe-upgrade-modal";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  description: string | null;
  features: string[];
  isPopular?: boolean;
}

interface SubscriptionData {
  organizationId: string;
  organizationName: string;
  slug: string;
  status: string;
  plan: PricingPlan | null;
  isTrial: boolean;
  trialEndsAt: string | null;
  msLeft: number;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  isTrialExpired: boolean;
  subscriptionStatus: string;
  subscriptionEndsAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  counts: {
    doctors: number;
    staff: number;
    prescriptions: number;
    appointments: number;
  };
}

export function ClinicSubscriptionView() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");
  const isSuccess = searchParams?.get("success");
  const isCanceled = searchParams?.get("canceled");

  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [targetPlanId, setTargetPlanId] = useState<string | null>(null);
  const [verifyingSession, setVerifyingSession] = useState(Boolean(sessionId && isSuccess));
  const [stripeNotice, setStripeNotice] = useState<string | null>(null);

  const fetchDetails = useCallback(() => {
    Promise.all([
      fetch("/api/subscription").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/pricing-plans").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([subRes, plansRes]) => {
        if (subRes?.success && subRes.data) {
          setSub(subRes.data);
        }
        if (plansRes?.success && Array.isArray(plansRes.data)) {
          setPlans(plansRes.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Handle Stripe Checkout return
  useEffect(() => {
    if (!sessionId || !isSuccess) return;

    let ignore = false;
    fetch(`/api/stripe/verify-session?sessionId=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!ignore) {
          if (data.success) {
            setStripeNotice(data.message || "Stripe payment confirmed! Your clinic subscription is active.");
            fetchDetails();
          } else {
            setStripeNotice(data.message || "Could not confirm Stripe session.");
          }
        }
      })
      .catch(() => {
        if (!ignore) setStripeNotice("Network error validating Stripe session.");
      })
      .finally(() => {
        if (!ignore) setVerifyingSession(false);
      });

    return () => {
      ignore = true;
    };
  }, [sessionId, isSuccess, fetchDetails]);

  const handleOpenUpgrade = (planId?: string) => {
    setTargetPlanId(planId || sub?.plan?.id || null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="p-8 text-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          No Clinic Subscription Record Found
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Create or select an organization to manage SaaS subscriptions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stripe Session Return Banners */}
      {verifyingSession && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-2.5 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Verifying your Stripe Checkout payment with Stripe API. Please wait...</span>
        </div>
      )}

      {stripeNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{stripeNotice}</span>
        </div>
      )}

      {isCanceled && !stripeNotice && (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-[var(--border-subtle)] text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Stripe checkout was canceled. Your clinic remains on its current plan without charges.</span>
        </div>
      )}

      {/* Top Banner: Current Subscription Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  sub.isTrial
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                }`}
              >
                {sub.isTrial ? "14-Day Free Trial" : "Active Subscription"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{sub.organizationName}</span>
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-2">
                <span>{sub.plan?.name || "Free Trial Package"}</span>
                {sub.plan && (
                  <span className="text-sm font-semibold text-slate-400">
                    (${sub.plan.price}/{sub.plan.billingCycle})
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                {sub.isTrial
                  ? "Your clinic is operating under the 14-day zero-card trial. Experience complete multi-doctor prescribing, queue dispensing, and patient management."
                  : "Your clinic has full active access with encrypted prescription storage, automated alerts, and unlimited clinical workflows."}
              </p>
            </div>

            {sub.isTrial && sub.trialEndsAt && (
              <div className="inline-flex items-center gap-2 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Trial Ends:{" "}
                  {new Date(sub.trialEndsAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  ({sub.daysLeft} days, {sub.hoursLeft} hours remaining)
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenUpgrade()}
              className="px-6 py-3 rounded-2xl bg-[var(--brand-primary)] hover:opacity-95 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{sub.isTrial ? "Upgrade with Stripe Sandbox" : "Change Package"}</span>
            </button>
          </div>
        </div>

        {/* Live Clinic Metrics Meter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[var(--border-subtle)]">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold uppercase">Doctors</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {sub.counts.doctors} <span className="text-xs font-normal text-slate-400">active</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold uppercase">Staff / Desk</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {sub.counts.staff} <span className="text-xs font-normal text-slate-400">members</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold uppercase">Prescriptions</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {sub.counts.prescriptions} <span className="text-xs font-normal text-slate-400">issued</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold uppercase">Appointments</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {sub.counts.appointments} <span className="text-xs font-normal text-slate-400">booked</span>
            </p>
          </div>
        </div>
      </div>

      {/* Available SaaS Packages Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Available Clinic SaaS Packages
          </h3>
          <p className="text-xs text-slate-500">
            Compare packages and upgrade anytime with Stripe Sandbox test payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = sub.plan?.id === plan.id;
            return (
              <div
                key={plan.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative ${
                  isCurrent
                    ? "border-[var(--brand-primary)] bg-[var(--brand-surface)]/20 shadow-md ring-2 ring-[var(--brand-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[var(--brand-primary)] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 py-2 border-y border-[var(--border-subtle)]">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-slate-400">/{plan.billingCycle}</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {Array.isArray(plan.features) &&
                      plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-[var(--border-subtle)]">
                  {isCurrent ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Current Active Plan</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenUpgrade(plan.id)}
                      className="w-full py-2.5 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Upgrade to {plan.name}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stripe Sandbox Upgrade Modal */}
      <StripeUpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentPlanId={targetPlanId || sub.plan?.id}
        organizationId={sub.organizationId}
        organizationName={sub.organizationName}
        onSuccess={fetchDetails}
      />
    </div>
  );
}
