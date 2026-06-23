import { z } from "zod";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const spacePayloadSchema = z.object({
  name: z.string().trim().min(1),
  icon: optionalTrimmedText,
  color: optionalTrimmedText,
  visibility: z.enum(["all_members", "selected_members"]),
  defaultAssigneeIds: z.array(z.string().trim()).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

export type SpacePayload = z.infer<typeof spacePayloadSchema>;
