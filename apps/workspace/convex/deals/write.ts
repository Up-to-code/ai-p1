import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { dealInputValidator, dealValidator } from "./validators";

function presentDeal<TDeal extends { _id: string }>(deal: TDeal) {
  return { ...deal, id: deal._id };
}

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: dealInputValidator },
  returns: dealValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const now = Date.now();
    const ownerUserId = args.input.ownerUserId ?? user._id;
    const id = await ctx.db.insert("deals", {
      organizationId: args.organizationId,
      ...args.input,
      ownerUserId,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
      ...(args.input.status === "won" || args.input.status === "lost" ? { closedAt: now } : {}),
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "deal.create",
      target: id,
      summary: `Created deal ${args.input.title}.`,
      createdAt: now,
    });

    const deal = await ctx.db.get(id);
    if (!deal) throw new Error("Deal could not be created.");
    return presentDeal(deal);
  },
});

export const updateFromHono = mutation({
  args: { organizationId: v.string(), dealId: v.id("deals"), input: dealInputValidator },
  returns: dealValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.dealId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Deal was not found.");
    const now = Date.now();
    const patch = {
      ...args.input,
      ownerUserId: args.input.ownerUserId ?? existing.ownerUserId,
      updatedAt: now,
      ...(args.input.status === "won" || args.input.status === "lost" ? { closedAt: existing.closedAt ?? now } : {}),
    };
    await ctx.db.patch(args.dealId, patch);

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "deal.update",
      target: args.dealId,
      summary: `Updated deal ${args.input.title}.`,
      createdAt: now,
    });

    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal was not found.");
    return presentDeal(deal);
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), dealId: v.id("deals") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.dealId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Deal was not found.");
    const now = Date.now();
    await ctx.db.patch(args.dealId, { deletedAt: now, isDeleted: true, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "deal.delete",
      target: args.dealId,
      summary: `Deleted deal ${existing.title}.`,
      createdAt: now,
    });
    return { removed: true };
  },
});
