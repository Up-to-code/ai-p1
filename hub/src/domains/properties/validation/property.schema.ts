import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

const nonNegativeIntegerText = (label: string) => z.string().trim().regex(/^\d+$/, `${label} must be a number.`);

export const propertySchema = z.object({
  title: requiredText("Unit name"),
  project: requiredText("Project"),
  city: requiredText("City"),
  type: requiredText("Unit type"),
  image: z.string().trim().url("Use a valid image URL."),
  status: z.enum(["available", "sold", "reserved", "pending", "draft"]),
  purpose: z.enum(["sale", "rent"]),
  price: requiredText("Price"),
  area: requiredText("Area"),
  bedrooms: nonNegativeIntegerText("Bedrooms"),
  bathrooms: nonNegativeIntegerText("Bathrooms"),
  description: requiredText("Description", 10),
});

export interface PropertyFormValues {
  title: string;
  project: string;
  city: string;
  type: string;
  image: string;
  status: "available" | "sold" | "reserved" | "pending" | "draft";
  purpose: "sale" | "rent";
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
}
