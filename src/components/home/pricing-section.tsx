"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, ShieldCheck, Building2 } from "lucide-react";
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

export function PricingSection({
  initialPlans,
}: {
  initialPlans: PricingPlanProps[];
}) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const { t } = useLanguage();

  const useFourColumnWithEnterprise = initialPlans.length === 3;

  return (
    <section
      id="pricing"
      className="w-full py-16 sm:py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] scroll-mt-20"
    >
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Split Header: Title Left, Billing Switcher Right */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[var(--border-subtle)]">
          <div className="space-y-2 max-w-[54ch]">
            <p className="text-xs font-semibold text-[var(--brand-text)]">
              {t.pricingTagline}
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-[-0.03em] text-[var(--text-primary)] leading-tight">
              {t.pricingTitlePart1}{" "}
              <span className="text-[var(--brand-text)]">
                {t.pricingTitlePart2}
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {t.pricingSubtitle}
            </p>
          </div>

          {/* Crisp Segmented Billing Toggle */}
          <div className="inline-flex items-center p-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t.monthlyBilling}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span>{t.annualBilling}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                {t.save20Percent}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Grid: Balanced 4-Column (3 Plans + Enterprise) on Widescreen when 3 Plans */}
        <div
          className={`grid gap-5 items-stretch ${
            useFourColumnWithEnterprise
              ? "md:grid-cols-2 xl:grid-cols-4"
              : "md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {initialPlans.map((plan) => {
            const rawPrice = plan.price;
            const displayPrice =
              billingCycle === "yearly" ? Math.round(rawPrice * 0.8) : rawPrice;

            return (
              <div
                key={plan.id}
                className={`rounded-xl p-6 sm:p-7 flex flex-col justify-between gap-6 transition-colors relative ${
                  plan.isPopular
                    ? "bg-[var(--bg-surface)] border-2 border-[var(--brand-primary)] shadow-[var(--shadow-card)]"
                    : "bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                }`}
              >
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 min-h-[24px]">
                      <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                        {plan.name}
                      </h3>
                      {plan.isPopular && (
                        <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-[10px] font-bold shrink-0">
                          {t.recommendedForPolyclinics}
                        </span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed min-h-[36px]">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  <div className="pb-5 border-b border-[var(--border-subtle)] space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black font-mono tracking-tight text-[var(--text-primary)]">
                        ${displayPrice}
                      </span>
                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        {t.perMonth}
                        {billingCycle === "yearly"
                          ? ` · ${t("uiBilledAnnually")}`
                          : ""}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {t("uiInstantSaaSCloudProvisioning")}
                    </p>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-[var(--text-muted)] block">
                      {t("uiEverythingInThisPlan")}
                    </span>
                    <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                      {Array.isArray(plan.features) &&
                        plan.features.map((feat, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 leading-snug"
                          >
                            <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 border-t border-[var(--border-subtle)] space-y-2">
                  <Link
                    href={`/auth/register?type=clinic&plan=${plan.id}`}
                    className={`w-full py-3 px-4 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all ${
                      plan.isPopular
                        ? "bg-[var(--brand-primary)] text-white hover:opacity-95 shadow-xs"
                        : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-text)]"
                    }`}
                  >
                    <span>{t.startFreeTrial}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-[11px] text-center text-[var(--text-muted)]">
                    {t("uiNoCreditCardRequiredCancel")}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Integrated 4th Column: Enterprise / Dedicated On-Premises Card (when 3 plans exist) */}
          {useFourColumnWithEnterprise && (
            <div className="rounded-xl p-6 sm:p-7 flex flex-col justify-between gap-6 bg-[var(--bg-subtle)]/70 border border-[var(--border-default)]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                    {t("uiNeedDedicatedOnPremisesOr")}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {t("uiWeProvideCustomHospitalIntranet")}
                  </p>
                </div>

                <div className="pb-5 border-b border-[var(--border-subtle)]">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)]">
                    <Building2 className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>{t.isolatedSchemaBadge}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2.5 leading-snug">
                    <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                    <span>{t("uiSubdomains")}</span>
                  </li>
                  <li className="flex items-start gap-2.5 leading-snug">
                    <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                    <span>{t("uiRbacAccess")}</span>
                  </li>
                  <li className="flex items-start gap-2.5 leading-snug">
                    <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                    <span>{t.bmdcCompliantBadge}</span>
                  </li>
                  <li className="flex items-start gap-2.5 leading-snug">
                    <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                    <span>{t.cloudHybridBadge}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-5 border-t border-[var(--border-subtle)] space-y-2">
                <Link
                  href="/#doctors"
                  className="w-full py-3 px-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-text)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <span>{t("uiContactHospitalSales")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-center text-[var(--text-muted)]">
                  {t.landingZeroDowntime}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Fallback Enterprise Callout Strip when plan count != 3 */}
        {!useFourColumnWithEnterprise && (
          <div className="p-6 sm:p-7 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[var(--text-primary)]">
                  {t("uiNeedDedicatedOnPremisesOr")}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-[60ch]">
                  {t("uiWeProvideCustomHospitalIntranet")}
                </p>
              </div>
            </div>

            <Link
              href="/#doctors"
              className="px-5 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--brand-primary)] text-xs font-semibold text-[var(--text-primary)] transition-colors shrink-0 inline-flex items-center gap-2"
            >
              <span>{t("uiContactHospitalSales")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
