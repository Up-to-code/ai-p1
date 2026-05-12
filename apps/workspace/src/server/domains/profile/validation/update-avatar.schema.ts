import { z } from "zod";

export const updateProfileAvatarSchema = z.object({
  avatarUrl: z.string().trim().url().optional(),
  avatarKey: z.string().trim().optional(),
});

export type UpdateProfileAvatarInput = z.infer<typeof updateProfileAvatarSchema>;
