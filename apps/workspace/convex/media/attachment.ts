import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { assertPlatformAdmin } from "../platform/access";
import {
  getMediaAsset,
  getMediaFolder,
  listResourceMedia,
  listResourceMediaFolders,
} from "./data";
import {
  assertFolderBelongsToResource,
  assertMediaPermission,
  assertMediaResourceExists,
  clearMediaFolderAssignments,
  clearExistingCover,
} from "./resourcePolicy";
import type {
  attachMediaInputValidator,
  createMediaFolderInputValidator,
  updateMediaInputValidator,
} from "./validators";
import { assertOrganizationStorageAvailable } from "../billing/storage";
import { cleanupAttachmentSearch, enqueueMediaSecurityScan, refreshAttachmentSearchProjection } from "../search/extraction";

type AttachMediaInput = typeof attachMediaInputValidator.type;
type UpdateMediaInput = typeof updateMediaInputValidator.type;
type CreateMediaFolderInput = typeof createMediaFolderInputValidator.type;

async function insertMediaAudit(
  ctx: MutationCtx,
  organizationId: string,
  actorUserId: string,
  action: string,
  target: string,
  summary: string,
  createdAt = Date.now(),
) {
  await ctx.db.insert("organizationAuditEvents", {
    organizationId,
    actorUserId,
    action,
    target,
    summary,
    createdAt,
  });
}

export async function attachMediaToResource(
  ctx: MutationCtx,
  args: { organizationId: string; input: AttachMediaInput; actorUserId: string },
): Promise<Doc<"mediaAssets">> {
  await assertMediaPermission(ctx, args.organizationId, args.input.resourceType, "update");
  await assertMediaResourceExists(ctx, args.organizationId, args.input.resourceType, args.input.resourceId);
  await assertOrganizationStorageAvailable(ctx, args.organizationId, args.input.size);

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
    malwareScanStatus: "pending",
    createdByUserId: args.actorUserId,
    createdAt: now,
    updatedAt: now,
  });

  await insertMediaAudit(
    ctx,
    args.organizationId,
    args.actorUserId,
    `${args.input.resourceType}.media.attach`,
    args.input.resourceId,
    `Attached ${args.input.name}.`,
    now,
  );

  const asset = await ctx.db.get(id);
  if (!asset) throw new Error("Media asset could not be created.");
  await enqueueMediaSecurityScan(ctx, asset);
  return asset;
}

export async function updateMediaAsset(
  ctx: MutationCtx,
  args: { organizationId: string; mediaId: Id<"mediaAssets">; input: UpdateMediaInput; actorUserId: string },
): Promise<Doc<"mediaAssets">> {
  const asset = await getMediaAsset(ctx, args.mediaId);
  if (!asset || asset.organizationId !== args.organizationId) {
    throw new Error("Media asset was not found.");
  }

  await assertMediaPermission(ctx, args.organizationId, asset.resourceType, "update");

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

  await insertMediaAudit(
    ctx,
    args.organizationId,
    args.actorUserId,
    `${asset.resourceType}.media.update`,
    asset.resourceId,
    `Updated ${asset.name}.`,
    now,
  );

  const updated = await ctx.db.get(args.mediaId);
  if (!updated) throw new Error("Media asset was not found.");
  await refreshAttachmentSearchProjection(ctx, updated);
  return updated;
}

export async function removeMediaAsset(
  ctx: MutationCtx,
  args: { organizationId: string; mediaId: Id<"mediaAssets">; actorUserId: string },
) {
  const asset = await getMediaAsset(ctx, args.mediaId);
  if (!asset || asset.organizationId !== args.organizationId) {
    throw new Error("Media asset was not found.");
  }

  await assertMediaPermission(ctx, args.organizationId, asset.resourceType, "update");

  await cleanupAttachmentSearch(ctx, args.organizationId, args.mediaId);
  await ctx.db.delete(args.mediaId);
  await insertMediaAudit(
    ctx,
    args.organizationId,
    args.actorUserId,
    `${asset.resourceType}.media.remove`,
    asset.resourceId,
    `Removed ${asset.name}.`,
  );

  return { removed: true };
}

export async function createMediaFolderForResource(
  ctx: MutationCtx,
  args: { organizationId: string; input: CreateMediaFolderInput; actorUserId: string },
) {
  await assertMediaPermission(ctx, args.organizationId, args.input.resourceType, "update");
  await assertMediaResourceExists(ctx, args.organizationId, args.input.resourceType, args.input.resourceId);

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
    createdByUserId: args.actorUserId,
    createdAt: now,
    updatedAt: now,
  });

  await insertMediaAudit(
    ctx,
    args.organizationId,
    args.actorUserId,
    `${args.input.resourceType}.media.folder.create`,
    args.input.resourceId,
    `Created folder ${name}.`,
    now,
  );

  const folder = await ctx.db.get(id);
  if (!folder) throw new Error("Folder could not be created.");
  return folder;
}

export async function deleteMediaFolderForResource(
  ctx: MutationCtx,
  args: { organizationId: string; folderId: Id<"mediaFolders">; actorUserId: string },
) {
  const folder = await getMediaFolder(ctx, args.folderId);
  if (!folder || folder.organizationId !== args.organizationId || folder.deletedAt) {
    throw new Error("Folder was not found.");
  }

  await assertMediaPermission(ctx, args.organizationId, folder.resourceType, "update");

  const now = Date.now();
  const media = await listResourceMedia(ctx, args.organizationId, folder.resourceType, folder.resourceId);
  await clearMediaFolderAssignments(ctx, media, args.folderId, now);

  await ctx.db.patch(args.folderId, { deletedAt: now, updatedAt: now });
  await insertMediaAudit(
    ctx,
    args.organizationId,
    args.actorUserId,
    `${folder.resourceType}.media.folder.delete`,
    folder.resourceId,
    `Deleted folder ${folder.name}.`,
    now,
  );

  return { removed: true };
}
