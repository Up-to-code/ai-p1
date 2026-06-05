import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { clerkAuthComponent, createAuth } from "../../auth";
import { assertOrganizationResourcePermission } from "../profile/access";
import { findInviteLinkByTokenHash, toPublicInviteLink } from "./data";
import {
  createOrganizationInviteLinkInputValidator,
  organizationInviteLinkValidator,
} from "./validators";

type AddMemberApi = {
  addMember: (input: {
    body: {
      userId: string;
      organizationId: string;
      role: string;
    };
  }) => Promise<unknown>;
};

type AddMemberErrorResult = {
  error?: {
    message?: string;
    code?: string;
  } | null;
};

function isAlreadyMemberError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("already a member");
}

export const createInviteLinkFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: createOrganizationInviteLinkInputValidator,
  },
  returns: organizationInviteLinkValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
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
    const user = await clerkAuthComponent.getAuthUser(ctx);
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

    const { auth } = await clerkAuthComponent.getAuth(createAuth, ctx);
    const organizationApi = auth.api as unknown as AddMemberApi;

    try {
      const addMemberResult = await organizationApi.addMember({
        body: {
          userId: user._id,
          organizationId: inviteLink.organizationId,
          role: inviteLink.role,
        },
      });
      const addMemberError = (addMemberResult as AddMemberErrorResult | null)?.error;

      if (addMemberError) {
        if (isAlreadyMemberError(addMemberError.message ?? addMemberError.code)) {
          return toPublicInviteLink(inviteLink);
        }
        throw new Error(addMemberError.message ?? addMemberError.code ?? "Invite link could not add member.");
      }
    } catch (error) {
      if (isAlreadyMemberError(error)) {
        return toPublicInviteLink(inviteLink);
      }
      throw error;
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
    const user = await clerkAuthComponent.getAuthUser(ctx);
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
