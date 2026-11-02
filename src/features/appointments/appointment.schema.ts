import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

export const appointmentSchema = z.object({
  doctorId: z.string().min(1),
  patientId: z.string().min(1).optional(),
  appointmentDate: z.string().min(1),
  notes: z.string().optional(),
  visitType: z.enum(["NEW", "FOLLOWUP", "REPORT_REVIEW"]).optional(),
  fee: z.number().optional(),
  paymentMethod: z.enum(["STRIPE", "CASH", "CARD_POS", "WAIVED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "WAIVED"]).optional(),
  stripeSessionId: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
  previousPrescriptionId: z.string().optional().nullable(),
  diseases: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medicalFlags: z.array(z.string()).optional(),
  dietRequired: z.boolean().optional(),
  dietInstructions: z.array(z.string()).optional(),
  dietNotes: z.string().optional(),
});

export const appointmentUpdateSchema = z.object({
  status: z.enum(AppointmentStatus).optional(),
  notes: z.string().optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "WAIVED"]).optional(),
  paymentMethod: z.enum(["STRIPE", "CASH", "CARD_POS", "WAIVED"]).optional(),
  refundStatus: z.string().optional(),
  refundAmount: z.number().optional(),
  refundReason: z.string().optional(),
  cancellationReason: z.string().optional(),
  cancelledByRole: z.string().optional(),
  verifiedAt: z.string().or(z.date()).optional().nullable(),
  verifiedBy: z.string().optional().nullable(),
  verificationNotes: z.string().optional().nullable(),
});

export const appointmentCancelSchema = z.object({
  reason: z.string().optional(),
  refundChoice: z.enum(["FULL", "NONE", "CUSTOM"]).optional(),
  refundAmount: z.number().optional(),
});

export const appointmentConfirmSchema = z.object({
  verificationNotes: z.string().optional(),
  paymentMethod: z.enum(["STRIPE", "CASH", "CARD_POS", "WAIVED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "WAIVED"]).optional(),
});
