import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { theoryInputValidator, theoryValidator } from "./validators";
import { presentWorkspaceRecord } from "../shared/present";

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: theoryInputValidator },
  returns: theoryValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");

    const now = Date.now();
    const id = await ctx.db.insert("theories", {
      organizationId: args.organizationId,
      ...args.input,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "theory.create",
      target: id,
      summary: `Created theory "${args.input.title}".`,
      createdAt: now,
    });

    const theory = await ctx.db.get(id);
    if (!theory) throw new Error("Theory could not be created.");
    return presentWorkspaceRecord(theory);
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    theoryId: v.id("theories"),
    input: theoryInputValidator,
  },
  returns: theoryValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.theoryId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Theory was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.theoryId, {
      ...args.input,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "theory.update",
      target: args.theoryId,
      summary: `Updated theory "${args.input.title}".`,
      createdAt: now,
    });

    const theory = await ctx.db.get(args.theoryId);
    if (!theory) throw new Error("Theory was not found.");
    return presentWorkspaceRecord(theory);
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), theoryId: v.id("theories") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.theoryId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Theory was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.theoryId, { deletedAt: now, updatedAt: now });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "theory.delete",
      target: args.theoryId,
      summary: `Deleted theory "${existing.title}".`,
      createdAt: now,
    });

    return { removed: true };
  },
});
