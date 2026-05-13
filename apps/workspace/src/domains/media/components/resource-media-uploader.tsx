"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, FileText, ImageIcon, Loader2, RotateCcw, Star, Trash2, UploadCloud, Video, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  deleteMediaRequest,
  setMediaCoverRequest,
  uploadAndAttachMedia,
  useResourceMediaQuery,
  type MediaKind,
  type MediaResourceType,
} from "../api/media";
import { useOperationState } from "@/lib/utils/operation-state";

type ResourceMediaUploaderProps = {
  organizationId?: string;
  resourceType: MediaResourceType;
  resourceId?: string;
  pendingFiles: File[];
  onPendingFilesChange: (files: File[]) => void;
  className?: string;
  allowedKinds?: MediaKind[];
  maxImages?: number;
  maxVideos?: number;
  variant?: "default" | "review";
  labels?: {
    title?: string;
    description?: string;
    hideHeader?: boolean;
    hideDropDescription?: boolean;
    pick?: string;
    queued?: string;
    upload?: string;
    setCover?: string;
    delete?: string;
    videoLimit?: string;
    imageLimit?: string;
    unsupported?: string;
    statusQueued?: string;
    statusUploading?: string;
    statusUploaded?: string;
    statusFailed?: string;
    remove?: string;
    retry?: string;
    cover?: string;
  };
  immediate?: boolean;
  hideExisting?: boolean;
};

type UploadQueueStatus = "queued" | "uploading" | "uploaded" | "failed";

type UploadQueueItem = {
  id: string;
  file: File;
  kind: MediaKind;
  previewUrl: string | null;
  status: UploadQueueStatus;
  error?: string;
  asset?: Awaited<ReturnType<typeof uploadAndAttachMedia>>[number];
};

const defaultLabels = {
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

function MediaIcon({ kind }: { kind: string }) {
  if (kind === "image") return <ImageIcon className="h-4 w-4" />;
  if (kind === "video") return <Video className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function userFacingUploadError(error: unknown) {
  const message = error instanceof Error ? error.message : "Upload failed.";
  if (/no secret provided/i.test(message) || /uploadthing/i.test(message)) {
    return "Upload storage is not configured. Check UploadThing environment keys.";
  }
  return message;
}

function createQueueItem(file: File): UploadQueueItem {
  const kind: MediaKind = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document";
  const previewUrl = kind === "image" || kind === "video" ? URL.createObjectURL(file) : null;
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    kind,
    previewUrl,
    status: "queued",
  };
}

function useQueuedMediaUpload(params: {
  organizationId?: string;
  resourceType: MediaResourceType;
  resourceId?: string;
}) {
  const { toast } = useToast();
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const queueRef = useRef<UploadQueueItem[]>([]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => () => {
    queueRef.current.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async ({ itemIds, items: providedItems }: { itemIds: string[]; items?: UploadQueueItem[] }) => {
      if (!params.organizationId || !params.resourceId) throw new Error("Media destination is not ready.");
      const items = providedItems ?? queue.filter((item) => itemIds.includes(item.id));
      const uploaded: { itemId: string; asset: Awaited<ReturnType<typeof uploadAndAttachMedia>>[number] }[] = [];
      const failed: { itemId: string; error: string }[] = [];
      if (!items.length) return { uploaded, failed };

      for (const item of items) {
        setQueue((current) => current.map((entry) => {
          if (entry.id === item.id) return { ...entry, status: "uploading", error: undefined };
          return entry;
        }));

        try {
          const [asset] = await uploadAndAttachMedia({
            organizationId: params.organizationId,
            resourceType: params.resourceType,
            resourceId: params.resourceId,
            files: [item.file],
          });
          if (!asset) throw new Error("Upload did not return a media asset.");
          uploaded.push({ itemId: item.id, asset });
          setQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "uploaded", asset } : entry));
        } catch (error) {
          const message = userFacingUploadError(error);
          failed.push({ itemId: item.id, error: message });
          setQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "failed", error: message } : entry));
        }
      }

      return { uploaded, failed };
    },
    onSuccess: ({ uploaded, failed }) => {
      if (uploaded.length > 0 && failed.length === 0) toast({ title: "Media uploaded.", type: "success" });
      if (uploaded.length > 0 && failed.length > 0) toast({ title: "Some media uploaded.", description: "Failed items stayed in the queue.", type: "warning" });
      if (uploaded.length === 0 && failed.length > 0) toast({ title: "Upload failed.", description: "Failed items stayed in the queue.", type: "error" });
    },
    onError: (error, variables) => {
      const message = userFacingUploadError(error);
      setQueue((current) => current.map((item) => variables.itemIds.includes(item.id) ? { ...item, status: "failed", error: message } : item));
      toast({ title: "Upload failed.", description: message, type: "error" });
    },
  });

  const addToQueue = (files: File[]) => {
    const next = files.map(createQueueItem);
    setQueue((current) => [...current, ...next]);
    return next.map((item) => item.id);
  };

  const addAndUpload = (files: File[]) => {
    const next = files.map(createQueueItem);
    setQueue((current) => [...current, ...next]);
    uploadMutation.mutate({ itemIds: next.map((item) => item.id), items: next });
  };

  const removeFromQueue = async (itemId: string) => {
    const item = queue.find((entry) => entry.id === itemId);
    if (!item || item.status === "uploading") return;
    if (item.status === "uploaded" && item.asset && params.organizationId) {
      await deleteMediaRequest(params.organizationId, item.asset._id);
    }
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    setQueue((current) => current.filter((entry) => entry.id !== itemId));
  };

  const uploadQueued = (itemIds?: string[]) => {
    const ids = itemIds ?? queue.filter((item) => item.status === "queued" || item.status === "failed").map((item) => item.id);
    if (ids.length > 0) uploadMutation.mutate({ itemIds: ids });
  };

  return {
    queue,
    addToQueue,
    addAndUpload,
    removeFromQueue,
    uploadQueued,
    isUploading: uploadMutation.isPending,
  };
}

export function ResourceMediaUploader({
  organizationId,
  resourceType,
  resourceId,
  pendingFiles,
  onPendingFilesChange,
  className,
  allowedKinds = ["image", "video", "document"],
  maxImages = 10,
  maxVideos,
  variant = "default",
  labels,
  immediate = false,
  hideExisting = false,
}: ResourceMediaUploaderProps) {
  const copy = { ...defaultLabels, ...labels };
  const media = useResourceMediaQuery(organizationId, resourceType, resourceId);
  const operation = useOperationState({ errorMessage: "Media action failed." });
  const uploadQueue = useQueuedMediaUpload({ organizationId, resourceType, resourceId });
  const [validationError, setValidationError] = useState<string | null>(null);
  const canUpload = Boolean(organizationId && resourceId);
  const accept = [
    allowedKinds.includes("image") ? "image/*" : null,
    allowedKinds.includes("video") ? "video/*" : null,
    allowedKinds.includes("document") ? "application/pdf" : null,
  ].filter(Boolean).join(",");
  const existingVideoCount = media?.filter((asset) => asset.kind === "video").length ?? 0;
  const visibleMedia = media?.filter((asset) => allowedKinds.includes(asset.kind));
  const queuedImageCount = immediate
    ? uploadQueue.queue.filter((item) => item.kind === "image" && item.status !== "uploaded").length
    : pendingFiles.filter((file) => file.type.startsWith("image/")).length;
  const pendingVideoCount = pendingFiles.filter((file) => file.type.startsWith("video/")).length;
  const pendingPreviews = useMemo(() => pendingFiles.map(createQueueItem), [pendingFiles]);

  useEffect(() => {
    return () => pendingPreviews.forEach((preview) => {
      if (preview.previewUrl) URL.revokeObjectURL(preview.previewUrl);
    });
  }, [pendingPreviews]);

  async function addFiles(files: FileList | null) {
    setValidationError(null);
    const accepted: File[] = [];
    let nextImageCount = queuedImageCount;
    let nextVideoCount = existingVideoCount + pendingVideoCount;

    for (const file of Array.from(files ?? [])) {
      const kind: MediaKind = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document";
      if (!allowedKinds.includes(kind)) {
        setValidationError(copy.unsupported);
        continue;
      }
      if (kind === "image" && typeof maxImages === "number" && nextImageCount >= maxImages) {
        setValidationError(copy.imageLimit);
        continue;
      }
      if (kind === "video" && typeof maxVideos === "number" && nextVideoCount >= maxVideos) {
        setValidationError(copy.videoLimit);
        continue;
      }
      if (kind === "image") nextImageCount += 1;
      if (kind === "video") nextVideoCount += 1;
      accepted.push(file);
    }

    const next = accepted;
    if (!next.length) return;

    if (immediate && organizationId && resourceId) {
      uploadQueue.addAndUpload(next);
      return;
    }

    onPendingFilesChange([...pendingFiles, ...next]);
  }

  async function uploadPending() {
    if (!organizationId || !resourceId || pendingFiles.length === 0) return;
    await operation.run(() =>
      uploadAndAttachMedia({
        organizationId,
        resourceType,
        resourceId,
        files: pendingFiles,
      }), {
        successMessage: "Media uploaded.",
        onSuccess: () => onPendingFilesChange([]),
      },
    );
  }

  const uploadQueueItems = immediate ? uploadQueue.queue : pendingPreviews;

  return (
    <section className={cn("rounded-[28px] border border-zinc-100 bg-white p-4 dark:border-white/10 dark:bg-[#0A0A0A] md:p-5", className)}>
      {!copy.hideHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">{copy.title}</h3>
            <p className="mt-1 max-w-xl text-xs font-semibold leading-relaxed text-zinc-400">{copy.description}</p>
          </div>
        </div>
      )}

      <label className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/70 p-6 text-center transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/[0.06] dark:bg-white/[0.015] dark:hover:border-white/[0.12] dark:hover:bg-white/[0.03]",
        !copy.hideHeader && "mt-4",
        variant === "review" ? "min-h-28" : "min-h-32",
        (operation.isRunning || uploadQueue.isUploading) && "pointer-events-none opacity-60",
      )}>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-zinc-900 shadow-sm shadow-zinc-950/[0.04] dark:bg-white/10 dark:text-white dark:shadow-none">
          <UploadCloud className="h-5 w-5" />
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">{copy.pick}</span>
        {!copy.hideDropDescription && <span className="max-w-md text-xs font-semibold leading-relaxed text-zinc-400">{copy.description}</span>}
        <input
          type="file"
          className="sr-only"
          multiple
          accept={accept}
          onChange={(event) => void addFiles(event.target.files)}
        />
      </label>

      {uploadQueueItems.length > 0 && (
        <div className="mt-4 border border-zinc-100 bg-zinc-50/50 p-3 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{copy.queued}</p>
            {canUpload && !immediate && (
              <Button type="button" size="sm" onClick={() => void uploadPending()} disabled={operation.isRunning}>
                {copy.upload}
              </Button>
            )}
            {canUpload && immediate && uploadQueue.queue.some((item) => item.status === "queued" || item.status === "failed") && (
              <Button type="button" size="sm" onClick={() => uploadQueue.uploadQueued()} disabled={uploadQueue.isUploading}>
                {copy.upload}
              </Button>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {uploadQueueItems.map((preview, index) => (
              <div key={preview.id} className={cn(
                "group relative overflow-hidden border bg-white transition-colors dark:bg-[#0A0A0A]",
                "border-zinc-100 dark:border-white/10",
                preview.status === "uploading" && "border-blue-400/30 bg-blue-50/30 dark:border-blue-400/30 dark:bg-blue-500/[0.04]",
                preview.status === "failed" && "border-amber-400/35 bg-amber-50/30 dark:border-amber-400/25 dark:bg-amber-500/[0.035]",
                preview.status === "uploaded" && "border-emerald-400/30 bg-emerald-50/30 dark:border-emerald-400/30 dark:bg-emerald-500/[0.04]",
              )}
              dir="ltr"
              >
                {preview.status === "uploading" && (
                  <span className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-blue-500/10">
                    <span className="block h-full w-1/2 animate-[upload-slide_1.1s_ease-in-out_infinite] bg-blue-500" />
                  </span>
                )}
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-zinc-100 text-zinc-400 dark:bg-white/[0.05]">
                  {preview.previewUrl && preview.kind === "image" ? (
                    <Image src={preview.previewUrl} alt={preview.file.name} fill sizes="180px" className="object-cover" />
                  ) : preview.previewUrl && preview.kind === "video" ? (
                    <video src={preview.previewUrl} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    <MediaIcon kind={preview.kind} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-zinc-950/5 to-transparent opacity-100" />
                  {preview.status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/20">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    {immediate && preview.status === "failed" && (
                      <button type="button" className="inline-flex h-8 w-8 items-center justify-center bg-zinc-950/70 text-white transition hover:bg-zinc-900" onClick={() => uploadQueue.uploadQueued([preview.id])} aria-label={copy.retry}>
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center bg-zinc-950/70 text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={preview.status === "uploading"}
                      onClick={() => {
                        if (immediate) void uploadQueue.removeFromQueue(preview.id);
                        else onPendingFilesChange(pendingFiles.filter((_, fileIndex) => fileIndex !== index));
                      }}
                      aria-label={`${copy.remove} ${preview.file.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="absolute inset-x-2 bottom-2 min-w-0">
                    <UploadQueueBadge status={preview.status} labels={copy} />
                    <p className="mt-1 truncate text-[10px] font-black text-white">{preview.file.name}</p>
                    <p className="text-[9px] font-bold text-white/65">{Math.max(1, Math.round(preview.file.size / 1024))} KB</p>
                  </div>
                </div>
                {preview.error && <p className="line-clamp-2 border-t border-amber-400/20 px-2 py-1.5 text-[10px] font-bold leading-4 text-amber-600 dark:text-amber-300">{preview.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {validationError && <p className="mt-3 text-xs font-bold text-amber-600 dark:text-amber-300">{validationError}</p>}

      {!hideExisting && visibleMedia && visibleMedia.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleMedia.map((asset) => (
            <article key={asset._id} className="overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="relative flex aspect-video items-center justify-center bg-zinc-100 text-zinc-400 dark:bg-black/30">
                {asset.kind === "image" ? (
                  <Image src={asset.url} alt={asset.name} fill sizes="300px" className="object-cover" />
                ) : (
                  <MediaIcon kind={asset.kind} />
                )}
                {asset.isCover && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-black uppercase text-zinc-900 dark:bg-zinc-900 dark:text-white">
                    <Star className="h-3 w-3 fill-current" />
                    {copy.cover}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 p-3">
                <p className="min-w-0 truncate text-xs font-black text-zinc-700 dark:text-zinc-200">{asset.name}</p>
                <div className="flex shrink-0 items-center gap-1">
                  {asset.kind === "image" && !asset.isCover && (
                    <button type="button" className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" onClick={() => operation.run(() => setMediaCoverRequest(asset.organizationId, asset._id), { successMessage: "Cover updated." })} aria-label={copy.setCover}>
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button type="button" className="p-2 text-zinc-400 hover:text-red-500" onClick={() => operation.run(() => deleteMediaRequest(asset.organizationId, asset._id), { successMessage: "Media deleted." })} aria-label={copy.delete}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {operation.error && <p className="mt-3 text-xs font-bold text-red-500">{operation.error}</p>}
    </section>
  );
}

function UploadQueueBadge({ status, labels }: { status: UploadQueueStatus; labels: typeof defaultLabels }) {
  const Icon = status === "uploading" ? Loader2 : status === "uploaded" ? CheckCircle2 : status === "failed" ? XCircle : UploadCloud;
  const label = status === "uploading" ? labels.statusUploading : status === "uploaded" ? labels.statusUploaded : status === "failed" ? labels.statusFailed : labels.statusQueued;
  return (
    <span className={cn(
      "inline-flex h-5 items-center gap-1 px-1.5 text-[8px] font-black uppercase tracking-widest",
      status === "uploaded" && "bg-emerald-500 text-white",
      status === "failed" && "bg-amber-500 text-zinc-950",
      status === "uploading" && "bg-blue-500 text-white",
      status === "queued" && "bg-white/90 text-zinc-800",
    )}>
      <Icon className={cn("h-3 w-3", status === "uploading" && "animate-spin")} />
      {label}
    </span>
  );
}
