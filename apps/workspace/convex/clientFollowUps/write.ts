import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { authUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { followUpInputValidator, followUpValidator } from "./validators";

function presentFollowUp<TFollowUp extends { _id: string; visibility?: "private" | "team" | "workspace" }>(followUp: TFollowUp) {
  return { ...followUp, id: followUp._id, visibility: followUp.visibility ?? "private" };
}

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: followUpInputValidator },
  returns: followUpValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");

    const now = Date.now();
    const id = await ctx.db.insert("clientFollowUps", {
      organizationId: args.organizationId,
      ...args.input,
      visibility: args.input.visibility ?? "private",
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
      ...(args.input.status === "completed" ? { completedAt: now } : {}),
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.followUp.create",
      target: id,
      summary: `Created follow-up ${args.input.title}.`,
      createdAt: now,
    });

    const followUp = await ctx.db.get(id);
    if (!followUp) throw new Error("Follow-up could not be created.");
    return presentFollowUp(followUp);
  },
});

export const updateFromHono = mutation({
  args: { organizationId: v.string(), followUpId: v.id("clientFollowUps"), input: followUpInputValidator },
  returns: followUpValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.followUpId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Follow-up was not found.");

    const nextVisibility = args.input.visibility ?? (existing.visibility ?? "private");
    const now = Date.now();
    await ctx.db.patch(args.followUpId, {
      ...args.input,
      visibility: nextVisibility,
      updatedAt: now,
      ...(args.input.status === "completed" && existing.status !== "completed" ? { completedAt: existing.completedAt ?? now } : {}),
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.followUp.update",
      target: args.followUpId,
      summary: `Updated follow-up ${args.input.title}.`,
      createdAt: now,
    });

    const followUp = await ctx.db.get(args.followUpId);
    if (!followUp) throw new Error("Follow-up was not found.");
    return presentFollowUp(followUp);
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), followUpId: v.id("clientFollowUps") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.followUpId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Follow-up was not found.");
    const now = Date.now();
    await ctx.db.patch(args.followUpId, { deletedAt: now, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.followUp.delete",
      target: args.followUpId,
      summary: `Deleted follow-up ${existing.title}.`,
      createdAt: now,
    });
    return { removed: true };
  },
});

export const markComplete = mutation({
  args: { organizationId: v.string(), followUpId: v.id("clientFollowUps") },
  returns: followUpValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.followUpId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Follow-up was not found.");

    const now = Date.now();
    await ctx.db.patch(args.followUpId, {
      status: "completed",
      completedAt: existing.completedAt ?? now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.followUp.complete",
      target: args.followUpId,
      summary: `Completed follow-up ${existing.title}.`,
      createdAt: now,
    });

    const followUp = await ctx.db.get(args.followUpId);
    if (!followUp) throw new Error("Follow-up was not found.");
    return presentFollowUp(followUp);
  },
});
