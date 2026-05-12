import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().max(100).default(20),
});

export const idSchema = z.string().min(1);
export const requiredText = (label: string, min = 2) => z.string().trim().min(min, label + " is required.");
export const optionalText = z.string().trim().optional();
