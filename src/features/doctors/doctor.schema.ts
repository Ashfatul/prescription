import { z } from "zod";

export const doctorSchema = z.object({
  userId: z.string().min(1),
  specialization: z.string().min(2),
  degrees: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  hospital: z.string().optional().nullable(),
  bmdcRegNo: z.string().optional().nullable(),
  chamberAddress: z.string().optional().nullable(),
  contactNumber: z.string().optional().nullable(),
  scheduleJson: z.record(z.string(), z.unknown()).optional().nullable(),
  available: z.boolean().optional(),
});

export const doctorUpdateSchema = doctorSchema.partial();
