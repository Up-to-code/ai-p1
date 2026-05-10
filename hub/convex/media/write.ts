import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { authComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { getMediaAsset, listResourceMedia } from "./data";
import { attachMediaInputValidator, mediaAssetValidator, updateMediaInputValidator } from "./validators";

async function assertResourceExists(
  ctx: MutationCtx,
  organizationId: string,
  resourceType: "project" | "property",
  resourceId: string,
) {
  if (resourceType === "project") {
    const project = await ctx.db.get(resourceId as Id<"projects">);
    if (!project || project.organizationId !== organizationId || project.deletedAt) {
      throw new Error("Project was not found.");
    }
    return;
  }

  const property = await ctx.db.get(resourceId as Id<"propertyUnits">);
  if (!property || property.organizationId !== organizationId || property.deletedAt) {
    throw new Error("Property unit was not found.");
  }
}

async function clearExistingCover(
  ctx: MutationCtx,
  organizationId: string,
  resourceType: "project" | "property",
  resourceId: string,
) {
  const media = await listResourceMedia(ctx, organizationId, resourceType, resourceId);
  await Promise.all(
    media
      .filter((asset) => asset.isCover)
      .map((asset) => ctx.db.patch(asset._id, { isCover: false, updatedAt: Date.now() })),
  );
}

export const attachFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: attachMediaInputValidator,
  },
  returns: mediaAssetValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const resource = args.input.resourceType === "project" ? "project" : "property";
    await assertOrganizationResourcePermission(ctx, args.organizationId, resource, "update");
    await assertResourceExists(ctx, args.organizationId, args.input.resourceType, args.input.resourceId);

    const now = Date.now();
    const existing = await listResourceMedia(ctx, args.organizationId, args.input.resourceType, args.input.resourceId);
    const shouldCover = args.input.kind === "image" && (args.input.isCover || existing.every((asset) => asset.kind !== "image"));

    if (shouldCover) {
      await clearExistingCover(ctx, args.organizationId, args.input.resourceType, args.input.resourceId);
    }

    const id = await ctx.db.insert("mediaAssets", {
      organizationId: args.organizationId,
      key: args.input.key,
      url: args.input.url,
      name: args.input.name,
      mimeType: args.input.mimeType,
      size: args.input.size,
      kind: args.input.kind,
      resourceType: args.input.resourceType,
      resourceId: args.input.resourceId,
      sortOrder: existing.length,
      isCover: shouldCover,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: `${args.input.resourceType}.media.attach`,
      target: args.input.resourceId,
      summary: `Attached ${args.input.name}.`,
      createdAt: now,
    });

    const asset = await ctx.db.get(id);
    if (!asset) throw new Error("Media asset could not be created.");
    return asset;
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    mediaId: v.id("mediaAssets"),
    input: updateMediaInputValidator,
  },
  returns: mediaAssetValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const asset = await getMediaAsset(ctx, args.mediaId);
    if (!asset || asset.organizationId !== args.organizationId) {
      throw new Error("Media asset was not found.");
    }

    const resource = asset.resourceType === "project" ? "project" : "property";
    await assertOrganizationResourcePermission(ctx, args.organizationId, resource, "update");

    if (args.input.isCover) {
      if (asset.kind !== "image") {
        throw new Error("Only images can be used as covers.");
      }
      await clearExistingCover(ctx, args.organizationId, asset.resourceType, asset.resourceId);
    }

    await ctx.db.patch(args.mediaId, {
      ...args.input,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: `${asset.resourceType}.media.update`,
      target: asset.resourceId,
      summary: `Updated ${asset.name}.`,
      createdAt: Date.now(),
    });

    const updated = await ctx.db.get(args.mediaId);
    if (!updated) throw new Error("Media asset was not found.");
    return updated;
  },
});

export const removeFromHono = mutation({
  args: {
    organizationId: v.string(),
    mediaId: v.id("mediaAssets"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const asset = await getMediaAsset(ctx, args.mediaId);
    if (!asset || asset.organizationId !== args.organizationId) {
      throw new Error("Media asset was not found.");
    }

    const resource = asset.resourceType === "project" ? "project" : "property";
    await assertOrganizationResourcePermission(ctx, args.organizationId, resource, "update");

    await ctx.db.delete(args.mediaId);
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: `${asset.resourceType}.media.remove`,
      target: asset.resourceId,
      summary: `Removed ${asset.name}.`,
      createdAt: Date.now(),
    });

    return { removed: true };
  },
});
