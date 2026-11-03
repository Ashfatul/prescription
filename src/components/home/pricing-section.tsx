"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CreditCard, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export type PricingPlanProps = {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  description?: string | null;
  features: string[];
  isPopular: boolean;
};

export function PricingSection({ initialPlans }: { initialPlans: PricingPlanProps[] }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const { t, language } = useLanguage();

  return (
    <section id="pricing" className="w-full py-16 sm:py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] scroll-mt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold uppercase tracking-wider border border-[var(--brand-border)]">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t.pricingTagline}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {t.pricingTitlePart1}{" "}
            <span className="bg-gradient-to-r from-[var(--brand-primary)] to-emerald-400 bg-clip-text text-transparent">
              {t.pricingTitlePart2}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {t.pricingSubtitle}
          </p>

          {/* Billing Interval Toggle */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span
              className={`text-xs font-bold cursor-pointer ${
                billingCycle === "monthly" ? "text-slate-900 dark:text-white" : "text-slate-400"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              {t.monthlyBilling}
            </span>

            <button
              type="button"
              onClick={() =>
                setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"))
              }
              className="relative w-12 h-6 rounded-full bg-[var(--border-strong)]/40 p-0.5 transition cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full bg-[var(--brand-primary)] shadow-md transition-transform ${
                  billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>

            <span
              className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "yearly" ? "text-slate-900 dark:text-white" : "text-slate-400"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              <span>{t.annualBilling}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-extrabold text-[10px]">
                {t.save20Percent}
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 md:grid-cols-3 items-stretch">
          {initialPlans.map((plan) => {
            const rawPrice = plan.price;
            const displayPrice =
              billingCycle === "yearly" ? Math.round(rawPrice * 0.8) : rawPrice;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 flex flex-col justify-between space-y-8 transition-all relative ${
                  plan.isPopular
                    ? "bg-[var(--bg-surface)] border-2 border-[var(--brand-primary)] shadow-xl ring-4 ring-[var(--brand-primary)]/10 scale-100 md:-translate-y-2"
                    : "bg-[var(--bg-app)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--brand-border)] hover:shadow-md"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-teal-500 text-white font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.recommendedForPolyclinics}</span>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 pb-4 border-b border-[var(--border-subtle)]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        ${displayPrice}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {t.perMonth} {billingCycle === "yearly" ? (language === "bn" ? "(বার্ষিক বিলিং)" : "(billed annually)") : ""}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold block">
                      ✓ {language === "bn" ? "তাত্ক্ষণিক ক্লাউড অ্যাক্টিভেশন" : "Instant SaaS cloud provisioning"}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {language === "bn" ? "এই প্যাকেজের সুবিধাসমূহ:" : "Everything in this plan:"}
                    </span>
                    <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                      {Array.isArray(plan.features) &&
                        plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 leading-snug">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
                  <Link
                    href={`/auth/register?type=clinic&plan=${plan.id}`}
                    className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                      plan.isPopular
                        ? "bg-[var(--brand-primary)] text-white hover:opacity-95 shadow-md"
                        : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-slate-800 dark:text-slate-200 hover:border-[var(--brand-primary)] hover:text-[var(--brand-text)]"
                    }`}
                  >
                    <span>{t.startFreeTrial}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <p className="text-[10px] text-center text-slate-400">
                    {language === "bn" ? "ক্রেডিট কার্ড লাগবে না • যে কোনো সময় বাতিলযোগ্য" : "No credit card required • Cancel anytime"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Callout Strip */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {language === "bn" ? "কাস্টম প্রাইভেট ক্লাউড বা অন-প্রিমিসেস সার্ভার প্রয়োজন?" : "Need Dedicated On-Premises or Private Cloud SLA?"}
              </h4>
              <p className="text-xs text-slate-500 max-w-xl">
                {language === "bn"
                  ? "আমরা বড় হাসপাতাল, সরকারি বা প্রাতিষ্ঠানিক মেডিকেল সেন্টারের জন্য কাস্টম ডকার ক্লাস্টার, নিজস্ব ইন্ট্রানেট হোস্টিং ও বিএমডিসি লিগ্যাল আর্কাইভিং সুবিধা প্রদান করি।"
                  : "We provide custom hospital intranet setups, private Docker container orchestrations, and BMDC legal archival for tertiary government and military medical complexes."}
              </p>
            </div>
          </div>

          <Link
            href="/#doctors"
            className="px-6 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] text-xs font-bold text-slate-800 dark:text-slate-200 transition shrink-0"
          >
            {language === "bn" ? "হাসপাতাল প্রতিনিধির সাথে যোগাযোগ" : "Contact Hospital Sales"}
          </Link>
        </div>
      </div>
    </section>
  );
}
