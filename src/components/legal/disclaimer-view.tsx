"use client";

import {
  AlertCircle,
  PhoneCall,
  Stethoscope,
  Pill,
  Microscope,
  ShieldCheck,
  HeartHandshake
} from "lucide-react";
import { LegalNav } from "@/components/legal/legal-nav";
import { useLanguage } from "@/lib/i18n/language-context";
import { HospitalSettings } from "@/features/settings/settings.service";

export function DisclaimerView({ settings }: { settings: HospitalSettings }) {
  const { t, language } = useLanguage();
  const isBn = language === "bn";

  return (
    <>
      <LegalNav
        title={t("uiMedicalDisclaimerPrescribingStandards")}
        lastUpdated={t("uiNovember")}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-10 shadow-xs space-y-10 leading-relaxed text-sm text-slate-700 dark:text-slate-300">

          {/* High Priority Emergency Alert Banner */}
          <div className="p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-900 dark:text-rose-200 space-y-3">
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 animate-bounce" />
              <h2 className="text-base sm:text-lg font-black tracking-tight text-rose-950 dark:text-white">
                {t("uiEmergencyMEDICALWARNING")}
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              <strong>{t("uiDoNOTUSETHISPLATFORM")}</strong>{" "}
              {isBn
                ? `যদি আপনি বা আপনার সাথে থাকা কেউ তীব্র বুকে ব্যথা, শ্বাসকষ্ট, অতিরিক্ত রক্তক্ষরণ, স্ট্রোকের লক্ষণ (মুখের অসাড়তা, কথা জড়িয়ে যাওয়া), চেতনা হ্রাস বা গুরুতর দুর্ঘটনার শিকার হন, তবে অবিলম্বে হাসপাতালের জরুরি হটলাইন ${settings.emergencyHotline}-এ কল করুন অথবা নিকটস্থ জরুরি ট্রমা সেন্টারে যোগাযোগ করুন।`
                : `If you or someone you are assisting is experiencing severe chest pain, shortness of breath, acute hemorrhage, signs of stroke (facial drooping, arm weakness, slurred speech), loss of consciousness, or severe trauma, immediately call the Hospital Emergency Hotline at ${settings.emergencyHotline} or go to the nearest emergency trauma center.`}
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiSoftwareToolVsIndependentMedical")}</span>
            </h2>
            <p>
              {t("uiThePatientPrescriptionManagementSystem2")}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t("uiThePlatformDoesNotProvide")}
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiNoDoctorPatientRelationshipEstablished")}</span>
            </h2>
            <p>
              {t("uiAccessingThisWebsiteBrowsingThe")}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t("uiALegallyRecognizedDoctorPatient")}
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiPharmaceuticalFormularyDefaultDosePresets")}</span>
            </h2>
            <p>
              {t("uiTheSystemFormularyProvidesStandard")}
            </p>
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs space-y-2">
              <p>
                • <strong>{t("uiPhysicianObligation")}</strong>{" "}
                {t("uiThePrescribingPhysicianMustReview")}
              </p>
              <p>
                • <strong>{t("uiDispensingPharmacists")}</strong>{" "}
                {t("uiPharmacistsDispensingMedicationsBasedOn")}
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Microscope className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiDiagnosticInvestigationsAttachedLabReports")}</span>
            </h2>
            <p>
              {t("uiDigitalDocumentsRadiologyScansX")}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                {t("uiDigitalScanRenderingFidelityDepends")}
              </li>
              <li>
                {t("uiDefinitiveClinicalDecisionsMustBe")}
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span>{t("uiPatientAdherenceAdverseDrugReaction")}</span>
            </h2>
            <p>
              {t("uiPatientsReceivingPrescriptionsGeneratedVia")}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                {t("uiFollowThePhysicianSDirections")}
              </li>
              <li>
                {t("uiReadAllPackageInsertsAnd")}
              </li>
              <li>
                {t("uiInTheEventOfUnexpected")}
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>{t("uiRegulatoryComplianceAccreditation")}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t("uiAllPrescriptionLayoutsAndDoctor")}
            </p>
          </section>

        </div>
      </main>
    </>
  );
}
