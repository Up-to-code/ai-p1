import { v } from "convex/values";

export const organizationInviteLinkStatusValidator = v.union(
  v.literal("pending"),
  v.literal("used"),
  v.literal("canceled"),
);

export const organizationInviteLinkValidator = v.object({
  id: v.string(),
  organizationId: v.string(),
  role: v.string(),
  status: organizationInviteLinkStatusValidator,
  createdByUserId: v.string(),
  expiresAt: v.number(),
  usedAt: v.optional(v.number()),
  usedByUserId: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const createOrganizationInviteLinkInputValidator = v.object({
  role: v.string(),
  tokenHash: v.string(),
  expiresAt: v.number(),
});
