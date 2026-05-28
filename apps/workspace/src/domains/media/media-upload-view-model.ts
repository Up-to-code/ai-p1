import { inferMediaKind, type MediaKind } from "./api/media";

export type UploadQueueStatus = "queued" | "uploading" | "uploaded" | "failed";

export type MediaUploadLabels = {
  title: string;
  description: string;
  hideHeader?: boolean;
  hideDropDescription?: boolean;
  pick: string;
  queued: string;
  upload: string;
  setCover: string;
  delete: string;
  videoLimit: string;
  imageLimit: string;
  unsupported: string;
  statusQueued: string;
  statusUploading: string;
  statusUploaded: string;
  statusFailed: string;
  remove: string;
  retry: string;
  cover: string;
};

export type UploadQueueItem<TAsset = unknown> = {
  id: string;
  file: File;
  kind: MediaKind;
  previewUrl: string | null;
  status: UploadQueueStatus;
  error?: string;
  asset?: TAsset;
};

type UploadConstraintMedia = {
  kind: MediaKind;
};

type UploadConstraintQueueItem = {
  kind: MediaKind;
  status: UploadQueueStatus;
};

export const defaultMediaUploadLabels: MediaUploadLabels = {
  title: "Media",
  description: "Add images, videos, and PDFs. The first image becomes the cover.",
  pick: "Choose files",
  queued: "Queued files",
  upload: "Upload media",
  setCover: "Set cover",
  delete: "Delete",
  videoLimit: "Only one overview video can be added here.",
  imageLimit: "You can upload up to 10 images at a time.",
  unsupported: "This file type is reserved for the Assets section.",
  statusQueued: "Queued",
  statusUploading: "Uploading",
  statusUploaded: "Uploaded",
  statusFailed: "Failed",
  remove: "Remove",
  retry: "Retry",
  cover: "Cover",
};

export function mergeMediaUploadLabels(overrides?: Partial<MediaUploadLabels>): MediaUploadLabels {
  return { ...defaultMediaUploadLabels, ...overrides };
}

export function mediaUploadAccept(allowedKinds: MediaKind[]) {
  return [
    allowedKinds.includes("image") ? "image/*" : null,
    allowedKinds.includes("video") ? "video/*" : null,
    allowedKinds.includes("document") ? "application/pdf" : null,
  ].filter(Boolean).join(",");
}

export function userFacingUploadError(error: unknown) {
  const message = error instanceof Error ? error.message : "Upload failed.";
  if (/no secret provided/i.test(message) || /uploadthing/i.test(message)) {
    return "Upload storage is not configured. Check UploadThing environment keys.";
  }
  return message;
}

export function createQueueItem<TAsset = unknown>(file: File): UploadQueueItem<TAsset> {
  const kind = inferMediaKind(file.type);
  const previewUrl = kind === "image" || kind === "video" ? URL.createObjectURL(file) : null;
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    kind,
    previewUrl,
    status: "queued",
  };
}

export function appendUploadQueueItems<TAsset>(
  queue: UploadQueueItem<TAsset>[],
  items: UploadQueueItem<TAsset>[],
) {
  return [...queue, ...items];
}

export function uploadQueueItemsById<TAsset>(
  queue: UploadQueueItem<TAsset>[],
  itemIds: string[],
) {
  return queue.filter((item) => itemIds.includes(item.id));
}

export function markUploadQueueItemUploading<TAsset>(queue: UploadQueueItem<TAsset>[], itemId: string) {
  return queue.map((entry) => entry.id === itemId ? { ...entry, status: "uploading" as const, error: undefined } : entry);
}

export function markUploadQueueItemUploaded<TAsset>(
  queue: UploadQueueItem<TAsset>[],
  itemId: string,
  asset: TAsset,
) {
  return queue.map((entry) => entry.id === itemId ? { ...entry, status: "uploaded" as const, asset } : entry);
}

export function markUploadQueueItemFailed<TAsset>(
  queue: UploadQueueItem<TAsset>[],
  itemId: string,
  error: string,
) {
  return queue.map((entry) => entry.id === itemId ? { ...entry, status: "failed" as const, error } : entry);
}

export function markUploadQueueBatchFailed<TAsset>(
  queue: UploadQueueItem<TAsset>[],
  itemIds: string[],
  error: string,
) {
  return queue.map((item) => itemIds.includes(item.id) ? { ...item, status: "failed" as const, error } : item);
}

export function removeUploadQueueItem<TAsset>(queue: UploadQueueItem<TAsset>[], itemId: string) {
  return queue.filter((entry) => entry.id !== itemId);
}

export function queuedUploadItemIds<TAsset>(queue: UploadQueueItem<TAsset>[]) {
  return queue
    .filter((item) => item.status === "queued" || item.status === "failed")
    .map((item) => item.id);
}

export function uploadFileSizeLabel(size: number) {
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

export function selectAcceptedMediaFiles(params: {
  files: File[];
  allowedKinds: MediaKind[];
  maxImages?: number;
  maxVideos?: number;
  queuedImageCount: number;
  existingVideoCount: number;
  pendingVideoCount: number;
  labels: Pick<MediaUploadLabels, "unsupported" | "imageLimit" | "videoLimit">;
}) {
  const accepted: File[] = [];
  let validationError: string | null = null;
  let nextImageCount = params.queuedImageCount;
  let nextVideoCount = params.existingVideoCount + params.pendingVideoCount;

  for (const file of params.files) {
    const kind = inferMediaKind(file.type);
    if (!params.allowedKinds.includes(kind)) {
      validationError = params.labels.unsupported;
      continue;
    }
    if (kind === "image" && typeof params.maxImages === "number" && nextImageCount >= params.maxImages) {
      validationError = params.labels.imageLimit;
      continue;
    }
    if (kind === "video" && typeof params.maxVideos === "number" && nextVideoCount >= params.maxVideos) {
      validationError = params.labels.videoLimit;
      continue;
    }
    if (kind === "image") nextImageCount += 1;
    if (kind === "video") nextVideoCount += 1;
    accepted.push(file);
  }

  return { accepted, validationError };
}

export function resourceMediaUploadState<TMedia extends UploadConstraintMedia>(params: {
  media?: TMedia[];
  allowedKinds: MediaKind[];
  immediate: boolean;
  queue: UploadConstraintQueueItem[];
  pendingFiles: Pick<File, "type">[];
}) {
  const visibleMedia = params.media?.filter((asset) => params.allowedKinds.includes(asset.kind));
  const existingVideoCount = params.media?.filter((asset) => asset.kind === "video").length ?? 0;
  const queuedImageCount = params.immediate
    ? params.queue.filter((item) => item.kind === "image" && item.status !== "uploaded").length
    : params.pendingFiles.filter((file) => file.type.startsWith("image/")).length;
  const pendingVideoCount = params.pendingFiles.filter((file) => file.type.startsWith("video/")).length;

  return {
    visibleMedia,
    existingVideoCount,
    queuedImageCount,
    pendingVideoCount,
  };
}

export function removePendingMediaFileAt<TFile>(files: TFile[], index: number) {
  return files.filter((_, fileIndex) => fileIndex !== index);
}

export function uploadQueueStatusPresentation(status: UploadQueueStatus, labels: MediaUploadLabels) {
  if (status === "uploading") return { label: labels.statusUploading, tone: "uploading" as const };
  if (status === "uploaded") return { label: labels.statusUploaded, tone: "uploaded" as const };
  if (status === "failed") return { label: labels.statusFailed, tone: "failed" as const };
  return { label: labels.statusQueued, tone: "queued" as const };
}
