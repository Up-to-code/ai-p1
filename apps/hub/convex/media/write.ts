import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { authComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { assertPlatformAdmin } from "../platform/access";
import { getMediaAsset, getMediaFolder, listResourceMedia, listResourceMediaFolders } from "./data";
import {
  attachMediaInputValidator,
  createMediaFolderInputValidator,
  mediaAssetValidator,
  mediaFolderValidator,
  updateMediaInputValidator,
} from "./validators";
import type { MediaResourceType } from "./data";

function permissionResourceForMedia(resourceType: MediaResourceType) {
  if (resourceType === "project") return "project";
  if (resourceType === "property") return "property";
  if (resourceType === "calendarEvent") return "calendar";
  return "client";
}

async function assertResourceExists(
  ctx: MutationCtx,
  organizationId: string,
  resourceType: MediaResourceType,
  resourceId: string,
) {
  if (resourceType === "project") {
    const project = await ctx.db.get(resourceId as Id<"projects">);
    if (!project || project.organizationId !== organizationId || project.deletedAt) {
      throw new Error("Project was not found.");
    }
    return;
  }

  if (resourceType === "property") {
    const property = await ctx.db.get(resourceId as Id<"propertyUnits">);
    if (!property || property.organizationId !== organizationId || property.deletedAt) {
      throw new Error("Property unit was not found.");
    }
    return;
  }

  if (resourceType === "client") {
    const client = await ctx.db.get(resourceId as Id<"clients">);
    if (!client || client.organizationId !== organizationId || client.deletedAt) {
      throw new Error("Client was not found.");
    }
    return;
  }

  if (resourceType === "calendarEvent") {
    const event = await ctx.db.get(resourceId as Id<"calendarEvents">);
    if (!event || event.organizationId !== organizationId || event.deletedAt) {
      throw new Error("Calendar event was not found.");
    }
    return;
  }

  const task = await ctx.db.get(resourceId as Id<"clientTasks">);
  if (!task || task.organizationId !== organizationId || task.deletedAt) {
    throw new Error("Task was not found.");
  }
}

async function clearExistingCover(
  ctx: MutationCtx,
  organizationId: string,
  resourceType: MediaResourceType,
  resourceId: string,
) {
  const media = await listResourceMedia(ctx, organizationId, resourceType, resourceId);
  await Promise.all(
    media
      .filter((asset) => asset.isCover)
      .map((asset) => ctx.db.patch(asset._id, { isCover: false, updatedAt: Date.now() })),
  );
}

async function assertFolderBelongsToResource(
  ctx: MutationCtx,
  organizationId: string,
  resourceType: MediaResourceType,
  resourceId: string,
  folderId: Id<"mediaFolders">,
) {
  const folder = await getMediaFolder(ctx, folderId);
  if (
    !folder ||
    folder.deletedAt ||
    folder.organizationId !== organizationId ||
    folder.resourceType !== resourceType ||
    folder.resourceId !== resourceId
  ) {
    throw new Error("Folder was not found.");
  }
}

export const attachFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: attachMediaInputValidator,
  },
  returns: mediaAssetValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const resource = permissionResourceForMedia(args.input.resourceType);
    await assertOrganizationResourcePermission(ctx, args.organizationId, resource, "update");
    await assertResourceExists(ctx, args.organizationId, args.input.resourceType, args.input.resourceId);

    const now = Date.now();
    if (args.input.folderId) {
      await assertFolderBelongsToResource(
        ctx,
        args.organizationId,
        args.input.resourceType,
        args.input.resourceId,
        args.input.folderId,
      );
    }

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
      folderId: args.input.folderId,
      shareVisibility: "private",
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

    const resource = permissionResourceForMedia(asset.resourceType);
    await assertOrganizationResourcePermission(ctx, args.organizationId, resource, "update");

    if (args.input.isCover) {
      if (asset.kind !== "image") {
        throw new Error("Only images can be used as covers.");
      }
      await clearExistingCover(ctx, args.organizationId, asset.resourceType, asset.resourceId);
    }

    const visibilityChanged =
      args.input.shareVisibility && args.input.shareVisibility !== (asset.shareVisibility ?? "private");
    if (visibilityChanged) {
      await assertPlatformAdmin(ctx);
    }
    const now = Date.now();

    await ctx.db.patch(args.mediaId, {
      ...args.input,
      publicEnabledAt: visibilityChanged && args.input.shareVisibility === "public" ? now : asset.publicEnabledAt,
      publicDisabledAt: visibilityChanged && args.input.shareVisibility === "private" ? now : asset.publicDisabledAt,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: `${asset.resourceType}.media.update`,
      target: asset.resourceId,
      summary: `Updated ${asset.name}.`,
      createdAt: now,
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

    const resource = permissionResourceForMedia(asset.resourceType);
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

export const createFolderFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: createMediaFolderInputValidator,
  },
  returns: mediaFolderValidator,
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const resource = permissionResourceForMedia(args.input.resourceType);
    await assertOrganizationResourcePermission(ctx, args.organizationId, resource, "update");
    await assertResourceExists(ctx, args.organizationId, args.input.resourceType, args.input.resourceId);

    const name = args.input.name.trim();
    if (!name) throw new Error("Folder name is required.");

    const existing = await listResourceMediaFolders(ctx, args.organizationId, args.input.resourceType, args.input.resourceId);
    if (existing.some((folder) => folder.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("A folder with this name already exists.");
    }

    const now = Date.now();
    const id = await ctx.db.insert("mediaFolders", {
      organizationId: args.organizationId,
      resourceType: args.input.resourceType,
      resourceId: args.input.resourceId,
      name,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: `${args.input.resourceType}.media.folder.create`,
      target: args.input.resourceId,
      summary: `Created folder ${name}.`,
      createdAt: now,
    });

    const folder = await ctx.db.get(id);
    if (!folder) throw new Error("Folder could not be created.");
    return folder;
  },
});

export const deleteFolderFromHono = mutation({
  args: {
    organizationId: v.string(),
    folderId: v.id("mediaFolders"),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const folder = await getMediaFolder(ctx, args.folderId);
    if (!folder || folder.organizationId !== args.organizationId || folder.deletedAt) {
      throw new Error("Folder was not found.");
    }

    const resource = permissionResourceForMedia(folder.resourceType);
    await assertOrganizationResourcePermission(ctx, args.organizationId, resource, "update");

    const media = await listResourceMedia(ctx, args.organizationId, folder.resourceType, folder.resourceId);
    await Promise.all(
      media
        .filter((asset) => asset.folderId === args.folderId)
        .map((asset) => ctx.db.patch(asset._id, { folderId: undefined, updatedAt: Date.now() })),
    );

    await ctx.db.patch(args.folderId, { deletedAt: Date.now(), updatedAt: Date.now() });
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: `${folder.resourceType}.media.folder.delete`,
      target: folder.resourceId,
      summary: `Deleted folder ${folder.name}.`,
      createdAt: Date.now(),
    });

    return { removed: true };
  },
});
