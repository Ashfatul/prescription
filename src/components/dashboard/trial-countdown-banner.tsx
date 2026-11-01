"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Clock,
  Sparkles,
  CreditCard,
  AlertCircle,
  Building2,
} from "lucide-react";
import { StripeUpgradeModal } from "./stripe-upgrade-modal";

interface SubscriptionState {
  organizationId: string;
  organizationName: string;
  slug: string;
  status: string;
  plan: {
    id: string;
    name: string;
    price: number;
    billingCycle: string;
  } | null;
  isTrial: boolean;
  trialEndsAt: string | null;
  msLeft: number;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  isTrialExpired: boolean;
  subscriptionStatus: string;
}

export function TrialCountdownBanner() {
  const [sub, setSub] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Local live tick state
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  const fetchSubscription = useCallback(() => {
    fetch("/api/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res?.success && res.data) {
          setSub(res.data);
          if (res.data.trialEndsAt) {
            const ends = new Date(res.data.trialEndsAt).getTime();
            const now = Date.now();
            const diff = Math.max(0, ends - now);
            setTimeRemaining({
              days: Math.floor(diff / (1000 * 60 * 60 * 24)),
              hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
              seconds: Math.floor((diff % (1000 * 60)) / 1000),
              isExpired: ends <= now,
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Live 1-second interval ticking
  useEffect(() => {
    if (!sub?.trialEndsAt || !sub.isTrial) return;

    const interval = setInterval(() => {
      const ends = new Date(sub.trialEndsAt!).getTime();
      const now = Date.now();
      const diff = Math.max(0, ends - now);

      setTimeRemaining({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isExpired: ends <= now,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sub]);

  if (loading || !sub || !sub.isTrial) {
    return null;
  }

  // Calculate 14-day percentage remaining
  const totalTrialMs = 14 * 24 * 60 * 60 * 1000;
  const currentRemainingMs =
    timeRemaining.days * 86400000 +
    timeRemaining.hours * 3600000 +
    timeRemaining.minutes * 60000 +
    timeRemaining.seconds * 1000;
  const percentUsed = Math.min(
    100,
    Math.max(0, Math.round(((totalTrialMs - currentRemainingMs) / totalTrialMs) * 100))
  );

  return (
    <>
      {timeRemaining.isExpired ? (
        <div className="p-5 rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Trial Expired
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {sub.organizationName}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                Your 14-day free trial has expired.
              </p>
              <p className="text-xs text-slate-500">
                Upgrade now using Stripe Sandbox test payment to reactivate prescription creation and chamber queue.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            <span>Upgrade with Stripe Sandbox</span>
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-3xl border border-teal-500/20 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent relative overflow-hidden shadow-xs">
          {/* Subtle top progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500/10">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-1000"
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            {/* Left Info */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[var(--brand-primary)] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-500/20">
                    14-Day Free Trial Active
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sub.organizationName}</span>
                  </span>
                  {sub.plan && (
                    <>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        {sub.plan.name} (${sub.plan.price}/mo)
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  No credit card required. Explore doctor scheduling, Rx designer, patient chat & digital formulary.
                </p>
              </div>
            </div>

            {/* Right: Live Countdown Clock & Upgrade CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 w-full lg:w-auto justify-between lg:justify-end">
              {/* Ticking Digital Time Modules */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-center min-w-[42px]">
                  <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                    {timeRemaining.days}
                  </span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                    Days
                  </span>
                </div>
                <span className="font-bold text-slate-300 dark:text-slate-700">:</span>
                <div className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-center min-w-[42px]">
                  <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                    {String(timeRemaining.hours).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                    Hours
                  </span>
                </div>
                <span className="font-bold text-slate-300 dark:text-slate-700">:</span>
                <div className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-center min-w-[42px]">
                  <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                    {String(timeRemaining.minutes).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                    Mins
                  </span>
                </div>
                <span className="font-bold text-slate-300 dark:text-slate-700">:</span>
                <div className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-center min-w-[42px]">
                  <span className="text-sm font-black text-teal-600 dark:text-teal-400 font-mono animate-pulse">
                    {String(timeRemaining.seconds).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                    Secs
                  </span>
                </div>
              </div>

              {/* Upgrade Button */}
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade (Stripe Sandbox)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Sandbox Upgrade Modal */}
      <StripeUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlanId={sub.plan?.id}
        organizationId={sub.organizationId}
        organizationName={sub.organizationName}
        onSuccess={fetchSubscription}
      />
    </>
  );
}
