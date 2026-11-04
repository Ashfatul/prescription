"use client";

import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Lock,
  Pill,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { PrintButton } from "@/components/common/print-button";
import { LanguageToggle } from "@/components/common/language-toggle";
import { ThemeCustomizer } from "@/components/common/theme-customizer";
import { useLanguage } from "@/lib/i18n/language-context";

interface MedicineItem {
  type?: string;
  name: string;
  dosage?: string;
  dose?: string;
  timing?: string;
  duration?: string;
  instructions?: string;
}

interface TestItem {
  name: string;
  instructions?: string;
}

export interface PublicPrescriptionData {
  id: string;
  createdAt: string | Date;
  notes?: string | null;
  medicinesJson?: unknown;
  testsJson?: unknown;
  vitalsJson?: unknown;
  clinicalInfoJson?: unknown;
  organization?: {
    name: string;
    address?: string | null;
    contactPhone?: string | null;
  } | null;
  doctor: {
    hospital?: string | null;
    specialization: string;
    degrees?: string | null;
    designation?: string | null;
    bmdcRegNo?: string | null;
    contactNumber?: string | null;
    user: {
      name: string;
      email?: string | null;
    };
  };
  patient: {
    gender?: string | null;
    user: {
      name: string;
    };
  };
}

export interface PublicPrescriptionViewProps {
  prescription: PublicPrescriptionData | null;
  qrDataUrl?: string;
  errorMsg?: string;
}

export function PublicPrescriptionView({
  prescription,
  qrDataUrl,
  errorMsg,
}: PublicPrescriptionViewProps) {
  const { t, language } = useLanguage();

  if (!prescription) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {t.prescriptionPrivateUnavailable}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {errorMsg || t.prescriptionPrivateNotice}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-95 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.returnToPpmsPortal}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const medicines = Array.isArray(prescription.medicinesJson)
    ? (prescription.medicinesJson as MedicineItem[])
    : [];

  const tests = Array.isArray(prescription.testsJson)
    ? (prescription.testsJson as TestItem[])
    : [];

  const vitals = (prescription.vitalsJson as Record<string, string>) || {};
  const clinicalInfo = (prescription.clinicalInfoJson as Record<string, unknown>) || {};
  const complaints = Array.isArray(clinicalInfo.complaints)
    ? clinicalInfo.complaints.join(", ")
    : (clinicalInfo.complaints as string) || "";
  const diagnosis = Array.isArray(clinicalInfo.diagnosis)
    ? clinicalInfo.diagnosis.join(", ")
    : (clinicalInfo.diagnosis as string) || "";
  const advice = Array.isArray(clinicalInfo.advice)
    ? clinicalInfo.advice
    : typeof clinicalInfo.advice === "string"
    ? [clinicalInfo.advice]
    : [];

  const doc = prescription.doctor;
  const patient = prescription.patient;
  const hospitalName =
    prescription.organization?.name || doc.hospital || "CareFlow";

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-slate-900 dark:text-slate-100 flex flex-col py-8 px-4 sm:px-6 print:p-0 print:bg-white print:text-black">
      {/* Top Floating Control Bar - Hidden on print */}
      <div className="max-w-4xl mx-auto w-full mb-6 print:hidden flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {t.verifiedPublicPrescription}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                {t.validLink}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Rx #{prescription.id.slice(-8).toUpperCase()} • {t("uiAuthoredBy")}{doc.user.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageToggle />
          <ThemeCustomizer compact direction="down" align="right" />
          <PrintButton />
          <Link
            href="/"
            className="px-4 py-2 rounded-xl border border-[var(--border-default)] text-xs font-bold hover:bg-[var(--bg-subtle)] transition"
          >
            {t.portalHome}
          </Link>
        </div>
      </div>

      {/* A4 Prescription Sheet */}
      <div className="max-w-4xl mx-auto w-full bg-white text-slate-900 border border-slate-200 rounded-3xl shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none p-8 sm:p-12 space-y-8">
        {/* Hospital Header */}
        <div className="border-b-2 border-teal-600 pb-6 flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-teal-600" />
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {hospitalName}
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              {prescription.organization?.address || (t("uiClinicalPrescribingPatientCareServices"))}
            </p>
            <p className="text-xs font-semibold text-teal-800">
              {t("uiContact2")} {prescription.organization?.contactPhone || doc.contactNumber || "+880 2-8901234"}
            </p>
          </div>

          <div className="text-left sm:text-right space-y-0.5">
            <h2 className="text-lg font-bold text-teal-900">{doc.user.name}</h2>
            <p className="text-xs font-semibold text-slate-700">{doc.degrees || "MBBS"}</p>
            <p className="text-xs text-slate-600">{doc.specialization} • {doc.designation || (t("uiConsultant"))}</p>
            <p className="text-xs text-slate-500">
              {t("uiBmdcRegNo")} <strong className="text-slate-800">{doc.bmdcRegNo || "BMDC-A-41285"}</strong>
            </p>
          </div>
        </div>

        {/* Patient Vitals Bar */}
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-700 block">{t.patientName}</span>
            <span className="text-sm font-bold text-slate-900">{patient.user.name}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-teal-700 block">{t.genderAge}</span>
            <span className="font-semibold text-slate-800">{patient.gender || "N/A"}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-teal-700 block">{t.dateOfIssue}</span>
            <span className="font-semibold text-slate-800">
              {new Date(prescription.createdAt).toLocaleDateString(t("uiEnUS"), {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-teal-700 block">Rx ID</span>
            <span className="font-mono font-bold text-teal-900">
              #{prescription.id.slice(-8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Baseline Vitals Grid */}
        {Object.keys(vitals).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {vitals.bp && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.bp}</span>
                <span className="font-extrabold text-slate-800">{vitals.bp} mmHg</span>
              </div>
            )}
            {vitals.pulse && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.pulse}</span>
                <span className="font-extrabold text-slate-800">{vitals.pulse} bpm</span>
              </div>
            )}
            {vitals.spo2 && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.spo2}</span>
                <span className="font-extrabold text-teal-700">{vitals.spo2}%</span>
              </div>
            )}
            {vitals.temp && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.temp}</span>
                <span className="font-extrabold text-slate-800">{vitals.temp}°F</span>
              </div>
            )}
            {vitals.weight && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.weight}</span>
                <span className="font-extrabold text-slate-800">{vitals.weight} kg</span>
              </div>
            )}
          </div>
        )}

        {/* Prescription Body (Two-Column Layout) */}
        <div className="grid sm:grid-cols-12 gap-8 pt-2">
          {/* Left Column: Complaints, Diagnosis, Tests */}
          <div className="sm:col-span-4 border-r border-slate-200 pr-6 space-y-6 text-xs">
            {complaints && (
              <div className="space-y-1">
                <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                  {t.chiefComplaints}
                </h3>
                <p className="text-slate-800 leading-relaxed">{complaints}</p>
              </div>
            )}

            {diagnosis && (
              <div className="space-y-1">
                <h3 className="font-bold text-teal-700 uppercase tracking-wider text-[11px]">
                  {t.clinicalDiagnosis}
                </h3>
                <p className="font-semibold text-slate-900 leading-relaxed">{diagnosis}</p>
              </div>
            )}

            {tests.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>{t.investigationsTests}</span>
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc text-slate-700">
                  {tests.map((testItem, idx) => (
                    <li key={idx} className="leading-tight">
                      <strong className="text-slate-900">{testItem.name}</strong>
                      {testItem.instructions && (
                        <span className="block text-[10px] text-slate-500">
                          {testItem.instructions}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Rx (Medicines) & Lifestyle Advice */}
          <div className="sm:col-span-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <span className="text-2xl font-black text-teal-700 font-serif">℞</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.prescribedMedications}
                </span>
              </div>

              {medicines.length === 0 ? (
                <p className="text-xs text-slate-400 italic">{t.noMedicationsPrescribed}</p>
              ) : (
                <div className="space-y-3.5">
                  {medicines.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-teal-600" />
                          <span>
                            {m.type ? `${m.type}. ` : ""}
                            {m.name}
                          </span>
                          {m.dosage && (
                            <span className="text-xs font-normal text-slate-500">
                              ({m.dosage})
                            </span>
                          )}
                        </div>
                        {m.dose && (
                          <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold text-xs font-mono">
                            {m.dose}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pt-0.5">
                        {m.timing && <span>• {m.timing}</span>}
                        {m.duration && (
                          <span>
                            • {t("uiContinueFor")}
                            <strong>{m.duration}</strong>
                          </span>
                        )}
                      </div>

                      {m.instructions && (
                        <p className="text-[11px] text-slate-500 italic pt-0.5">
                          {t("uiNote2")}{m.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Advice & Notes */}
            {(advice.length > 0 || prescription.notes) && (
              <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  {t.clinicalAdviceInstructions}
                </h3>
                {advice.length > 0 && (
                  <ul className="space-y-1 list-disc pl-4 text-slate-700">
                    {advice.map((a, idx) => (
                      <li key={idx}>{String(a)}</li>
                    ))}
                  </ul>
                )}
                {prescription.notes && (
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {prescription.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer: Legal BMDC Stamp, QR Code Verification & Doctor Signature */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          {/* QR Code and verification tag */}
          <div className="flex items-center gap-4">
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Prescription QR Code"
                className="w-20 h-20 border border-slate-200 rounded-xl p-1 bg-white"
              />
            )}
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-teal-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>{t.bmdcVerifiedLegalPrescription}</span>
              </div>
              <p className="text-[10px] text-slate-400 max-w-xs">
                {t.scanQrCodeNotice}
              </p>
            </div>
          </div>

          {/* Doctor Signature Block */}
          <div className="text-center sm:text-right space-y-1">
            <div className="w-40 border-b border-slate-400 pb-1 mx-auto sm:ml-auto">
              <span className="font-serif italic text-sm text-slate-800 font-bold">
                {doc.user.name}
              </span>
            </div>
            <p className="font-bold text-slate-800">{doc.user.name}</p>
            <p className="text-[10px] text-slate-500">
              {t("uiBmdcRegNo")} {doc.bmdcRegNo || "A-41285"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
