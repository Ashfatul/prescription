"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  Users,
  Clock,
  Printer,
  XCircle,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Activity,
  HeartPulse,
} from "lucide-react";
import { PublicDoctorItem } from "@/components/appointments/appointment-booking-modal";
import { CustomSelect } from "@/components/common/custom-select";

const inputClasses =
  "w-full px-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]";

interface PatientRecord {
  id: string;
  userId: string;
  gender?: string | null;
  medicalHistory?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

interface AppointmentRecord {
  id: string;
  serialNumber: number;
  appointmentDate: string;
  status: "BOOKED" | "COMPLETED" | "CANCELLED";
  notes?: string | null;
  doctor: {
    id: string;
    specialization: string;
    chamberAddress?: string | null;
    user: {
      name: string;
    };
  };
  patient: {
    id: string;
    gender?: string | null;
    user: {
      name: string;
      phone?: string | null;
      email: string;
    };
  };
}

export function ReceptionManager() {
  // Navigation tabs within Reception
  const [activeTab, setActiveTab] = useState<"checkin" | "queue" | "patients">("checkin");

  // Dependencies
  const [doctors, setDoctors] = useState<PublicDoctorItem[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);

  // Check-in Form State
  const [patientMode, setPatientMode] = useState<"walkin" | "existing">("walkin");
  const [searchPatientQuery, setSearchPatientQuery] = useState("");
  const [selectedExistingPatientId, setSelectedExistingPatientId] = useState("");

  // Walk-in fields
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinGender, setWalkinGender] = useState("Male");
  const [walkinAge, setWalkinAge] = useState("");
  const [walkinHistory, setWalkinHistory] = useState("");

  // Triage vitals
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [bp, setBp] = useState("120/80 mmHg");
  const [pulse, setPulse] = useState("76 bpm");
  const [temp, setTemp] = useState("98.6 °F");
  const [weight, setWeight] = useState("");
  const [complaint, setComplaint] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [issuedTicket, setIssuedTicket] = useState<AppointmentRecord | null>(null);

  // Queue filter
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [queueSearch, setQueueSearch] = useState("");

  // Reusable refresh function
  const loadData = useCallback(async () => {
    try {
      const [docRes, patRes, apptRes] = await Promise.all([
        fetch("/api/public/doctors"),
        fetch("/api/patients"),
        fetch("/api/appointments"),
      ]);

      const [docData, patData, apptData] = await Promise.all([
        docRes.json(),
        patRes.json(),
        apptRes.json(),
      ]);

      if (docData.success && Array.isArray(docData.data)) {
        setDoctors(docData.data);
      }

      if (patData.success && Array.isArray(patData.data)) {
        setPatients(patData.data);
      }

      if (apptData.success && Array.isArray(apptData.data)) {
        setAppointments(apptData.data);
      }
    } catch (err) {
      console.error("Failed to refresh reception data", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let active = true;

    async function initFetch() {
      try {
        const [docRes, patRes, apptRes] = await Promise.all([
          fetch("/api/public/doctors"),
          fetch("/api/patients"),
          fetch("/api/appointments"),
        ]);

        const [docData, patData, apptData] = await Promise.all([
          docRes.json(),
          patRes.json(),
          apptRes.json(),
        ]);

        if (!active) return;

        if (docData.success && Array.isArray(docData.data)) {
          setDoctors(docData.data);
          if (docData.data.length > 0) {
            setSelectedDoctorId((prev) => prev || docData.data[0].id);
          }
        }

        if (patData.success && Array.isArray(patData.data)) {
          setPatients(patData.data);
        }

        if (apptData.success && Array.isArray(apptData.data)) {
          setAppointments(apptData.data);
        }
      } catch (err) {
        console.error("Failed to load reception desk data", err);
      }
    }

    void initFetch();

    return () => {
      active = false;
    };
  }, []);

  // Filtered patients for search in existing mode
  const filteredExistingPatients = useMemo(() => {
    if (!searchPatientQuery.trim()) return patients.slice(0, 8);
    const q = searchPatientQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.user.name.toLowerCase().includes(q) ||
        (p.user.phone && p.user.phone.toLowerCase().includes(q)) ||
        p.user.email.toLowerCase().includes(q)
    );
  }, [patients, searchPatientQuery]);

  // Today's appointments
  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return appointments.filter((a) => {
      const aDate = new Date(a.appointmentDate).toISOString().split("T")[0];
      const matchesDate = aDate === today;
      const matchesDoc = doctorFilter === "all" || a.doctor.id === doctorFilter;
      const matchesQuery =
        !queueSearch.trim() ||
        a.patient.user.name.toLowerCase().includes(queueSearch.toLowerCase()) ||
        String(a.serialNumber).includes(queueSearch);

      return matchesDate && matchesDoc && matchesQuery;
    });
  }, [appointments, doctorFilter, queueSearch]);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setErrorMsg("Please select a consulting doctor.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      let patientId = selectedExistingPatientId;

      // 1. If Walk-in, register patient record first
      if (patientMode === "walkin") {
        if (!walkinName.trim()) {
          throw new Error("Patient name is required for walk-in registration.");
        }

        const patRes = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: walkinName.trim(),
            phone: walkinPhone.trim() || undefined,
            gender: walkinGender,
            medicalHistory: walkinHistory.trim()
              ? `Age: ${walkinAge || "N/A"} | History: ${walkinHistory.trim()}`
              : walkinAge
              ? `Age: ${walkinAge}`
              : undefined,
          }),
        });

        const patJson = await patRes.json();
        if (!patRes.ok || !patJson.success) {
          throw new Error(patJson.message || "Failed to register walk-in patient");
        }

        patientId = patJson.data.id;
      }

      if (!patientId) {
        throw new Error("Please select or register a patient.");
      }

      // 2. Prepare notes bundle with Triage Vitals
      const triageNotes = [
        complaint.trim() ? `Complaint: ${complaint.trim()}` : null,
        `Vitals - BP: ${bp || "N/A"}, Pulse: ${pulse || "N/A"}, Temp: ${temp || "N/A"}, Wt: ${weight || "N/A"}`,
      ]
        .filter(Boolean)
        .join(" | ");

      // 3. Issue Appointment Serial Ticket
      const todayIso = new Date().toISOString();
      const apptRes = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          patientId,
          appointmentDate: todayIso,
          notes: triageNotes,
        }),
      });

      const apptJson = await apptRes.json();
      if (!apptRes.ok || !apptJson.success) {
        throw new Error(apptJson.message || "Failed to issue queue serial ticket");
      }

      setIssuedTicket(apptJson.data);
      // Reset form
      setWalkinName("");
      setWalkinPhone("");
      setWalkinAge("");
      setWalkinHistory("");
      setComplaint("");
      void loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error during patient check-in";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: "COMPLETED" | "CANCELLED") => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        void loadData();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Counters */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-surface)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-bold uppercase tracking-wider">
            <HeartPulse className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            Front Desk & Patient Triage
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 leading-tight">
            Clinic Reception Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Quick walk-in patient check-in, pre-consultation vitals recording, queue token issuance, and live chamber schedule board.
          </p>
        </div>

        {/* Quick Stats Chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 text-xs">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Today&apos;s Serials</span>
            <span className="text-base font-extrabold text-[var(--brand-text)]">{todayAppointments.length}</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 text-xs">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Active Doctors</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">{doctors.length}</span>
          </div>
        </div>
      </div>

      {/* Reception Nav Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-xs max-w-fit">
        {[
          { id: "checkin", label: "Fast Check-In & Ticket", icon: Plus },
          { id: "queue", label: "Today's Live Queue Board", icon: Clock },
          { id: "patients", label: "Patient Directory", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. FAST CHECK-IN & QUEUE TICKET DISPENSER */}
      {activeTab === "checkin" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Form (8 Cols) */}
          <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Patient Intake & Serial Dispenser
                </h2>
                <p className="text-xs text-slate-500">Record patient details, pre-vitals, and issue token ticket</p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPatientMode("walkin")}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    patientMode === "walkin" ? "bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white" : "text-slate-500"
                  }`}
                >
                  Walk-In New
                </button>
                <button
                  type="button"
                  onClick={() => setPatientMode("existing")}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    patientMode === "existing" ? "bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white" : "text-slate-500"
                  }`}
                >
                  Existing Patient
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCheckInSubmit} className="space-y-5">
              {/* Patient Intake Fields */}
              {patientMode === "walkin" ? (
                <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-3.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    1. Walk-In Patient Information
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nusrat Jahan"
                        value={walkinName}
                        onChange={(e) => setWalkinName(e.target.value)}
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +880 1711-000000"
                        value={walkinPhone}
                        onChange={(e) => setWalkinPhone(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Gender
                      </label>
                      <CustomSelect
                        value={walkinGender}
                        onChange={(val) => setWalkinGender(val)}
                        options={[
                          { value: "Male", label: "Male" },
                          { value: "Female", label: "Female" },
                          { value: "Other", label: "Other" },
                        ]}
                        searchable={false}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 34"
                        value={walkinAge}
                        onChange={(e) => setWalkinAge(e.target.value)}
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Known History / Comorbidities / Allergies
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Diabetic, HTN, Penicillin allergy"
                        value={walkinHistory}
                        onChange={(e) => setWalkinHistory(e.target.value)}
                        className={inputClasses}
                      />
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {["Diabetic", "HTN", "Asthma", "Heart Disease", "NKDA"].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() =>
                              setWalkinHistory((prev) =>
                                prev ? `${prev}, ${chip}` : chip
                              )
                            }
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] cursor-pointer transition"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Existing Patient Search Mode */
                <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    1. Search & Select Existing Patient Record
                  </span>

                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Type name, phone, or email to search..."
                      value={searchPatientQuery}
                      onChange={(e) => setSearchPatientQuery(e.target.value)}
                      className="w-full input-icon-left !pl-11 pr-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {filteredExistingPatients.map((p) => {
                      const isSelected = selectedExistingPatientId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedExistingPatientId(p.id)}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition cursor-pointer ${
                            isSelected
                              ? "bg-[var(--brand-surface)] border-[var(--brand-primary)] text-[var(--brand-text)] font-bold shadow-2xs"
                              : "border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div>
                            <span className="font-bold">{p.user.name}</span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              {p.user.phone || p.user.email}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-semibold text-slate-400">
                            {p.gender || "Patient"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Doctor Queue Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  2. Select Consulting Physician & Chamber
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1">
                  {doctors.map((doc) => {
                    const isSelected = selectedDoctorId === doc.id;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedDoctorId(doc.id)}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer ${
                          isSelected
                            ? "bg-[var(--brand-surface)] border-[var(--brand-primary)] text-[var(--brand-text)] shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                          {doc.imageUrl ? (
                            <Image src={doc.imageUrl} alt={doc.name} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                              Dr.
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs truncate text-slate-900 dark:text-white">
                            {doc.name}
                          </p>
                          <p className="text-[11px] text-[var(--brand-text)] font-medium truncate">
                            {doc.specialization}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {doc.chamberAddress || "Chamber 301"} • Serial #{doc.currentSerial || "1"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Pre-Consultation Vitals & Complaints */}
              <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  3. Pre-Consultation Triage Vitals
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      BP (mmHg)
                    </label>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      placeholder="120/80"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Pulse (bpm)
                    </label>
                    <input
                      type="text"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      placeholder="76"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Temp (°F)
                    </label>
                    <input
                      type="text"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      placeholder="98.6"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="65"
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Primary Symptoms / Chief Complaint
                  </label>
                  <input
                    type="text"
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="e.g. High fever for 2 days with sore throat and dry cough..."
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submitting ? "Issuing Ticket..." : "Check In & Dispense Queue Ticket"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Live Ticket Preview (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Issued Ticket
                </h3>
                {issuedTicket && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                )}
              </div>

              {issuedTicket ? (
                <div className="p-5 rounded-2xl bg-[var(--brand-surface)] border-2 border-[var(--brand-primary)]/40 text-center space-y-3 print:bg-white print:border-black">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text)] block">
                      Queue Ticket Issued
                    </span>
                    <span className="text-4xl font-black text-[var(--brand-primary)]">
                      #{issuedTicket.serialNumber}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[var(--brand-primary)]/20 text-left text-xs space-y-1.5">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Patient: {issuedTicket.patient.user.name}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Doctor: {issuedTicket.doctor.user.name} ({issuedTicket.doctor.specialization})
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Chamber: {issuedTicket.doctor.chamberAddress || "OPD Room 301"}
                    </p>
                    {issuedTicket.notes && (
                      <p className="text-slate-600 dark:text-slate-400 text-[10px] pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                        {issuedTicket.notes}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Activity className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No Ticket Dispensed Yet</p>
                  <p className="text-[11px]">Complete the intake form to generate the next serial ticket.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. TODAY'S LIVE QUEUE BOARD */}
      {activeTab === "queue" && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Today&apos;s Active Consultation Queue
              </h2>
              <p className="text-xs text-slate-500">Live patient turn tracker across all consulting chambers</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-56">
                <CustomSelect
                  value={doctorFilter}
                  onChange={(val) => setDoctorFilter(val)}
                  options={[
                    { value: "all", label: "All Doctors" },
                    ...doctors.map((d) => ({
                      value: d.id,
                      label: `${d.name} (${d.specialization})`,
                    })),
                  ]}
                  placeholder="Filter by doctor..."
                />
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter serial # or patient..."
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  className="!pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Serial #</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Consulting Doctor</th>
                  <th className="py-2.5 px-3">Triage Notes / Vitals</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {todayAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No patients registered in queue for today yet.
                    </td>
                  </tr>
                ) : (
                  todayAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                      <td className="py-3 px-3 font-mono font-black text-sm text-[var(--brand-primary)]">
                        #{appt.serialNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {appt.patient.user.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {appt.patient.user.phone || appt.patient.user.email}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {appt.doctor.user.name}
                        </span>
                        <span className="text-[11px] text-[var(--brand-text)]">
                          {appt.doctor.specialization} ({appt.doctor.chamberAddress || "Room 301"})
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate text-[11px] text-slate-500">
                        {appt.notes || "Standard Intake"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            appt.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : appt.status === "CANCELLED"
                              ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {appt.status === "BOOKED" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(appt.id, "COMPLETED")}
                                title="Mark Consulted"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold cursor-pointer"
                              >
                                ✓ Done
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(appt.id, "CANCELLED")}
                                title="Cancel Ticket"
                                className="p-1 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PATIENTS DIRECTORY */}
      {activeTab === "patients" && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Registered Patients Directory
              </h2>
              <p className="text-xs text-slate-500">All hospital patients recorded in the system</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {patients.length} Registered
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {patients.map((pat) => (
              <div
                key={pat.id}
                className="p-4 rounded-2xl bg-[var(--bg-app)] border border-slate-200/80 dark:border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {pat.user.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                    {pat.gender || "Patient"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Phone: {pat.user.phone || "Not recorded"}
                </p>
                <p className="text-[11px] text-slate-400">
                  Email: {pat.user.email}
                </p>
                {pat.medicalHistory && (
                  <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800 truncate">
                    Notes: {pat.medicalHistory}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
