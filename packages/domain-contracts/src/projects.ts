import { z } from "zod";

export const projectStatusSchema = z.enum(["planned", "active", "paused", "completed", "archived"]);
export const projectHealthSchema = z.enum(["onTrack", "atRisk", "blocked"]);
export const projectVisibilitySchema = z.enum(["private", "space_members", "organization"]);

export const projectInputSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  clientId: z.string().optional(),
  opportunityId: z.string().optional(),
  status: projectStatusSchema,
  health: projectHealthSchema,
  visibility: projectVisibilitySchema.optional(),
  teamMemberIds: z.array(z.string()).optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  budget: z.number().finite().optional(),
  currency: z.string().trim().optional(),
  description: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  isStrict: z.boolean().optional(),
  isRollupEnabled: z.boolean().optional(),
  templateId: z.string().trim().optional(),
  customTabs: z.array(z.string()).optional(),
  progress: z.number().min(0).max(100).optional(),
});

export const projectRecordSchema = z.object({
  _id: z.string(),
  _creationTime: z.number(),
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  clientId: z.string().optional(),
  opportunityId: z.string().optional(),
  ownerUserId: z.string(),
  teamMemberIds: z.array(z.string()).optional(),
  status: projectStatusSchema,
  health: projectHealthSchema,
  visibility: projectVisibilitySchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
  coverImageUrl: z.string().optional(),
  isStrict: z.boolean().optional(),
  isRollupEnabled: z.boolean().optional(),
  templateId: z.string().optional(),
  customTabs: z.array(z.string()).optional(),
  progress: z.number().optional(),
  createdByUserId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().optional(),
  isDeleted: z.boolean().optional(),
});

export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectHealth = z.infer<typeof projectHealthSchema>;
export type ProjectVisibility = z.infer<typeof projectVisibilitySchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ProjectRecord = z.infer<typeof projectRecordSchema>;

export type ProjectSummary = {
  id: string;
  name: string;
  status: ProjectStatus;
  health: ProjectHealth;
  clientId?: string;
  ownerUserId: string;
  teamMemberIds?: string[];
  budget?: number;
  description?: string;
  tags?: string[];
  progress?: number;
  createdAt: number;
  updatedAt: number;
};
