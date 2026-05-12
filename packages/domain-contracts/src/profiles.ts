import { z } from "zod";

/**
 * WHY:   Profile data crosses repository, domain, and UI boundaries during workspace rendering.
 * WHAT:  ProfileSummary captures the current user's account, role, and organization link fields.
 * HOW:   It mirrors the web-facing subset of the Convex `userProfiles` record plus auth-provider metadata.
 */
export type ProfileSummary = {
  email?: string;
  name?: string;
  username?: string;
  role?: string;
  roleApprovalStatus?: string;
  requestedRole?: string;
  brokerId?: string;
  developerId?: string;
  showInOffersDirectory?: boolean;
  isActive?: boolean;
  metadata?: {
    platformAccess?: {
      admin?: {
        enabled: boolean;
        level: string;
        permissions: string[];
        revokedAt?: number;
      };
    };
  };
  authProvider: {
    id: "google";
    passwordManaged: false;
  };
};

export const updateProfileInputSchema = z.object({
  name: z.string().trim().min(2, "Profile name must be at least 2 characters").max(120),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/i, "Username may contain letters, numbers, dots, underscores, and hyphens"),
  showInOffersDirectory: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
