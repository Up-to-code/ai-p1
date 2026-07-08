import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { authUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { opportunityInputValidator, opportunityValidator } from "./validators";

function presentOpportunity<TOpportunity extends { _id: string }>(opportunity: TOpportunity) {
  return { ...opportunity, id: opportunity._id };
}

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: opportunityInputValidator },
  returns: opportunityValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const now = Date.now();
    const ownerUserId = args.input.ownerUserId ?? user._id;
    const id = await ctx.db.insert("opportunities", {
      organizationId: args.organizationId,
      ...args.input,
      ownerUserId,
      recordState: "active",
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
      ...(args.input.status === "won" || args.input.status === "lost" ? { closedAt: now } : {}),
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "opportunity.create",
      target: id,
      summary: `Created opportunity ${args.input.title}.`,
      createdAt: now,
    });

    const opportunity = await ctx.db.get(id);
    if (!opportunity) throw new Error("Opportunity could not be created.");
    return presentOpportunity(opportunity);
  },
});

export const updateFromHono = mutation({
  args: { organizationId: v.string(), opportunityId: v.id("opportunities"), input: opportunityInputValidator },
  returns: opportunityValidator,
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.opportunityId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Opportunity was not found.");
    const now = Date.now();
    const patch = {
      ...args.input,
      ownerUserId: args.input.ownerUserId ?? existing.ownerUserId,
      updatedAt: now,
      ...(args.input.status === "won" || args.input.status === "lost" ? { closedAt: existing.closedAt ?? now } : {}),
    };
    await ctx.db.patch(args.opportunityId, patch);

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "opportunity.update",
      target: args.opportunityId,
      summary: `Updated opportunity ${args.input.title}.`,
      createdAt: now,
    });

    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity) throw new Error("Opportunity was not found.");
    return presentOpportunity(opportunity);
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), opportunityId: v.id("opportunities") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.opportunityId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error("Opportunity was not found.");
    const now = Date.now();
    await ctx.db.patch(args.opportunityId, { deletedAt: now, recordState: "deleted", updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "opportunity.delete",
      target: args.opportunityId,
      summary: `Deleted opportunity ${existing.title}.`,
      createdAt: now,
    });
    return { removed: true };
  },
});
