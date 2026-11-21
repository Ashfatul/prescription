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
  ShieldCheck,
  HeartPulse,
  Edit3,
  Phone,
  Mail,
  FileSearch,
  Info,
} from "lucide-react";
import { SearchableSelect, SelectOption } from "@/components/common/custom-select";
import { PrescriptionPreviewModal } from "@/components/dashboard/prescription-preview-modal";
import { useLanguage } from "@/lib/i18n/language-context";
import { notifyToast } from "@/lib/toast";

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
  vitalsJson?: unknown;
  isTriageCompleted?: boolean | null;
  triagedAt?: string | null;
  triagedBy?: string | null;
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

// Flat, searchable option lists with their clinical category shown as a badge.
const COMPLAINT_OPTIONS: SelectOption[] = COMPLAINT_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ value: item, label: item, badge: group.category }))
);

const DIAGNOSIS_OPTIONS: SelectOption[] = DIAGNOSIS_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ value: item, label: item, badge: group.category }))
);

function parseBulletValues(text?: string | null): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim().replace(/^([•\-\–\—*]|\-\-)\s*/, "").trim())
    .filter(Boolean);
}

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

// Flat, searchable advice options with their category shown as a badge.
const ADVICE_OPTIONS: SelectOption[] = ADVICE_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ value: item, label: item, badge: group.category }))
);

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

  // Triage Vitals (Staff prepared, Doctor can refine via viewer/override)
  const initV = (initialPrescriptionToRevise?.vitalsJson as Record<string, string>) || (currentAppointment?.vitalsJson as Record<string, string>) || {};
  const [bp, setBp] = useState(initV.bp || triage.bp || "");
  const [pulse, setPulse] = useState(initV.pulse || triage.pulse || "");
  const [temp, setTemp] = useState(initV.temp || triage.temp || "");
  const [weight, setWeight] = useState(initV.weight || triage.weight || "");
  const [bloodSugar, setBloodSugar] = useState(initV.bloodSugar || "");
  const [spo2, setSpo2] = useState(initV.spo2 || "");
  const [showClinicalOverrideModal, setShowClinicalOverrideModal] = useState(false);

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

  // Staff-recorded history & allergies — editable through searchable selectors
  const [historyValues, setHistoryValues] = useState<string[]>(() => parseBulletValues(initialHistory));
  const [allergyValues, setAllergyValues] = useState<string[]>(() => parseBulletValues(initialAllergies));

  // Keep the stored/printed text format (one "- " item per line) unchanged.
  const medicalHistory = historyValues.map((value) => `- ${value}`).join("\n");
  const allergies = allergyValues.map((value) => `- ${value}`).join("\n");

  // Complaints & Diagnosis — staff triage value is selected by default and
  // stays fully editable by the doctor through the searchable multi-select.
  const [complaintValues, setComplaintValues] = useState<string[]>(() => {
    const fromRecord = parseBulletValues(initC.complaints);
    if (fromRecord.length) return fromRecord;
    return triage.complaint ? [triage.complaint.trim()] : [];
  });
  const [diagnosisValues, setDiagnosisValues] = useState<string[]>(() =>
    parseBulletValues(initC.diagnosis)
  );

  // Keep the stored/printed text format (one "- " item per line) unchanged.
  const complaints = complaintValues.map((value) => `- ${value}`).join("\n");
  const diagnosis = diagnosisValues.map((value) => `- ${value}`).join("\n");

  // Prescribed Tests
  const [tests, setTests] = useState<TestRow[]>(() => {
    if (initialPrescriptionToRevise && Array.isArray(initialPrescriptionToRevise.testsJson)) {
      return initialPrescriptionToRevise.testsJson as TestRow[];
    }
    return [];
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
    return [];
  });

  // Advice & Follow-Up — same searchable multi-select workflow as complaints
  const [adviceValues, setAdviceValues] = useState<string[]>(() => {
    const fromRecord = parseBulletValues(initC.advice);
    if (fromRecord.length) return fromRecord;
    return parseBulletValues(
      "- Drink plenty of boiled warm water.\n- Avoid oily, spicy, and outside street food.\n- Take complete bed rest."
    );
  });
  const [followUp, setFollowUp] = useState(initC.followUp || "After 7 days with investigation reports");
  const [notes, setNotes] = useState(initialPrescriptionToRevise?.notes || "");
  const [patientNote, setPatientNote] = useState(initC.patientNote || "");

  // Keep the stored/printed text format (one "- " item per line) unchanged.
  const advice = adviceValues.map((value) => `- ${value}`).join("\n");

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
      notifyToast(language === "bn" ? "ফাইল সফলভাবে সংযুক্ত হয়েছে।" : "File attachment uploaded successfully.", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (language === "bn" ? "ফাইল আপলোড করতে ব্যর্থ হয়েছে।" : "Failed to upload file");
      setAttachmentError(msg);
      notifyToast(msg, "error");
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
      const err = language === "bn"
        ? "কোনো রোগী নির্বাচিত নেই। অনুগ্রহ করে কিউ থেকে একজন রোগী নির্বাচন করুন।"
        : "No queued patient selected. Please select a patient from the queue.";
      setErrorMessage(err);
      notifyToast(err, "error");
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
        patientNote: patientNote.trim() || undefined,
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
        const errMsg = data.message || (language === "bn" ? "প্রেসক্রিপশন সংরক্ষণ করতে ব্যর্থ হয়েছে।" : "Failed to save prescription.");
        setErrorMessage(errMsg);
        notifyToast(errMsg, "error");
        return;
      }

      setCreatedPrescriptionId(data.data.id);
      const nextVer = data.data.version || (editingPrescription ? (editingPrescription.version || 1) + 1 : 1);
      setSavedVersionNumber(nextVer);
      onPrescriptionCreated?.(data.data.id, currentAppointment?.id);

      const successMsg = isRevision
        ? (language === "bn"
          ? `প্রেসক্রিপশন সংস্করণ #${nextVer} সফলভাবে সংরক্ষিত এবং আপডেট করা হয়েছে!`
          : `Prescription revision #${nextVer} updated and saved successfully!`)
        : (language === "bn"
          ? `প্রেসক্রিপশন সফলভাবে সংরক্ষিত ও প্রদান করা হয়েছে! (${currentPatient.user.name})`
          : `Prescription issued and saved successfully for ${currentPatient.user.name}!`);

      notifyToast(successMsg, "success");
    } catch (err: unknown) {
      setSubmitting(false);
      const errMsg = err instanceof Error
        ? err.message
        : (language === "bn" ? "প্রেসক্রিপশন প্রদানের সময় নেটওয়ার্ক ত্রুটি ঘটেছে।" : "Network error while issuing prescription.");
      setErrorMessage(errMsg);
      notifyToast(errMsg, "error");
    }
  };

  const handleResetForAnother = () => {
    setCreatedPrescriptionId(null);
    setSavedVersionNumber(null);
    setEditingPrescription(null);
    setChangeReason("");
    onCancelRevision?.();
    onCallNextPatient?.();
    notifyToast(
      language === "bn"
        ? "পরবর্তী রোগীর জন্য ওয়ার্কস্পেস প্রস্তুত।"
        : "Workspace prepared for next consultation.",
      "info"
    );
  };

  const patientReports = currentPatient?.testReports || [];
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="space-y-6">
      {/* Top Consultation Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
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
                onChange={(val) => {
                  setSelectedTemplateId(val);
                  const tpl = templates.find((t) => t.id === val);
                  if (tpl) {
                    notifyToast(
                      language === "bn"
                        ? `লেআউট টেমপ্লেট নির্বাচন করা হয়েছে: ${tpl.name}`
                        : `Layout template applied: ${tpl.name}`,
                      "info"
                    );
                  }
                }}
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
        <div className="p-6 rounded-xl border-2 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 dark:border-emerald-600 shadow-sm animate-in fade-in space-y-4">
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
                href={`/prescriptions/${createdPrescriptionId}/print${savedVersionNumber ? `?version=${savedVersionNumber}` : ""
                  }`}
                target="_blank"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-bold shadow-sm hover:opacity-95 transition"
              >
                <span>🖨️ {t.viewAndPrintA4} (v{savedVersionNumber || 1})</span>
              </Link>

              {onCallNextPatient && (
                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition cursor-pointer"
                >
                  📞 {t.callNextPatient}
                </button>
              )}

              {onBackToQueue && (
                <button
                  type="button"
                  onClick={onBackToQueue}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  👥 {t.chamberQueue}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-600 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: Patient Clinical & Triage Context Banner (Staff Managed - Read Only) */}
      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
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

        {/* Sleek Pre-Consultation Telemetry & Clinical Context (Staff Prepared - Doctor Viewer by Default) */}
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-3.5">
          {/* Header Strip: Title + Status + Modify CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="p-1 rounded-md bg-rose-500/10 text-rose-500">
                <Activity className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {t("uiVitalsMeasuredByFrontDesk", "Pre-Consultation Vitals & Triage")}
                </span>
                <span className="text-[10px] text-slate-400">
                  {currentAppointment?.triagedBy
                    ? `${t("uiRecordedByStaff", "Staff Triage")}: ${currentAppointment.triagedBy}`
                    : (currentAppointment?.isTriageCompleted
                      ? t("uiTriageCompletedBadge", "Triage Ready")
                      : t("uiTriageVitalsRecorded", "Recorded by Front Desk"))}
                </span>
              </div>
              {currentAppointment?.isTriageCompleted || bp || pulse || temp || weight ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t("uiTriageCompletedBadge", "Triage Ready")}</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{t("uiTriagePendingBadge", "Triage Pending Front Desk")}</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowClinicalOverrideModal(true)}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>{t("uiEditVitalsAndContext", "Modify Vitals & History")}</span>
            </button>
          </div>

          {/* Metric Telemetry Strip (Read-Only) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="p-3 rounded-lg bg-[var(--bg-app)] border border-slate-200/70 dark:border-slate-800/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {t.bpUnit}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-mono font-black text-slate-900 dark:text-white">
                  {bp || "—"}
                </span>
                {bp && !bp.toLowerCase().includes("mm") && (
                  <span className="text-[10px] text-slate-400 font-medium">mmHg</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg-app)] border border-slate-200/70 dark:border-slate-800/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {t.pulseUnit}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-mono font-black text-slate-900 dark:text-white">
                  {pulse || "—"}
                </span>
                {pulse && !pulse.toLowerCase().includes("bpm") && (
                  <span className="text-[10px] text-slate-400 font-medium">bpm</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg-app)] border border-slate-200/70 dark:border-slate-800/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {t.tempUnit}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-mono font-black text-slate-900 dark:text-white">
                  {temp || "—"}
                </span>
                {temp && !temp.includes("°") && (
                  <span className="text-[10px] text-slate-400 font-medium">°F</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg-app)] border border-slate-200/70 dark:border-slate-800/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {t.weightUnit}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-mono font-black text-slate-900 dark:text-white">
                  {weight || "—"}
                </span>
                {weight && !weight.toLowerCase().includes("kg") && (
                  <span className="text-[10px] text-slate-400 font-medium">kg</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg-app)] border border-slate-200/70 dark:border-slate-800/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {t.bloodSugarUnit}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-mono font-black text-slate-900 dark:text-white truncate">
                  {bloodSugar || "—"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg-app)] border border-slate-200/70 dark:border-slate-800/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {t.spo2Unit}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-mono font-black text-slate-900 dark:text-white">
                  {spo2 || "—"}
                </span>
                {spo2 && !spo2.includes("%") && (
                  <span className="text-[10px] text-slate-400 font-medium">%</span>
                )}
              </div>
            </div>
          </div>

          {/* Dual Summary: Allergies & Medical History (Read-Only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {/* Allergies Card */}
            {allergies.trim() ? (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-950 dark:text-rose-100 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-700 dark:text-rose-300">
                      {t.drugAllergiesWarnings}
                    </span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                      {t.safetyCritical}
                    </span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 break-words text-rose-900 dark:text-rose-200 whitespace-pre-line leading-relaxed">
                    {allergies}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800 text-slate-500 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {t.drugAllergiesWarnings}
                  </span>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {t("uiNoKnownAllergies", "No Known Drug Allergies (NKDA)")}
                  </p>
                </div>
              </div>
            )}

            {/* Medical History Card */}
            {medicalHistory.trim() ? (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-950 dark:text-blue-100 flex items-start gap-2.5">
                <HeartPulse className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-700 dark:text-blue-300 block">
                    {t.medicalHistoryStaff}
                  </span>
                  <p className="text-xs font-semibold mt-0.5 break-words text-blue-900 dark:text-blue-200 whitespace-pre-line leading-relaxed">
                    {medicalHistory}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800 text-slate-500 flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {t.medicalHistoryStaff}
                  </span>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {t("uiNoChronicIllness", "No Chronic Illness Recorded")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Clinical Override Modal (Allows Doctor to Refine Vitals or Clinical Context) */}
        {showClinicalOverrideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--bg-elevated)] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[var(--brand-surface)] text-[var(--brand-primary)]">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {t("uiClinicalOverrideTitle", "Physician Clinical Override: Vitals & History")}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t("uiReMeasureVitalsPrompt", "If re-measured during chamber consultation, update the values below:")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClinicalOverrideModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Vitals Form Inputs */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Vital Signs (Re-measurement)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t.bpUnit}</label>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      placeholder="120/80"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t.pulseUnit}</label>
                    <input
                      type="text"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      placeholder="72 bpm"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t.tempUnit}</label>
                    <input
                      type="text"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      placeholder="98.6 °F"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t.weightUnit}</label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="65 kg"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t.bloodSugarUnit}</label>
                    <input
                      type="text"
                      value={bloodSugar}
                      onChange={(e) => setBloodSugar(e.target.value)}
                      placeholder="7.2 mmol/L"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{t.spo2Unit}</label>
                    <input
                      type="text"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      placeholder="98%"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-[var(--bg-surface)] text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Drug Allergies Form */}
              <div className="space-y-2 p-3.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{t.drugAllergiesWarnings}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                    {t.safetyCritical}
                  </span>
                </div>
                <SearchableSelect
                  multiple
                  searchable
                  allowCustom
                  options={ALLERGY_PRESETS}
                  values={allergyValues}
                  onChangeValues={setAllergyValues}
                  placeholder={t.allergiesInputPlaceholder}
                  searchPlaceholder={t.allergiesInputPlaceholder}
                />
              </div>

              {/* Medical History Form */}
              <div className="space-y-2 p-3.5 rounded-lg bg-[var(--bg-app)] border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {t.medicalHistoryStaff}
                </span>
                <SearchableSelect
                  multiple
                  searchable
                  allowCustom
                  options={HISTORY_PRESETS}
                  values={historyValues}
                  onChangeValues={setHistoryValues}
                  placeholder={t.chronicConditionsPlaceholder}
                  searchPlaceholder={t.chronicConditionsPlaceholder}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClinicalOverrideModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowClinicalOverrideModal(false);
                    notifyToast(
                      language === "bn"
                        ? "ক্লিনিক্যাল তথ্য ও ভাইটালস সফলভাবে আপডেট করা হয়েছে।"
                        : "Clinical vitals and context updated by physician.",
                      "success"
                    );
                  }}
                  className="px-5 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-95 transition cursor-pointer shadow-xs"
                >
                  {t("uiSaveAndApply", "Save & Apply")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 2: Doctor Chamber Header (Compact by default) */}
        <div className="p-4 sm:p-5 rounded-lg bg-[var(--bg-surface)] border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in">
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
        <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)] flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>1. {t.chiefComplaints} & {t.clinicalDiagnosis}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {t("uiRxSearchSelectCreateHint", "Search, select or create inline")}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chief Complaints — one searchable selector with inline create */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.chiefComplaints}
                </label>
                {complaintValues.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-[10px] font-bold">
                    {complaintValues.length}
                  </span>
                )}
              </div>
              <SearchableSelect
                multiple
                searchable
                allowCustom
                options={COMPLAINT_OPTIONS}
                values={complaintValues}
                onChangeValues={setComplaintValues}
                placeholder={t("searchComplaints", "Search or add a chief complaint")}
                searchPlaceholder={t("searchComplaints", "Search or add a chief complaint")}
              />
              {triage.complaint && (
                <p className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <Info className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                  {t("staffReported", "Reported by staff at triage — edit or remove as needed.")}
                </p>
              )}
            </div>

            {/* Clinical Diagnosis — one searchable selector with inline create */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.clinicalDiagnosis}
                </label>
                {diagnosisValues.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-[10px] font-bold">
                    {diagnosisValues.length}
                  </span>
                )}
              </div>
              <SearchableSelect
                multiple
                searchable
                allowCustom
                options={DIAGNOSIS_OPTIONS}
                values={diagnosisValues}
                onChangeValues={setDiagnosisValues}
                placeholder={t("searchDiagnosis", "Search or add a clinical diagnosis")}
                searchPlaceholder={t("searchDiagnosis", "Search or add a clinical diagnosis")}
              />
            </div>
          </div>
        </div>

        {/* SECTIONS 4 & 5: Diagnostics (left) + Medications (right) — half / half */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
          {/* Prescribed Medications */}
          <div className="xl:order-2 h-full p-5 sm:p-6 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--brand-primary)]/40 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl font-serif font-black text-[var(--brand-primary)]">℞</span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                    3. {t.medications}
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
              {medicines.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)]/40 text-center space-y-2.5">
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    {language === "bn" ? "কোনো ওষুধ যোগ করা হয়নি (ঐচ্ছিক)" : "No medications added yet (optional)"}
                  </p>
                </div>
              ) : (
                medicines.map((med, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-lg bg-[var(--bg-app)] border border-slate-200/90 dark:border-slate-800/90 space-y-4 hover:border-[var(--brand-border)] transition-all shadow-xs"
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

                    {/* Single-column editing — medicine identity, then dosing */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* LEFT — Medicine information */}
                      <div className="space-y-2.5 p-3.5 rounded-lg bg-[var(--bg-surface)] border border-slate-200/80 dark:border-slate-800/80">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-text)]">
                          {t("uiMedicineInformation", "Medicine information")}
                        </p>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {t.formulationLabel}
                          </label>
                          <SearchableSelect
                            size="sm"
                            options={FORMULATION_OPTIONS}
                            value={med.type}
                            placeholder={t("uiFormulationPlaceholder", "Formulation...")}
                            allowCustom
                            onChange={(val) => updateMedicine(index, "type", val)}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {t.drugBrandSearchLabel}
                          </label>
                          <SearchableSelect
                            size="sm"
                            options={catalogMedicines.filter(
                              (option) => option.badge === med.type || option.value === med.name
                            )}
                            value={med.name}
                            placeholder={t("uiSearchBrandOrGenericE")}
                            allowCustom
                            onChange={(val, opt) => handleSelectMedicineFromCatalog(index, opt || { value: val, label: val })}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {t.strengthDosageLabel}
                          </label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                            placeholder={t("uiStrengthPlaceholder", "e.g. 20mg, 500mg, 10ml")}
                            className="w-full min-h-[38px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                          />
                        </div>
                      </div>

                      {/* RIGHT — Dose & schedule selectors */}
                      <div className="space-y-2.5 p-3.5 rounded-lg bg-[var(--bg-surface)] border border-slate-200/80 dark:border-slate-800/80">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--brand-text)]">
                            {t("uiDoseScheduleInfo", "Dose & schedule")}
                          </p>
                          <span className="text-[10px] font-mono font-bold text-[var(--brand-text)]">
                            {med.frequency || t("uiNotSpecified2")}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {t.doseScheduleFrequency}
                          </label>
                          <SearchableSelect
                            size="sm"
                            searchable
                            allowCustom
                            options={FREQUENCY_PRESETS}
                            value={med.frequency}
                            placeholder={t("uiDosePlaceholder", "e.g. 1 + 0 + 1")}
                            onChange={(val) => updateMedicine(index, "frequency", val)}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {t.timingMealRelation}
                          </label>
                          <SearchableSelect
                            size="sm"
                            searchable
                            allowCustom
                            options={TIMING_PRESETS}
                            value={med.instructions}
                            placeholder={t("uiTimingPlaceholder", "e.g. 30 mins before meal")}
                            onChange={(val) => updateMedicine(index, "instructions", val)}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {t.courseDurationLabel}
                          </label>
                          <SearchableSelect
                            size="sm"
                            searchable
                            allowCustom
                            options={DURATION_PRESETS}
                            value={med.duration}
                            placeholder={t("uiDurationPlaceholder", "e.g. 7 Days")}
                            onChange={(val) => updateMedicine(index, "duration", val)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Diagnostic Lab Investigations Advised */}
          <div className="xl:order-1 h-full p-5 sm:p-6 rounded-xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
                  2. {t.diagnosticInvestigationsAdvised}
                </span>
                <p className="text-xs text-slate-500">{t.orderLabTestsDesc}</p>
              </div>
              <button
                type="button"
                onClick={() => addTest()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:opacity-95 shadow-sm transition cursor-pointer self-start sm:self-auto"
              >
                {t.addInvestigationBtn}
              </button>
            </div>

            {/* Tests List — each row uses a searchable select with inline create */}
            <div className="space-y-3">
              {tests.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)]/40 text-center space-y-2.5">
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    {language === "bn" ? "কোনো পরীক্ষা যোগ করা হয়নি (ঐচ্ছিক)" : "No diagnostic tests added yet (optional)"}
                  </p>
                </div>
              ) : (
                tests.map((test, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-lg bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[var(--brand-primary)]">#{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeTest(index)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                        title={t.remove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {t.diagnosticInvestigationsAdvised}
                        </label>
                        <SearchableSelect
                          size="sm"
                          options={catalogTests}
                          value={test.name}
                          placeholder={t.searchDiagnosticTestsPlaceholder}
                          allowCustom
                          onChange={(val) => updateTest(index, "name", val)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {t.testInstructionsPlaceholder}
                        </label>
                        <input
                          type="text"
                          value={test.instructions}
                          onChange={(e) => updateTest(index, "instructions", e.target.value)}
                          placeholder={t.testInstructionsPlaceholder}
                          className="w-full min-h-[38px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-[var(--bg-surface)] text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">

          {/* SECTION 6: Advice & Follow-Up */}
          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
              4. {t.adviceAndLifestyle}
            </span>

            <div className="grid grid-cols-1 gap-6">
              {/* Advice — one searchable selector with inline create */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.adviceAndLifestyle}
                  </label>
                  {adviceValues.length > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-[10px] font-bold">
                      {adviceValues.length}
                    </span>
                  )}
                </div>
                <SearchableSelect
                  multiple
                  searchable
                  allowCustom
                  options={ADVICE_OPTIONS}
                  values={adviceValues}
                  onChangeValues={setAdviceValues}
                  placeholder={t("searchAdvice", "Search or add lifestyle advice")}
                  searchPlaceholder={t("searchAdvice", "Search or add lifestyle advice")}
                />
              </div>

              {/* Follow-up & Notes */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.nextConsultationVisit}
                  </label>
                  <SearchableSelect
                    searchable
                    allowCustom
                    options={FOLLOWUP_PRESETS}
                    value={followUp}
                    onChange={(val) => setFollowUp(val)}
                    placeholder={t.followUpPlaceholder}
                    searchPlaceholder={t.followUpPlaceholder}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.privatePhysicianNotes}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.internalNotesPlaceholder}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)] leading-relaxed font-medium min-h-[120px] resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t("noteForPatient", "Note for Patient")}
                  </label>
                  <textarea
                    rows={2}
                    value={patientNote}
                    onChange={(e) => setPatientNote(e.target.value)}
                    placeholder={t("noteForPatientPlaceholder", "A short reassuring message for the patient...")}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-[var(--bg-app)] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[var(--brand-primary)] leading-relaxed font-medium min-h-[120px] resize-y"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t("noteForPatientHint", "This message is printed on the prescription and shared with the patient.")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 7: File Attachments */}
          <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
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
              <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-xs">{attachmentError}</div>
            )}

            {attachments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                {t.noFilesAttached}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {attachments.map((att, idx) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                      <span className="font-semibold truncate">{att.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachments((prev) => prev.filter((_, i) => i !== idx));
                        notifyToast(language === "bn" ? "সংযুক্তি সরানো হয়েছে।" : "Attachment removed.", "info");
                      }}
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="min-h-[42px] sm:min-h-[44px] px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            👁️ {t.livePreview}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[42px] sm:min-h-[44px] px-6 sm:px-8 py-2.5 rounded-lg bg-[var(--brand-primary)] text-white text-xs sm:text-sm font-black shadow-md hover:opacity-95 transition disabled:opacity-60 flex items-center gap-2 cursor-pointer"
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
      </form >

      {/* Patient Lab Reports Drawer / Modal */}
      {
        showReportsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-2xl rounded-xl bg-[var(--bg-surface)] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
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
                      className="p-4 rounded-lg bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs"
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
        )
      }

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
          name: selectedTemplate?.contentJson?.hospitalName || docHospital || "",
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
          patientNote,
          medicalHistory,
          allergies,
        }}
        medicines={medicines}
        tests={tests}
      />
    </div >
  );
}
