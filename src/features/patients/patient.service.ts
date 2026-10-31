import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { patientSchema, patientUpdateSchema } from "@/features/patients/patient.schema";

export async function listPatients() {
  return db.patient.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPatient(input: unknown) {
  const data = patientSchema.parse(input);
  return db.patient.create({
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    },
    include: { user: true },
  });
}

export async function updatePatient(id: string, input: unknown) {
  const data = patientUpdateSchema.parse(input);
  const existing = await db.patient.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Patient not found", 404);
  }

  return db.patient.update({
    where: { id },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    },
    include: { user: true },
  });
}

export async function deletePatient(id: string) {
  await db.patient.delete({ where: { id } });
  return { deleted: true };
}
