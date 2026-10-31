import { notFound } from "next/navigation";
import { db } from "@/lib/db";

type Params = { id: string };

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
    },
  });

  if (!prescription) {
    notFound();
  }

  const medicines = (prescription.medicinesJson as Array<Record<string, string>>) || [];
  const tests = (prescription.testsJson as Array<Record<string, string>>) || [];

  return (
    <main className="mx-auto max-w-3xl bg-white p-8 text-black print:p-3">
      <header className="border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold">Prescription</h1>
        <p className="mt-2 text-sm">Doctor: {prescription.doctor.user.name}</p>
        <p className="text-sm">Specialization: {prescription.doctor.specialization}</p>
        <p className="text-sm">Patient: {prescription.patient.user.name}</p>
      </header>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Medicines</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {medicines.map((med, idx) => (
            <li key={`${med.name}-${idx}`}>
              {med.name} - {med.dosage} {med.instructions ? `(${med.instructions})` : ""}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Tests</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {tests.map((test, idx) => (
            <li key={`${test.name}-${idx}`}>
              {test.name} {test.instructions ? `(${test.instructions})` : ""}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Notes</h2>
        <p className="mt-2 text-sm">{prescription.notes || "No notes"}</p>
      </section>
    </main>
  );
}
