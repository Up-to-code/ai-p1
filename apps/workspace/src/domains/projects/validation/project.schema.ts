import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

const nonNegativeIntegerText = (label: string) => z.string().trim().regex(/^\d+$/, `${label} must be a number.`);
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
  priceRange: requiredText("Price range"),
  description: requiredText("Description", 10),
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
  priceRange: string;
  description: string;
}
