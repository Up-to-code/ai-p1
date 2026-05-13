import { z } from "zod";

const projectCategories = ["Residential", "Commercial", "Mixed Use"] as const;
const projectOfferingTypes = ["Apartment", "Studio", "Villa", "Townhouse", "Penthouse", "Compound", "Office", "Retail"] as const;

export const projectPayloadSchema = z.object({
  name: z.string().trim().min(1),
  developer: z.string().trim().min(1),
  city: z.string().trim().min(1),
  area: z.string().trim().min(1),
  type: z.enum(projectCategories),
  unitTypes: z.array(z.enum(projectOfferingTypes)).optional().default([]),
  status: z.enum(["draft", "pending", "approved", "rejected"]),
  visibility: z.enum(["private", "public"]).optional(),
  units: z.coerce.number().int().min(0),
  priceRange: z.string().trim().min(1),
  regaAuthorizationNo: z.string().trim().optional(),
  regaExpiresAt: z.string().trim().optional(),
  planNumber: z.string().trim().optional(),
  plotNumber: z.string().trim().optional(),
  postalIdentity: z.string().trim().optional(),
  description: z.string().trim().min(10),
});

export type ProjectPayload = z.infer<typeof projectPayloadSchema>;
