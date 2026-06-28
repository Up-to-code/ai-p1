"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { uploadFiles } from "@/lib/uploadthing";
import type { Id } from "@convex/_generated/dataModel";
import { workspaceMutation } from "@/domains/resources/workspace-resource-request";

export type MediaKind = "image" | "video" | "document";
export type MediaResourceType = "project" | "client" | "calendarEvent" | "task";
export type MediaShareVisibility = "private" | "public" | "team" | "owner" | "member";
export type MediaAsset = {
  _id: Id<"mediaAssets">;
  _creationTime: number;
  organizationId: string;
  key: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
  kind: MediaKind;
  resourceType: MediaResourceType;
  resourceId: string;
  folderId?: Id<"mediaFolders">;
  shareVisibility?: MediaShareVisibility;
  publicEnabledAt?: number;
  publicDisabledAt?: number;
  sortOrder: number;
  isCover: boolean;
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
};

export function inferMediaKind(mimeType: string): MediaKind {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

export function useResourceMediaQuery(
  organizationId: string | undefined,
  resourceType: MediaResourceType,
  resourceId: string | undefined,
) {
  return useQuery(
    api.media.read.listForResource,
    organizationId && resourceId ? { organizationId, resourceType, resourceId } : "skip",
  );
}

export async function attachUploadedMedia(params: {
  organizationId: string;
  resourceType: MediaResourceType;
  resourceId: string;
  upload: {
    key: string;
    name: string;
    size: number;
    mimeType?: string;
    type?: string;
    url?: string;
  };
  isCover?: boolean;
  folderId?: string;
}) {
  const mimeType = params.upload.mimeType ?? params.upload.type ?? "application/octet-stream";
  const url = params.upload.url;
  if (!url) throw new Error("Uploaded file did not return a URL.");

  return requestOrganizationAction<MediaAsset>(
    organizationApiPath(params.organizationId, "media", "attach"),
    "POST",
    {
      key: params.upload.key,
      url,
      name: params.upload.name,
      size: params.upload.size,
      mimeType,
      kind: inferMediaKind(mimeType),
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      folderId: params.folderId,
      isCover: params.isCover,
    },
    "Media request failed.",
  );
}

export async function uploadAndAttachMedia(params: {
  organizationId: string;
  resourceType: MediaResourceType;
  resourceId: string;
  files: File[];
  folderId?: string;
}) {
  if (params.files.length === 0) return [];

  const endpoint = params.resourceType === "project" ? "projectMedia" : "clientMedia";
  const uploaded = await uploadFiles(endpoint, {
    files: params.files,
    input: { organizationId: params.organizationId },
  });

  return Promise.all(
    uploaded.map((upload, index) =>
      attachUploadedMedia({
        organizationId: params.organizationId,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        upload: upload as never,
        folderId: params.folderId,
        isCover: index === 0 && inferMediaKind(((upload as never) as { mimeType?: string; type?: string }).mimeType ?? ((upload as never) as { type?: string }).type ?? "") === "image",
      }),
    ),
  );
}

export async function setMediaCoverRequest(organizationId: string, mediaId: string) {
  return requestOrganizationAction<MediaAsset>(
    organizationApiPath(organizationId, "media", mediaId),
    "PATCH",
    { isCover: true },
    "Media request failed.",
  );
}

export async function deleteMediaRequest(organizationId: string, mediaId: string) {
  return requestOrganizationAction(
    organizationApiPath(organizationId, "media", mediaId),
    "DELETE",
    undefined,
    "Media request failed.",
  );
}

export async function setMediaShareVisibilityRequest(
  organizationId: string,
  mediaId: string,
  shareVisibility: MediaShareVisibility,
) {
  return requestOrganizationAction<MediaAsset>(
    organizationApiPath(organizationId, "media", mediaId),
    "PATCH",
    { shareVisibility },
    "Media request failed.",
  );
}

export async function createMediaFolderRequest(params: {
  organizationId: string;
  resourceType: MediaResourceType;
  resourceId: string;
  name: string;
}) {
  return requestOrganizationAction(
    organizationApiPath(params.organizationId, "media", "folders"),
    "POST",
    {
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      name: params.name,
    },
    "Media request failed.",
  );
}

export async function deleteMediaFolderRequest(organizationId: string, folderId: string) {
  return requestOrganizationAction(
    organizationApiPath(organizationId, "media", "folders", folderId),
    "DELETE",
    undefined,
    "Media request failed.",
  );
}
