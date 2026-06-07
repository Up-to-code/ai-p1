import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { assetInputValidator, assetValidator } from "./validators";

async function assertProjectBelongsToOrganization(ctx: MutationCtx, organizationId: string, projectId?: Id<"projects">) {
  if (!projectId) return;
  const project = await ctx.db.get(projectId);
  if (!project || project.organizationId !== organizationId || project.deletedAt) {
    throw new Error("Project was not found.");
  }
}

function presentAsset(asset: Doc<"assets">) {
  const safeAsset = { ...asset };
  delete safeAsset.deletedAt;
  delete safeAsset.isDeleted;
  return {
    ...safeAsset,
    id: asset._id,
    visibility: asset.visibility ?? "private",
    coverImageUrl: undefined,
    image: undefined,
    title: asset.name,
    reference: asset._id,
    project: asset.project ?? asset.type,
    city: "",
    price: asset.status,
    area: asset.visibility ?? "private",
    bedrooms: 0,
    bathrooms: 0,
    purpose: "sale" as const,
  };
}

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: assetInputValidator,
  },
  returns: assetValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "asset", "create");
    await assertProjectBelongsToOrganization(ctx, args.organizationId, args.input.projectId);

    const now = Date.now();
    const id = await ctx.db.insert("assets", {
      organizationId: args.organizationId,
      ...args.input,
      ownerUserId: user._id,
      visibility: args.input.visibility ?? "private",
      isDeleted: false,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "asset.create",
      target: id,
      summary: `Created asset ${args.input.name}.`,
      createdAt: now,
    });

    const asset = await ctx.db.get(id);
    if (!asset) throw new Error("Asset could not be created.");
    return presentAsset(asset);
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    assetId: v.id("assets"),
    input: assetInputValidator,
  },
  returns: assetValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "asset", "update");
    await assertProjectBelongsToOrganization(ctx, args.organizationId, args.input.projectId);
    const existing = await ctx.db.get(args.assetId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Asset was not found.");
    }

    const nextVisibility = args.input.visibility ?? (existing.visibility ?? "private");
    const now = Date.now();
    await ctx.db.patch(args.assetId, {
      ...args.input,
      visibility: nextVisibility,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "asset.update",
      target: args.assetId,
      summary: `Updated asset ${args.input.name}.`,
      createdAt: now,
    });

    const asset = await ctx.db.get(args.assetId);
    if (!asset) throw new Error("Asset was not found.");
    return presentAsset(asset);
  },
});

export const deleteFromHono = mutation({
  args: {
    organizationId: v.string(),
    assetId: v.id("assets"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "asset", "delete");
    const existing = await ctx.db.get(args.assetId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Asset was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.assetId, { deletedAt: now, isDeleted: true, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "asset.delete",
      target: args.assetId,
      summary: `Deleted asset ${existing.name}.`,
      createdAt: now,
    });

    return { removed: true };
  },
});
