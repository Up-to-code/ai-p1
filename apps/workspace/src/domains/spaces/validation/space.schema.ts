import { z } from "zod";
import {
  spaceVisibilitySchema,
  spaceProjectVisibilitySchema,
} from "@qentrah/domain-contracts";

export const spaceSchema = z.object({
  name: z.string().trim().min(1, "Space name is required"),
  description: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  color: z.string().trim().optional(),
  visibility: spaceVisibilitySchema.default("private"),
  defaultProjectVisibility: spaceProjectVisibilitySchema.optional(),
  allowMemberProjectCreation: z.boolean().optional(),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

export type SpaceFormValues = z.infer<typeof spaceSchema>;
