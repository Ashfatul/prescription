import { z } from "zod";

export const patientSchema = z.object({
  userId: z.string().min(1),
  gender: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  medicalHistory: z.string().optional(),
});

export const patientUpdateSchema = patientSchema.partial();
