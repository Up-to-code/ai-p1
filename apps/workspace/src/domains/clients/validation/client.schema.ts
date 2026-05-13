import { z } from "zod";
import { optionalText, requiredText } from "@/validation/common.schema";

const numericText = (label: string) => z.string().trim().regex(/^\d+$/, `${label} must be a number.`);

export const clientSchema = z.object({
  name: requiredText("Full name"),
  type: z.enum(["Buyer", "Tenant", "Investor", "Broker"]),
  contact: z.string().trim().email("Enter a valid email address."),
  phone: requiredText("Phone", 7),
  age: numericText("Age").refine((value) => Number(value) >= 18, "Age must be 18 or higher.").refine((value) => Number(value) <= 120, "Age must be realistic."),
  nationality: requiredText("Nationality"),
  generation: requiredText("Generation"),
  budget: requiredText("Budget"),
  propertyInterest: requiredText("Property interest"),
  status: z.enum(["active", "inactive"]),
  visibility: z.enum(["private", "public"]).optional(),
  pipelineStage: z.enum(["new", "qualified", "viewing", "negotiation", "closed"]),
  pipelineOrder: z.number().finite().optional(),
  priority: z.enum(["normal", "high", "urgent"]),
  nextAction: requiredText("Next action"),
  issue: optionalText,
});

export interface ClientFormValues {
  name: string;
  type: "Buyer" | "Tenant" | "Investor" | "Broker";
  contact: string;
  phone: string;
  age: string;
  nationality: string;
  generation: string;
  budget: string;
  propertyInterest: string;
  status: "active" | "inactive";
  visibility?: "private" | "public";
  pipelineStage: "new" | "qualified" | "viewing" | "negotiation" | "closed";
  pipelineOrder?: number;
  priority: "normal" | "high" | "urgent";
  nextAction: string;
  issue?: string;
}
