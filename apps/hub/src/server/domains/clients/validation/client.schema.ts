import { z } from "zod";

export const clientPayloadSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(["Buyer", "Tenant", "Investor", "Broker"]),
  contact: z.string().trim().email(),
  phone: z.string().trim().min(7),
  age: z.coerce.number().int().min(18).max(120),
  nationality: z.string().trim().min(1),
  generation: z.string().trim().min(1),
  budget: z.string().trim().min(1),
  propertyInterest: z.string().trim().min(1),
  status: z.enum(["active", "inactive"]),
  visibility: z.enum(["private", "public"]).optional(),
  pipelineStage: z.enum(["new", "qualified", "viewing", "negotiation", "closed"]),
  priority: z.enum(["normal", "high", "urgent"]),
  nextAction: z.string().trim().min(1),
  issue: z.string().trim().optional().transform((value) => value || undefined),
});

export const clientUnitLinkPayloadSchema = z.object({
  propertyId: z.string().trim().min(1),
  status: z.enum(["interested", "shortlisted", "viewing", "offer", "rejected"]).default("interested"),
  notes: z.string().trim().optional().transform((value) => value || undefined),
});

export type ClientPayload = z.infer<typeof clientPayloadSchema>;
export type ClientUnitLinkPayload = z.infer<typeof clientUnitLinkPayloadSchema>;
