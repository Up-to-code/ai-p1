import { z } from "zod";

export const spaceSchema = z.object({
  name: z.string().trim().min(1, "Space name is required"),
  icon: z.string().trim().optional(),
  color: z.string().trim().optional(),
  visibility: z.enum(["all_members", "selected_members"]).default("all_members"),
  defaultAssigneeIds: z.array(z.string()).optional(),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

export type SpaceFormValues = z.infer<typeof spaceSchema>;
