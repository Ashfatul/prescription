import { z } from "zod";

export const medicineSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  dosage: z.string().min(1),
  instructions: z.string().optional(),
});

export const testSchema = z.object({
  name: z.string().min(1),
  instructions: z.string().optional(),
});
