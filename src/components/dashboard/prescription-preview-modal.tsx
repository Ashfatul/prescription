"use client";

import { useMemo, useState } from "react";

export interface PreviewDoctorInfo {
  name: string;
  specialization: string;
  degrees?: string | null;
  designation?: string | null;
  hospital?: string | null;
  bmdcRegNo?: string | null;
  chamberAddress?: string | null;
  contactNumber?: string | null;
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
  };
  clinicalInfo?: {
    complaints?: string;
    diagnosis?: string;
    advice?: string;
    followUp?: string;
  };
  medicines: PreviewMedicine[];
  tests: PreviewTest[];
  prescriptionId?: string;
  dateStr?: string;
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
  dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
}: PrescriptionPreviewModalProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculation: If medicines or tests are extensive, paginate
  // Page 1 can comfortably fit 5 medicines alongside complaints/diagnosis/vitals/tests
  // Subsequent pages can fit up to 8 medicines
  const pages = useMemo(() => {
    const medList = [...medicines];
    const testList = [...tests];
    const resultPages: {
      pageNumber: number;
      medicines: PreviewMedicine[];
      tests: PreviewTest[];
      isLastPage: boolean;
    }[] = [];

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
      medicines: page1Meds,
      tests: page1Tests,
      isLastPage: remainingMeds.length === 0 && remainingTests.length === 0,
    });

    // Subsequent pages if needed
    let currentMedIdx = PAGE_1_MEDS_LIMIT;
    let pageNum = 2;
    while (currentMedIdx < medList.length || remainingTests.length > (pageNum - 2) * 8) {
      const nextMeds = medList.slice(currentMedIdx, currentMedIdx + PAGE_NEXT_MEDS_LIMIT);
      currentMedIdx += PAGE_NEXT_MEDS_LIMIT;
      resultPages.push({
        pageNumber: pageNum,
        medicines: nextMeds,
        tests: remainingTests.slice((pageNum - 2) * 8, (pageNum - 1) * 8),
        isLastPage: currentMedIdx >= medList.length,
      });
      pageNum++;
    }

    return resultPages;
  }, [medicines, tests]);

  if (!isOpen) return null;

  const totalPages = pages.length;
  const activePageData = pages[currentPage - 1] || pages[0];

  const handlePrint = () => {
    window.print();
  };

  const primaryColor = hospitalInfo?.themeColor || "#0f766e";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Top Floating Control Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/90 text-white border border-slate-700 shadow-2xl backdrop-blur-md">
        <span className="text-xs font-semibold text-slate-300">
          Preview • Page {currentPage} of {totalPages}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-0.5 border border-slate-700">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-40"
            >
              ◀ Prev
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-40"
            >
              Next ▶
            </button>
          </div>
        )}

        <div className="w-px h-4 bg-slate-700" />

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl bg-[var(--brand-primary)] hover:opacity-90 transition-all text-white shadow-xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print / PDF</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* A4 Sheet Container */}
      <div className="my-16 max-w-4xl w-full">
        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-300 p-8 sm:p-12 min-h-[900px] flex flex-col justify-between print:border-none print:shadow-none print:p-0">
          <div>
            {/* 1. Hospital / Organization Header (Repeated on every page) */}
            <div
              className="pb-4 mb-4 border-b-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ borderColor: primaryColor }}
            >
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
                  {hospitalInfo?.name || doctor.hospital || "Metropolitan Specialized Hospital"}
                </h1>
                {hospitalInfo?.tagline && (
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {hospitalInfo.tagline}
                  </p>
                )}
                <p className="text-xs text-slate-600 mt-1 max-w-md">
                  {hospitalInfo?.address || doctor.chamberAddress || "Diagnostic & Consultation Block, Uttara, Dhaka"}
                </p>
              </div>

              <div className="text-right sm:border-l sm:pl-4 border-slate-200 text-xs text-slate-600 space-y-0.5">
                <p>
                  <strong>Tel:</strong> {hospitalInfo?.phone || doctor.contactNumber || "+880 2-8901234"}
                </p>
                <p>
                  <strong>Emergency:</strong> 10678 / 24 Hours
                </p>
                {hospitalInfo?.email && <p><strong>Email:</strong> {hospitalInfo.email}</p>}
                <p className="text-[11px] font-mono text-slate-400">
                  Rx Ref: {prescriptionId || "PREVIEW-DRAFT"}
                </p>
              </div>
            </div>

            {/* 2. Doctor Credentials Header (Repeated on every page) */}
            <div className="pb-3 mb-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-3 bg-slate-50/70 p-3 rounded-xl">
              <div>
                <h2 className="text-base font-bold text-slate-900">{doctor.name}</h2>
                <p className="text-xs font-semibold" style={{ color: primaryColor }}>
                  {doctor.degrees ? `${doctor.degrees} • ` : ""}
                  {doctor.specialization}
                </p>
                {doctor.designation && (
                  <p className="text-xs text-slate-600">{doctor.designation}</p>
                )}
              </div>

              <div className="text-right text-xs text-slate-600">
                {doctor.bmdcRegNo && (
                  <p className="font-medium text-slate-700">
                    BMDC Reg No: <span className="font-semibold">{doctor.bmdcRegNo}</span>
                  </p>
                )}
                {doctor.chamberAddress && (
                  <p className="text-slate-500 text-[11px]">Chamber: {doctor.chamberAddress}</p>
                )}
                <p className="text-slate-500 text-[11px]">Date: <strong>{dateStr}</strong></p>
              </div>
            </div>

            {/* 3. Patient Information Bar (Repeated on every page) */}
            <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-y-2 text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-slate-400 font-medium">Patient Name: </span>
                  <strong className="text-slate-900 font-bold">{patient.name || "Walk-in Patient"}</strong>
                </div>
                {patient.gender && (
                  <div>
                    <span className="text-slate-400 font-medium">Gender: </span>
                    <strong className="text-slate-900">{patient.gender}</strong>
                  </div>
                )}
                {patient.age && (
                  <div>
                    <span className="text-slate-400 font-medium">Age: </span>
                    <strong className="text-slate-900">{patient.age} Yrs</strong>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {patient.phone && (
                  <div>
                    <span className="text-slate-400 font-medium">Contact: </span>
                    <strong className="text-slate-900">{patient.phone}</strong>
                  </div>
                )}
                <span className="font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            </div>

            {/* 4. Prescription Body (2 Column Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column (30%): Vitals, Complaints, Diagnosis, Tests */}
              <div className="md:col-span-4 border-r-0 md:border-r border-slate-200 md:pr-6 space-y-6">
                {/* Vitals Box */}
                {(vitals?.bp || vitals?.pulse || vitals?.temp || vitals?.weight) && (
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] pb-1 border-b border-slate-200">
                      Patient Vitals
                    </h3>
                    <div className="grid grid-cols-2 gap-2 pt-1 font-medium">
                      {vitals.bp && <div><span className="text-slate-400">BP:</span> {vitals.bp}</div>}
                      {vitals.pulse && <div><span className="text-slate-400">Pulse:</span> {vitals.pulse}</div>}
                      {vitals.temp && <div><span className="text-slate-400">Temp:</span> {vitals.temp}</div>}
                      {vitals.weight && <div><span className="text-slate-400">Weight:</span> {vitals.weight}</div>}
                    </div>
                  </div>
                )}

                {/* Chief Complaints */}
                {clinicalInfo?.complaints && (
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] pb-1 border-b border-slate-200">
                      Chief Complaints
                    </h3>
                    <p className="text-slate-800 leading-relaxed whitespace-pre-line pt-1">
                      {clinicalInfo.complaints}
                    </p>
                  </div>
                )}

                {/* Clinical Diagnosis */}
                {clinicalInfo?.diagnosis && (
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] pb-1 border-b border-slate-200">
                      Diagnosis (Dx)
                    </h3>
                    <p className="font-semibold text-slate-900 pt-1">
                      {clinicalInfo.diagnosis}
                    </p>
                  </div>
                )}

                {/* Diagnostic Tests Advised */}
                {activePageData.tests.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[11px] pb-1 border-b border-slate-200">
                      Investigations Advised
                    </h3>
                    <ol className="list-decimal list-inside space-y-1.5 pt-1 text-slate-800 font-medium">
                      {activePageData.tests.map((t, idx) => (
                        <li key={idx} className="leading-tight">
                          <span>{t.name}</span>
                          {t.instructions && (
                            <span className="block text-[11px] text-slate-500 italic ml-4">
                              ({t.instructions})
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
                    Prescribed Medication
                  </span>
                </div>

                {/* Medicines List */}
                <div className="space-y-4">
                  {activePageData.medicines.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No medicines on this page.</p>
                  ) : (
                    activePageData.medicines.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-bold text-slate-500">
                              {(currentPage - 1) * 5 + idx + 1}.
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
                {activePageData.isLastPage && (
                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    {clinicalInfo?.advice && (
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                          Lifestyle & Dietary Advice:
                        </h4>
                        <p className="text-slate-800 leading-relaxed bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl">
                          {clinicalInfo.advice}
                        </p>
                      </div>
                    )}

                    {clinicalInfo?.followUp && (
                      <div className="text-xs flex items-center gap-2 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-semibold">
                        <span>🗓️ Next Visit / Follow-up:</span>
                        <span>{clinicalInfo.followUp}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 5. Footer: Doctor Signature & Disclaimer (Repeated on every page) */}
          <div className="pt-8 mt-12 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
            <div className="max-w-lg space-y-1">
              <p className="text-[11px] leading-tight">
                {hospitalInfo?.disclaimer ||
                  "This prescription is computer generated and valid for medical consultation. Keep safe for follow-up visits. For emergencies, contact hospital emergency 24/7."}
              </p>
              <p className="text-[10px] text-slate-400">
                Printed via PPMS Cloud • Page {currentPage} of {totalPages}
              </p>
            </div>

            <div className="text-center sm:text-right w-52 shrink-0">
              <div className="h-12 border-b border-dashed border-slate-400 mb-1" />
              <p className="font-bold text-slate-900">{doctor.name}</p>
              <p className="text-[11px] text-slate-600">{doctor.specialization}</p>
              <p className="text-[10px] text-slate-400">Authorized Physician Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
