"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { PrintFloatingActionBar } from "@/components/prescriptions/print-floating-action-bar";

export type MedicineItem = {
  type?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
};

export type TestItem = {
  name: string;
  instructions?: string;
};

export type Vitals = {
  bp?: string;
  weight?: string;
  pulse?: string;
  temp?: string;
  bloodSugar?: string;
  spo2?: string;
};

export type ClinicalInfo = {
  complaints?: string;
  diagnosis?: string;
  advice?: string;
  followUp?: string;
  medicalHistory?: string;
  allergies?: string;
};

export type CustomTextBlock = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  isBold?: boolean;
};

export type TemplateContent = {
  hospitalName?: string;
  hospitalTagline?: string;
  hospitalAddress?: string;
  hospitalPhone?: string;
  hospitalEmail?: string;
  hospitalWebsite?: string;
  logoUrl?: string;
  watermarkUrl?: string;
  watermarkOpacity?: number;
  watermarkSize?: number;
  watermarkX?: number;
  watermarkY?: number;
  showWatermark?: boolean;
  themeColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headerBgColor?: string;
  hospitalTitleSize?: number;
  doctorTitleSize?: number;
  bodyFontSize?: number;
  rxItemFontSize?: number;
  disclaimerFontSize?: number;
  headerOffsetY?: number;
  signatureOffsetY?: number;
  contentPaddingX?: number;
  showHospitalLogo?: boolean;
  showHospitalTagline?: boolean;
  showHospitalContactBar?: boolean;
  showVitals?: boolean;
  showClinicalNotes?: boolean;
  showDiagnosis?: boolean;
  showSignatureBlock?: boolean;
  showDisclaimer?: boolean;
  disclaimer?: string;
  customTextBlocks?: CustomTextBlock[];
};

export interface PrintablePrescriptionViewProps {
  id: string;
  currentVersion: number;
  activeVersion: number;
  isHistorical: boolean;
  changeReason?: string | null;
  displayDate: string | Date;
  versions: { id: string; versionNumber: number }[];
  doctor: {
    name: string;
    specialization?: string | null;
    degrees?: string | null;
    designation?: string | null;
    hospitalAffiliation?: string | null;
    bmdcRegNo?: string | null;
    chamber?: string | null;
    contactPhone?: string | null;
    signatureUrl?: string | null;
  };
  patient: {
    name: string;
    gender?: string | null;
    dateOfBirth?: string | Date | null;
  };
  appointment?: {
    serialNumber: number;
  } | null;
  notes?: string | null;
  medicines: MedicineItem[];
  tests: TestItem[];
  vitals: Vitals;
  clinicalInfo: ClinicalInfo;
  tplContent: TemplateContent;
  attachments?: { id: string; file: { url: string; originalName: string } }[];
}

export function PrintablePrescriptionView({
  id,
  currentVersion,
  activeVersion,
  isHistorical,
  changeReason,
  displayDate,
  versions,
  doctor,
  patient,
  appointment,
  notes,
  medicines,
  tests,
  vitals,
  clinicalInfo,
  tplContent,
  attachments = [],
}: PrintablePrescriptionViewProps) {
  const { t, language } = useLanguage();
  const isBn = language === "bn";

  const themeColor = tplContent.themeColor || "#0f766e";
  const backgroundColor = tplContent.backgroundColor || "#ffffff";
  const textColor = tplContent.textColor || "#0f172a";
  const watermarkUrl = tplContent.watermarkUrl;
  const showWatermark = tplContent.showWatermark ?? true;
  const watermarkOpacity = tplContent.watermarkOpacity ?? 0.12;
  const watermarkSize = tplContent.watermarkSize ?? 260;
  const watermarkX = tplContent.watermarkX ?? 0;
  const watermarkY = tplContent.watermarkY ?? 0;
  const customTextBlocks = tplContent.customTextBlocks || [];

  const hospitalName =
    tplContent.hospitalName ||
    doctor.hospitalAffiliation ||
    (t("uiMetropolitanSpecializedHospital"));
  const hospitalTagline =
    tplContent.hospitalTagline ||
    (t("uiCenterOfMedicalExcellenceCompassionate"));
  const hospitalAddress =
    tplContent.hospitalAddress ||
    doctor.chamber ||
    (t("uiMedicalEnclaveDhakaBangladesh"));
  const hospitalPhone =
    tplContent.hospitalPhone ||
    doctor.contactPhone ||
    "+880 2-8901234 / 10678";

  const defaultDisclaimer = t("uiThisIsALegallyValid");

  const disclaimer = tplContent.disclaimer || defaultDisclaimer;

  const formattedDate = new Date(displayDate).toLocaleDateString(t("uiEnUS"), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const patientAgeYears = patient.dateOfBirth
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : null;

  return (
    <div className="min-h-screen bg-zinc-100 py-6 text-zinc-900 print:bg-white print:p-0 print:py-0">
      <PrintFloatingActionBar
        id={id}
        isHistorical={isHistorical}
        currentVersion={currentVersion}
        activeVersion={activeVersion}
        displayDate={displayDate}
        changeReason={changeReason}
        versions={versions}
      />

      {/* Main Prescription Paper (A4 Standard) */}
      <main
        className="relative mx-auto min-h-[1050px] max-w-4xl overflow-hidden rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl print:m-0 print:min-h-0 print:w-full print:max-w-none print:rounded-none print:p-5 print:pt-4 print:pb-4 print:shadow-none"
        style={{
          borderColor: themeColor,
          backgroundColor: backgroundColor,
          color: textColor,
          paddingLeft: tplContent.contentPaddingX ? `${tplContent.contentPaddingX}px` : undefined,
          paddingRight: tplContent.contentPaddingX ? `${tplContent.contentPaddingX}px` : undefined,
        }}
      >
        {/* Behind Logo / Watermark Layer */}
        {showWatermark && watermarkUrl && (
          <div
            className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center overflow-hidden"
            style={{
              transform: `translate(${watermarkX}px, ${watermarkY}px)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={watermarkUrl}
              alt=""
              style={{
                opacity: watermarkOpacity,
                width: `${watermarkSize}px`,
                height: `${watermarkSize}px`,
                objectFit: "contain",
              }}
            />
          </div>
        )}

        {/* Floating Custom Text Blocks ("Place text anywhere") */}
        {customTextBlocks.map((block) => (
          <div
            key={block.id}
            className="pointer-events-none absolute z-20 select-none whitespace-pre-wrap"
            style={{
              left: `${block.x}%`,
              top: `${block.y}%`,
              transform: "translate(-50%, -50%)",
              fontSize: `${block.fontSize}px`,
              color: block.color,
              fontWeight: block.isBold ? 700 : 400,
            }}
          >
            {block.text}
          </div>
        ))}

        {/* Prescription Content Container */}
        <div className="relative z-10 flex flex-col justify-between min-h-[970px]">
          <div>
            {/* Top Header: Hospital & Doctor Information */}
            <header
              className="border-b-2 pb-3.5 mb-3"
              style={{
                borderColor: themeColor,
                transform: tplContent.headerOffsetY ? `translateY(${tplContent.headerOffsetY}px)` : undefined,
              }}
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                {/* Left Column: Doctor Profile */}
                <div className="max-w-md">
                  <h1
                    className="text-xl sm:text-2xl font-bold tracking-tight"
                    style={{
                      color: themeColor,
                      fontSize: tplContent.doctorTitleSize ? `${tplContent.doctorTitleSize}px` : undefined,
                    }}
                  >
                    {doctor.name}
                  </h1>
                  {doctor.degrees && <p className="text-xs sm:text-sm font-semibold opacity-90">{doctor.degrees}</p>}
                  {doctor.specialization && <p className="text-xs font-medium opacity-85">{doctor.specialization}</p>}
                  {doctor.designation && <p className="text-xs opacity-75">{doctor.designation}</p>}
                  {doctor.hospitalAffiliation && (
                    <p className="mt-0.5 text-xs font-semibold opacity-85">
                      🏥 {doctor.hospitalAffiliation}
                    </p>
                  )}
                  {doctor.bmdcRegNo && (
                    <p className="mt-0.5 text-[11px] font-mono opacity-70">
                      {t("uiReg")} {doctor.bmdcRegNo}
                    </p>
                  )}
                  {doctor.contactPhone && (
                    <p className="text-[11px] opacity-70">
                      {t("uiPhone")} {doctor.contactPhone}
                    </p>
                  )}
                </div>

                {/* Right Column: Hospital / Clinic Branding */}
                <div className="text-left md:text-right flex flex-col md:items-end">
                  {tplContent.showHospitalLogo !== false && tplContent.logoUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={tplContent.logoUrl}
                      alt={hospitalName}
                      className="mb-1.5 h-10 w-auto max-w-[150px] object-contain rounded"
                    />
                  )}
                  <h2
                    className="text-lg sm:text-xl font-black uppercase tracking-wider"
                    style={{
                      color: themeColor,
                      fontSize: tplContent.hospitalTitleSize ? `${tplContent.hospitalTitleSize}px` : undefined,
                    }}
                  >
                    {hospitalName}
                  </h2>
                  {tplContent.showHospitalTagline !== false && hospitalTagline && (
                    <p className="text-[11px] italic opacity-75">{hospitalTagline}</p>
                  )}
                  <p className="mt-0.5 text-xs opacity-75">{hospitalAddress}</p>
                  {tplContent.showHospitalContactBar !== false && (
                    <>
                      <p className="text-xs opacity-75">
                        {t("uiHotline")} <span className="font-semibold">{hospitalPhone}</span>
                      </p>
                      {tplContent.hospitalEmail && (
                        <p className="text-[11px] opacity-70">{tplContent.hospitalEmail}</p>
                      )}
                      {tplContent.hospitalWebsite && (
                        <p className="text-[11px] opacity-70">{tplContent.hospitalWebsite}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </header>

            {/* Patient Details Strip */}
            <section className="mb-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-2.5 sm:p-3 print:bg-transparent print:border-zinc-300">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-[11px] font-medium opacity-65">
                    {t.patientName}:
                  </span>
                  <p className="text-sm font-bold">{patient.name}</p>
                </div>

                <div>
                  <span className="text-[11px] font-medium opacity-65">
                    {t("uiGenderAge")}
                  </span>
                  <p className="text-sm font-semibold">
                    {patient.gender || (t("rolePatient"))}{" "}
                    {patientAgeYears !== null ? `(${patientAgeYears} ${t("uiYrs3")})` : ""}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-medium opacity-65">
                    {t("uiDateSerial2")}
                  </span>
                  <p className="text-sm font-semibold">
                    {formattedDate} {appointment ? `• #${appointment.serialNumber}` : ""}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-medium opacity-65">
                    {t("uiPrescriptionNo")}
                  </span>
                  <p className="text-xs font-mono font-bold break-all">
                    {id} • v{currentVersion}
                  </p>
                </div>
              </div>

              {/* Revision note bar if present */}
              {changeReason && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/80 p-2 text-xs text-amber-900 print:border-zinc-300 print:bg-transparent print:text-zinc-800">
                  <span className="font-bold">
                    {isBn ? `রিভিশন নোট (সংস্করণ ${currentVersion}):` : `Revision Note (v${currentVersion}):`}
                  </span>{" "}
                  <span>{changeReason}</span>
                </div>
              )}

              {/* Vitals row if present */}
              {tplContent.showVitals !== false && (vitals.bp || vitals.weight || vitals.pulse || vitals.temp || vitals.bloodSugar || vitals.spo2) && (
                <div className="mt-2.5 flex flex-wrap gap-4 border-t border-zinc-200/60 pt-2 text-xs print:border-zinc-300">
                  {vitals.bp && (
                    <span>
                      <strong className="opacity-75">{t.bloodPressure}:</strong> {vitals.bp}
                    </span>
                  )}
                  {vitals.pulse && (
                    <span>
                      <strong className="opacity-75">{t.pulseRate}:</strong> {vitals.pulse}
                    </span>
                  )}
                  {vitals.temp && (
                    <span>
                      <strong className="opacity-75">{t.temperature}:</strong> {vitals.temp}
                    </span>
                  )}
                  {vitals.weight && (
                    <span>
                      <strong className="opacity-75">{t.weight}:</strong> {vitals.weight}
                    </span>
                  )}
                  {vitals.bloodSugar && (
                    <span>
                      <strong className="opacity-75">RBS/Sugar:</strong> {vitals.bloodSugar}
                    </span>
                  )}
                  {vitals.spo2 && (
                    <span>
                      <strong className="opacity-75">SpO2:</strong> {vitals.spo2}
                    </span>
                  )}
                </div>
              )}
            </section>

            {/* Main Body: 2-Column Professional Prescription Grid */}
            <div
              className="grid min-h-[560px] grid-cols-12 gap-6 print:min-h-[520px]"
              style={{
                fontSize: tplContent.bodyFontSize ? `${tplContent.bodyFontSize}px` : undefined,
              }}
            >
              {/* Left Column: Complaints, Diagnosis & Investigations (~35% width) */}
              <aside className="col-span-12 border-b border-zinc-200/80 pb-4 md:col-span-4 md:border-b-0 md:border-r md:pr-4 print:col-span-4 print:border-r print:border-b-0">
                {/* Past Medical History / Comorbidities */}
                {clinicalInfo.medicalHistory && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                      {t("uiMedicalHistoryHx")}
                    </h3>
                    <div className="mt-1.5 whitespace-pre-line leading-relaxed text-xs font-medium bg-zinc-50/70 p-2.5 rounded-lg border border-zinc-200/80 print:bg-transparent print:border-zinc-300">
                      {clinicalInfo.medicalHistory}
                    </div>
                  </div>
                )}

                {/* Drug Allergies / Adverse Alerts */}
                {clinicalInfo.allergies && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 print:text-black">
                      {t("uiDrugAllergiesAlerts")}
                    </h3>
                    <div className="mt-1.5 whitespace-pre-line leading-relaxed text-xs font-semibold text-rose-900 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200 print:bg-transparent print:text-black print:border-zinc-300">
                      {clinicalInfo.allergies}
                    </div>
                  </div>
                )}
                {clinicalInfo.complaints && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                      {t.chiefComplaints}
                    </h3>
                    <p className="mt-1.5 whitespace-pre-line leading-relaxed opacity-85">
                      {clinicalInfo.complaints}
                    </p>
                  </div>
                )}

                {tplContent.showDiagnosis !== false && clinicalInfo.diagnosis && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                      {t("uiDiagnosisAssessment")}
                    </h3>
                    <div className="mt-1.5 rounded-lg border border-teal-200 bg-teal-50/50 p-2.5 text-xs font-semibold text-teal-900 whitespace-pre-line leading-relaxed print:bg-transparent print:border-zinc-300">
                      {clinicalInfo.diagnosis}
                    </div>
                  </div>
                )}

                {tests.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                      {t.investigationsAdvised}
                    </h3>
                    <ul className="mt-2 space-y-2 text-xs">
                      {tests.map((test, idx) => (
                        <li key={idx} className="flex flex-col">
                          <span className="font-semibold opacity-90">
                            {idx + 1}. {test.name}
                          </span>
                          {test.instructions && (
                            <span className="text-[11px] italic opacity-70 pl-3">
                              ↳ {test.instructions}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tplContent.showClinicalNotes !== false && notes && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                      {t("uiClinicalNotes")}
                    </h3>
                    <p className="mt-1.5 opacity-75">{notes}</p>
                  </div>
                )}
              </aside>

              {/* Right Column: Rx, Medicines, Advice & Follow-Up (~65% width) */}
              <section className="col-span-12 md:col-span-8 md:pl-2 print:col-span-8">
                {/* Rx Symbol Header */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-serif text-3xl font-extrabold italic" style={{ color: themeColor }}>
                    ℞
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                    {t("uiPrescriptionMedication")}
                  </span>
                </div>

                {/* Medicines List */}
                <div
                  className="space-y-4"
                  style={{
                    fontSize: tplContent.rxItemFontSize ? `${tplContent.rxItemFontSize}px` : undefined,
                  }}
                >
                  {medicines.map((med, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-200/60 bg-white/60 p-3 shadow-xs print:border-b print:border-zinc-200 print:p-2 print:shadow-none"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-xs font-bold opacity-50">{idx + 1}.</span>
                          <span className="text-xs font-semibold uppercase" style={{ color: themeColor }}>
                            {med.type || "Tab"}.
                          </span>
                          <span className="text-sm font-bold">{med.name}</span>
                          {med.dosage && (
                            <span className="text-xs font-medium opacity-75">({med.dosage})</span>
                          )}
                        </div>

                        {med.duration && (
                          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 print:bg-transparent">
                            ⏱ {med.duration}
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 pl-4 text-xs">
                        {med.frequency && (
                          <span className="font-bold tracking-wide opacity-90">
                            {med.frequency}
                          </span>
                        )}
                        {med.instructions && (
                          <span className="italic opacity-70">
                            • {med.instructions}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Advice & Special Instructions */}
                {clinicalInfo.advice && (
                  <div className="mt-8 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 print:bg-transparent print:border-zinc-300">
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                      {t.adviceAndLifestyle}
                    </h4>
                    <p className="mt-1.5 whitespace-pre-line leading-relaxed opacity-85">
                      {clinicalInfo.advice}
                    </p>
                  </div>
                )}

                {/* Follow-up Note */}
                {clinicalInfo.followUp && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                    <span>📅 {t.nextReviewFollowUp}:</span>
                    <span className="rounded bg-teal-50 px-2 py-0.5 text-teal-800 print:bg-transparent print:p-0">
                      {clinicalInfo.followUp}
                    </span>
                  </div>
                )}

                {/* Attached Lab Reports & Documents */}
                {attachments && attachments.length > 0 && (
                  <div className="mt-6 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 print:bg-transparent print:border-zinc-300">
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                      📎 {t("uiAttachedDiagnosticReportsRecords")} ({attachments.length})
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white font-medium hover:border-zinc-400 text-zinc-800"
                        >
                          <span>📄 {att.file.originalName}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Prescription Footer: Signature Block & Legal Disclaimer */}
          <footer
            className="mt-12 border-t-2 pt-6 print:mt-8"
            style={{
              borderColor: themeColor,
              transform: tplContent.signatureOffsetY ? `translateY(${tplContent.signatureOffsetY}px)` : undefined,
            }}
          >
            <div className="flex flex-col-reverse justify-between gap-6 sm:flex-row sm:items-end">
              {/* Legal Disclaimer */}
              {tplContent.showDisclaimer !== false && (
                <div
                  className="max-w-md text-[10px] leading-relaxed opacity-75"
                  style={{
                    fontSize: tplContent.disclaimerFontSize ? `${tplContent.disclaimerFontSize}px` : undefined,
                  }}
                >
                  <p>{disclaimer}</p>
                  <p className="mt-1 font-mono text-[9px] opacity-60">
                    {isBn
                      ? `পিপিএমএস মেডিকেল সিস্টেমের মাধ্যমে প্রস্তুতকৃত • ডকুমেন্ট আইডি: ${id}`
                      : `Generated via PPMS Medical Care System • Document ID: ${id}`}
                  </p>
                </div>
              )}

              {/* Doctor Signature Block */}
              {tplContent.showSignatureBlock !== false && (
                <div className="text-center sm:text-right shrink-0">
                  <div className="inline-flex flex-col items-center sm:items-end justify-end min-w-[200px] border-b border-zinc-400 pb-1 text-center font-serif text-sm italic opacity-90 min-h-12">
                    {doctor.signatureUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={doctor.signatureUrl}
                        alt={`${doctor.name} Signature`}
                        className="max-h-12 max-w-[170px] object-contain mb-0.5"
                      />
                    ) : (
                      <div className="h-8 w-36 border-b border-dashed border-zinc-300" />
                    )}
                  </div>
                  <p className="mt-1 text-xs font-bold">{doctor.name}</p>
                  {doctor.specialization && <p className="text-[11px] opacity-75">{doctor.specialization}</p>}
                  {doctor.bmdcRegNo && (
                    <p className="text-[10px] font-mono opacity-70">
                      {t("uiBmdc")} {doctor.bmdcRegNo}
                    </p>
                  )}
                  <p className="text-[10px] opacity-60">{t.doctorsSignature}</p>
                </div>
              )}
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
