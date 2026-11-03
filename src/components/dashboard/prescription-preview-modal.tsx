"use client";

import { useMemo, useState, useEffect } from "react";
import { Printer, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface PreviewDoctorInfo {
  name: string;
  specialization: string;
  degrees?: string | null;
  designation?: string | null;
  hospital?: string | null;
  bmdcRegNo?: string | null;
  chamberAddress?: string | null;
  contactNumber?: string | null;
  signatureUrl?: string | null;
}

export interface PreviewPatientInfo {
  name: string;
  age?: string | number;
  gender?: string | null;
  phone?: string | null;
  id?: string;
}

export interface PreviewMedicine {
  type: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PreviewTest {
  name: string;
  instructions: string;
}

export interface PrescriptionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: PreviewDoctorInfo;
  patient: PreviewPatientInfo;
  templateName?: string;
  hospitalInfo?: {
    name?: string;
    tagline?: string;
    address?: string;
    phone?: string;
    email?: string;
    disclaimer?: string;
    themeColor?: string;
  };
  vitals?: {
    bp?: string;
    weight?: string;
    pulse?: string;
    temp?: string;
    bloodSugar?: string;
    spo2?: string;
  };
  clinicalInfo?: {
    complaints?: string;
    diagnosis?: string;
    advice?: string;
    followUp?: string;
    medicalHistory?: string;
    allergies?: string;
  };
  medicines: PreviewMedicine[];
  tests: PreviewTest[];
  prescriptionId?: string;
  version?: number;
  changeReason?: string;
  dateStr?: string;
}

interface PageData {
  pageNumber: number;
  startMedIndex: number;
  medicines: PreviewMedicine[];
  tests: PreviewTest[];
  isLastPage: boolean;
}

function PrescriptionPageSheet({
  page,
  totalPages,
  doctor,
  patient,
  hospitalInfo,
  vitals,
  clinicalInfo,
  prescriptionId,
  version,
  changeReason,
  dateStr,
  primaryColor,
}: {
  page: PageData;
  totalPages: number;
  doctor: PreviewDoctorInfo;
  patient: PreviewPatientInfo;
  hospitalInfo?: PrescriptionPreviewModalProps["hospitalInfo"];
  vitals?: PrescriptionPreviewModalProps["vitals"];
  clinicalInfo?: PrescriptionPreviewModalProps["clinicalInfo"];
  prescriptionId?: string;
  version?: number;
  changeReason?: string;
  dateStr: string;
  primaryColor: string;
}) {
  const { t, language } = useLanguage();
  return (
    <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-300 p-6 sm:p-8 min-h-[920px] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:min-h-0 print:rounded-none">
      <div>
        {/* 1. Unified Prescription Header: Doctor Credentials (Left) & Hospital Affiliation (Right) */}
        <header
          className="pb-3.5 mb-3 border-b-2 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
          style={{ borderColor: primaryColor }}
        >
          {/* Left Column: Doctor Profile & Qualifications */}
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-tight">
              {doctor.name || "Consultant Physician"}
            </h2>
            <p className="text-xs font-bold" style={{ color: primaryColor }}>
              {doctor.degrees ? `${doctor.degrees} • ` : ""}
              {doctor.specialization}
            </p>
            {doctor.designation && (
              <p className="text-xs font-medium text-slate-600 leading-tight">{doctor.designation}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5 text-[11px] text-slate-500">
              {doctor.bmdcRegNo && (
                <span>
                  BMDC Reg: <strong className="text-slate-700 font-mono">{doctor.bmdcRegNo}</strong>
                </span>
              )}
              {doctor.chamberAddress && <span>• Chamber: {doctor.chamberAddress}</span>}
              {doctor.contactNumber && <span>• Tel: {doctor.contactNumber}</span>}
            </div>
          </div>

          {/* Right Column: Hospital / Clinic Branding */}
          <div className="text-left sm:text-right sm:border-l sm:pl-4 border-slate-200 space-y-0.5 shrink-0 max-w-xs">
            <h1 className="text-base sm:text-lg font-black tracking-tight" style={{ color: primaryColor }}>
              {hospitalInfo?.name || doctor.hospital || "Metropolitan Specialized Hospital"}
            </h1>
            {hospitalInfo?.tagline && (
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {hospitalInfo.tagline}
              </p>
            )}
            <p className="text-[11px] text-slate-600">
              {hospitalInfo?.address || doctor.chamberAddress || "Diagnostic & Consultation Block, Dhaka"}
            </p>
            <div className="text-[11px] text-slate-500 flex flex-wrap sm:justify-end gap-x-2">
              <span><strong>{language === "bn" ? "হটলাইন:" : "Hotline:"}</strong> {hospitalInfo?.phone || doctor.contactNumber || "+880 2-8901234"}</span>
              <span><strong>{language === "bn" ? "জরুরি:" : "Emerg:"}</strong> 10678 (24h)</span>
            </div>
            <p className="text-[10px] font-mono font-bold text-slate-500">
              Rx: {prescriptionId || "PREVIEW-DRAFT"} • v{version || 1}
            </p>
          </div>
        </header>

        {/* Revision Note Banner if present on Page 1 */}
        {page.pageNumber === 1 && changeReason && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <span className="font-bold shrink-0">{t.changeReason} (v{version || 1}):</span>
            <span className="text-slate-800 font-medium">{changeReason}</span>
          </div>
        )}

        {/* 2. Compact Patient Information Bar (Repeated on every page) */}
        <div className="p-2.5 rounded-xl bg-slate-100/90 border border-slate-200 mb-4 flex flex-wrap items-center justify-between gap-y-1.5 text-xs">
          <div className="flex items-center gap-5">
            <div>
              <span className="text-slate-400 font-medium">{t.patientName}: </span>
              <strong className="text-slate-900 font-bold">{patient.name || (language === "bn" ? "সাধারণ রোগী" : "Walk-in Patient")}</strong>
            </div>
            {patient.gender && (
              <div>
                <span className="text-slate-400 font-medium">{t.patientGender}: </span>
                <strong className="text-slate-900">{patient.gender}</strong>
              </div>
            )}
            {patient.age && (
              <div>
                <span className="text-slate-400 font-medium">{t.patientAge}: </span>
                <strong className="text-slate-900">{patient.age} {language === "bn" ? "বছর" : "Yrs"}</strong>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {patient.phone && (
              <div>
                <span className="text-slate-400 font-medium">{t.patientPhone}: </span>
                <strong className="text-slate-900">{patient.phone}</strong>
              </div>
            )}
            <div>
              <span className="text-slate-400 font-medium">{t.date}: </span>
              <strong className="text-slate-900">{dateStr}</strong>
            </div>
            <span className="font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
              v{version || 1}
            </span>
            <span className="font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
              {t.pageNumberText} {page.pageNumber} {t.ofText} {totalPages}
            </span>
          </div>
        </div>

        {/* 4. Prescription Body (2 Column Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column (30%): Vitals, Complaints, Diagnosis, Tests */}
          <div className="md:col-span-4 border-r-0 md:border-r border-slate-200 md:pr-6 space-y-6">
            {/* Vitals Box (Shown on page 1) */}
            {page.pageNumber === 1 && (vitals?.bp || vitals?.pulse || vitals?.temp || vitals?.weight || vitals?.bloodSugar || vitals?.spo2) && (
              <div className="space-y-1 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] pb-1 border-b border-slate-200">
                  {t.patientVitals}
                </h3>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 font-medium text-[11px]">
                  {vitals.bp && <div><span className="text-slate-400">{t.bloodPressure}:</span> {vitals.bp}</div>}
                  {vitals.pulse && <div><span className="text-slate-400">{t.pulseRate}:</span> {vitals.pulse}</div>}
                  {vitals.temp && <div><span className="text-slate-400">{t.temperature}:</span> {vitals.temp}</div>}
                  {vitals.weight && <div><span className="text-slate-400">{t.weight}:</span> {vitals.weight}</div>}
                  {vitals.bloodSugar && <div><span className="text-slate-400">RBS:</span> {vitals.bloodSugar}</div>}
                  {vitals.spo2 && <div><span className="text-slate-400">SpO2:</span> {vitals.spo2}</div>}
                </div>
              </div>
            )}

            {/* Medical History / Chronic Comorbidities (Shown on page 1) */}
            {page.pageNumber === 1 && clinicalInfo?.medicalHistory && (
              <div className="space-y-1 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] pb-1 border-b border-slate-200 flex items-center justify-between">
                  <span>{t.medicalHistoryHx}</span>
                  <span className="text-[10px] font-mono text-slate-400">Hx</span>
                </h3>
                <div className="text-slate-800 leading-relaxed whitespace-pre-line pt-1 font-medium bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60">
                  {clinicalInfo.medicalHistory}
                </div>
              </div>
            )}

            {/* Drug Allergies / Contraindications (Shown on page 1) */}
            {page.pageNumber === 1 && clinicalInfo?.allergies && (
              <div className="space-y-1 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-rose-600 text-[11px] pb-1 border-b border-rose-200 flex items-center justify-between">
                  <span>{t.drugAllergiesAlert}</span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                    {language === "bn" ? "সতর্কতা" : "Alert"}
                  </span>
                </h3>
                <div className="text-rose-900 leading-relaxed whitespace-pre-line pt-1 font-medium bg-rose-50/60 p-2.5 rounded-xl border border-rose-200/60">
                  {clinicalInfo.allergies}
                </div>
              </div>
            )}

            {/* Chief Complaints (Shown on page 1) */}
            {page.pageNumber === 1 && clinicalInfo?.complaints && (
              <div className="space-y-1 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] pb-1 border-b border-slate-200">
                  {t.chiefComplaints}
                </h3>
                <p className="text-slate-800 leading-relaxed whitespace-pre-line pt-1">
                  {clinicalInfo.complaints}
                </p>
              </div>
            )}

            {/* Clinical Diagnosis (Shown on page 1) */}
            {page.pageNumber === 1 && clinicalInfo?.diagnosis && (
              <div className="space-y-1 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] pb-1 border-b border-slate-200">
                  {t.clinicalDiagnosis} (Dx)
                </h3>
                <p className="font-semibold text-slate-900 pt-1 leading-relaxed whitespace-pre-line">
                  {clinicalInfo.diagnosis}
                </p>
              </div>
            )}

            {/* Diagnostic Tests Advised */}
            {page.tests.length > 0 && (
              <div className="space-y-1 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] pb-1 border-b border-slate-200">
                  {t.investigationsAdvised}
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 pt-1 text-slate-800 font-medium">
                  {page.tests.map((tItem, idx) => (
                    <li key={idx} className="leading-tight">
                      <span>{tItem.name}</span>
                      {tItem.instructions && (
                        <span className="block text-[11px] text-slate-500 italic ml-4">
                          ({tItem.instructions})
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Right Column (70%): Rx Symbol, Medicines List, Advice, Follow-Up */}
          <div className="md:col-span-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-serif font-black" style={{ color: primaryColor }}>
                ℞
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.medications}
              </span>
            </div>

            {/* Medicines List */}
            <div className="space-y-4">
              {page.medicines.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  {language === "bn" ? "এই পৃষ্ঠায় কোনো ঔষধ নেই।" : "No medicines on this page."}
                </p>
              ) : (
                page.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-500">
                          {page.startMedIndex + idx + 1}.
                        </span>
                        <span className="text-xs font-semibold text-slate-500 uppercase">
                          {med.type}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {med.name}
                        </span>
                        {med.dosage && (
                          <span className="text-xs font-semibold text-slate-600">
                            ({med.dosage})
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                        {med.duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-700 pl-5">
                      <span className="font-semibold text-slate-800">{med.frequency}</span>
                      <span className="text-slate-500 italic">{med.instructions}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Advice & Follow-Up (Shown on last page) */}
            {page.isLastPage && (
              <div className="pt-4 border-t border-slate-200 space-y-4">
                {clinicalInfo?.advice && (
                  <div className="text-xs space-y-1">
                    <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                      {t.adviceAndLifestyle}:
                    </h4>
                    <p className="text-slate-800 leading-relaxed bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl">
                      {clinicalInfo.advice}
                    </p>
                  </div>
                )}

                {clinicalInfo?.followUp && (
                  <div className="text-xs flex items-center gap-2 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-semibold">
                    <span>🗓️ {t.nextVisitRecommendation}:</span>
                    <span>{clinicalInfo.followUp}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Footer: Doctor Signature & Disclaimer (Repeated on every page) */}
      <div className="pt-4 mt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
        <div className="max-w-lg space-y-1">
          <p className="text-[11px] leading-tight">
            {hospitalInfo?.disclaimer ||
              (language === "bn"
                ? "এই প্রেসক্রিপশনটি কম্পিউটার দ্বারা প্রস্তুতকৃত এবং পরামর্শের জন্য বৈধ। পরবর্তী সাক্ষাতের জন্য প্রেসক্রিপশনটি সংরক্ষণ করুন।"
                : "This prescription is computer generated and valid for medical consultation. Keep safe for follow-up visits. For emergencies, contact hospital emergency 24/7.")}
          </p>
          <p className="text-[10px] text-slate-400">
            {language === "bn"
              ? `পিপিএমএস ক্লাউড • পৃষ্ঠা ${page.pageNumber} / ${totalPages}`
              : `Printed via PPMS Cloud • Page ${page.pageNumber} of ${totalPages}`}
          </p>
        </div>

        <div className="text-center sm:text-right w-56 shrink-0">
          <div className="min-h-12 flex flex-col items-center sm:items-end justify-end border-b border-slate-400 pb-1 mb-1">
            {doctor.signatureUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={doctor.signatureUrl}
                alt={`${doctor.name || "Doctor"} Signature`}
                className="max-h-12 max-w-[160px] object-contain mb-0.5"
              />
            ) : (
              <div className="h-8 border-dashed border-b border-slate-300 w-36" />
            )}
          </div>
          <p className="font-bold text-slate-900">{doctor.name || (language === "bn" ? "বিশেষজ্ঞ চিকিৎসক" : "Consultant Physician")}</p>
          <p className="text-[11px] text-slate-600 leading-tight">{doctor.specialization}</p>
          {doctor.bmdcRegNo && (
            <p className="text-[10px] font-mono text-slate-500">BMDC: {doctor.bmdcRegNo}</p>
          )}
          <p className="text-[10px] text-slate-400">{t.doctorSignatureAuthorized}</p>
        </div>
      </div>
    </div>
  );
}

export function PrescriptionPreviewModal({
  isOpen,
  onClose,
  doctor,
  patient,
  hospitalInfo,
  vitals,
  clinicalInfo,
  medicines,
  tests,
  prescriptionId,
  version = 1,
  changeReason,
  dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
}: PrescriptionPreviewModalProps) {
  const { t, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculation: If medicines or tests are extensive, paginate
  // Page 1 can comfortably fit 5 medicines alongside complaints/diagnosis/vitals/tests
  // Subsequent pages can fit up to 8 medicines
  const pages: PageData[] = useMemo(() => {
    const medList = [...medicines];
    const testList = [...tests];
    const resultPages: PageData[] = [];

    const PAGE_1_MEDS_LIMIT = 5;
    const PAGE_NEXT_MEDS_LIMIT = 8;
    const PAGE_1_TESTS_LIMIT = 5;

    // First page items
    const page1Meds = medList.slice(0, PAGE_1_MEDS_LIMIT);
    const page1Tests = testList.slice(0, PAGE_1_TESTS_LIMIT);
    const remainingMeds = medList.slice(PAGE_1_MEDS_LIMIT);
    const remainingTests = testList.slice(PAGE_1_TESTS_LIMIT);

    resultPages.push({
      pageNumber: 1,
      startMedIndex: 0,
      medicines: page1Meds,
      tests: page1Tests,
      isLastPage: remainingMeds.length === 0 && remainingTests.length === 0,
    });

    // Subsequent pages if needed
    let currentMedIdx = PAGE_1_MEDS_LIMIT;
    let pageNum = 2;
    while (currentMedIdx < medList.length || remainingTests.length > (pageNum - 2) * 8) {
      const nextMeds = medList.slice(currentMedIdx, currentMedIdx + PAGE_NEXT_MEDS_LIMIT);
      const nextTests = remainingTests.slice((pageNum - 2) * 8, (pageNum - 1) * 8);
      const isLast =
        currentMedIdx + PAGE_NEXT_MEDS_LIMIT >= medList.length &&
        (pageNum - 1) * 8 >= remainingTests.length;

      resultPages.push({
        pageNumber: pageNum,
        startMedIndex: currentMedIdx,
        medicines: nextMeds,
        tests: nextTests,
        isLastPage: isLast,
      });
      currentMedIdx += PAGE_NEXT_MEDS_LIMIT;
      pageNum++;
    }

    return resultPages;
  }, [medicines, tests]);

  const handleClose = () => {
    setCurrentPage(1);
    onClose();
  };

  // Lock background scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCurrentPage(1);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalPages = pages.length;
  const activePageIndex = Math.min(Math.max(1, currentPage), totalPages);
  const activePageData = pages[activePageIndex - 1] || pages[0];

  const handlePrint = () => {
    window.print();
  };

  const primaryColor = hospitalInfo?.themeColor || "#0f766e";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 print:static print:inset-auto print:bg-white print:p-0 print:overflow-visible"
      role="dialog"
      aria-modal="true"
      aria-label="Prescription Preview Modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Top Sticky Control Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-900/95 border-b border-slate-800 text-white shadow-xl backdrop-blur-md print:hidden">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            Rx
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate leading-tight flex items-center gap-2">
              <span>{t.livePreview}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]">
                v{version}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline">
                A4
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              {totalPages > 1
                ? (language === "bn" ? `পৃষ্ঠা ${activePageIndex} / ${totalPages}` : `Viewing Page ${activePageIndex} of ${totalPages}`)
                : (language === "bn" ? "এক পাতার প্রেসক্রিপশন" : "Single Page Prescription")}
            </p>
          </div>
        </div>

        {/* Center: Pagination Controls (when multiple pages exist) */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 bg-slate-800/90 rounded-xl p-1 border border-slate-700 shadow-inner">
            <button
              type="button"
              disabled={activePageIndex <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              title={t.previous}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.previous}</span>
            </button>
            <span className="text-xs font-mono font-bold px-2.5 text-slate-200">
              {activePageIndex} / {totalPages}
            </span>
            <button
              type="button"
              disabled={activePageIndex >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              title={t.next}
            >
              <span className="hidden sm:inline">{t.next}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right: Print and Close Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[var(--brand-primary)] hover:opacity-90 transition-all text-white shadow-md cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.print}</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Document Canvas Viewport */}
      <div
        className="w-full flex justify-center p-4 sm:p-6 md:p-8 pb-16 print:p-0 print:m-0 print:block"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div className="max-w-4xl w-full print:max-w-none print:w-full">
          {/* Interactive Screen Preview (current page) */}
          <div className="print:hidden">
            <PrescriptionPageSheet
              page={activePageData}
              totalPages={totalPages}
              doctor={doctor}
              patient={patient}
              hospitalInfo={hospitalInfo}
              vitals={vitals}
              clinicalInfo={clinicalInfo}
              prescriptionId={prescriptionId}
              version={version}
              changeReason={changeReason}
              dateStr={dateStr}
              primaryColor={primaryColor}
            />
          </div>

          {/* Full Multi-Page Document for Print / PDF */}
          <div className="hidden print:block">
            {pages.map((p, idx) => (
              <div
                key={p.pageNumber}
                className={idx < pages.length - 1 ? "print-page-break" : ""}
              >
                <PrescriptionPageSheet
                  page={p}
                  totalPages={totalPages}
                  doctor={doctor}
                  patient={patient}
                  hospitalInfo={hospitalInfo}
                  vitals={vitals}
                  clinicalInfo={clinicalInfo}
                  prescriptionId={prescriptionId}
                  version={version}
                  changeReason={changeReason}
                  dateStr={dateStr}
                  primaryColor={primaryColor}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
