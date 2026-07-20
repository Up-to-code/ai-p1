import { z } from "zod";

export const spaceVisibilitySchema = z.enum(["private", "public", "request_only"]);
export const spaceProjectVisibilitySchema = z.enum(["private", "space_members", "organization"]);
export const spaceMemberRoleSchema = z.enum(["admin", "member", "viewer"]);

export const spaceInputSchema = z.object({
  name: z.string().trim().min(1, "Space name is required"),
  description: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  color: z.string().trim().optional(),
  visibility: spaceVisibilitySchema,
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  defaultProjectVisibility: spaceProjectVisibilitySchema.optional(),
  allowMemberProjectCreation: z.boolean().optional(),
});

export const spaceRecordSchema = z.object({
  _id: z.string(),
  _creationTime: z.number(),
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  visibility: spaceVisibilitySchema,
  slug: z.string(),
  defaultProjectVisibility: spaceProjectVisibilitySchema.optional(),
  allowMemberProjectCreation: z.boolean().optional(),
  createdByUserId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type SpaceVisibility = z.infer<typeof spaceVisibilitySchema>;
export type SpaceProjectVisibility = z.infer<typeof spaceProjectVisibilitySchema>;
export type SpaceMemberRole = z.infer<typeof spaceMemberRoleSchema>;
export type SpaceInput = z.infer<typeof spaceInputSchema>;
export type SpaceRecord = z.infer<typeof spaceRecordSchema>;
