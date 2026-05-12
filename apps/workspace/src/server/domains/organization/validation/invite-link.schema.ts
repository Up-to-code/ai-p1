import { z } from "zod";

export const createOrganizationInviteLinkSchema = z.object({
  role: z.string().trim().min(1, "Work role is required."),
  locale: z.string().trim().min(2).max(12).regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, "Locale is invalid."),
});

export const acceptOrganizationInviteLinkSchema = z.object({
  token: z.string().trim().min(20, "Invite token is required."),
});

export type CreateOrganizationInviteLinkInput = z.output<typeof createOrganizationInviteLinkSchema>;
export type AcceptOrganizationInviteLinkInput = z.output<typeof acceptOrganizationInviteLinkSchema>;
