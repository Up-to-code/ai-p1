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
import {
  appendUploadQueueItems,
  createQueueItem,
  markUploadQueueBatchFailed,
  markUploadQueueItemFailed,
  markUploadQueueItemUploaded,
  markUploadQueueItemUploading,
  mediaUploadAccept,
  mergeMediaUploadLabels,
  queuedUploadItemIds,
  removePendingMediaFileAt,
  removeUploadQueueItem,
  resourceMediaUploadState,
  selectAcceptedMediaFiles,
  uploadFileSizeLabel,
  uploadQueueStatusPresentation,
  uploadQueueItemsById,
  userFacingUploadError,
  type MediaUploadLabels,
  type UploadQueueItem,
  type UploadQueueStatus,
} from "../media-upload-view-model";

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
  labels?: Partial<MediaUploadLabels>;
  immediate?: boolean;
  hideExisting?: boolean;
};

type AttachedMediaAsset = Awaited<ReturnType<typeof uploadAndAttachMedia>>[number];

function MediaIcon({ kind }: { kind: string }) {
  if (kind === "image") return <ImageIcon className="h-4 w-4" />;
  if (kind === "video") return <Video className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function useQueuedMediaUpload(params: {
  organizationId?: string;
  resourceType: MediaResourceType;
  resourceId?: string;
}) {
  const { toast } = useToast();
  const [queue, setQueue] = useState<UploadQueueItem<AttachedMediaAsset>[]>([]);
  const queueRef = useRef<UploadQueueItem<AttachedMediaAsset>[]>([]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => () => {
    queueRef.current.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async ({ itemIds, items: providedItems }: { itemIds: string[]; items?: UploadQueueItem<AttachedMediaAsset>[] }) => {
      if (!params.organizationId || !params.resourceId) throw new Error("Media destination is not ready.");
      const items = providedItems ?? uploadQueueItemsById(queue, itemIds);
      const uploaded: { itemId: string; asset: AttachedMediaAsset }[] = [];
      const failed: { itemId: string; error: string }[] = [];
      if (!items.length) return { uploaded, failed };

      for (const item of items) {
        setQueue((current) => markUploadQueueItemUploading(current, item.id));

        try {
          const [asset] = await uploadAndAttachMedia({
            organizationId: params.organizationId,
            resourceType: params.resourceType,
            resourceId: params.resourceId,
            files: [item.file],
          });
          if (!asset) throw new Error("Upload did not return a media asset.");
          uploaded.push({ itemId: item.id, asset });
          setQueue((current) => markUploadQueueItemUploaded(current, item.id, asset));
        } catch (error) {
          const message = userFacingUploadError(error);
          failed.push({ itemId: item.id, error: message });
          setQueue((current) => markUploadQueueItemFailed(current, item.id, message));
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
      setQueue((current) => markUploadQueueBatchFailed(current, variables.itemIds, message));
      toast({ title: "Upload failed.", description: message, type: "error" });
    },
  });

  const addToQueue = (files: File[]) => {
    const next = files.map(createQueueItem<AttachedMediaAsset>);
    setQueue((current) => appendUploadQueueItems(current, next));
    return next.map((item) => item.id);
  };

  const addAndUpload = (files: File[]) => {
    const next = files.map(createQueueItem<AttachedMediaAsset>);
    setQueue((current) => appendUploadQueueItems(current, next));
    uploadMutation.mutate({ itemIds: next.map((item) => item.id), items: next });
  };

  const removeFromQueue = async (itemId: string) => {
    const item = queue.find((entry) => entry.id === itemId);
    if (!item || item.status === "uploading") return;
    if (item.status === "uploaded" && item.asset && params.organizationId) {
      await deleteMediaRequest(params.organizationId, item.asset._id);
    }
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    setQueue((current) => removeUploadQueueItem(current, itemId));
  };

  const uploadQueued = (itemIds?: string[]) => {
    const ids = itemIds ?? queuedUploadItemIds(queue);
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
  const copy = mergeMediaUploadLabels(labels);
  const media = useResourceMediaQuery(organizationId, resourceType, resourceId);
  const operation = useOperationState({ errorMessage: "Media action failed." });
  const uploadQueue = useQueuedMediaUpload({ organizationId, resourceType, resourceId });
  const [validationError, setValidationError] = useState<string | null>(null);
  const canUpload = Boolean(organizationId && resourceId);
  const accept = mediaUploadAccept(allowedKinds);
  const {
    visibleMedia,
    existingVideoCount,
    queuedImageCount,
    pendingVideoCount,
  } = resourceMediaUploadState({
    media,
    allowedKinds,
    immediate,
    queue: uploadQueue.queue,
    pendingFiles,
  });
  const pendingPreviews = useMemo(() => pendingFiles.map(createQueueItem), [pendingFiles]);

  useEffect(() => {
    return () => pendingPreviews.forEach((preview) => {
      if (preview.previewUrl) URL.revokeObjectURL(preview.previewUrl);
    });
  }, [pendingPreviews]);

  async function addFiles(files: FileList | null) {
    setValidationError(null);
    const { accepted, validationError } = selectAcceptedMediaFiles({
      files: Array.from(files ?? []),
      allowedKinds,
      maxImages,
      maxVideos,
      queuedImageCount,
      existingVideoCount,
      pendingVideoCount,
      labels: copy,
    });
    setValidationError(validationError);

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
    <section className={cn("rounded-[28px] border border-border bg-card p-4 md:p-5", className)}>
      {!copy.hideHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-foreground">{copy.title}</h3>
            <p className="mt-1 max-w-xl text-xs font-semibold leading-relaxed text-zinc-400">{copy.description}</p>
          </div>
        </div>
      )}

      <label className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/70 p-6 text-center transition-all hover:border-border hover:bg-muted",
        !copy.hideHeader && "mt-4",
        variant === "review" ? "min-h-28" : "min-h-32",
        (operation.isRunning || uploadQueue.isUploading) && "pointer-events-none opacity-60",
      )}>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-card text-foreground shadow-sm shadow-zinc-950/[0.04] dark:shadow-none">
          <UploadCloud className="h-5 w-5" />
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{copy.pick}</span>
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
        <div className="mt-4 border border-border bg-muted/50 p-3">
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
                "group relative overflow-hidden border bg-card transition-colors",
                "border-border",
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
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted text-zinc-400">
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
                        else onPendingFilesChange(removePendingMediaFileAt(pendingFiles, index));
                      }}
                      aria-label={`${copy.remove} ${preview.file.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="absolute inset-x-2 bottom-2 min-w-0">
                    <UploadQueueBadge status={preview.status} labels={copy} />
                    <p className="mt-1 truncate text-[10px] font-black text-white">{preview.file.name}</p>
                    <p className="text-[9px] font-bold text-white/65">{uploadFileSizeLabel(preview.file.size)}</p>
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
            <article key={asset._id} className="overflow-hidden rounded-2xl border border-border bg-muted">
              <div className="relative flex aspect-video items-center justify-center bg-muted text-zinc-400">
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
                <p className="min-w-0 truncate text-xs font-black text-foreground">{asset.name}</p>
                <div className="flex shrink-0 items-center gap-1">
                  {asset.kind === "image" && !asset.isCover && (
                    <button type="button" className="p-2 text-zinc-400 hover:text-foreground" onClick={() => operation.run(() => setMediaCoverRequest(asset.organizationId, asset._id), { successMessage: "Cover updated." })} aria-label={copy.setCover}>
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

function UploadQueueBadge({ status, labels }: { status: UploadQueueStatus; labels: MediaUploadLabels }) {
  const Icon = status === "uploading" ? Loader2 : status === "uploaded" ? CheckCircle2 : status === "failed" ? XCircle : UploadCloud;
  const { label } = uploadQueueStatusPresentation(status, labels);
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
