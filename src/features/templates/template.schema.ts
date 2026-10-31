import { z } from "zod";

export const templateSchema = z.object({
  name: z.string().min(1),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  imageUrl: z.url().optional(),
  createdById: z.string().min(1),
});
