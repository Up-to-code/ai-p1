"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { uploadFiles } from "@/lib/uploadthing";
import type { Id } from "@convex/_generated/dataModel";

export type MediaKind = "image" | "video" | "document";
export type MediaResourceType = "project" | "property";

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

async function jsonOrThrow(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Media request failed.");
  }
  return payload;
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
    ufsUrl?: string;
  };
  isCover?: boolean;
}) {
  const mimeType = params.upload.mimeType ?? params.upload.type ?? "application/octet-stream";
  const url = params.upload.ufsUrl ?? params.upload.url;
  if (!url) throw new Error("Uploaded file did not return a URL.");

  const response = await fetch(`/api/v1/organizations/${params.organizationId}/media/attach`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      key: params.upload.key,
      url,
      name: params.upload.name,
      size: params.upload.size,
      mimeType,
      kind: inferMediaKind(mimeType),
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      isCover: params.isCover,
    }),
  });
  return jsonOrThrow(response);
}

export async function uploadAndAttachMedia(params: {
  organizationId: string;
  resourceType: MediaResourceType;
  resourceId: string;
  files: File[];
}) {
  if (params.files.length === 0) return [];

  const endpoint = params.resourceType === "project" ? "projectMedia" : "propertyMedia";
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
        isCover: index === 0 && inferMediaKind(((upload as never) as { mimeType?: string; type?: string }).mimeType ?? ((upload as never) as { type?: string }).type ?? "") === "image",
      }),
    ),
  );
}

export async function setMediaCoverRequest(organizationId: string, mediaId: string) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/media/${mediaId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ isCover: true }),
  });
  return jsonOrThrow(response);
}

export async function deleteMediaRequest(organizationId: string, mediaId: string) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/media/${mediaId}`, {
    method: "DELETE",
  });
  return jsonOrThrow(response);
}

export type MediaAssetId = Id<"mediaAssets">;
