import { z } from "zod";
import { optionalText, requiredText } from "@/validation/common.schema";

const optionalNumericText = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .refine((value) => !value || /^\d+$/.test(value), `${label} must be a number.`);

export const clientSchema = z
  .object({
    name: requiredText("Full name"),
    type: z.enum(["person", "organization"]),
    contact: z
      .string()
      .trim()
      .optional()
      .transform((value) => value ?? "")
      .refine((value) => !value || z.string().email().safeParse(value).success, "Enter a valid email address."),
    phone: optionalText.default(""),
    company: optionalText.default(""),
    contactName: optionalText.default(""),
    website: z.string().trim().optional().transform((value) => value ?? "").refine((value) => !value || z.string().url().safeParse(value).success, "Enter a valid website URL."),
    source: optionalText.default("manual"),
    lastContact: optionalText.default(""),
    age: optionalNumericText("Age")
      .refine((value) => !value || Number(value) >= 18, "Age must be 18 or higher.")
      .refine((value) => !value || Number(value) <= 120, "Age must be realistic."),
    nationality: optionalText.default(""),
    generation: optionalText.default(""),
    budget: optionalText.default(""),
    assetInterest: optionalText.default(""),
    status: z.enum(["new", "active", "nurture", "inactive", "archived"]),
    visibility: z.enum(["private", "team", "workspace"]).optional(),
    pipelineStage: z.enum(["new", "qualified", "review", "negotiation", "closed"]),
    pipelineOrder: z.number().finite().optional(),
    priority: z.enum(["normal", "high", "urgent"]),
    nextAction: optionalText.default(""),
    issue: optionalText,
    notes: optionalText,
  })
  .refine((value) => Boolean(value.contact || value.phone), {
    message: "Add an email or phone.",
    path: ["contact"],
  });

export interface ClientFormValues {
  name: string;
  type: "person" | "organization";
  contact: string;
  phone: string;
  company?: string;
  contactName?: string;
  website?: string;
  source?: string;
  lastContact?: string;
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
  tags?: string[];
}
