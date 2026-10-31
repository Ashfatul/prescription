import { z } from "zod";

export const doctorSchema = z.object({
  userId: z.string().min(1),
  specialization: z.string().min(2),
  scheduleJson: z.record(z.string(), z.unknown()).optional(),
  available: z.boolean().optional(),
});

export const doctorUpdateSchema = doctorSchema.partial();
