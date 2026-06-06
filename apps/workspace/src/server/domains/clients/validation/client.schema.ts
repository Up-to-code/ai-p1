import { z } from "zod";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const clientPayloadSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(["Buyer", "Tenant", "Investor", "Broker"]).default("Buyer"),
  contact: optionalTrimmedText,
  phone: optionalTrimmedText,
  age: z.coerce.number().int().min(0).max(120).default(0),
  nationality: z.string().trim().default(""),
  generation: z.string().trim().default(""),
  budget: z.string().trim().default(""),
  propertyInterest: z.string().trim().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
  visibility: z.enum(["private", "public"]).optional(),
  pipelineStage: z.enum(["new", "qualified", "viewing", "negotiation", "closed"]).default("new"),
  pipelineOrder: z.number().finite().optional(),
  priority: z.enum(["normal", "high", "urgent"]).default("normal"),
  nextAction: z.string().trim().default("Follow up"),
  issue: optionalTrimmedText,
}).superRefine((value, context) => {
  if (!value.contact && !value.phone) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide either contact/email or phone for the client.",
      path: ["contact"],
    });
  }
}).transform((value) => ({
  ...value,
  contact: value.contact ?? value.phone ?? "",
  phone: value.phone ?? "",
}));

export const clientUnitLinkPayloadSchema = z.object({
  propertyId: z.string().trim().min(1),
  status: z.enum(["interested", "shortlisted", "viewing", "offer", "rejected"]).default("interested"),
  notes: z.string().trim().optional().transform((value) => value || undefined),
});

export type ClientPayload = z.infer<typeof clientPayloadSchema>;
export type ClientUnitLinkPayload = z.infer<typeof clientUnitLinkPayloadSchema>;
