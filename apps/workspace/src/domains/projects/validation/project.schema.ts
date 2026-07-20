import { z } from "zod";
import { requiredText } from "@/validation/common.schema";
import {
  projectStatusSchema,
  projectHealthSchema,
  projectVisibilitySchema,
} from "@qentrah/domain-contracts";

export const projectStatuses = projectStatusSchema.options;
export const projectHealths = projectHealthSchema.options;

export const projectSchema = z.object({
  name: requiredText("Project name"),
  clientId: z.string().trim().optional(),
  opportunityId: z.string().trim().optional(),
  status: projectStatusSchema.default("planned"),
  health: projectHealthSchema.default("onTrack"),
  visibility: projectVisibilitySchema.default("space_members"),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  budget: z.string().trim().optional(),
  description: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  templateId: z.string().trim().optional(),
  useAiSetup: z.boolean().optional().default(false),
  progress: z.number().min(0).max(100).optional(),
  teamMemberIds: z.array(z.string()).optional(),
});

export type ProjectFormInput = z.input<typeof projectSchema>;
export type ProjectFormValues = z.output<typeof projectSchema>;
