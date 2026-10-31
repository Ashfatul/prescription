"use client";

import { FormEvent, useState } from "react";
import { Card } from "@/components/common/card";

type DoctorProfile = {
  id: string;
  specialization: string;
  degrees?: string | null;
  designation?: string | null;
  hospital?: string | null;
  bmdcRegNo?: string | null;
  chamberAddress?: string | null;
  contactNumber?: string | null;
  available: boolean;
  user: {
    name: string;
    email: string;
    phone?: string | null;
  };
};

export function DoctorProfileEditor({
  doctor,
  onSaved,
}: {
  doctor: DoctorProfile;
  onSaved?: (updated: Partial<DoctorProfile>) => void;
}) {
  const [specialization, setSpecialization] = useState(doctor.specialization || "");
  const [degrees, setDegrees] = useState(doctor.degrees || "");
  const [designation, setDesignation] = useState(doctor.designation || "");
  const [hospital, setHospital] = useState(doctor.hospital || "");
  const [bmdcRegNo, setBmdcRegNo] = useState(doctor.bmdcRegNo || "");
  const [chamberAddress, setChamberAddress] = useState(doctor.chamberAddress || "");
  const [contactNumber, setContactNumber] = useState(doctor.contactNumber || "");
  const [available, setAvailable] = useState(doctor.available);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/doctors/${doctor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialization,
          degrees,
          designation,
          hospital,
          bmdcRegNo,
          chamberAddress,
          contactNumber,
          available,
        }),
      });

      const data = await res.json();
      setSaving(false);

      if (!res.ok || !data.success) {
        setMessage({ type: "error", text: data.message || "Failed to update profile." });
        return;
      }

      setMessage({ type: "success", text: "Doctor profile updated successfully! Prescriptions will now use these updated details." });
      onSaved?.({
        specialization,
        degrees,
        designation,
        hospital,
        bmdcRegNo,
        chamberAddress,
        contactNumber,
        available,
      });
    } catch {
      setSaving(false);
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Professional Profile & Hospital Affiliation
          </h3>
          <p className="text-xs text-zinc-500">
            These details automatically pre-fill your prescription headers and printouts.
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            available
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          }`}
        >
          {available ? "● Accepting Patients" : "○ Currently Away"}
        </span>
      </div>

      {message && (
        <div
          className={`mt-4 rounded-xl p-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Doctor Name (Registered)
            </label>
            <input
              disabled
              value={doctor.user.name}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Medical Specialization *
            </label>
            <input
              required
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Internal Medicine, Cardiology"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Hospital / Organization Working For *
            </label>
            <input
              required
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="e.g. Metropolitan Specialized Hospital"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Professional Designation
            </label>
            <input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Senior Consultant / Associate Professor"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Degrees & Qualifications
            </label>
            <input
              value={degrees}
              onChange={(e) => setDegrees(e.target.value)}
              placeholder="e.g. MBBS, FCPS (Medicine), MD (Cardiology)"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              BMDC / Medical Registration Number
            </label>
            <input
              value={bmdcRegNo}
              onChange={(e) => setBmdcRegNo(e.target.value)}
              placeholder="e.g. BMDC-A-41285"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Chamber / Consultation Room
            </label>
            <input
              value={chamberAddress}
              onChange={(e) => setChamberAddress(e.target.value)}
              placeholder="e.g. Room 301, 3rd Floor, West Wing"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Appointment / Chamber Phone
            </label>
            <input
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g. +880 1711-234567"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Available for live serial queue & consultation</span>
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-70"
          >
            {saving ? "Saving Profile..." : "Save Professional Profile"}
          </button>
        </div>
      </form>
    </Card>
  );
}
