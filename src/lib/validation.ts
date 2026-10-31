import { z } from "zod";

export const cuidSchema = z.string().min(10);
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
