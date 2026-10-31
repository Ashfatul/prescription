import { RoleName } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  imageUrl: z.url().optional(),
  role: z.enum(RoleName),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(8).optional(),
});
