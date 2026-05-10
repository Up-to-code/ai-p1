import { z } from "zod";

export const projectPayloadSchema = z.object({
  name: z.string().trim().min(1),
  developer: z.string().trim().min(1),
  city: z.string().trim().min(1),
  area: z.string().trim().min(1),
  type: z.string().trim().min(1),
  status: z.enum(["draft", "pending", "approved", "rejected"]),
  units: z.coerce.number().int().min(0),
  priceRange: z.string().trim().min(1),
  description: z.string().trim().min(10),
});

export type ProjectPayload = z.infer<typeof projectPayloadSchema>;
