"use client";

import {
  Scale,
  Stethoscope,
  AlertTriangle,
  UserCheck,
  CalendarCheck,
  ShieldAlert,
  Building2
} from "lucide-react";
import { LegalNav } from "@/components/legal/legal-nav";
import { useLanguage } from "@/lib/i18n/language-context";

export function TermsView() {
  const { t, language } = useLanguage();
  const isBn = language === "bn";

  return (
    <>
      <LegalNav
        title={t("uiTermsOfServiceClinicalUsage")}
        lastUpdated={t("uiNovember")}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-10 shadow-xs space-y-10 leading-relaxed text-sm text-slate-700 dark:text-slate-300">

          {/* Executive Summary Callout */}
          <div className="p-5 rounded-2xl bg-[var(--brand-surface)] border border-[var(--brand-border)]/60 text-xs text-[var(--brand-text)] flex items-start gap-3.5">
            <Scale className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm font-bold text-[var(--text-primary)]">
                {t("uiClinicalPlatformUsageSummary")}
              </strong>
              <p className="leading-relaxed">
                {t("uiByAccessingOrUsingThe")}
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiPhysicianLicensureBMDCCredentialRequirements")}</span>
            </h2>
            <p>
              {t("uiThePrescriptionAuthoringModuleWithin")}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                {t("uiPhysiciansMustProvideTheirVerified")}
              </li>
              <li>
                {t("uiImpersonatingALicensedDoctorOr")}
              </li>
              <li>
                {t("uiThePhysicianSDigitalSignature")}
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>{t("uiIndependentMedicalJudgmentDecisionSupport")}</span>
            </h2>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
              <strong>{t("uiCriticalLEGALNOTICE")}</strong>{" "}
              {t("uiPpmsIsAClinicalManagement")}
            </div>
            <p>
              {t("uiAllAutoPopulatedPharmaceuticalSuggestions")}
            </p>
            <p>
              {t("uiThePrescribingPhysicianBearsSole")}
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiAppointmentsSerialTokensChamberQueue")}</span>
            </h2>
            <p>
              {t("rolePatientsAndHospitalReceptionistsUtilizingTheAppointmentSchedulingModuleAgreeToTheFollowingOperationalTerms")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {t("uiSerialAllocation")}
                </span>
                <p className="text-slate-500">
                  {t("uiQueueTokensAreAssignedSequentially")}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {t("uiEmergencyTriageOverride")}
                </span>
                <p className="text-slate-500">
                  {t("uiChamberPhysiciansAndTriageNurses")}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {t("uiTimelyArrival")}
                </span>
                <p className="text-slate-500">
                  {t("rolePatientsAreAdvisedToCheckInAtTheReceptionDeskAtLeastMinutesBeforeTheirEstimated")}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {t("uiCancellationRescheduling")}
                </span>
                <p className="text-slate-500">
                  {t("uiAppointmentsMayBeCancelledVia")}
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiAccountSecurityProhibitedActivities")}</span>
            </h2>
            <p>
              {t("uiUsersAreResponsibleForSafeguarding")}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                {t("uiSharingDoctorCredentialsOrStaff")}
              </li>
              <li>
                {t("uiAttemptingToBypassRoleBased")}
              </li>
              <li>
                {t("uiBulkScrapingOrExportingPatient")}
              </li>
              <li>
                {t("uiInjectingMaliciousSoftwareOrInterfering")}
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiLimitationOfLiabilityServiceAvailability")}</span>
            </h2>
            <p>
              {t("uiPpmsMaintainsATargetedAvailability")}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t("uiToTheMaximumExtentPermitted")}
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiGoverningLawDisputeResolution")}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t("uiTheseTermsShallBeGoverned")}
            </p>
          </section>

        </div>
      </main>
    </>
  );
}
