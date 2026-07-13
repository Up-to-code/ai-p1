import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getAuthUser } from "../../auth";
import { assertOrganizationResourcePermission } from "../profile/access";
import { findInviteLinkByTokenHash, toPublicInviteLink } from "./data";
import {
  createOrganizationInviteLinkInputValidator,
  createOrganizationInviteLinkFromTokenInputValidator,
  organizationInviteLinkValidator,
} from "./validators";

async function hashInviteToken(token: string) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export const createInviteLinkFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: createOrganizationInviteLinkInputValidator,
  },
  returns: organizationInviteLinkValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
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

export const createInviteLinkFromToken = mutation({
  args: {
    organizationId: v.string(),
    input: createOrganizationInviteLinkFromTokenInputValidator,
  },
  returns: organizationInviteLinkValidator,
  handler: async (ctx, args) => {
    const token = args.input.token.trim();
    if (!token) {
      throw new Error("Invite token is required.");
    }

    const tokenHash = await hashInviteToken(token);
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "member", "create");

    const existing = await findInviteLinkByTokenHash(ctx, tokenHash);
    if (existing) {
      throw new Error("Invite link token already exists.");
    }

    const now = Date.now();
    const id = await ctx.db.insert("organizationInviteLinks", {
      organizationId: args.organizationId,
      role: args.input.role,
      tokenHash,
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
    userId: v.string(),
  },
  returns: organizationInviteLinkValidator,
  handler: async (ctx, args) => {
    const inviteLink = await findInviteLinkByTokenHash(ctx, args.tokenHash);
    const now = Date.now();

    if (!inviteLink) {
      throw new Error("Invite link was not found.");
    }
    if (inviteLink.status !== "pending") {
      if (inviteLink.status === "used" && inviteLink.usedByUserId === args.userId) {
        return toPublicInviteLink(inviteLink);
      }

      throw new Error("Invite link is no longer active.");
    }
    if (inviteLink.expiresAt <= now) {
      throw new Error("Invite link has expired.");
    }

    await ctx.db.patch(inviteLink._id, {
      status: "used",
      usedAt: now,
      usedByUserId: args.userId,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: inviteLink.organizationId,
      actorUserId: args.userId,
      action: "organization.invite_link.accept",
      target: inviteLink._id,
      summary: `Accepted invite link for ${inviteLink.role}.`,
      createdAt: now,
    });

    return {
      ...toPublicInviteLink(inviteLink),
      status: "used" as const,
      usedAt: now,
      usedByUserId: args.userId,
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
    const user = await getAuthUser(ctx);
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
