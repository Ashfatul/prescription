"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Paperclip,
  Upload,
  Trash2,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { SearchableSelect, SelectOption } from "@/components/common/searchable-select";
import { PrescriptionPreviewModal } from "@/components/dashboard/prescription-preview-modal";

type DoctorInfo = {
  id: string;
  specialization: string;
  degrees?: string | null;
  designation?: string | null;
  hospital?: string | null;
  bmdcRegNo?: string | null;
  chamberAddress?: string | null;
  contactNumber?: string | null;
  signatureUrl?: string | null;
  user: {
    name: string;
    email: string;
    phone?: string | null;
    signatureUrl?: string | null;
  };
};

type PatientInfo = {
  id: string;
  user: {
    name: string;
    email: string;
    phone?: string | null;
  };
  gender?: string | null;
  dateOfBirth?: string | null;
  medicalHistory?: string | null;
};

type AppointmentInfo = {
  id: string;
  serialNumber: number;
  appointmentDate: string;
  patientId: string;
  patient: PatientInfo;
};

type TemplateOption = {
  id: string;
  name: string;
  isDefault: boolean;
  contentJson?: {
    hospitalName?: string;
    hospitalTagline?: string;
    hospitalAddress?: string;
    hospitalPhone?: string;
    hospitalEmail?: string;
    themeColor?: string;
    disclaimer?: string;
  } | null;
};

export type MedicineRow = {
  type: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

export type TestRow = {
  name: string;
  instructions: string;
};

// Fast 1-click clinical presets
const COMPLAINT_PRESETS = [
  "High fever for 3 days",
  "Dry hacking cough & sore throat",
  "Severe headache & body ache",
  "Epigastric burning & dyspepsia",
  "Shortness of breath on exertion",
  "Burning sensation during micturition",
  "Generalized weakness & fatigue",
  "Loose watery stool & vomiting",
];

const DIAGNOSIS_PRESETS = [
  "Acute Viral Pharyngitis",
  "Upper Respiratory Tract Infection (URTI)",
  "Acute Gastritis / Peptic Ulcer Disease",
  "Essential Hypertension (Stage 1)",
  "Type 2 Diabetes Mellitus",
  "Mild Bronchial Asthma",
  "Urinary Tract Infection (UTI)",
  "Acute Gastroenteritis",
];

const FREQUENCY_PRESETS = ["1 + 0 + 1", "1 + 1 + 1", "0 + 0 + 1", "1 + 0 + 0", "1 + 1 + 1 + 1", "Every 8 hours", "As needed (SOS)"];
const DURATION_PRESETS = ["3 Days", "5 Days", "7 Days", "10 Days", "14 Days", "1 Month", "Continuous"];

const ADVICE_PRESETS = [
  "Drink plenty of boiled warm water.",
  "Avoid oily, spicy, and outside street food.",
  "Avoid cold drinks, ice cream, and dust exposure.",
  "Take adequate rest and avoid physical overexertion.",
  "Walk 30 minutes daily in morning / evening.",
  "Monitor Blood Pressure & Fasting Blood Sugar regularly.",
];

const HISTORY_PRESETS = [
  "Diabetes Mellitus (DM)",
  "Hypertension (HTN)",
  "Bronchial Asthma / COPD",
  "Ischemic Heart Disease (IHD)",
  "Chronic Kidney Disease (CKD)",
  "Dyslipidemia / High Cholesterol",
  "Hypothyroidism",
  "Hyperuricemia / Gout",
  "No Known Major Illness",
];

const ALLERGY_PRESETS = [
  "No Known Drug Allergies (NKDA)",
  "Penicillin Group",
  "Cephalosporins",
  "Sulfa Drugs",
  "NSAIDs / Aspirin",
  "Ciprofloxacin / Quinolones",
  "Paracetamol",
];

const FOLLOWUP_PRESETS = [
  "After 3 days",
  "After 5 days",
  "After 7 days",
  "After 14 days",
  "After 1 month",
  "With investigation report",
  "As needed (SOS)",
];

const FORMULATION_OPTIONS: SelectOption[] = [
  { value: "Tablet", label: "Tablet", badge: "Tab" },
  { value: "Capsule", label: "Capsule", badge: "Cap" },
  { value: "Syrup", label: "Syrup", badge: "Syr" },
  { value: "Suspension", label: "Suspension", badge: "Susp" },
  { value: "Injection", label: "Injection", badge: "Inj" },
  { value: "Inhaler", label: "Inhaler", badge: "Inh" },
  { value: "Eye Drops", label: "Eye Drops", badge: "Drop" },
  { value: "Ear Drops", label: "Ear Drops", badge: "Drop" },
  { value: "Ointment", label: "Ointment", badge: "Oint" },
  { value: "Cream", label: "Cream", badge: "Crm" },
  { value: "Gel", label: "Gel", badge: "Gel" },
  { value: "Suppository", label: "Suppository", badge: "Supp" },
  { value: "Spray", label: "Spray", badge: "Spry" },
  { value: "Lotion", label: "Lotion", badge: "Lot" },
];

function appendBulletLine(existingText: string, newItem: string, bullet = "• "): string {
  const trimmed = existingText.trimEnd();
  const cleanItem = newItem.trim().replace(/^([•\-\–\—]|\-\-)\s*/, "");
  const formattedLine = `${bullet}${cleanItem}`;

  if (!trimmed) {
    return formattedLine;
  }

  const existingLines = trimmed
    .split("\n")
    .map((line) => line.trim().replace(/^([•\-\–\—]|\-\-)\s*/, ""));
  if (existingLines.includes(cleanItem)) {
    return trimmed;
  }

  return `${trimmed}\n${formattedLine}`;
}

export type PrescriptionRevisionData = {
  id: string;
  version: number;
  patientId: string;
  appointmentId?: string | null;
  templateId?: string | null;
  medicinesJson: unknown;
  testsJson: unknown;
  vitalsJson?: unknown;
  clinicalInfoJson?: unknown;
  doctorOverrideJson?: unknown;
  notes?: string | null;
  patient?: {
    id: string;
    gender?: string | null;
    dateOfBirth?: string | null;
    medicalHistory?: string | null;
    user: {
      name: string;
      email: string;
      phone?: string | null;
    };
  };
};

const REVISION_REASON_PRESETS = [
  "Updated after lab / diagnostic report",
  "Follow-up visit dose adjustment",
  "Medication change due to allergy / intolerance",
  "Added new complementary medication",
  "Titrated medicine dose based on BP / Sugar readings",
  "Patient symptoms improved / stepped down medication",
];

export function PrescriptionEditor({
  doctor,
  appointments = [],
  patients = [],
  initialPrescriptionToRevise = null,
  onCancelRevision,
  onPrescriptionCreated,
}: {
  doctor: DoctorInfo;
  appointments?: AppointmentInfo[];
  patients?: PatientInfo[];
  initialPrescriptionToRevise?: PrescriptionRevisionData | null;
  onCancelRevision?: () => void;
  onPrescriptionCreated?: (id: string) => void;
}) {
  // Revision Mode State
  const [editingPrescription, setEditingPrescription] = useState<PrescriptionRevisionData | null>(
    initialPrescriptionToRevise || null
  );
  const [changeReason, setChangeReason] = useState("");
  const [savedVersionNumber, setSavedVersionNumber] = useState<number | null>(null);

  // Base Template
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialPrescriptionToRevise?.templateId || ""
  );

  // Catalog loaded from DB
  const [catalogMedicines, setCatalogMedicines] = useState<SelectOption[]>([]);
  const [catalogTests, setCatalogTests] = useState<SelectOption[]>([]);

  // Doctor Header Override
  const initO = (initialPrescriptionToRevise?.doctorOverrideJson as Record<string, string>) || {};
  const [customizeDoctorHeader, setCustomizeDoctorHeader] = useState(
    Boolean(initO.doctorName || initO.specialization || initO.hospital)
  );
  const [docName, setDocName] = useState(initO.doctorName || doctor.user.name || "");
  const [docSpecialization, setDocSpecialization] = useState(initO.specialization || doctor.specialization || "");
  const [docDegrees, setDocDegrees] = useState(initO.degrees || doctor.degrees || "");
  const [docDesignation, setDocDesignation] = useState(initO.designation || doctor.designation || "");
  const [docHospital, setDocHospital] = useState(initO.hospital || doctor.hospital || "");
  const [docRegNo, setDocRegNo] = useState(initO.bmdcRegNo || doctor.bmdcRegNo || "");
  const [docChamber, setDocChamber] = useState(initO.chamberAddress || doctor.chamberAddress || "");
  const [docContact, setDocContact] = useState(initO.contactNumber || doctor.contactNumber || "");
  const docSignatureUrl = initO.signatureUrl || doctor.signatureUrl || doctor.user?.signatureUrl || "";

  // Patient Selection
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPrescriptionToRevise?.patientId || appointments[0]?.patientId || patients[0]?.id || ""
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(
    initialPrescriptionToRevise?.appointmentId || appointments[0]?.id || ""
  );

  // Vitals
  const initV = (initialPrescriptionToRevise?.vitalsJson as Record<string, string>) || {};
  const [bp, setBp] = useState(initV.bp || "120/80 mmHg");
  const [weight, setWeight] = useState(initV.weight || "");
  const [pulse, setPulse] = useState(initV.pulse || "72 bpm");
  const [temp, setTemp] = useState(initV.temp || "98.4 °F");
  const [bloodSugar, setBloodSugar] = useState(initV.bloodSugar || "");
  const [spo2, setSpo2] = useState(initV.spo2 || "");

  // Patient History & Comorbidities
  const initC = (initialPrescriptionToRevise?.clinicalInfoJson as Record<string, string>) || {};
  const [medicalHistory, setMedicalHistory] = useState(initC.medicalHistory || "");
  const [allergies, setAllergies] = useState(initC.allergies || "");

  // Clinical Details
  const [complaints, setComplaints] = useState(initC.complaints || "");
  const [diagnosis, setDiagnosis] = useState(initC.diagnosis || "");

  // Diagnostic Tests
  const [tests, setTests] = useState<TestRow[]>(() => {
    if (initialPrescriptionToRevise && Array.isArray(initialPrescriptionToRevise.testsJson)) {
      return initialPrescriptionToRevise.testsJson as TestRow[];
    }
    return [{ name: "CBC with ESR (Complete Blood Count)", instructions: "Clean blood sample" }];
  });

  // Medicines (Rx)
  const [medicines, setMedicines] = useState<MedicineRow[]>(() => {
    if (
      initialPrescriptionToRevise &&
      Array.isArray(initialPrescriptionToRevise.medicinesJson) &&
      initialPrescriptionToRevise.medicinesJson.length > 0
    ) {
      return initialPrescriptionToRevise.medicinesJson as MedicineRow[];
    }
    return [
      {
        type: "Tablet",
        name: "Napa Extra",
        dosage: "500mg + 65mg",
        frequency: "1 + 0 + 1",
        duration: "5 Days",
        instructions: "1 tablet after meal, 2-3 times daily as needed",
      },
    ];
  });

  // Advice & Follow-Up
  const [advice, setAdvice] = useState(
    initC.advice || "Drink plenty of boiled warm water. Take adequate bed rest. Avoid oily & spicy foods."
  );
  const [followUp, setFollowUp] = useState(initC.followUp || "After 7 days with investigation reports");
  const [notes, setNotes] = useState(initialPrescriptionToRevise?.notes || "");

  // Attachments
  const [attachments, setAttachments] = useState<
    { id: string; name: string; url: string; fileType: string }[]
  >([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAttachment(true);
    setAttachmentError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to upload attachment");
      }

      setAttachments((prev) => [
        ...prev,
        {
          id: data.data.id,
          name: data.data.originalName || file.name,
          url: data.data.url,
          fileType: data.data.fileType,
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload file";
      setAttachmentError(msg);
    } finally {
      setUploadingAttachment(false);
      e.target.value = "";
    }
  };

  // State
  const [submitting, setSubmitting] = useState(false);
  const [createdPrescriptionId, setCreatedPrescriptionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch templates and catalog on mount
  useEffect(() => {
    let active = true;

    async function initData() {
      try {
        const [tplRes, medRes, testRes] = await Promise.all([
          fetch("/api/templates"),
          fetch("/api/medicines"),
          fetch("/api/tests"),
        ]);
        const [tplData, medData, testData] = await Promise.all([
          tplRes.json(),
          medRes.json(),
          testRes.json(),
        ]);

        if (!active) return;

        if (tplData.success && Array.isArray(tplData.data)) {
          setTemplates(tplData.data);
          const def = tplData.data.find((t: TemplateOption) => t.isDefault) || tplData.data[0];
          if (def) setSelectedTemplateId(def.id);
        }

        if (medData.success && Array.isArray(medData.data)) {
          const medOptions: SelectOption[] = medData.data.map(
            (m: { name: string; dosage: string; type: string; instructions?: string | null }) => ({
              value: m.name,
              label: `${m.name} (${m.dosage})`,
              badge: m.type,
              description: m.instructions || undefined,
              payload: m,
            })
          );
          setCatalogMedicines(medOptions);
        }

        if (testData.success && Array.isArray(testData.data)) {
          const testOptions: SelectOption[] = testData.data.map(
            (t: { name: string; instructions?: string | null }) => ({
              value: t.name,
              label: t.name,
              description: t.instructions || undefined,
              payload: t,
            })
          );
          setCatalogTests(testOptions);
        }
      } catch (err) {
        console.error("Failed to load prescription editor dependencies", err);
      }
    }

    void initData();
    return () => {
      active = false;
    };
  }, []);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    const appt = appointments.find((a) => a.patientId === patientId);
    setSelectedAppointmentId(appt?.id || "");

    const pat = appt?.patient || patients.find((p) => p.id === patientId);
    if (pat?.medicalHistory && !medicalHistory.trim()) {
      setMedicalHistory(pat.medicalHistory);
    }
  };

  const addMedicine = (preset?: Partial<MedicineRow>) => {
    setMedicines((prev) => [
      ...prev,
      {
        type: preset?.type || "Tablet",
        name: preset?.name || "",
        dosage: preset?.dosage || "",
        frequency: preset?.frequency || "1 + 0 + 1",
        duration: preset?.duration || "7 Days",
        instructions: preset?.instructions || "After meals",
      },
    ]);
  };

  const updateMedicine = (index: number, field: keyof MedicineRow, value: string) => {
    setMedicines((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSelectMedicineFromCatalog = (index: number, option?: SelectOption) => {
    if (!option) return;
    const item = option.payload as
      | { name?: string; type?: string; dosage?: string; instructions?: string | null }
      | undefined;
    if (item && item.name) {
      setMedicines((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          name: item.name || copy[index].name,
          type: item.type || copy[index].type,
          dosage: item.dosage || copy[index].dosage,
          instructions: item.instructions || copy[index].instructions,
        };
        return copy;
      });
    } else {
      updateMedicine(index, "name", option.value);
    }
  };

  const removeMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const addTest = (name = "", instructions = "") => {
    setTests((prev) => [...prev, { name, instructions }]);
  };

  const handleSelectTestFromCatalog = (index: number, option?: SelectOption) => {
    if (!option) return;
    const item = option.payload as
      | { name?: string; instructions?: string | null }
      | undefined;
    if (item && item.name) {
      setTests((prev) => {
        const copy = [...prev];
        copy[index] = {
          name: item.name || copy[index].name,
          instructions: item.instructions || copy[index].instructions || "",
        };
        return copy;
      });
    } else {
      setTests((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], name: option.value };
        return copy;
      });
    }
  };

  const updateTest = (index: number, field: keyof TestRow, value: string) => {
    setTests((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeTest = (index: number) => {
    setTests((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper to append preset to text areas on separate lines with bullet markers
  const appendComplaint = (phrase: string) => {
    setComplaints((prev) => appendBulletLine(prev, phrase));
  };

  const setDiagnosisPreset = (dx: string) => {
    setDiagnosis((prev) => appendBulletLine(prev, dx));
  };

  const appendAdvice = (adv: string) => {
    setAdvice((prev) => appendBulletLine(prev, adv));
  };

  const appendHistory = (item: string) => {
    setMedicalHistory((prev) => appendBulletLine(prev, item));
  };

  const appendAllergy = (item: string) => {
    setAllergies((prev) => appendBulletLine(prev, item));
  };

  // Patient options for SearchableSelect
  const patientOptions: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [];
    appointments.forEach((appt) => {
      list.push({
        value: appt.patientId,
        label: `${appt.patient.user.name} (Serial #${appt.serialNumber})`,
        description: `${appt.patient.user.email}${appt.patient.user.phone ? ` • Tel: ${appt.patient.user.phone}` : ""}`,
        badge: `Today #${appt.serialNumber}`,
      });
    });
    patients
      .filter((p) => !appointments.some((a) => a.patientId === p.id))
      .forEach((p) => {
        list.push({
          value: p.id,
          label: p.user.name,
          description: `${p.user.email}${p.user.phone ? ` • Tel: ${p.user.phone}` : ""}`,
          badge: "Patient Record",
        });
      });
    return list;
  }, [appointments, patients]);

  // Template options for SearchableSelect
  const templateOptions: SelectOption[] = useMemo(
    () =>
      templates.map((tpl) => ({
        value: tpl.id,
        label: `${tpl.name}${tpl.isDefault ? " (Default)" : ""}`,
        badge: tpl.isDefault ? "Default" : undefined,
        description: tpl.contentJson?.hospitalName
          ? `Hospital: ${tpl.contentJson.hospitalName}`
          : undefined,
      })),
    [templates]
  );

  const currentPatient =
    appointments.find((a) => a.patientId === selectedPatientId)?.patient ||
    patients.find((p) => p.id === selectedPatientId);

  const patientAge = useMemo(() => {
    if (!currentPatient) return undefined;
    if (currentPatient.dateOfBirth) {
      const birth = new Date(currentPatient.dateOfBirth);
      const diffYears = Math.floor(
        (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      if (diffYears > 0 && diffYears < 130) return diffYears;
    }
    if (currentPatient.medicalHistory) {
      const match = currentPatient.medicalHistory.match(/Age:\s*(\d+)/i);
      if (match) return match[1];
    }
    return undefined;
  }, [currentPatient]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    if (!selectedPatientId) {
      setErrorMessage("Please select a patient.");
      setSubmitting(false);
      return;
    }

    if (medicines.length === 0 || !medicines[0].name.trim()) {
      setErrorMessage("Please add at least one medicine.");
      setSubmitting(false);
      return;
    }

    const payload = {
      doctorId: doctor.id,
      patientId: selectedPatientId,
      appointmentId: selectedAppointmentId || undefined,
      templateId: selectedTemplateId || undefined,
      medicines: medicines.filter((m) => m.name.trim()),
      tests: tests.filter((t) => t.name.trim()),
      vitals: {
        bp: bp.trim() || undefined,
        weight: weight.trim() || undefined,
        pulse: pulse.trim() || undefined,
        temp: temp.trim() || undefined,
        bloodSugar: bloodSugar.trim() || undefined,
        spo2: spo2.trim() || undefined,
      },
      clinicalInfo: {
        complaints: complaints.trim() || undefined,
        diagnosis: diagnosis.trim() || undefined,
        advice: advice.trim() || undefined,
        followUp: followUp.trim() || undefined,
        medicalHistory: medicalHistory.trim() || undefined,
        allergies: allergies.trim() || undefined,
      },
      doctorOverride: {
        doctorName: docName,
        specialization: docSpecialization,
        degrees: docDegrees,
        designation: docDesignation,
        hospital: docHospital,
        bmdcRegNo: docRegNo,
        chamberAddress: docChamber,
        contactNumber: docContact,
        signatureUrl: docSignatureUrl || doctor.signatureUrl || doctor.user?.signatureUrl || undefined,
      },
      notes,
      attachmentIds: attachments.map((a) => a.id),
    };

    try {
      const isRevision = Boolean(editingPrescription);
      const url = isRevision ? `/api/prescriptions/${editingPrescription!.id}` : "/api/prescriptions";
      const method = isRevision ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          changeReason: changeReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to save prescription.");
        return;
      }

      setCreatedPrescriptionId(data.data.id);
      const nextVer = data.data.version || (editingPrescription ? (editingPrescription.version || 1) + 1 : 1);
      setSavedVersionNumber(nextVer);
      onPrescriptionCreated?.(data.data.id);
    } catch {
      setSubmitting(false);
      setErrorMessage("Network error while saving prescription.");
    }
  };

  const resetForm = () => {
    setCreatedPrescriptionId(null);
    setSavedVersionNumber(null);
    setEditingPrescription(null);
    setChangeReason("");
    onCancelRevision?.();
    setMedicines([
      {
        type: "Tablet",
        name: "Napa Extra",
        dosage: "500mg + 65mg",
        frequency: "1 + 0 + 1",
        duration: "5 Days",
        instructions: "1 tablet after meal, 2-3 times daily as needed",
      },
    ]);
    setTests([{ name: "CBC with ESR (Complete Blood Count)", instructions: "Clean blood sample" }]);
    setComplaints("");
    setDiagnosis("");
    setMedicalHistory("");
    setAllergies("");
    setBloodSugar("");
    setSpo2("");
    setAdvice("");
    setFollowUp("");
    setNotes("");
    setAttachments([]);
  };

  const handleCancelRevision = () => {
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Prescription Generator</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)]">
              {editingPrescription ? `Revising v${editingPrescription.version || 1}` : "Fast Prescribing"}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {editingPrescription
              ? `Creating Version ${(editingPrescription.version || 1) + 1} • All previous versions are permanently preserved in history.`
              : "Auto-fill medicines from catalog, 1-click clinical presets, and multi-page preview."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {templates.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
                Template:
              </label>
              <div className="w-48 sm:w-60">
                <SearchableSelect
                  options={templateOptions}
                  value={selectedTemplateId}
                  placeholder="Select template..."
                  searchPlaceholder="Search layout templates..."
                  onChange={(val) => setSelectedTemplateId(val)}
                />
              </div>
            </div>
          )}

          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Revision Mode Banner with Reason presets */}
      {editingPrescription && (
        <div className="rounded-3xl border-2 border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-700/60 p-6 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white font-black text-lg shadow-sm">
                v{(editingPrescription.version || 1) + 1}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Modifying Existing Prescription
                  </span>
                  <span className="rounded-full bg-amber-200/90 dark:bg-amber-900/60 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/60">
                    Current Active: v{editingPrescription.version || 1} ➔ Next: v{(editingPrescription.version || 1) + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                  Patient: <strong className="text-slate-900 dark:text-white">{currentPatient?.user.name}</strong> • Rx ID: <code className="font-mono text-xs">{editingPrescription.id}</code>
                </p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-400/90 mt-0.5">
                  Preserving History: All earlier versions remain archived and directly inspectable & printable by both you and the patient.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelRevision}
              className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs"
            >
              ✕ Cancel Revision / New Rx
            </button>
          </div>

          <div className="pt-3 border-t border-amber-200/70 dark:border-amber-900/40 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Revision Reason / Clinical Note for Version {(editingPrescription.version || 1) + 1}:
            </label>
            <input
              type="text"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g. Updated after CBC report returned; adjusted antibiotic dosage..."
              className="w-full rounded-xl border border-amber-300/80 dark:border-amber-800/80 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">1-Click Reasons:</span>
              {REVISION_REASON_PRESETS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setChangeReason(reason)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-100/90 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/50 transition font-medium border border-amber-300/60 dark:border-amber-800/50 cursor-pointer"
                >
                  + {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {createdPrescriptionId && (
        <div className="p-6 rounded-3xl border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-700 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                ✓ {savedVersionNumber && savedVersionNumber > 1 ? `Version ${savedVersionNumber} Saved (History Preserved)` : "Prescription Generated Successfully"}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                {savedVersionNumber && savedVersionNumber > 1
                  ? `Prescription Updated to Version ${savedVersionNumber}`
                  : "Ready for Printing & Patient Sharing"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Prescription ID: <code className="font-mono font-semibold">{createdPrescriptionId}</code>
                {savedVersionNumber && ` • Active Version: v${savedVersionNumber}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/prescriptions/${createdPrescriptionId}/print${savedVersionNumber ? `?version=${savedVersionNumber}` : ""}`}
                target="_blank"
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-semibold shadow-sm hover:opacity-90 transition-all"
              >
                <span>🖨️ View & Print Full A4 (v{savedVersionNumber || 1})</span>
              </Link>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
              >
                + Write Another Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-xs font-medium text-red-600 border border-red-200 dark:border-red-800">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Doctor & Hospital Header (Profile Pre-filled) */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                1. Doctor & Hospital Header
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                {docHospital ? `${docHospital} • ` : ""}
                {docName} ({docDegrees || docSpecialization})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCustomizeDoctorHeader(!customizeDoctorHeader)}
              className="text-xs font-semibold text-[var(--brand-text)] hover:underline"
            >
              {customizeDoctorHeader ? "Hide Header Editor" : "✎ Modify Header for this Prescription"}
            </button>
          </div>

          {customizeDoctorHeader && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Degrees & Post-Graduation</label>
                <input
                  type="text"
                  value={docDegrees}
                  onChange={(e) => setDocDegrees(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Specialization</label>
                <input
                  type="text"
                  value={docSpecialization}
                  onChange={(e) => setDocSpecialization(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Hospital / Medical Center</label>
                <input
                  type="text"
                  value={docHospital}
                  onChange={(e) => setDocHospital(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Designation / Rank</label>
                <input
                  type="text"
                  value={docDesignation}
                  onChange={(e) => setDocDesignation(e.target.value)}
                  placeholder="e.g. Senior Consultant"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">BMDC Registration No.</label>
                <input
                  type="text"
                  value={docRegNo}
                  onChange={(e) => setDocRegNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Chamber / Address</label>
                <input
                  type="text"
                  value={docChamber}
                  onChange={(e) => setDocChamber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={docContact}
                  onChange={(e) => setDocContact(e.target.value)}
                  placeholder="e.g. +880 1711-234567"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Patient Selection & Vital Signs */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
            2. Patient Information & Vitals
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Select Patient *
              </label>
              {editingPrescription ? (
                <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentPatient?.user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentPatient?.user.email} {currentPatient?.user.phone ? `• Tel: ${currentPatient.user.phone}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-[10px] font-bold">
                    🔒 Locked for Revision
                  </span>
                </div>
              ) : (
                <SearchableSelect
                  options={patientOptions}
                  value={selectedPatientId}
                  onChange={(val) => handlePatientSelect(val)}
                  placeholder="Search patient by name, serial #, phone..."
                  searchPlaceholder="Search patients in queue or archive..."
                />
              )}
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  BP (mmHg)
                </label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  placeholder="120/80"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Pulse (bpm)
                </label>
                <input
                  type="text"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  placeholder="72 bpm"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Temp (°F)
                </label>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  placeholder="98.6 °F"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="65 kg"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  RBS / Sugar
                </label>
                <input
                  type="text"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                  placeholder="7.2 mmol/L"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  SpO2 (%)
                </label>
                <input
                  type="text"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  placeholder="98%"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Patient Chronic History & Drug Allergies Area */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Medical History & Chronic Comorbidities */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Medical History & Comorbidities (Diabetes, HTN, etc.)
                </label>
                <span className="text-[10px] font-mono text-slate-400">Hx</span>
              </div>
              <textarea
                rows={3}
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="Click quick presets below or type patient chronic conditions (each on a separate line)..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)] leading-relaxed"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 self-center">
                  Quick chips:
                </span>
                {HISTORY_PRESETS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => appendHistory(chip)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition-all cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Drug Allergies & Safety Precautions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400">
                  Drug Allergies & Safety Alerts
                </label>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                  Safety Critical
                </span>
              </div>
              <textarea
                rows={3}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Click quick presets below or type drug allergies (e.g. Penicillin, Sulfa drugs)..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 leading-relaxed"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 self-center">
                  Quick chips:
                </span>
                {ALLERGY_PRESETS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => appendAllergy(chip)}
                    className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-[11px] text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 hover:bg-rose-100 hover:text-rose-900 transition-all cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Clinical Complaints & Diagnosis (With 1-Click Fast Presets) */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
            3. Chief Complaints & Diagnosis (1-Click Fast Presets)
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Complaints */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Chief Complaints / Symptoms
              </label>
              <textarea
                rows={4}
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
                placeholder="Click quick presets below or type patient symptoms (each on a separate line)..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)] leading-relaxed"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 self-center">
                  Quick chips:
                </span>
                {COMPLAINT_PRESETS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => appendComplaint(chip)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition-all cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Clinical Diagnosis (Dx)
              </label>
              <textarea
                rows={4}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Click quick presets below or type clinical conditions (each on a separate line)..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)] leading-relaxed"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 self-center">
                  Quick chips:
                </span>
                {DIAGNOSIS_PRESETS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setDiagnosisPreset(chip)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition-all cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Investigations & Diagnostic Tests (Searchable Catalog) */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
              4. Diagnostic Investigations Advised
            </span>
            <button
              type="button"
              onClick={() => addTest()}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              + Add Investigation
            </button>
          </div>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 items-center"
              >
                <div className="sm:col-span-1 text-center font-bold text-xs text-slate-400">
                  #{index + 1}
                </div>
                <div className="sm:col-span-6">
                  <SearchableSelect
                    options={catalogTests}
                    value={test.name}
                    placeholder="Search diagnostic test catalog or type new..."
                    allowCustom
                    onChange={(val, opt) => handleSelectTestFromCatalog(index, opt || { value: val, label: val })}
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={test.instructions}
                    onChange={(e) => updateTest(index, "instructions", e.target.value)}
                    placeholder="Instructions (e.g. 10-12h fasting)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-surface)] text-xs focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeTest(index)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Prescribed Medications (℞ Rx Section) */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--brand-primary)]/40 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif font-black text-[var(--brand-primary)]">
                ℞
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                  5. Prescribed Medications (Rx)
                </span>
                <p className="text-[11px] text-slate-500">
                  Select drugs from catalog to auto-fill dosage, formulation, and instructions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => addMedicine()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold hover:opacity-90 shadow-xs transition-all self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Medicine</span>
            </button>
          </div>

          {/* Medicines Rows */}
          <div className="space-y-4">
            {medicines.map((med, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200/90 dark:border-slate-800/90 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Pharmaceutical Entry
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedicine(index)}
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                {/* Primary Drug Search and Type/Dosage */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                      Formulation
                    </label>
                    <SearchableSelect
                      options={FORMULATION_OPTIONS}
                      value={med.type}
                      placeholder="Select formulation..."
                      searchPlaceholder="Search formulation..."
                      allowCustom
                      onChange={(val) => updateMedicine(index, "type", val)}
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                      Medicine / Brand Search (Auto-Fill) *
                    </label>
                    <SearchableSelect
                      options={catalogMedicines}
                      value={med.name}
                      placeholder="Type brand or generic (e.g. Maxpro, Napa)..."
                      allowCustom
                      onChange={(val, opt) => handleSelectMedicineFromCatalog(index, opt || { value: val, label: val })}
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                      Strength / Dosage
                    </label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                      placeholder="e.g. 20mg, 500mg"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Frequency, Duration, & Instructions with Chip Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                  <div className="sm:col-span-4 space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                      Dose Frequency
                    </label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                      placeholder="1 + 0 + 1"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-xs font-semibold focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1">
                      {FREQUENCY_PRESETS.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => updateMedicine(index, "frequency", f)}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200/80 dark:bg-slate-700/80 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)]"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                      placeholder="7 Days"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-xs font-semibold focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1">
                      {DURATION_PRESETS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => updateMedicine(index, "duration", d)}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200/80 dark:bg-slate-700/80 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)]"
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-5 space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                      Intake Instructions
                    </label>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
                      placeholder="e.g. 30 mins before breakfast & dinner"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-xs focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1">
                      {["Before meal", "After meal", "With meal", "At bedtime"].map((inst) => (
                        <button
                          key={inst}
                          type="button"
                          onClick={() => updateMedicine(index, "instructions", inst)}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200/80 dark:bg-slate-700/80 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)]"
                        >
                          {inst}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Advice & Follow-Up */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
            6. Lifestyle Advice & Follow-Up (With 1-Click Chips)
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Special Advice / Dietary Precautions
              </label>
              <textarea
                rows={4}
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="Click quick presets below or type dietary instructions, physical activity, restrictions..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)] leading-relaxed"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 self-center">
                  Quick chips:
                </span>
                {ADVICE_PRESETS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => appendAdvice(chip)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition-all cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-Up / Next Visit
                </label>
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="e.g. After 7 days with investigation reports"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 self-center">
                    Quick chips:
                  </span>
                  {FOLLOWUP_PRESETS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setFollowUp(chip)}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition-all cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Private Physician Notes (Internal Only)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional internal medical record notes..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 7: Diagnostic Lab Reports & Document Attachments */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)] flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              <span>7. Diagnostic Lab Reports & Medical Attachments</span>
            </span>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition shadow-xs">
              <Upload className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>{uploadingAttachment ? "Uploading..." : "Upload Document / Scan"}</span>
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleUploadAttachment}
                disabled={uploadingAttachment}
                className="hidden"
              />
            </label>
          </div>

          {attachmentError && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{attachmentError}</span>
            </div>
          )}

          {attachments.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              No diagnostic files attached. You can attach patient lab reports, X-Rays, or clinical summaries (PDF, Images up to 5MB).
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attachments.map((att, idx) => (
                <div
                  key={att.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {att.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-lg text-slate-400 hover:text-[var(--brand-primary)] cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1 rounded-lg text-red-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-xs"
          >
            👁️ Open Live Preview
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-7 py-3 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {submitting ? (
              <span>Saving Prescription...</span>
            ) : editingPrescription ? (
              <span>💾 Save as Version {(editingPrescription.version || 1) + 1} (Preserve History)</span>
            ) : (
              <span>✓ Save & Generate Prescription</span>
            )}
          </button>
        </div>
      </form>

      {/* Live Multi-Page Prescription Modal */}
      <PrescriptionPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        prescriptionId={editingPrescription?.id || createdPrescriptionId || undefined}
        version={editingPrescription ? (editingPrescription.version || 1) + 1 : savedVersionNumber || 1}
        changeReason={changeReason || undefined}
        doctor={{
          name: docName,
          specialization: docSpecialization,
          degrees: docDegrees,
          designation: docDesignation,
          hospital: docHospital,
          bmdcRegNo: docRegNo,
          chamberAddress: docChamber,
          contactNumber: docContact,
          signatureUrl: docSignatureUrl || doctor.signatureUrl || doctor.user?.signatureUrl || undefined,
        }}
        patient={{
          name: currentPatient?.user.name || "Patient",
          gender: currentPatient?.gender || "Not specified",
          phone: currentPatient?.user.phone || undefined,
          age: patientAge,
        }}
        hospitalInfo={{
          name: selectedTemplate?.contentJson?.hospitalName || docHospital || "Metropolitan Specialized Hospital",
          tagline: selectedTemplate?.contentJson?.hospitalTagline || "Center of Medical Excellence & Compassionate Care",
          address: selectedTemplate?.contentJson?.hospitalAddress || docChamber || "Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230",
          phone: selectedTemplate?.contentJson?.hospitalPhone || docContact || "+880 2-8901234",
          email: selectedTemplate?.contentJson?.hospitalEmail || "info@metropolitanhospital.com",
          disclaimer: selectedTemplate?.contentJson?.disclaimer,
          themeColor: selectedTemplate?.contentJson?.themeColor || "#0f766e",
        }}
        vitals={{ bp, weight, pulse, temp, bloodSugar, spo2 }}
        clinicalInfo={{
          complaints,
          diagnosis,
          advice,
          followUp,
          medicalHistory,
          allergies,
        }}
        medicines={medicines}
        tests={tests}
      />
    </div>
  );
}
