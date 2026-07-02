import { z } from "zod";

export const spaceSchema = z.object({
  name: z.string().trim().min(1, "Space name is required"),
  description: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  color: z.string().trim().optional(),
  visibility: z.enum(["private", "public", "request_only"]).default("private"),
  defaultProjectVisibility: z.enum(["private", "space_members", "organization"]).optional(),
  allowMemberProjectCreation: z.boolean().optional(),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

export type SpaceFormValues = z.infer<typeof spaceSchema>;
