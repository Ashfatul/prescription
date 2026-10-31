import { z } from "zod";

const medicineItem = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  instructions: z.string().optional(),
});

const testItem = z.object({
  name: z.string().min(1),
  instructions: z.string().optional(),
});

export const prescriptionSchema = z.object({
  doctorId: z.string().min(1),
  patientId: z.string().min(1),
  appointmentId: z.string().optional(),
  notes: z.string().optional(),
  medicines: z.array(medicineItem).min(1),
  tests: z.array(testItem).default([]),
  templateId: z.string().optional(),
  attachmentIds: z.array(z.string()).default([]),
});

export const prescriptionUpdateSchema = prescriptionSchema.partial();
