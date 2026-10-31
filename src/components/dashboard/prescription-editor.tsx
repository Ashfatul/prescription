"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/common/card";

type DoctorInfo = {
  id: string;
  specialization: string;
  degrees?: string | null;
  designation?: string | null;
  hospital?: string | null;
  bmdcRegNo?: string | null;
  chamberAddress?: string | null;
  contactNumber?: string | null;
  user: {
    name: string;
    email: string;
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
};

type MedicineRow = {
  type: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type TestRow = {
  name: string;
  instructions: string;
};

const COMMON_MEDICINE_SUGGESTIONS = [
  { type: "Tab", name: "Napa Extra", dosage: "500mg+65mg", frequency: "1 + 0 + 1", duration: "5 Days", instructions: "After meal" },
  { type: "Tab", name: "Monas", dosage: "10mg", frequency: "0 + 0 + 1", duration: "1 Month", instructions: "At night" },
  { type: "Cap", name: "Maxpro", dosage: "20mg", frequency: "1 + 0 + 1", duration: "14 Days", instructions: "Before meal" },
  { type: "Tab", name: "Azithrocin", dosage: "500mg", frequency: "1 + 0 + 0", duration: "5 Days", instructions: "Before meal" },
  { type: "Syp", name: "Tofen", dosage: "100ml", frequency: "2 tsp twice daily", duration: "7 Days", instructions: "After meal" },
];

const COMMON_TEST_SUGGESTIONS = [
  "CBC with ESR",
  "Chest X-Ray P/A View",
  "Serum Creatinine",
  "Serum Lipid Profile",
  "Echocardiogram (2D & Color Doppler)",
  "HbA1c",
  "Ultrasonography of Whole Abdomen",
];

export function PrescriptionEditor({
  doctor,
  appointments = [],
  patients = [],
  onPrescriptionCreated,
}: {
  doctor: DoctorInfo;
  appointments?: AppointmentInfo[];
  patients?: PatientInfo[];
  onPrescriptionCreated?: (id: string) => void;
}) {
  // Base Template
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Doctor Header Override
  const [customizeDoctorHeader, setCustomizeDoctorHeader] = useState(false);
  const [docName, setDocName] = useState(doctor.user.name || "");
  const [docSpecialization, setDocSpecialization] = useState(doctor.specialization || "");
  const [docDegrees, setDocDegrees] = useState(doctor.degrees || "");
  const [docDesignation, setDocDesignation] = useState(doctor.designation || "");
  const [docHospital, setDocHospital] = useState(doctor.hospital || "");
  const [docRegNo, setDocRegNo] = useState(doctor.bmdcRegNo || "");
  const [docChamber, setDocChamber] = useState(doctor.chamberAddress || "");
  const [docContact, setDocContact] = useState(doctor.contactNumber || "");

  // Patient Selection
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    appointments[0]?.patientId || patients[0]?.id || "",
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(
    appointments[0]?.id || "",
  );

  // Vitals
  const [bp, setBp] = useState("120/80 mmHg");
  const [weight, setWeight] = useState("");
  const [pulse, setPulse] = useState("72 bpm");
  const [temp, setTemp] = useState("98.4 °F");

  // Clinical Details
  const [complaints, setComplaints] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  // Diagnostic Tests
  const [tests, setTests] = useState<TestRow[]>([
    { name: "CBC with ESR", instructions: "Morning sample" },
  ]);

  // Medicines (Rx)
  const [medicines, setMedicines] = useState<MedicineRow[]>([
    {
      type: "Tab",
      name: "Napa Extra",
      dosage: "500mg + 65mg",
      frequency: "1 + 0 + 1",
      duration: "5 Days",
      instructions: "After meal",
    },
  ]);

  // Advice & Follow-Up
  const [advice, setAdvice] = useState("Drink plenty of boiled water. Take adequate bed rest. Avoid cold foods.");
  const [followUp, setFollowUp] = useState("After 7 days with investigation reports");
  const [notes, setNotes] = useState("");

  // State
  const [submitting, setSubmitting] = useState(false);
  const [createdPrescriptionId, setCreatedPrescriptionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/templates");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTemplates(json.data);
          const defaultTpl = json.data.find((t: TemplateOption) => t.isDefault) || json.data[0];
          if (defaultTpl) {
            setSelectedTemplateId(defaultTpl.id);
          }
        }
      } catch (e) {
        console.error("Failed to load templates", e);
      }
    };
    void fetchTemplates();
  }, []);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    const appt = appointments.find((a) => a.patientId === patientId);
    setSelectedAppointmentId(appt?.id || "");
  };

  const addMedicine = (preset?: Partial<MedicineRow>) => {
    setMedicines((prev) => [
      ...prev,
      {
        type: preset?.type || "Tab",
        name: preset?.name || "",
        dosage: preset?.dosage || "",
        frequency: preset?.frequency || "1 + 0 + 1",
        duration: preset?.duration || "7 Days",
        instructions: preset?.instructions || "After meal",
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

  const removeMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const addTest = (name = "", instructions = "") => {
    setTests((prev) => [...prev, { name, instructions }]);
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
        bp,
        weight,
        pulse,
        temp,
      },
      clinicalInfo: {
        complaints,
        diagnosis,
        advice,
        followUp,
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
      },
      notes,
    };

    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to create prescription.");
        return;
      }

      setCreatedPrescriptionId(data.data.id);
      onPrescriptionCreated?.(data.data.id);
    } catch {
      setSubmitting(false);
      setErrorMessage("Network error while creating prescription.");
    }
  };

  const resetForm = () => {
    setCreatedPrescriptionId(null);
    setMedicines([
      {
        type: "Tab",
        name: "Napa Extra",
        dosage: "500mg + 65mg",
        frequency: "1 + 0 + 1",
        duration: "5 Days",
        instructions: "After meal",
      },
    ]);
    setTests([{ name: "CBC with ESR", instructions: "Morning sample" }]);
    setComplaints("");
    setDiagnosis("");
    setNotes("");
  };

  return (
    <Card className="h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Professional Prescription Generator
          </h2>
          <p className="text-xs text-zinc-500">
            Create comprehensive medical prescriptions with doctor credentials, patient vitals, diagnosis, medicines (Rx), tests, and lifestyle advice.
          </p>
        </div>

        {templates.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              Template:
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} {tpl.isDefault ? "(Default)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {createdPrescriptionId && (
        <div className="my-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/70 p-5 dark:border-emerald-700 dark:bg-emerald-950/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                ✓ Prescription Generated Successfully
              </span>
              <h3 className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
                Ready for Print, Export, or Patient Sharing
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Prescription ID: <code className="font-mono font-semibold">{createdPrescriptionId}</code>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/prescriptions/${createdPrescriptionId}/print`}
                target="_blank"
                className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-teal-700"
              >
                <span>🖨️ View & Print Prescription</span>
              </Link>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                + New Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="my-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-6">
        {/* Section 1: Doctor Header Customizer */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                1. Doctor & Hospital Header (Pre-filled from Profile)
              </span>
              <p className="text-xs text-zinc-500">
                {docHospital ? `${docHospital} • ` : ""}
                {docName} ({docDegrees || docSpecialization})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCustomizeDoctorHeader(!customizeDoctorHeader)}
              className="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
            >
              {customizeDoctorHeader ? "Hide Header Editor" : "✎ Modify Header for this Prescription"}
            </button>
          </div>

          {customizeDoctorHeader && (
            <div className="mt-4 grid gap-3 border-t border-zinc-200/80 pt-3 sm:grid-cols-2 dark:border-zinc-800/80">
              <div>
                <label className="mb-1 block text-xs font-semibold">Doctor Name</label>
                <input
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Hospital / Organization</label>
                <input
                  value={docHospital}
                  onChange={(e) => setDocHospital(e.target.value)}
                  placeholder="Hospital name"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Designation</label>
                <input
                  value={docDesignation}
                  onChange={(e) => setDocDesignation(e.target.value)}
                  placeholder="e.g. Senior Consultant"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Degrees & Qualifications</label>
                <input
                  value={docDegrees}
                  onChange={(e) => setDocDegrees(e.target.value)}
                  placeholder="MBBS, FCPS..."
                  className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">BMDC Reg No</label>
                <input
                  value={docRegNo}
                  onChange={(e) => setDocRegNo(e.target.value)}
                  placeholder="BMDC-A-..."
                  className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Specialization</label>
                <input
                  value={docSpecialization}
                  onChange={(e) => setDocSpecialization(e.target.value)}
                  placeholder="e.g. Cardiology"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Chamber / Consultation Room</label>
                <input
                  value={docChamber}
                  onChange={(e) => setDocChamber(e.target.value)}
                  placeholder="e.g. Room 204"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Appointment / Chamber Phone</label>
                <input
                  value={docContact}
                  onChange={(e) => setDocContact(e.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Patient Selection & Vitals */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            2. Patient Information & Vitals
          </span>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Select Patient / Appointment *</label>
              <select
                required
                value={selectedPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="">-- Choose Patient --</option>
                {appointments.map((appt) => (
                  <option key={appt.id} value={appt.patientId}>
                    #{appt.serialNumber} - {appt.patient.user.name} ({appt.patient.user.email})
                  </option>
                ))}
                {patients.length > 0 &&
                  patients
                    .filter((p) => !appointments.some((a) => a.patientId === p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.user.name} ({p.user.email})
                      </option>
                    ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  BP (mmHg)
                </label>
                <input
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  placeholder="120/80"
                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Weight (kg)
                </label>
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="65 kg"
                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Pulse (bpm)
                </label>
                <input
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  placeholder="72 bpm"
                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Temp (°F)
                </label>
                <input
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  placeholder="98.6 °F"
                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Clinical Complaints & Diagnosis */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            3. Clinical Complaints & Diagnosis
          </span>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Chief Complaints / Symptoms</label>
              <textarea
                rows={2}
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
                placeholder="e.g. High fever for 3 days, dry hacking cough, headache..."
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Clinical Findings / Diagnosis</label>
              <textarea
                rows={2}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Viral Pharyngitis / Mild Bronchial Asthma..."
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Investigations & Tests Advised */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              4. Investigations / Diagnostic Tests Advised
            </span>
            <button
              type="button"
              onClick={() => addTest()}
              className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
            >
              + Add Another Test
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-zinc-400">Quick add:</span>
            {COMMON_TEST_SUGGESTIONS.slice(0, 5).map((testName) => (
              <button
                key={testName}
                type="button"
                onClick={() => addTest(testName, "Morning sample")}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 transition hover:bg-teal-100 hover:text-teal-800 dark:bg-zinc-800 dark:text-zinc-300"
              >
                + {testName}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {tests.map((test, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-2 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span className="w-6 text-center text-xs font-bold text-zinc-400">
                  {index + 1}.
                </span>
                <input
                  value={test.name}
                  onChange={(e) => updateTest(index, "name", e.target.value)}
                  placeholder="Test Name (e.g. CBC, Serum Creatinine)"
                  className="flex-1 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />
                <input
                  value={test.instructions}
                  onChange={(e) => updateTest(index, "instructions", e.target.value)}
                  placeholder="Instructions (e.g. Fasting 10 hrs)"
                  className="w-1/3 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => removeTest(index)}
                  className="rounded-lg p-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  title="Remove Test"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Medicines (Rx Section) */}
        <div className="rounded-2xl border-2 border-teal-600/30 bg-white p-4 shadow-sm dark:border-teal-700/30 dark:bg-zinc-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-serif text-teal-700 dark:text-teal-400">
                ℞
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                5. Prescribed Medicines
              </span>
            </div>
            <button
              type="button"
              onClick={() => addMedicine()}
              className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-teal-700"
            >
              + Add Medicine
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-zinc-400">Quick add:</span>
            {COMMON_MEDICINE_SUGGESTIONS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => addMedicine(preset)}
                className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-700 transition hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300"
              >
                + {preset.type}. {preset.name} ({preset.dosage})
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-3">
            {medicines.map((med, index) => (
              <div
                key={index}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                    Medicine #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMedicine(index)}
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-6">
                  <div className="sm:col-span-1">
                    <label className="mb-0.5 block text-[10px] font-semibold text-zinc-500">
                      Type
                    </label>
                    <select
                      value={med.type}
                      onChange={(e) => updateMedicine(index, "type", e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <option value="Tab">Tab.</option>
                      <option value="Cap">Cap.</option>
                      <option value="Syp">Syp.</option>
                      <option value="Inj">Inj.</option>
                      <option value="Drop">Drop</option>
                      <option value="Ointment">Oint.</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Spray">Spray</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-0.5 block text-[10px] font-semibold text-zinc-500">
                      Medicine Name *
                    </label>
                    <input
                      required
                      value={med.name}
                      onChange={(e) => updateMedicine(index, "name", e.target.value)}
                      placeholder="e.g. Napa Extra"
                      className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="mb-0.5 block text-[10px] font-semibold text-zinc-500">
                      Dosage / Strength
                    </label>
                    <input
                      value={med.dosage}
                      onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                      placeholder="e.g. 500mg"
                      className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="mb-0.5 block text-[10px] font-semibold text-zinc-500">
                      Frequency
                    </label>
                    <input
                      value={med.frequency}
                      onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                      placeholder="1 + 0 + 1"
                      className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="mb-0.5 block text-[10px] font-semibold text-zinc-500">
                      Duration
                    </label>
                    <input
                      value={med.duration}
                      onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                      placeholder="7 Days"
                      className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="mb-0.5 block text-[10px] font-semibold text-zinc-500">
                    Timing & Patient Instructions
                  </label>
                  <input
                    value={med.instructions}
                    onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
                    placeholder="e.g. After meal, with plenty of water"
                    className="w-full rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Advice & Follow-Up */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            6. Lifestyle Advice & Follow-Up
          </span>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Special Advice / Precautions</label>
              <textarea
                rows={2}
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="Dietary precautions, lifestyle, physical activity..."
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Follow-Up / Next Visit</label>
              <input
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder="e.g. After 7 days / On 15th November"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />

              <label className="mt-2 mb-1 block text-xs font-semibold">Internal Notes (Optional)</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional private notes for patient file..."
                className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting ? "Generating Prescription..." : "✓ Generate & Save Professional Prescription"}
          </button>
        </div>
      </form>
    </Card>
  );
}
