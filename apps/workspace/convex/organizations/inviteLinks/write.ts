import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { authComponent } from "../../auth";
import { assertOrganizationResourcePermission } from "../profile/access";
import { findInviteLinkByTokenHash, toPublicInviteLink } from "./data";
import {
  createOrganizationInviteLinkInputValidator,
  organizationInviteLinkValidator,
} from "./validators";

export const createInviteLinkFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: createOrganizationInviteLinkInputValidator,
  },
  returns: organizationInviteLinkValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "member", "create");

    const existing = await findInviteLinkByTokenHash(ctx, args.input.tokenHash);
    if (existing) {
      throw new Error("Invite link token already exists.");
    }

    const now = Date.now();
    const id = await ctx.db.insert("organizationInviteLinks", {
      organizationId: args.organizationId,
      role: args.input.role,
      tokenHash: args.input.tokenHash,
      status: "pending",
      createdByUserId: user._id,
      expiresAt: args.input.expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    const inviteLink = await ctx.db.get(id);
    if (!inviteLink) {
      throw new Error("Invite link could not be created.");
    }

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "organization.invite_link.create",
      target: id,
      summary: `Created invite link for ${args.input.role}.`,
      createdAt: now,
    });

    return toPublicInviteLink(inviteLink);
  },
});

export const acceptInviteLinkFromHono = mutation({
  args: {
    tokenHash: v.string(),
  },
  returns: organizationInviteLinkValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const inviteLink = await findInviteLinkByTokenHash(ctx, args.tokenHash);
    const now = Date.now();

    if (!inviteLink) {
      throw new Error("Invite link was not found.");
    }
    if (inviteLink.status !== "pending") {
      throw new Error("Invite link is no longer active.");
    }
    if (inviteLink.expiresAt <= now) {
      throw new Error("Invite link has expired.");
    }

    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", inviteLink.organizationId))
      .unique();
    if (!organization?.workosOrganizationId) {
      throw new Error("Organization is not linked to WorkOS.");
    }
    const workosOrganizationId = organization.workosOrganizationId;

    const existingMembership = await ctx.db
      .query("workosOrganizationMembers")
      .withIndex("by_workos_org_user", (q) =>
        q.eq("workosOrganizationId", workosOrganizationId).eq("workosUserId", user.id),
      )
      .unique();

    if (existingMembership?.status === "active") {
      return toPublicInviteLink(inviteLink);
    }

    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        organizationId: inviteLink.organizationId,
        userId: user._id,
        email: user.email,
        role: inviteLink.role,
        roles: [inviteLink.role],
        status: "active",
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("workosOrganizationMembers", {
        organizationId: inviteLink.organizationId,
        workosOrganizationId,
        workosUserId: user.id,
        userId: user._id,
        email: user.email,
        role: inviteLink.role,
        roles: [inviteLink.role],
        permissions: [],
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.patch(inviteLink._id, {
      status: "used",
      usedAt: now,
      usedByUserId: user._id,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: inviteLink.organizationId,
      actorUserId: user._id,
      action: "organization.invite_link.accept",
      target: inviteLink._id,
      summary: `Accepted invite link for ${inviteLink.role}.`,
      createdAt: now,
    });

    return {
      ...toPublicInviteLink(inviteLink),
      status: "used" as const,
      usedAt: now,
      usedByUserId: user._id,
      updatedAt: now,
    };
  },
});

export const cancelInviteLinkFromHono = mutation({
  args: {
    organizationId: v.string(),
    inviteLinkId: v.id("organizationInviteLinks"),
  },
  returns: organizationInviteLinkValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "member", "create");
    const inviteLink = await ctx.db.get(args.inviteLinkId);
    const now = Date.now();

    if (!inviteLink || inviteLink.organizationId !== args.organizationId) {
      throw new Error("Invite link was not found.");
    }
    if (inviteLink.status !== "pending") {
      throw new Error("Invite link is no longer pending.");
    }

    await ctx.db.patch(inviteLink._id, {
      status: "canceled",
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "organization.invite_link.cancel",
      target: inviteLink._id,
      summary: `Canceled invite link for ${inviteLink.role}.`,
      createdAt: now,
    });

    return {
      ...toPublicInviteLink(inviteLink),
      status: "canceled" as const,
      updatedAt: now,
    };
  },
});
