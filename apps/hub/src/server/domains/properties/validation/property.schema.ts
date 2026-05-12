import { z } from "zod";

export const propertyPayloadSchema = z.object({
  title: z.string().trim().min(1),
  projectId: z.string().trim().min(1).optional(),
  project: z.string().trim().min(1),
  city: z.string().trim().min(1),
  type: z.string().trim().min(1),
  status: z.enum(["available", "sold", "reserved", "pending", "draft"]),
  visibility: z.enum(["private", "public"]).optional(),
  purpose: z.enum(["sale", "rent"]),
  price: z.string().trim().min(1),
  area: z.string().trim().min(1),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  description: z.string().trim().min(10),
});

export type PropertyPayload = z.infer<typeof propertyPayloadSchema>;
