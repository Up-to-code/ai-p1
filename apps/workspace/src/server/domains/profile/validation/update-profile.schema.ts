import { z } from "zod";

const notificationsSchema = z.object({
  product: z.boolean(),
  approvals: z.boolean(),
  billing: z.boolean(),
  security: z.boolean(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Profile name must be at least 2 characters.").max(120),
  phone: z.string().trim().max(40, "Phone is too long.").optional(),
  role: z.string().trim().min(2, "Role is required.").max(120),
  language: z.enum(["en", "ar"]),
  timezone: z.string().trim().min(2, "Timezone is required.").max(80),
  notifications: notificationsSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
