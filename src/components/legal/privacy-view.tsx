"use client";

import {
  ShieldCheck,
  Eye,
  Database,
  UserCheck,
  FileCheck,
  Server,
  Mail
} from "lucide-react";
import { LegalNav } from "@/components/legal/legal-nav";
import { useLanguage } from "@/lib/i18n/language-context";
import { HospitalSettings } from "@/features/settings/settings.service";

export function PrivacyView({ settings }: { settings: HospitalSettings }) {
  const { t, language } = useLanguage();
  const isBn = language === "bn";

  return (
    <>
      <LegalNav
        title={t("uiPrivacyPolicyHealthDataProtection")}
        lastUpdated={t("uiNovember")}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-10 shadow-xs space-y-10 leading-relaxed text-sm text-slate-700 dark:text-slate-300">

          {/* Executive Summary Callout */}
          <div className="p-5 rounded-2xl bg-[var(--brand-surface)] border border-[var(--brand-border)]/60 text-xs text-[var(--brand-text)] flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm font-bold text-[var(--text-primary)]">
                {t("uiOurClinicalDataPledge")}
              </strong>
              <p className="leading-relaxed">
                {t("uiThePatientPrescriptionManagementSystem")}
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiInformationWeCollect")}</span>
            </h2>
            <p>
              {t("uiWhenPatientsVisitAnOutpatient")}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  {t("rolePatientDemographics")}
                </strong>{" "}
                {t("uiFullLegalNameContactTelephone")}
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  {t("uiClinicalTriageVitals")}
                </strong>{" "}
                {t("uiBloodPressureSystolicDiastolicPulse")}
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  {t("uiPrescriptionData")}
                </strong>{" "}
                {t("uiPrescribedPharmaceuticalMoleculesBrandNames")}
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  {t("uiDiagnosticAttachments")}
                </strong>{" "}
                {t("uiLaboratoryTestResultsBloodBiochemistry")}
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  {t("uiTechnicalSessionLogs")}
                </strong>{" "}
                {t("uiUserSessionCookiesPpmsSession")}
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiPurposeLawfulBasisOfProcessing")}</span>
            </h2>
            <p>
              {t("uiAllClinicalDataIsCollected")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {t("uiClinicalPrescriptionDelivery")}
                </span>
                <p className="text-slate-500">
                  {t("uiGeneratingLegallyCompliantMultiPage")}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {t("uiChamberQueueCoordination")}
                </span>
                <p className="text-slate-500">
                  {t("uiAllocatingRealTimeSerialTokens")}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {t("uiMedicalHistoryContinuity")}
                </span>
                <p className="text-slate-500">
                  {t("uiProvidingPhysiciansWithPastPrescribed")}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {t("uiHospitalEpidemiologicAnalytics")}
                </span>
                <p className="text-slate-500">
                  {t("uiAggregatedAnonymizedReportingOnTop")}
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiRoleBasedAccessIsolationRBAC")}</span>
            </h2>
            <p>
              {t("uiAccessToPatientChartsIs")}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <strong>{t("roleDoctors")}</strong>{" "}
                {t("uiFullAccessToPrescribeReview")}
              </li>
              <li>
                <strong>{t("uiFrontDeskStaff")}</strong>{" "}
                {t("uiRestrictedToRegisteringWalkIns")}
              </li>
              <li>
                <strong>{t("rolePatients")}</strong>{" "}
                {t("uiAuthenticatedAccessOnlyToTheir")}
              </li>
              <li>
                <strong>{t("uiSuperAdmins")}</strong>{" "}
                {t("uiPlatformInfrastructureFormularyCatalogMaintenance")}
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiDataStorageEncryptionIntranetOperation")}</span>
            </h2>
            <p>
              {t("uiPpmsIsEngineeredToOperate")}
            </p>
            <div className="space-y-2 text-xs sm:text-sm">
              <p>
                • <strong>{t("uiEncryptionInTransit")}</strong>{" "}
                {t("uiAllHTTPTrafficIsProtected")}
              </p>
              <p>
                • <strong>{t("uiCredentialHashing")}</strong>{" "}
                {t("uiUserPasswordsAreEncryptedUsing")}
              </p>
              <p>
                • <strong>{t("uiOnPremiseIntranetOption")}</strong>{" "}
                {t("uiHospitalDeploymentsMayRunThe")}
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("rolePatientRightsAndDataControl")}</span>
            </h2>
            <p>
              {t("uiUnderMedicalEthicsAndData")}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                {t("uiTheRightToObtainA")}
              </li>
              <li>
                {t("uiTheRightToRequestRectification")}
              </li>
              <li>
                {t("uiTheRightToRequestConfidential")}
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiContactTheDataProtectionOfficer")}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t("uiIfYouHaveAnyQuestions")}
            </p>
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs space-y-1">
              <p><strong className="text-slate-900 dark:text-white">{t("uiHospitalDataProtectionOfficerDPO")}</strong></p>
              <p>{settings.hospitalName} ({settings.hospitalBranch})</p>
              <p>{settings.hospitalAddress}</p>
              <p>{t("uiEmail")} <a href={`mailto:${settings.supportEmail}`} className="text-[var(--brand-text)] font-semibold underline">{settings.supportEmail}</a></p>
              <p>{t("uiClinicalHelpline")} {settings.contactPhone} • {t("uiEmergency")} {settings.emergencyHotline}</p>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
