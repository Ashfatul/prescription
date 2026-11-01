import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PrintButton } from "@/components/common/print-button";

type Params = { id: string };

type MedicineItem = {
  type?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
};

type TestItem = {
  name: string;
  instructions?: string;
};

type Vitals = {
  bp?: string;
  weight?: string;
  pulse?: string;
  temp?: string;
};

type ClinicalInfo = {
  complaints?: string;
  diagnosis?: string;
  advice?: string;
  followUp?: string;
};

type DoctorOverride = {
  doctorName?: string;
  specialization?: string;
  degrees?: string;
  designation?: string;
  hospital?: string;
  bmdcRegNo?: string;
  chamberAddress?: string;
  contactNumber?: string;
};

type CustomTextBlock = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  isBold?: boolean;
};

type TemplateContent = {
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

export default async function PrintablePrescriptionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const prescription = await db.prescription.findUnique({
    where: { id },
    include: {
      doctor: { include: { user: true } },
      patient: { include: { user: true } },
      template: true,
      appointment: true,
      attachments: { include: { file: true } },
    },
  });

  if (!prescription) {
    notFound();
  }

  // Doctor Info (Priority: doctorOverrideJson -> doctor profile -> user record)
  const override = (prescription.doctorOverrideJson as DoctorOverride) || {};
  const docProfile = prescription.doctor;

  const doctorName = override.doctorName || docProfile.user.name;
  const specialization = override.specialization || docProfile.specialization;
  const degrees = override.degrees || docProfile.degrees;
  const designation = override.designation || docProfile.designation;
  const hospitalAffiliation = override.hospital || docProfile.hospital;
  const bmdcRegNo = override.bmdcRegNo || docProfile.bmdcRegNo;
  const chamber = override.chamberAddress || docProfile.chamberAddress;
  const contactPhone = override.contactNumber || docProfile.contactNumber || docProfile.user.phone;

  // Template / Hospital Info
  const tplContent = (prescription.template?.contentJson as TemplateContent) || {};
  const hospitalName =
    tplContent.hospitalName || hospitalAffiliation || "Metropolitan Specialized Hospital";
  const hospitalTagline =
    tplContent.hospitalTagline || "Center of Medical Excellence & Compassionate Patient Care";
  const hospitalAddress =
    tplContent.hospitalAddress || chamber || "Medical Enclave, Dhaka, Bangladesh";
  const hospitalPhone =
    tplContent.hospitalPhone || contactPhone || "+880 2-8901234 / Emergency 10678";
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
  const disclaimer =
    tplContent.disclaimer ||
    "This is a legally valid computer-generated medical prescription. In case of sudden emergency or deterioration, report immediately to the nearest hospital emergency room.";

  // Clinical & Medicines Data
  const medicines = (prescription.medicinesJson as MedicineItem[]) || [];
  const tests = (prescription.testsJson as TestItem[]) || [];
  const vitals = (prescription.vitalsJson as Vitals) || {};
  const clinicalInfo = (prescription.clinicalInfoJson as ClinicalInfo) || {};

  const formattedDate = new Date(prescription.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-zinc-100 py-6 text-zinc-900 print:bg-white print:p-0 print:py-0">
      {/* Floating Action Bar - Hidden in Print */}
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-md print:hidden dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/doctor"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ← Back to Doctor Dashboard
          </Link>
          <span className="text-xs text-zinc-500">
            Prescription ID: <code className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{id}</code>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-zinc-500 sm:inline">
            📄 Formatted for A4 Prescription Paper
          </span>
          <PrintButton />
        </div>
      </div>

      {/* Main Prescription Paper (A4 Standard) */}
      <main
        className="relative mx-auto min-h-[1050px] max-w-4xl overflow-hidden rounded-2xl p-10 shadow-xl print:m-0 print:min-h-0 print:w-full print:max-w-none print:rounded-none print:p-8 print:shadow-none"
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
              className="border-b-2 pb-5"
              style={{
                borderColor: themeColor,
                transform: tplContent.headerOffsetY ? `translateY(${tplContent.headerOffsetY}px)` : undefined,
              }}
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                {/* Left Column: Doctor Profile */}
                <div className="max-w-md">
                  <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{
                      color: themeColor,
                      fontSize: tplContent.doctorTitleSize ? `${tplContent.doctorTitleSize}px` : undefined,
                    }}
                  >
                    {doctorName}
                  </h1>
                  {degrees && <p className="text-sm font-semibold opacity-90">{degrees}</p>}
                  <p className="text-xs font-medium opacity-85">{specialization}</p>
                  {designation && <p className="text-xs opacity-75">{designation}</p>}
                  {hospitalAffiliation && (
                    <p className="mt-0.5 text-xs font-semibold opacity-85">
                      🏥 {hospitalAffiliation}
                    </p>
                  )}
                  {bmdcRegNo && (
                    <p className="mt-1 text-[11px] font-mono opacity-70">
                      Reg: {bmdcRegNo}
                    </p>
                  )}
                  {contactPhone && (
                    <p className="text-[11px] opacity-70">
                      Phone: {contactPhone}
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
                      className="mb-2 h-12 w-auto max-w-[160px] object-contain rounded"
                    />
                  )}
                  <h2
                    className="text-xl font-black uppercase tracking-wider"
                    style={{
                      color: themeColor,
                      fontSize: tplContent.hospitalTitleSize ? `${tplContent.hospitalTitleSize}px` : undefined,
                    }}
                  >
                    {hospitalName}
                  </h2>
                  {tplContent.showHospitalTagline !== false && hospitalTagline && (
                    <p className="text-xs italic opacity-75">{hospitalTagline}</p>
                  )}
                  <p className="mt-1 text-xs opacity-75">{hospitalAddress}</p>
                  {tplContent.showHospitalContactBar !== false && (
                    <>
                      <p className="text-xs opacity-75">
                        Hotline: <span className="font-semibold">{hospitalPhone}</span>
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
            <section className="my-4 rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3.5 print:bg-transparent print:border-zinc-300">
              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-[11px] font-medium opacity-65">Patient Name:</span>
                  <p className="text-sm font-bold">{prescription.patient.user.name}</p>
                </div>

                <div>
                  <span className="text-[11px] font-medium opacity-65">Gender / Age:</span>
                  <p className="text-sm font-semibold">
                    {prescription.patient.gender || "Patient"}{" "}
                    {prescription.patient.dateOfBirth
                      ? `(${new Date().getFullYear() - new Date(prescription.patient.dateOfBirth).getFullYear()} Yrs)`
                      : ""}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-medium opacity-65">Date & Serial:</span>
                  <p className="text-sm font-semibold">
                    {formattedDate} {prescription.appointment ? `• Serial #${prescription.appointment.serialNumber}` : ""}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-medium opacity-65">Prescription No:</span>
                  <p className="text-xs font-mono font-bold">{id.slice(0, 14)}...</p>
                </div>
              </div>

              {/* Vitals row if present */}
              {tplContent.showVitals !== false && (vitals.bp || vitals.weight || vitals.pulse || vitals.temp) && (
                <div className="mt-2.5 flex flex-wrap gap-4 border-t border-zinc-200/60 pt-2 text-xs print:border-zinc-300">
                  {vitals.bp && (
                    <span>
                      <strong className="opacity-75">BP:</strong> {vitals.bp}
                    </span>
                  )}
                  {vitals.weight && (
                    <span>
                      <strong className="opacity-75">Weight:</strong> {vitals.weight}
                    </span>
                  )}
                  {vitals.pulse && (
                    <span>
                      <strong className="opacity-75">Pulse:</strong> {vitals.pulse}
                    </span>
                  )}
                  {vitals.temp && (
                    <span>
                      <strong className="opacity-75">Temp:</strong> {vitals.temp}
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
                {clinicalInfo.complaints && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                      Chief Complaints
                    </h3>
                    <p className="mt-1.5 whitespace-pre-line leading-relaxed opacity-85">
                      {clinicalInfo.complaints}
                    </p>
                  </div>
                )}

                {tplContent.showDiagnosis !== false && clinicalInfo.diagnosis && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                      Diagnosis / Assessment
                    </h3>
                    <div className="mt-1.5 rounded-lg border border-teal-200 bg-teal-50/50 p-2.5 text-xs font-semibold text-teal-900 print:bg-transparent print:border-zinc-300">
                      {clinicalInfo.diagnosis}
                    </div>
                  </div>
                )}

                {tests.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                      Investigations Advised
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

                {tplContent.showClinicalNotes !== false && prescription.notes && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                      Clinical Notes
                    </h3>
                    <p className="mt-1.5 opacity-75">{prescription.notes}</p>
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
                    Prescription & Medication
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
                      Advice & Lifestyle Instructions
                    </h4>
                    <p className="mt-1.5 whitespace-pre-line leading-relaxed opacity-85">
                      {clinicalInfo.advice}
                    </p>
                  </div>
                )}

                {/* Follow-up Note */}
                {clinicalInfo.followUp && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                    <span>📅 Next Review / Follow-up:</span>
                    <span className="rounded bg-teal-50 px-2 py-0.5 text-teal-800 print:bg-transparent print:p-0">
                      {clinicalInfo.followUp}
                    </span>
                  </div>
                )}

                {/* Attached Lab Reports & Documents */}
                {prescription.attachments && prescription.attachments.length > 0 && (
                  <div className="mt-6 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 print:bg-transparent print:border-zinc-300">
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
                      📎 Attached Diagnostic Reports & Records ({prescription.attachments.length})
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {prescription.attachments.map((att) => (
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
                    Generated via PPMS Medical Care System • Document ID: {id}
                  </p>
                </div>
              )}

              {/* Doctor Signature Block */}
              {tplContent.showSignatureBlock !== false && (
                <div className="text-center sm:text-right">
                  <div className="inline-block min-w-[200px] border-b border-zinc-400 pb-1 text-center font-serif text-sm italic opacity-75">
                    {/* Physical signature area */}
                  </div>
                  <p className="mt-1.5 text-xs font-bold">{doctorName}</p>
                  <p className="text-[11px] opacity-75">{specialization}</p>
                  <p className="text-[10px] opacity-60">Doctor&apos;s Signature & Stamp</p>
                </div>
              )}
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
