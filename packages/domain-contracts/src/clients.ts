import { z } from "zod";

export const clientTypeSchema = z.enum(["person", "organization"]);
export const clientStatusSchema = z.enum(["new", "active", "nurture", "inactive", "archived"]);
export const clientPrioritySchema = z.enum(["normal", "high", "urgent"]);
export const clientPipelineStageSchema = z.string();
export const visibilitySchema = z.enum(["private", "team", "workspace"]);

export const clientInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: clientTypeSchema,
  ownerUserId: z.string().optional(),
  status: clientStatusSchema,
  pipelineStage: clientPipelineStageSchema.optional(),
  pipelineOrder: z.number().finite().optional(),
  source: z.string().optional(),
  visibility: visibilitySchema.optional(),
  company: z.string().trim().optional(),
  contactName: z.string().trim().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  website: z.string().url().optional().or(z.literal("")),
  notes: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
});

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
