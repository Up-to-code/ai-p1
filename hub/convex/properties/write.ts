import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { propertyInputValidator, propertyUnitValidator } from "./validators";

function unitReference(now: number) {
  return `UNT-${now.toString(36).toUpperCase().slice(-6)}`;
}

function presentProperty(property: Doc<"propertyUnits">) {
  return {
    ...property,
    id: property._id,
    coverImageUrl: undefined,
  };
}

async function assertProjectBelongsToOrganization(
  ctx: MutationCtx,
  organizationId: string,
  projectId?: string,
) {
  if (!projectId) return;
  const project = await ctx.db.get(projectId as Id<"projects">);
  if (!project || project.organizationId !== organizationId || project.deletedAt) {
    throw new Error("Project was not found.");
  }
}

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: propertyInputValidator,
  },
  returns: propertyUnitValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "property", "create");
    await assertProjectBelongsToOrganization(ctx, args.organizationId, args.input.projectId);

    const now = Date.now();
    const id = await ctx.db.insert("propertyUnits", {
      organizationId: args.organizationId,
      ...args.input,
      reference: unitReference(now),
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "property.create",
      target: id,
      summary: `Created property unit ${args.input.title}.`,
      createdAt: now,
    });

    const unit = await ctx.db.get(id);
    if (!unit) throw new Error("Property unit could not be created.");
    return presentProperty(unit);
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    propertyId: v.id("propertyUnits"),
    input: propertyInputValidator,
  },
  returns: propertyUnitValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "property", "update");
    await assertProjectBelongsToOrganization(ctx, args.organizationId, args.input.projectId);
    const existing = await ctx.db.get(args.propertyId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Property unit was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.propertyId, {
      ...args.input,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "property.update",
      target: args.propertyId,
      summary: `Updated property unit ${args.input.title}.`,
      createdAt: now,
    });

    const unit = await ctx.db.get(args.propertyId);
    if (!unit) throw new Error("Property unit was not found.");
    return presentProperty(unit);
  },
});

export const deleteFromHono = mutation({
  args: {
    organizationId: v.string(),
    propertyId: v.id("propertyUnits"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "property", "delete");
    const existing = await ctx.db.get(args.propertyId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Property unit was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.propertyId, { deletedAt: now, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "property.delete",
      target: args.propertyId,
      summary: `Deleted property unit ${existing.title}.`,
      createdAt: now,
    });

    return { removed: true };
  },
});
