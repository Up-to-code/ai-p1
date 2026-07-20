import { z } from "zod";
import { projectStatusSchema, projectHealthSchema, projectVisibilitySchema } from "@qentrah/domain-contracts";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const projectPayloadSchema = z.object({
  name: z.string().trim().min(1),
  clientId: optionalTrimmedText,
  opportunityId: optionalTrimmedText,
  status: projectStatusSchema,
  health: projectHealthSchema.default("onTrack"),
  visibility: projectVisibilitySchema.optional(),
  teamMemberIds: z.array(z.string().trim()).optional(),
  startDate: optionalTrimmedText,
  endDate: optionalTrimmedText,
  budget: z.coerce.number().optional(),
  currency: optionalTrimmedText,
  description: optionalTrimmedText,
  tags: z.array(z.string().trim()).optional(),
  isStrict: z.boolean().optional(),
  isRollupEnabled: z.boolean().optional(),
  templateId: z.string().optional(),
  customTabs: z.array(z.string()).optional(),
  progress: z.number().optional(),
});

export type ProjectPayload = z.infer<typeof projectPayloadSchema>;
