import { z } from "zod";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const projectPayloadSchema = z.object({
  name: z.string().trim().min(1),
  clientId: optionalTrimmedText,
  opportunityId: optionalTrimmedText,
  status: z.enum(["planned", "active", "paused", "completed", "archived"]),
  health: z.enum(["onTrack", "atRisk", "blocked"]).default("onTrack"),
  visibility: z.enum(["private", "space_members", "organization"]).optional(),
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
