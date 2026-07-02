import { z } from "zod";

const optionalTrimmedText = z.string().trim().optional().transform((value) => value || undefined);

export const spacePayloadSchema = z.object({
  name: z.string().trim().min(1),
  description: optionalTrimmedText,
  icon: optionalTrimmedText,
  color: optionalTrimmedText,
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  visibility: z.enum(["private", "public", "request_only"]),
  defaultProjectVisibility: z.enum(["private", "space_members", "organization"]).optional(),
  allowMemberProjectCreation: z.boolean().optional(),
});

export type SpacePayload = z.infer<typeof spacePayloadSchema>;
