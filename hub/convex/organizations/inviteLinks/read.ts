import { v } from "convex/values";
import { query } from "../../_generated/server";
import { assertOrganizationResourcePermission } from "../profile/access";
import { organizationInviteLinkValidator } from "./validators";
import { toPublicInviteLink } from "./data";

export const listPending = query({
  args: { organizationId: v.string() },
  returns: v.array(organizationInviteLinkValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "member", "create");

    const now = Date.now();
    const inviteLinks = await ctx.db
      .query("organizationInviteLinks")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return inviteLinks
      .filter((inviteLink) => inviteLink.status === "pending" && inviteLink.expiresAt > now)
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
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return inviteLinks.filter(
      (inviteLink) =>
        inviteLink.status === "pending" &&
        inviteLink.expiresAt > now &&
        inviteLink.role === args.role,
    ).length;
  },
});
