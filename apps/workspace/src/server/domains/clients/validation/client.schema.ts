import { z } from "zod";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const clientPayloadSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(["person", "organization"]).default("person"),
  email: optionalTrimmedText,
  phone: optionalTrimmedText,
  status: z.enum(["new", "active", "nurture", "inactive", "archived"]).default("new"),
  pipelineStage: z.enum(["new", "qualified", "review", "negotiation", "closed"]).optional(),
  pipelineOrder: z.number().finite().optional(),
  visibility: z.enum(["private", "team", "workspace"]).optional(),
  source: z.string().trim().default("manual"),
  company: optionalTrimmedText,
  contactName: optionalTrimmedText,
  website: optionalTrimmedText,
  notes: optionalTrimmedText,
  tags: z.array(z.string().trim()).optional(),
  customFields: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
});

export type ClientPayload = z.infer<typeof clientPayloadSchema>;
