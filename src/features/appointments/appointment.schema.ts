import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

export const appointmentSchema = z.object({
  doctorId: z.string().min(1),
  patientId: z.string().min(1).optional(),
  appointmentDate: z.string().min(1),
  notes: z.string().optional(),
});

export const appointmentUpdateSchema = z.object({
  status: z.enum(AppointmentStatus).optional(),
  notes: z.string().optional(),
});
