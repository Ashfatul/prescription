"use client";

import { FormEvent, useState } from "react";

export function QuickPrescriptionForm({
  doctorId,
  patientId,
  onSuccess,
}: {
  doctorId: string;
  patientId: string;
  onSuccess?: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [medicine, setMedicine] = useState("Napa");
  const [dosage, setDosage] = useState("500mg");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
        patientId,
        notes,
        medicines: [{ name: medicine, dosage, instructions: "After meal" }],
        tests: [],
      }),
    });

    setSaving(false);
    setNotes("");
    onSuccess?.();
  };

  return (
    <form className="space-y-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800" onSubmit={onSubmit}>
      <h4 className="text-sm font-semibold">Quick Prescription</h4>
      <input
        className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        value={medicine}
        onChange={(e) => setMedicine(e.target.value)}
        placeholder="Medicine name"
      />
      <input
        className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        value={dosage}
        onChange={(e) => setDosage(e.target.value)}
        placeholder="Dosage"
      />
      <textarea
        className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
      />
      <button className="rounded-lg bg-teal-600 px-3 py-1 text-sm text-white" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Create"}
      </button>
    </form>
  );
}
