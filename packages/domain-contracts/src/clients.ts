import { z } from "zod";

export const clientTypeSchema = z.enum(["person", "organization"]);
export const clientStatusSchema = z.enum(["new", "active", "nurture", "inactive", "archived"]);
export const clientPrioritySchema = z.enum(["normal", "high", "urgent"]);
export const clientPipelineStageSchema = z.string();
export const visibilitySchema = z.enum(["private", "team", "workspace"]);
const optionalClientText = z.string().trim().optional().transform((value) => value || undefined);

export const clientInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: clientTypeSchema,
  ownerUserId: z.string().optional(),
  status: clientStatusSchema,
  pipelineStage: clientPipelineStageSchema.optional(),
  pipelineOrder: z.number().finite().optional(),
  source: z.string().optional(),
  priority: clientPrioritySchema.optional(),
  budget: optionalClientText,
  assetInterest: optionalClientText,
  added: optionalClientText,
  lastContact: optionalClientText,
  contact: optionalClientText,
  visibility: visibilitySchema.optional(),
  company: optionalClientText,
  contactName: optionalClientText,
  email: z.union([z.string().email(), z.literal("")]).optional().transform((value) => value || undefined),
  phone: optionalClientText,
  website: z.union([z.string().url(), z.literal("")]).optional().transform((value) => value || undefined),
  notes: optionalClientText,
  tags: z.array(z.string().trim()).optional(),
}).strict();

/** Writable Client fields for update operations; identity and lifecycle fields are excluded. */
export const clientPatchObjectSchema = clientInputSchema.partial();
export const clientPatchSchema = clientPatchObjectSchema.refine(
  (patch) => Object.keys(patch).length > 0,
  "At least one client field is required",
);

export const clientRecordSchema = z.object({
  _id: z.string(),
  _creationTime: z.number(),
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  type: clientTypeSchema,
  ownerUserId: z.string(),
  status: clientStatusSchema,
  source: z.string(),
  visibility: visibilitySchema.optional(),
  company: z.string().optional(),
  contactName: z.string().optional(),
  contact: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  notes: z.string().optional(),
  priority: clientPrioritySchema,
  budget: z.string(),
  assetInterest: z.string(),
  pipelineStage: z.string().optional(),
  pipelineOrder: z.number().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
  added: z.string(),
  lastContact: z.string(),
  recordState: z.enum(["active", "archived", "deleted"]).optional(),
  createdByUserId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().optional(),
});

export type ClientType = z.infer<typeof clientTypeSchema>;
export type ClientStatus = z.infer<typeof clientStatusSchema>;
export type ClientPriority = z.infer<typeof clientPrioritySchema>;
export type ClientPipelineStage = z.infer<typeof clientPipelineStageSchema>;
export type Visibility = z.infer<typeof visibilitySchema>;
export type ClientInput = z.infer<typeof clientInputSchema>;
export type ClientPatch = z.infer<typeof clientPatchSchema>;
export type ClientRecord = z.infer<typeof clientRecordSchema>;

export type ClientSummary = {
  id: string;
  name: string;
  type: ClientType;
  status: ClientStatus;
  email?: string;
  phone?: string;
  company?: string;
  pipelineStage?: string;
  priority?: ClientPriority;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
};
