import { z } from "zod";

const medicineItem = z.object({
  type: z.string().default("Tab"),
  name: z.string().min(1),
  dosage: z.string().default(""),
  frequency: z.string().optional(),
  instructions: z.string().optional(),
  duration: z.string().optional(),
});

const testItem = z.object({
  name: z.string().min(1),
  instructions: z.string().optional(),
});

const vitalsSchema = z
  .object({
    bp: z.string().optional(),
    weight: z.string().optional(),
    pulse: z.string().optional(),
    temp: z.string().optional(),
    bloodSugar: z.string().optional(),
    spo2: z.string().optional(),
  })
  .optional();

const clinicalInfoSchema = z
  .object({
    complaints: z.string().optional(),
    diagnosis: z.string().optional(),
    advice: z.string().optional(),
    followUp: z.string().optional(),
    medicalHistory: z.string().optional(),
    allergies: z.string().optional(),
  })
  .optional();

const doctorOverrideSchema = z
  .object({
    doctorName: z.string().optional(),
    specialization: z.string().optional(),
    degrees: z.string().optional(),
    designation: z.string().optional(),
    hospital: z.string().optional(),
    bmdcRegNo: z.string().optional(),
    chamberAddress: z.string().optional(),
    contactNumber: z.string().optional(),
  })
  .optional();

export const prescriptionSchema = z.object({
  doctorId: z.string().min(1),
  patientId: z.string().min(1),
  appointmentId: z.string().optional(),
  notes: z.string().optional(),
  medicines: z.array(medicineItem).min(1),
  tests: z.array(testItem).default([]),
  vitals: vitalsSchema,
  clinicalInfo: clinicalInfoSchema,
  doctorOverride: doctorOverrideSchema,
  templateId: z.string().optional(),
  attachmentIds: z.array(z.string()).default([]),
  changeReason: z.string().optional(),
});

export const prescriptionUpdateSchema = prescriptionSchema.partial().extend({
  changeReason: z.string().optional(),
});
