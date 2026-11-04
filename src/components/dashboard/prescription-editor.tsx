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
  ArrowLeft,
  CheckCircle2,
  Copy,
  Plus,
  X,
  Stethoscope,
  Activity,
  ShieldAlert,
  Phone,
  Mail,
  FileSearch,
} from "lucide-react";
import { SearchableSelect, SelectOption } from "@/components/common/searchable-select";
import { PrescriptionPreviewModal } from "@/components/dashboard/prescription-preview-modal";
import { useLanguage } from "@/lib/i18n/language-context";

export type DoctorInfo = {
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

export type TestReportInfo = {
  id: string;
  title: string;
  description?: string | null;
  reportDate?: string | null;
  fileUrl: string;
  fileType: string;
  originalName: string;
  status?: string | null;
  notes?: string | null;
  createdAt: string;
};

export type PatientInfo = {
  id: string;
  user: {
    name: string;
    email: string;
    phone?: string | null;
  };
  gender?: string | null;
  dateOfBirth?: string | null;
  medicalHistory?: string | null;
  testReports?: TestReportInfo[];
};

export type AppointmentInfo = {
  id: string;
  serialNumber: number;
  appointmentDate: string;
  patientId: string;
  status: string;
  notes?: string | null;
  visitType?: string | null;
  fee?: number | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  diseasesJson?: unknown;
  allergiesJson?: unknown;
  medicalFlagsJson?: unknown;
  dietRequired?: boolean | null;
  dietInstructionsJson?: unknown;
  dietNotes?: string | null;
  patient: PatientInfo;
};

export type TemplateOption = {
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

// Categorized high-readability 1-click presets
const COMPLAINT_GROUPS = [
  {
    category: "General / Fever",
    items: [
      "High fever for 3 days",
      "Severe headache & body ache",
      "Generalized weakness & fatigue",
      "Night chills & malaise",
    ],
  },
  {
    category: "Respiratory",
    items: [
      "Dry hacking cough & sore throat",
      "Productive cough with sputum",
      "Shortness of breath on exertion",
      "Runny nose & nasal congestion",
    ],
  },
  {
    category: "Gastrointestinal",
    items: [
      "Epigastric burning & dyspepsia",
      "Loose watery stool & vomiting",
      "Abdominal cramping & nausea",
      "Bloating & hyperacidity",
    ],
  },
  {
    category: "Urinary & Other",
    items: [
      "Burning sensation during micturition",
      "Frequent daytime urination",
      "High random blood sugar on check",
    ],
  },
];

const DIAGNOSIS_GROUPS = [
  {
    category: "Infections",
    items: [
      "Acute Viral Pharyngitis",
      "Upper Respiratory Tract Infection (URTI)",
      "Acute Gastroenteritis",
      "Urinary Tract Infection (UTI)",
      "Enteric Fever (Typhoid)",
    ],
  },
  {
    category: "Cardio-Metabolic",
    items: [
      "Essential Hypertension (Stage 1)",
      "Type 2 Diabetes Mellitus",
      "Dyslipidemia / High Cholesterol",
      "Hyperuricemia / Gout",
    ],
  },
  {
    category: "Respiratory & GI",
    items: [
      "Mild Bronchial Asthma",
      "Acute Gastritis / Peptic Ulcer Disease",
      "GERD (Acid Reflux)",
      "Irritable Bowel Syndrome (IBS)",
    ],
  },
];

const FREQUENCY_PRESETS = [
  "1 + 0 + 1",
  "1 + 1 + 1",
  "0 + 0 + 1",
  "1 + 0 + 0",
  "1 + 1 + 1 + 1",
  "Every 8 hours",
  "As needed (SOS)",
];

const TIMING_PRESETS = [
  "30 mins before meal",
  "After meal",
  "With meal",
  "At bedtime",
  "Empty stomach",
];

const DURATION_PRESETS = [
  "3 Days",
  "5 Days",
  "7 Days",
  "10 Days",
  "14 Days",
  "1 Month",
  "Continuous",
];

const ADVICE_GROUPS = [
  {
    category: "Fluids & Rest",
    items: [
      "Drink plenty of boiled warm water.",
      "Take adequate bed rest and avoid physical overexertion.",
    ],
  },
  {
    category: "Dietary Guidance",
    items: [
      "Avoid oily, spicy, and outside street food.",
      "Avoid cold drinks, ice cream, and dust exposure.",
      "Eat high-fiber vegetables and fresh fruits.",
      "Reduce daily salt and refined sugar intake.",
    ],
  },
  {
    category: "Monitoring & Lifestyle",
    items: [
      "Walk 30 minutes daily in morning / evening.",
      "Monitor Blood Pressure & Fasting Blood Sugar regularly.",
      "Return immediately if symptoms worsen or fever persists.",
    ],
  },
];

const COMMON_TEST_CHIPS = [
  { name: "CBC with ESR (Complete Blood Count)", instructions: "Clean blood sample" },
  { name: "Fasting Blood Sugar (FBS)", instructions: "10-12 hours overnight fasting" },
  { name: "HbA1c (Glycated Hemoglobin)", instructions: "Any time, non-fasting" },
  { name: "Serum Creatinine", instructions: "Clean blood sample" },
  { name: "Lipid Profile", instructions: "12 hours strict overnight fasting" },
  { name: "Urine Routine & Microscopic (R/M/E)", instructions: "Midstream early morning sample" },
  { name: "SGPT / ALT (Liver Function)", instructions: "Clean blood sample" },
  { name: "Chest X-Ray P/A View", instructions: "Standard upright view" },
  { name: "ECG (12 Lead)", instructions: "At complete resting state" },
  { name: "USG of Whole Abdomen", instructions: "Empty stomach with full bladder" },
];

const HISTORY_PRESETS = [
  "Diabetes Mellitus (DM)",
  "Hypertension (HTN)",
  "Bronchial Asthma / COPD",
  "Ischemic Heart Disease (IHD)",
  "Chronic Kidney Disease (CKD)",
  "Dyslipidemia / High Cholesterol",
  "Hypothyroidism",
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
  "With investigation reports",
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

// Helper to format text lines using standard "- " bullet (Requirement 6)
function appendBulletLine(existingText: string, newItem: string, bullet = "- "): string {
  const trimmed = existingText.trimEnd();
  const cleanItem = newItem.trim().replace(/^([•\-\–\—*]|\-\-)\s*/, "");
  const formattedLine = `${bullet}${cleanItem}`;

  if (!trimmed) {
    return formattedLine;
  }

  const existingLines = trimmed
    .split("\n")
    .map((line) => line.trim().replace(/^([•\-\–\—*]|\-\-)\s*/, ""));
  if (existingLines.includes(cleanItem)) {
    return trimmed;
  }

  return `${trimmed}\n${formattedLine}`;
}

function parseTriage(notes?: string | null) {
  if (!notes) return { complaint: "", bp: "", pulse: "", temp: "", weight: "" };
  let complaint = "";
  let bp = "";
  let pulse = "";
  let temp = "";
  let weight = "";

  const complaintMatch = notes.match(/Complaint:\s*([^|]+)/i);
  if (complaintMatch) complaint = complaintMatch[1].trim();

  const bpMatch = notes.match(/BP:\s*([^,|]+)/i);
  if (bpMatch && bpMatch[1] !== "N/A") bp = bpMatch[1].trim();

  const pulseMatch = notes.match(/Pulse:\s*([^,|]+)/i);
  if (pulseMatch && pulseMatch[1] !== "N/A") pulse = pulseMatch[1].trim();

  const tempMatch = notes.match(/Temp:\s*([^,|]+)/i);
  if (tempMatch && tempMatch[1] !== "N/A") temp = tempMatch[1].trim();

  const wtMatch = notes.match(/Wt:\s*([^,|]+)/i);
  if (wtMatch && wtMatch[1] !== "N/A") weight = wtMatch[1].trim();

  return { complaint, bp, pulse, temp, weight };
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
  patient?: PatientInfo;
};

export function PrescriptionEditor({
  doctor,
  appointments = [],
  patients = [],
  selectedAppointmentId: initialAppointmentId = null,
  initialPrescriptionToRevise = null,
  onCancelRevision,
  onBackToQueue,
  onPrescriptionCreated,
  onCallNextPatient,
}: {
  doctor: DoctorInfo;
  appointments?: AppointmentInfo[];
  patients?: PatientInfo[];
  selectedAppointmentId?: string | null;
  initialPrescriptionToRevise?: PrescriptionRevisionData | null;
  onCancelRevision?: () => void;
  onBackToQueue?: () => void;
  onPrescriptionCreated?: (id: string, appointmentId?: string) => void;
  onCallNextPatient?: () => void;
}) {
  const { t, language } = useLanguage();

  // Active Consultation Target
  const currentAppointment = useMemo(() => {
    if (initialPrescriptionToRevise?.appointmentId) {
      return appointments.find((a) => a.id === initialPrescriptionToRevise.appointmentId) || null;
    }
    if (initialAppointmentId) {
      return appointments.find((a) => a.id === initialAppointmentId) || null;
    }
    return appointments[0] || null;
  }, [appointments, initialAppointmentId, initialPrescriptionToRevise]);

  const currentPatient = useMemo(() => {
    if (currentAppointment?.patient) return currentAppointment.patient;
    if (initialPrescriptionToRevise?.patient) return initialPrescriptionToRevise.patient;
    const targetId = initialPrescriptionToRevise?.patientId || currentAppointment?.patientId;
    return patients.find((p) => p.id === targetId) || patients[0] || null;
  }, [currentAppointment, initialPrescriptionToRevise, patients]);

  const triage = useMemo(() => parseTriage(currentAppointment?.notes), [currentAppointment]);

  // Revision State
  const [editingPrescription, setEditingPrescription] = useState<PrescriptionRevisionData | null>(
    initialPrescriptionToRevise || null
  );
  const [changeReason, setChangeReason] = useState("");
  const [savedVersionNumber, setSavedVersionNumber] = useState<number | null>(null);

  // Template State
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialPrescriptionToRevise?.templateId || ""
  );

  // Catalogs
  const [catalogMedicines, setCatalogMedicines] = useState<SelectOption[]>([]);
  const [catalogTests, setCatalogTests] = useState<SelectOption[]>([]);

  // Doctor Header Details (defaults to profile)
  const initO = (initialPrescriptionToRevise?.doctorOverrideJson as Record<string, string>) || {};
  const [customizeDoctorHeader, setCustomizeDoctorHeader] = useState(false);
  const [docName, setDocName] = useState(initO.doctorName || doctor.user.name || "");
  const [docSpecialization, setDocSpecialization] = useState(initO.specialization || doctor.specialization || "");
  const [docDegrees, setDocDegrees] = useState(initO.degrees || doctor.degrees || "");
  const [docDesignation, setDocDesignation] = useState(initO.designation || doctor.designation || "");
  const [docHospital, setDocHospital] = useState(initO.hospital || doctor.hospital || "");
  const [docRegNo, setDocRegNo] = useState(initO.bmdcRegNo || doctor.bmdcRegNo || "");
  const [docChamber, setDocChamber] = useState(initO.chamberAddress || doctor.chamberAddress || "");
  const [docContact, setDocContact] = useState(initO.contactNumber || doctor.contactNumber || "");
  const docSignatureUrl = initO.signatureUrl || doctor.signatureUrl || doctor.user?.signatureUrl || "";

  // Triage Vitals (Staff prepared, Doctor can refine)
  const initV = (initialPrescriptionToRevise?.vitalsJson as Record<string, string>) || {};
  const [bp, setBp] = useState(initV.bp || triage.bp || "");
  const [pulse, setPulse] = useState(initV.pulse || triage.pulse || "");
  const [temp, setTemp] = useState(initV.temp || triage.temp || "");
  const [weight, setWeight] = useState(initV.weight || triage.weight || "");
  const [bloodSugar, setBloodSugar] = useState(initV.bloodSugar || "");
  const [spo2, setSpo2] = useState(initV.spo2 || "");

  // Clinical History & Allergies (Staff triage populated)
  const initC = (initialPrescriptionToRevise?.clinicalInfoJson as Record<string, string>) || {};
  const initialHistory = useMemo(() => {
    if (initC.medicalHistory) return initC.medicalHistory;
    const items: string[] = [];
    if (Array.isArray(currentAppointment?.diseasesJson) && currentAppointment.diseasesJson.length > 0) {
      items.push(...(currentAppointment.diseasesJson as string[]).map((d) => `- ${d}`));
    }
    if (currentPatient?.medicalHistory) {
      const cleaned = currentPatient.medicalHistory.trim();
      if (cleaned && !items.some((i) => i.includes(cleaned))) {
        items.push(cleaned.startsWith("- ") ? cleaned : `- ${cleaned}`);
      }
    }
    return items.join("\n");
  }, [initC.medicalHistory, currentAppointment?.diseasesJson, currentPatient?.medicalHistory]);

  const initialAllergies = useMemo(() => {
    if (initC.allergies) return initC.allergies;
    if (Array.isArray(currentAppointment?.allergiesJson) && currentAppointment.allergiesJson.length > 0) {
      return (currentAppointment.allergiesJson as string[]).map((a) => `- ${a}`).join("\n");
    }
    return "";
  }, [initC.allergies, currentAppointment?.allergiesJson]);

  const [medicalHistory, setMedicalHistory] = useState(initialHistory);
  const [allergies, setAllergies] = useState(initialAllergies);
  const [clinicalContextEditable, setClinicalContextEditable] = useState(false);

  // Complaints & Diagnosis
  const [complaints, setComplaints] = useState(
    initC.complaints || (triage.complaint ? `- ${triage.complaint}` : "")
  );
  const [diagnosis, setDiagnosis] = useState(initC.diagnosis || "");

  // Prescribed Tests
  const [tests, setTests] = useState<TestRow[]>(() => {
    if (initialPrescriptionToRevise && Array.isArray(initialPrescriptionToRevise.testsJson)) {
      return initialPrescriptionToRevise.testsJson as TestRow[];
    }
    return [{ name: "CBC with ESR (Complete Blood Count)", instructions: "Clean blood sample" }];
  });

  // Prescribed Medicines (Rx)
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
        instructions: "After meal",
      },
    ];
  });

  // Advice & Follow-Up
  const [advice, setAdvice] = useState(
    initC.advice ||
      "- Drink plenty of boiled warm water.\n- Avoid oily, spicy, and outside street food.\n- Take complete bed rest."
  );
  const [followUp, setFollowUp] = useState(initC.followUp || "After 7 days with investigation reports");
  const [notes, setNotes] = useState(initialPrescriptionToRevise?.notes || "");

  // Attachments & Reports
  const [attachments, setAttachments] = useState<
    { id: string; name: string; url: string; fileType: string }[]
  >([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [showReportsModal, setShowReportsModal] = useState(false);

  // Submission States
  const [submitting, setSubmitting] = useState(false);
  const [createdPrescriptionId, setCreatedPrescriptionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Load catalogs on mount
  useEffect(() => {
    let active = true;
    async function loadData() {
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
          if (def && !selectedTemplateId) setSelectedTemplateId(def.id);
        }

        if (medData.success && Array.isArray(medData.data)) {
          setCatalogMedicines(
            medData.data.map(
              (m: { name: string; dosage: string; type: string; instructions?: string | null }) => ({
                value: m.name,
                label: `${m.name} (${m.dosage})`,
                badge: m.type,
                description: m.instructions || undefined,
                payload: m,
              })
            )
          );
        }

        if (testData.success && Array.isArray(testData.data)) {
          setCatalogTests(
            testData.data.map((t: { name: string; instructions?: string | null }) => ({
              value: t.name,
              label: t.name,
              description: t.instructions || undefined,
              payload: t,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load prescription catalog dependencies", err);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [selectedTemplateId]);

  // Patient Age Calculation
  const patientAge = useMemo(() => {
    if (!currentPatient) return undefined;
    if (currentPatient.dateOfBirth) {
      const birth = new Date(currentPatient.dateOfBirth);
      const diffYears = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (diffYears > 0 && diffYears < 130) return diffYears;
    }
    if (currentPatient.medicalHistory) {
      const match = currentPatient.medicalHistory.match(/Age:\s*(\d+)/i);
      if (match) return match[1];
    }
    return undefined;
  }, [currentPatient]);

  // Medicine Actions
  const addMedicine = (preset?: Partial<MedicineRow>) => {
    setMedicines((prev) => [
      ...prev,
      {
        type: preset?.type || "Tablet",
        name: preset?.name || "",
        dosage: preset?.dosage || "",
        frequency: preset?.frequency || "1 + 0 + 1",
        duration: preset?.duration || "7 Days",
        instructions: preset?.instructions || "After meal",
      },
    ]);
  };

  const cloneMedicine = (index: number) => {
    setMedicines((prev) => {
      const copy = [...prev];
      const target = copy[index];
      copy.splice(index + 1, 0, { ...target });
      return copy;
    });
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

  // Test Actions
  const addTest = (name = "", instructions = "") => {
    setTests((prev) => [...prev, { name, instructions }]);
  };

  const removeTest = (index: number) => {
    setTests((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTest = (index: number, field: keyof TestRow, value: string) => {
    setTests((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Quick Preset Handlers (using standard "- " bullet)
  const appendComplaint = (phrase: string) => {
    setComplaints((prev) => appendBulletLine(prev, phrase, "- "));
  };

  const appendDiagnosis = (dx: string) => {
    setDiagnosis((prev) => appendBulletLine(prev, dx, "- "));
  };

  const appendAdvice = (adv: string) => {
    setAdvice((prev) => appendBulletLine(prev, adv, "- "));
  };

  const appendHistory = (item: string) => {
    setMedicalHistory((prev) => appendBulletLine(prev, item, "- "));
  };

  const appendAllergy = (item: string) => {
    setAllergies((prev) => appendBulletLine(prev, item, "- "));
  };

  // File Attachment Upload
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    if (!currentPatient) {
      setErrorMessage("No queued patient selected. Please select a patient from the queue.");
      setSubmitting(false);
      return;
    }

    if (medicines.length === 0 || !medicines[0].name.trim()) {
      setErrorMessage("Please specify at least one prescribed medicine.");
      setSubmitting(false);
      return;
    }

    const payload = {
      doctorId: doctor.id,
      patientId: currentPatient.id,
      appointmentId: currentAppointment?.id || undefined,
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
        signatureUrl: docSignatureUrl || undefined,
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
      onPrescriptionCreated?.(data.data.id, currentAppointment?.id);
    } catch {
      setSubmitting(false);
      setErrorMessage("Network error while issuing prescription.");
    }
  };

  const handleResetForAnother = () => {
    setCreatedPrescriptionId(null);
    setSavedVersionNumber(null);
    setEditingPrescription(null);
    setChangeReason("");
    onCancelRevision?.();
    onCallNextPatient?.();
  };

  const patientReports = currentPatient?.testReports || [];
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="space-y-6">
      {/* Top Consultation Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <div className="flex items-center gap-3">
          {onBackToQueue && (
            <button
              type="button"
              onClick={onBackToQueue}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backToQueue}</span>
            </button>
          )}

          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t.prescriptionConsole}</span>
              {currentAppointment?.serialNumber && (
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[var(--brand-primary)] text-white shadow-2xs font-mono">
                  {language === "bn" ? `সিরিয়াল #${currentAppointment.serialNumber}` : `Serial #${currentAppointment.serialNumber}`}
                </span>
              )}
              {editingPrescription && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30">
                  {t.revisingVersion} {editingPrescription.version || 1}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.consultationWorkspace}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {templates.length > 0 && (
            <div className="w-44 sm:w-52">
              <SearchableSelect
                options={templates.map((tpl) => ({
                  value: tpl.id,
                  label: `${tpl.name}${tpl.isDefault ? (t("uiDefault2")) : ""}`,
                  badge: tpl.isDefault ? (t("uiDefault")) : undefined,
                }))}
                value={selectedTemplateId}
                placeholder={t.layoutTemplate}
                searchPlaceholder={t.searchTemplates}
                onChange={(val) => setSelectedTemplateId(val)}
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs cursor-pointer"
          >
            <span>{t.livePreview}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner with Queue Advancement */}
      {createdPrescriptionId && (
        <div className="p-6 rounded-3xl border-2 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 dark:border-emerald-600 shadow-sm animate-in fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {savedVersionNumber && savedVersionNumber > 1
                    ? `${language === "bn" ? `ভার্সন ${savedVersionNumber}` : `Version ${savedVersionNumber}`} ${t.versionSavedHistoryPreserved}`
                    : t.prescriptionIssuedQueueCleared}
                </span>
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {currentPatient?.user.name} {t.consultationCompleteTitle}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Prescription ID: <code className="font-mono font-bold">{createdPrescriptionId}</code> •
                {t("uiRemovedFromChamberQueueTV")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/prescriptions/${createdPrescriptionId}/print${
                  savedVersionNumber ? `?version=${savedVersionNumber}` : ""
                }`}
                target="_blank"
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-sm hover:opacity-95 transition"
              >
                <span>🖨️ {t.viewAndPrintA4} (v{savedVersionNumber || 1})</span>
              </Link>

              {onCallNextPatient && (
                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition cursor-pointer"
                >
                  📞 {t.callNextPatient}
                </button>
              )}

              {onBackToQueue && (
                <button
                  type="button"
                  onClick={onBackToQueue}
                  className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  👥 {t.chamberQueue}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-600 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: Patient Clinical & Triage Context Banner (Staff Managed - Read Only) */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--brand-primary)] bg-[var(--brand-surface)] border border-[var(--brand-border)] px-2.5 py-0.5 rounded-md">
                {t.patientDemographicsVerified}
              </span>
              {currentAppointment?.visitType && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  {currentAppointment.visitType === "FOLLOWUP"
                    ? t.followupVisit
                    : currentAppointment.visitType === "REPORT_REVIEW"
                    ? t.reportReviewFree
                    : t.firstConsultation}
                </span>
              )}
              {currentAppointment?.paymentStatus && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  {t.consultationFee}: ${currentAppointment.fee ?? 0} ({currentAppointment.paymentStatus})
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {currentPatient?.user.name || (t("uiPatientRecord"))}
            </h3>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span>
                {t.patientGender}: <strong className="text-slate-800 dark:text-slate-200">{currentPatient?.gender || (t("uiNotSpecified2"))}</strong>
              </span>
              <span>
                {t.patientAge}: <strong className="text-slate-800 dark:text-slate-200">{patientAge ? `${patientAge} ${t("uiYrs2")}` : "N/A"}</strong>
              </span>
              {currentPatient?.user.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{currentPatient.user.phone}</span>
                </span>
              )}
              {currentPatient?.user.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{currentPatient.user.email}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* View Attached Lab Reports Button */}
            {patientReports.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowReportsModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition cursor-pointer shadow-2xs"
              >
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.labReportsCount} ({patientReports.length})</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                {t.noLabReportsUploaded}
              </span>
            )}

            {onBackToQueue && (
              <button
                type="button"
                onClick={onBackToQueue}
                className="text-xs text-[var(--brand-text)] hover:underline font-semibold cursor-pointer"
              >
                {t.switchPatient}
              </button>
            )}
          </div>
        </div>

        {/* Triage Vitals Strip */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>{t.triageVitalsRecorded}</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">{t.bpUnit}</label>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="120/80"
                className="w-full mt-1 font-mono font-bold text-xs text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">{t.pulseUnit}</label>
              <input
                type="text"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="72 bpm"
                className="w-full mt-1 font-mono font-bold text-xs text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">{t.tempUnit}</label>
              <input
                type="text"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="98.6 °F"
                className="w-full mt-1 font-mono font-bold text-xs text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">{t.weightUnit}</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="65 kg"
                className="w-full mt-1 font-mono font-bold text-xs text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">{t.bloodSugarUnit}</label>
              <input
                type="text"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                placeholder="7.2 mmol/L"
                className="w-full mt-1 font-mono font-bold text-xs text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80">
              <label className="text-[10px] font-bold text-slate-500 uppercase block">{t.spo2Unit}</label>
              <input
                type="text"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="98%"
                className="w-full mt-1 font-mono font-bold text-xs text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Safety Critical Alerts (History & Allergies from Staff Intake) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Drug Allergies Alert */}
          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t.drugAllergiesWarnings}</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                {t.safetyCritical}
              </span>
            </div>
            <textarea
              rows={2}
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              readOnly={!clinicalContextEditable}
              placeholder={t.allergiesInputPlaceholder}
              className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {ALLERGY_PRESETS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => appendAllergy(a)}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 text-[11px] font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 transition cursor-pointer"
                >
                  + {a}
                </button>
              ))}
            </div>
          </div>

          {/* Medical History */}
          <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.medicalHistoryStaff}
              </span>
              <button
                type="button"
                onClick={() => setClinicalContextEditable((current) => !current)}
                className="text-[10px] font-bold text-[var(--brand-text)] hover:underline"
              >
                {clinicalContextEditable ? t("uiLockClinicalContext", "Lock") : t("uiEditClinicalContext", "Edit")}
              </button>
            </div>
            <textarea
              rows={2}
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              readOnly={!clinicalContextEditable}
              placeholder={t.chronicConditionsPlaceholder}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {HISTORY_PRESETS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => appendHistory(h)}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition cursor-pointer"
                >
                  + {h}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 2: Doctor Chamber Header (Compact by default) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {t.chamberLabel}: {docHospital || "General OPD"} • {docName} ({docSpecialization})
            </span>
            {docRegNo && <span className="text-slate-400">• {t.bmdcRegNo}: {docRegNo}</span>}
          </div>
          <button
            type="button"
            onClick={() => setCustomizeDoctorHeader(!customizeDoctorHeader)}
            className="text-xs font-semibold text-[var(--brand-text)] hover:underline self-start sm:self-auto"
          >
            {customizeDoctorHeader ? t.hideHeaderEditor : t.editChamberDetails}
          </button>
        </div>

        {customizeDoctorHeader && (
          <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">{t.doctorName}</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">{t.degrees}</label>
              <input
                type="text"
                value={docDegrees}
                onChange={(e) => setDocDegrees(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">{t.specialization}</label>
              <input
                type="text"
                value={docSpecialization}
                onChange={(e) => setDocSpecialization(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">{t.hospitalName}</label>
              <input
                type="text"
                value={docHospital}
                onChange={(e) => setDocHospital(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">{t.designation}</label>
              <input
                type="text"
                value={docDesignation}
                onChange={(e) => setDocDesignation(e.target.value)}
                placeholder="e.g. Consultant"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">{t.bmdcRegNo}</label>
              <input
                type="text"
                value={docRegNo}
                onChange={(e) => setDocRegNo(e.target.value)}
                placeholder="e.g. A-12345"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">{t.chamberAddress}</label>
              <input
                type="text"
                value={docChamber}
                onChange={(e) => setDocChamber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">{t.contactPhone}</label>
              <input
                type="text"
                value={docContact}
                onChange={(e) => setDocContact(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* SECTION 3: Clinical Findings & Diagnosis */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)] flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>1. {t.chiefComplaints} & {t.clinicalDiagnosis}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">{t("useDashForManualEntries")}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chief Complaints */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.chiefComplaints}
              </label>
              <textarea
                rows={4}
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
                placeholder="- High fever for 3 days&#10;- Sore throat & headache"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)] leading-relaxed font-medium"
              />

              {/* Categorized Pill Presets (Requirement 5 & 6) */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t.quickSelectPresets}
                </span>
                <div className="space-y-1.5">
                  {COMPLAINT_GROUPS.map((grp) => (
                    <div key={grp.category} className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 w-24 shrink-0">
                        {grp.category}:
                      </span>
                      {grp.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => appendComplaint(item)}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[var(--bg-surface)] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] hover:border-[var(--brand-border)] transition cursor-pointer shadow-2xs"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Clinical Diagnosis (Dx) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.clinicalDiagnosis}
              </label>
              <textarea
                rows={4}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="- Upper Respiratory Tract Infection (URTI)&#10;- Mild Acute Gastritis"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)] leading-relaxed font-medium"
              />

              {/* Categorized Diagnosis Presets */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t.commonDiagnoses}
                </span>
                <div className="space-y-1.5">
                  {DIAGNOSIS_GROUPS.map((grp) => (
                    <div key={grp.category} className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 w-24 shrink-0">
                        {grp.category}:
                      </span>
                      {grp.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => appendDiagnosis(item)}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[var(--bg-surface)] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] hover:border-[var(--brand-border)] transition cursor-pointer shadow-2xs"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Prescribed Medications (℞ Rx Section - Requirement 11) */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--brand-primary)]/40 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl font-serif font-black text-[var(--brand-primary)]">℞</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                  2. {t.medications}
                </span>
                <p className="text-xs text-slate-500">
                  {t.selectBrandGenericAuto}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => addMedicine()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-95 shadow-sm transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addMedicine}</span>
            </button>
          </div>

          {/* Medicine Cards List */}
          <div className="space-y-4">
            {medicines.map((med, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-[var(--bg-app)] border border-slate-200/90 dark:border-slate-800/90 space-y-4 hover:border-[var(--brand-border)] transition-all shadow-xs"
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-black flex items-center justify-center shadow-xs">
                      #{index + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wide">
                      {med.type || "Tablet"}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {med.name || t.newMedication}
                    </span>
                    {med.dosage && (
                      <span className="text-xs font-bold text-[var(--brand-text)] bg-[var(--brand-surface)] px-2 py-0.5 rounded-md border border-[var(--brand-border)]">
                        {med.dosage}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => cloneMedicine(index)}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.duplicate}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.remove}</span>
                    </button>
                  </div>
                </div>

                {/* Field 1: Formulation, Brand Name, Strength */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {t.formulationLabel}
                    </label>
                    <SearchableSelect
                      options={FORMULATION_OPTIONS}
                      value={med.type}
                      placeholder="Formulation..."
                      searchPlaceholder="Search form..."
                      allowCustom
                      onChange={(val) => updateMedicine(index, "type", val)}
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {t.drugBrandSearchLabel}
                    </label>
                    <SearchableSelect
                      options={catalogMedicines.filter(
                        (option) => option.badge === med.type || option.value === med.name
                      )}
                      value={med.name}
                      placeholder={t("uiSearchBrandOrGenericE")}
                      allowCustom
                      onChange={(val, opt) => handleSelectMedicineFromCatalog(index, opt || { value: val, label: val })}
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {t.strengthDosageLabel}
                    </label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                      placeholder="e.g. 20mg, 500mg, 10ml"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                    />
                  </div>
                </div>

                {/* Field 2: Frequency with Clear Pill Badges */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t.doseScheduleFrequency}
                    </label>
                    <span className="text-[11px] font-mono font-bold text-[var(--brand-text)]">
                      {t("uiDose")} {med.frequency || (t("uiNotSpecified2"))}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                      placeholder="e.g. 1 + 0 + 1"
                      className="w-32 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-xs font-bold focus:outline-none"
                    />
                    {FREQUENCY_PRESETS.map((f) => {
                      const isSelected = med.frequency === f;
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => updateMedicine(index, "frequency", f)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            isSelected
                              ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-xs"
                              : "bg-[var(--bg-surface)] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[var(--brand-border)] hover:bg-[var(--brand-surface)]"
                          }`}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Field 3: Timing & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t.timingMealRelation}
                    </label>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
                      placeholder="e.g. 30 mins before breakfast & dinner"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-xs focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {TIMING_PRESETS.map((tItem) => (
                        <button
                          key={tItem}
                          type="button"
                          onClick={() => updateMedicine(index, "instructions", tItem)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--bg-surface)] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition cursor-pointer"
                        >
                          {tItem}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t.courseDurationLabel}
                    </label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                      placeholder="e.g. 7 Days"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-xs font-semibold focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {DURATION_PRESETS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => updateMedicine(index, "duration", d)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--bg-surface)] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition cursor-pointer"
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => addMedicine()}
              className="px-6 py-2.5 rounded-2xl border-2 border-dashed border-[var(--brand-primary)]/40 hover:border-[var(--brand-primary)] bg-[var(--brand-surface)] text-[var(--brand-text)] text-xs font-bold transition cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ {t.addPrescribedMedicine}</span>
            </button>
          </div>
        </div>

        {/* SECTION 5: Diagnostic Lab Investigations Advised */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                3. {t.diagnosticInvestigationsAdvised}
              </span>
              <p className="text-xs text-slate-500">{t.orderLabTestsDesc}</p>
            </div>
            <button
              type="button"
              onClick={() => addTest()}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {t.addInvestigationBtn}
            </button>
          </div>

          {/* Quick Test Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            <span className="text-[11px] font-bold text-slate-500 mr-1">{t.quickSelectPresets}</span>
            {COMMON_TEST_CHIPS.map((chip) => (
              <button
                key={chip.name}
                type="button"
                onClick={() => addTest(chip.name, chip.instructions)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[var(--bg-app)] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] hover:border-[var(--brand-border)] transition cursor-pointer"
              >
                + {chip.name.split(" (")[0]}
              </button>
            ))}
          </div>

          {/* Tests List */}
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 items-center"
              >
                <div className="sm:col-span-1 text-center font-black text-xs text-[var(--brand-primary)]">
                  #{index + 1}
                </div>
                <div className="sm:col-span-6">
                  <SearchableSelect
                    options={catalogTests}
                    value={test.name}
                    placeholder={t.searchDiagnosticTestsPlaceholder}
                    allowCustom
                    onChange={(val) => updateTest(index, "name", val)}
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={test.instructions}
                    onChange={(e) => updateTest(index, "instructions", e.target.value)}
                    placeholder={t.testInstructionsPlaceholder}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-surface)] text-xs focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeTest(index)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6: Advice & Follow-Up */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
            4. {t.adviceAndLifestyle}
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Advice */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.adviceAndLifestyle}
              </label>
              <textarea
                rows={4}
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="- Drink plenty of boiled warm water.&#10;- Avoid oily and spicy foods."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)] leading-relaxed font-medium"
              />

              <div className="space-y-1.5 pt-1">
                {ADVICE_GROUPS.map((grp) => (
                  <div key={grp.category} className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 w-24 shrink-0">
                      {grp.category}:
                    </span>
                    {grp.items.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => appendAdvice(item)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[var(--bg-surface)] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] hover:border-[var(--brand-border)] transition cursor-pointer shadow-2xs"
                      >
                        + {item}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up & Private Notes */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.nextConsultationVisit}
                </label>
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder={t.followUpPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs font-semibold focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {FOLLOWUP_PRESETS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setFollowUp(chip)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[var(--bg-surface)] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] transition cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.privatePhysicianNotes}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.internalNotesPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 7: File Attachments */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)] flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              <span>5. {t.prescriptionAttachmentsOptional}</span>
            </span>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer transition shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>{uploadingAttachment ? t.uploadingAttachment : t.attachFileBtn}</span>
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
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 text-xs">{attachmentError}</div>
          )}

          {attachments.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              {t.noFilesAttached}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {attachments.map((att, idx) => (
                <div
                  key={att.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                    <span className="font-semibold truncate">{att.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    ✕
                  </button>
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
            className="px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            👁️ {t.livePreview}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-black shadow-md hover:opacity-95 transition disabled:opacity-60 flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <span>{t.saving}</span>
            ) : editingPrescription ? (
              <span>💾 {language === "bn" ? `ভার্সন ${(editingPrescription.version || 1) + 1} হিসেবে সংরক্ষণ` : `Save as Version ${(editingPrescription.version || 1) + 1}`}</span>
            ) : (
              <span>✓ {t.saveAndComplete}</span>
            )}
          </button>
        </div>
      </form>

      {/* Patient Lab Reports Drawer / Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-[var(--bg-surface)] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>{t.attachedLabReportsScans}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t.uploadedByTriageStaffFor} {currentPatient?.user.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReportsModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {patientReports.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">
                  {t("uiNoLabReportsFoundFor")}
                </p>
              ) : (
                patientReports.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white block truncate">
                        {r.title}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate">
                        {r.description || r.originalName} • {r.reportDate ? new Date(r.reportDate).toLocaleDateString() : ""}
                      </p>
                      {r.notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                          {t("uiNotes")} {r.notes}
                        </p>
                      )}
                    </div>

                    <a
                      href={r.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-90 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{t.view}</span>
                    </a>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReportsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

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
          name: currentPatient?.user.name || (t("rolePatient")),
          gender: currentPatient?.gender || (t("uiNotSpecified2")),
          phone: currentPatient?.user.phone || undefined,
          age: patientAge,
        }}
        hospitalInfo={{
          name: selectedTemplate?.contentJson?.hospitalName || docHospital || "CareFlow OS",
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
