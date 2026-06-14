import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

export const projectStatuses = ["planned", "active", "paused", "completed", "archived"] as const;
export const projectHealths = ["onTrack", "atRisk", "blocked"] as const;

export const projectSchema = z.object({
  name: requiredText("Project name"),
  clientId: z.string().trim().optional(),
  opportunityId: z.string().trim().optional(),
  status: z.enum(projectStatuses).default("planned"),
  health: z.enum(projectHealths).default("onTrack"),
  visibility: z.enum(["private", "team", "workspace"]).default("team"),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  budget: z.string().trim().optional(),
  description: z.string().trim().optional(),
  templateId: z.string().trim().optional(),
  useAiSetup: z.boolean().optional().default(false),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
