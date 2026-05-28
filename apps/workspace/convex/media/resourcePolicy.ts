import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { getMediaFolder, listResourceMedia, type MediaResourceType } from "./data";

type MediaCtx = QueryCtx | MutationCtx;

export function permissionResourceForMedia(resourceType: MediaResourceType) {
  if (resourceType === "project") return "project";
  if (resourceType === "property") return "property";
  if (resourceType === "calendarEvent") return "calendar";
  return "client";
}

export async function assertMediaPermission(
  ctx: MediaCtx,
  organizationId: string,
  resourceType: MediaResourceType,
  action: "read" | "update",
) {
  await assertOrganizationResourcePermission(
    ctx,
    organizationId,
    permissionResourceForMedia(resourceType),
    action,
  );
}

export async function assertMediaResourceExists(
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

export async function clearExistingCover(
  ctx: MutationCtx,
  organizationId: string,
  resourceType: MediaResourceType,
  resourceId: string,
) {
  const media = await listResourceMedia(ctx, organizationId, resourceType, resourceId);
  const now = Date.now();
  await Promise.all(
    media
      .filter((asset) => asset.isCover)
      .map((asset) => ctx.db.patch(asset._id, { isCover: false, updatedAt: now })),
  );
}

export function mediaAssetsInFolder<TAsset extends { folderId?: Id<"mediaFolders"> }>(
  media: TAsset[],
  folderId: Id<"mediaFolders">,
) {
  return media.filter((asset) => asset.folderId === folderId);
}

export async function clearMediaFolderAssignments(
  ctx: MutationCtx,
  media: Array<{ _id: Id<"mediaAssets">; folderId?: Id<"mediaFolders"> }>,
  folderId: Id<"mediaFolders">,
  updatedAt = Date.now(),
) {
  await Promise.all(
    mediaAssetsInFolder(media, folderId).map((asset) =>
      ctx.db.patch(asset._id, { folderId: undefined, updatedAt }),
    ),
  );
}

export async function assertFolderBelongsToResource(
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
