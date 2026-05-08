import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

const nonNegativeIntegerText = (label: string) => z.string().trim().regex(/^\d+$/, `${label} must be a number.`);

export const projectSchema = z.object({
  name: requiredText("Project name"),
  developer: requiredText("Developer"),
  city: requiredText("City"),
  area: requiredText("Area"),
  type: requiredText("Project type"),
  image: z.string().trim().url("Use a valid image URL."),
  status: z.enum(["draft", "pending", "approved", "rejected"]),
  units: nonNegativeIntegerText("Units"),
  priceRange: requiredText("Price range"),
  description: requiredText("Description", 10),
});

export interface ProjectFormValues {
  name: string;
  developer: string;
  city: string;
  area: string;
  type: string;
  image: string;
  status: "draft" | "pending" | "approved" | "rejected";
  units: string;
  priceRange: string;
  description: string;
}
