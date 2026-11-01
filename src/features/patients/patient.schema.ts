import { z } from "zod";

export const patientSchema = z.object({
  userId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  medicalHistory: z.string().optional(),
});

export const patientUpdateSchema = patientSchema.partial();
