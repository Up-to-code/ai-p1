import { z } from "zod";
import { optionalText, requiredText } from "@/validation/common.schema";

const numericText = (label: string) => z.string().trim().regex(/^\d+$/, `${label} must be a number.`);

export const clientSchema = z.object({
  name: requiredText("Full name"),
  type: z.enum(["person", "organization"]),
  contact: z.string().trim().email("Enter a valid email address."),
  phone: requiredText("Phone", 7),
  age: numericText("Age").refine((value) => Number(value) >= 18, "Age must be 18 or higher.").refine((value) => Number(value) <= 120, "Age must be realistic."),
  nationality: requiredText("Nationality"),
  generation: requiredText("Generation"),
  budget: requiredText("Budget"),
  assetInterest: requiredText("Asset interest"),
  status: z.enum(["new", "active", "nurture", "inactive", "archived"]),
  visibility: z.enum(["private", "team", "workspace"]).optional(),
  pipelineStage: z.enum(["new", "qualified", "review", "negotiation", "closed"]),
  pipelineOrder: z.number().finite().optional(),
  priority: z.enum(["normal", "high", "urgent"]),
  nextAction: requiredText("Next action"),
  issue: optionalText,
  notes: optionalText,
});

export interface ClientFormValues {
  name: string;
  type: "person" | "organization";
  contact: string;
  phone: string;
  age: string;
  nationality: string;
  generation: string;
  budget: string;
  assetInterest: string;
  status: "new" | "active" | "nurture" | "inactive" | "archived";
  visibility?: "private" | "team" | "workspace";
  pipelineStage: "new" | "qualified" | "review" | "negotiation" | "closed";
  pipelineOrder?: number;
  priority: "normal" | "high" | "urgent";
  nextAction: string;
  issue?: string;
  notes?: string;
}
