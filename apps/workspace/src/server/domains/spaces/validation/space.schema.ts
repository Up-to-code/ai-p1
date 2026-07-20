import { z } from "zod";
import { spaceVisibilitySchema, spaceProjectVisibilitySchema } from "@qentrah/domain-contracts";

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
  visibility: spaceVisibilitySchema,
  defaultProjectVisibility: spaceProjectVisibilitySchema.optional(),
  allowMemberProjectCreation: z.boolean().optional(),
});

export type SpacePayload = z.infer<typeof spacePayloadSchema>;
