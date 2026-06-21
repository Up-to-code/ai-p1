"use client";

import type { MediaKind } from "./api/media";

export type UploadStatus = "idle" | "uploading" | "uploaded";
export type ShareVisibility = "private" | "public" | "team" | "owner" | "member";
export type PendingUpload = {
  id: string;
  file: File;
  baseName: string;
  extension: string;
  isEditing: boolean;
};

function inferLocalKind(file: File): MediaKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

export function formatSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function fileTypeLabel(file: File, extension: string) {
  if (file.type.startsWith("image/")) return extension ? extension.slice(1).toUpperCase() : "IMAGE";
  if (file.type === "application/pdf") return "PDF";
  return extension ? extension.slice(1).toUpperCase() : "FILE";
}

export function mediaTypeLabel(kind: MediaKind, mimeType: string) {
  if (kind === "image") return mimeType.split("/")[1]?.toUpperCase() || "IMAGE";
  if (mimeType === "application/pdf") return "PDF";
  return kind.toUpperCase();
}

export function shareUrl(mediaId: string) {
  if (typeof window === "undefined") return `/f/${mediaId}`;
  return `${window.location.origin}/f/${mediaId}`;
}

export async function copyText(value: string, unavailableMessage: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error(unavailableMessage);
  }

  await navigator.clipboard.writeText(value);
}

function pendingUploadId(file: File) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
}

function splitFileName(name: string) {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex <= 0) return { baseName: name, extension: "" };
  return {
    baseName: name.slice(0, dotIndex),
    extension: name.slice(dotIndex),
  };
}

export function pendingUploadName({ file, baseName, extension }: PendingUpload) {
  return `${baseName.trim() || splitFileName(file.name).baseName}${extension}`;
}

export function selectPendingDocumentUploads(files: FileList | File[], unsupportedMessage: string) {
  const accepted: PendingUpload[] = [];
  let validationError: string | null = null;

  for (const file of Array.from(files)) {
    const kind = inferLocalKind(file);
    if (kind !== "image" && file.type !== "application/pdf") {
      validationError = unsupportedMessage;
      continue;
    }

    const { baseName, extension } = splitFileName(file.name);
    accepted.push({
      id: pendingUploadId(file),
      file,
      baseName,
      extension,
      isEditing: false,
    });
  }

  return { accepted, validationError };
}

export function updatePendingUploadBaseName(queue: PendingUpload[], id: string, baseName: string) {
  return queue.map((queued) => queued.id === id ? { ...queued, baseName } : queued);
}

export function finishPendingUploadEdit(queue: PendingUpload[], id: string) {
  return queue.map((queued) => queued.id === id ? { ...queued, isEditing: false } : queued);
}

export function togglePendingUploadEdit(queue: PendingUpload[], id: string) {
  return queue.map((queued) => queued.id === id ? { ...queued, isEditing: !queued.isEditing } : queued);
}

export function removePendingUpload(queue: PendingUpload[], id: string) {
  return queue.filter((queued) => queued.id !== id);
}

export function renamedFile(item: PendingUpload) {
  const safeName = pendingUploadName(item);
  if (safeName === item.file.name) return item.file;

  return new File([item.file], safeName, {
    type: item.file.type,
    lastModified: item.file.lastModified,
  });
}

export function openLocalFile(file: File) {
  const url = URL.createObjectURL(file);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
