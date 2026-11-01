import { RoleName } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  signatureUrl: z.string().optional().nullable(),
  role: z.nativeEnum(RoleName),
  organizationId: z.string().optional().nullable(),

  // Doctor optional fields
  specialization: z.string().optional(),
  degrees: z.string().optional(),
  designation: z.string().optional(),
  hospital: z.string().optional(),
  bmdcRegNo: z.string().optional(),
  chamberAddress: z.string().optional(),
  contactNumber: z.string().optional(),
  visitingHours: z.string().optional(),

  // Patient optional fields
  gender: z.string().optional(),
  dateOfBirth: z.string().optional().nullable(),
  medicalHistory: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(8).optional(),
});

export const ACCENT_COLORS = ["teal", "blue", "indigo", "rose", "slate"] as const;
export type AccentColor = (typeof ACCENT_COLORS)[number];

export const THEME_MODES = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const userPreferencesSchema = z.object({
  theme: z.enum(THEME_MODES).optional(),
  accent: z.enum(ACCENT_COLORS).optional(),
});
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
