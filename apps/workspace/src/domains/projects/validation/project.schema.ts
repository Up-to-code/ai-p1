import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

const nonNegativeIntegerText = (label: string) => z.string().trim().regex(/^\d+$/, `${label} must be a number.`);
const projectPriceItemSchema = z.object({
  id: z.string(),
  label: z.string().trim(),
  price: z.string().trim(),
});
export const projectCategories = ["Residential", "Commercial", "Mixed Use"] as const;
export const projectOfferingTypes = ["Apartment", "Studio", "Villa", "Townhouse", "Penthouse", "Compound", "Office", "Retail"] as const;

export const projectSchema = z.object({
  name: requiredText("Project name"),
  developer: requiredText("Developer"),
  city: requiredText("City"),
  area: requiredText("Area"),
  type: z.enum(projectCategories),
  unitTypes: z.array(z.enum(projectOfferingTypes)),
  status: z.enum(["draft", "pending", "approved", "rejected"]),
  visibility: z.enum(["private", "public"]).optional(),
  units: nonNegativeIntegerText("Units"),
  averagePrice: requiredText("Average price"),
  projectPrices: z.array(projectPriceItemSchema).optional().default([]),
  priceRange: z.string().trim().optional(),
  regaAuthorizationNo: z.string().trim().optional(),
  regaExpiresAt: z.string().trim().optional(),
  planNumber: z.string().trim().optional(),
  plotNumber: z.string().trim().optional(),
  postalIdentity: z.string().trim().optional(),
  description: requiredText("Description"),
});

export interface ProjectFormValues {
  name: string;
  developer: string;
  city: string;
  area: string;
  type: (typeof projectCategories)[number];
  unitTypes: (typeof projectOfferingTypes)[number][];
  status: "draft" | "pending" | "approved" | "rejected";
  visibility?: "private" | "public";
  units: string;
  averagePrice: string;
  projectPrices: Array<{ id: string; label: string; price: string }>;
  priceRange?: string;
  regaAuthorizationNo?: string;
  regaExpiresAt?: string;
  planNumber?: string;
  plotNumber?: string;
  postalIdentity?: string;
  description: string;
}
