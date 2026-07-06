import { v } from "convex/values";
import { query } from "../../_generated/server";
import { assertOrganizationResourcePermission, canUseOrganizationResourceAction } from "../profile/access";
import { organizationInviteLinkValidator } from "./validators";
import { toPublicInviteLink } from "./data";

const MAX_PENDING_INVITE_LINKS = 100;

export const listPending = query({
  args: { organizationId: v.string() },
  returns: v.array(organizationInviteLinkValidator),
  handler: async (ctx, args) => {
    const canInviteMembers = await canUseOrganizationResourceAction(ctx, args.organizationId, "member", "create");
    if (!canInviteMembers) return [];

    const now = Date.now();
    const inviteLinks = await ctx.db
      .query("organizationInviteLinks")
      .withIndex("by_organization_status_expires", (q) =>
        q.eq("organizationId", args.organizationId).eq("status", "pending").gt("expiresAt", now),
      )
      .take(MAX_PENDING_INVITE_LINKS);

    return inviteLinks
      .sort((left, right) => right.createdAt - left.createdAt)
      .map(toPublicInviteLink);
  },
});

export const countPendingByRole = query({
  args: { organizationId: v.string(), role: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "role", "delete");

    const now = Date.now();
    const inviteLinks = await ctx.db
      .query("organizationInviteLinks")
      .withIndex("by_organization_role_status_expires", (q) =>
        q.eq("organizationId", args.organizationId).eq("role", args.role).eq("status", "pending").gt("expiresAt", now),
      )
      .take(MAX_PENDING_INVITE_LINKS);

    return inviteLinks.length;
  },
});

export const getByTokenHash = query({
  args: { tokenHash: v.string() },
  returns: v.union(organizationInviteLinkValidator, v.null()),
  handler: async (ctx, args) => {
    const inviteLink = await ctx.db
      .query("organizationInviteLinks")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", args.tokenHash))
      .unique();

    if (!inviteLink) return null;
    return toPublicInviteLink(inviteLink);
  },
});
