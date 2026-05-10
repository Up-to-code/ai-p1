"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FileText, ImageIcon, Star, Trash2, UploadCloud, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  maxVideos?: number;
  variant?: "default" | "review";
  labels?: {
    title?: string;
    description?: string;
    pick?: string;
    queued?: string;
    upload?: string;
    setCover?: string;
    delete?: string;
    videoLimit?: string;
    unsupported?: string;
  };
  immediate?: boolean;
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
  unsupported: "This file type is reserved for the Assets section.",
};

function MediaIcon({ kind }: { kind: string }) {
  if (kind === "image") return <ImageIcon className="h-4 w-4" />;
  if (kind === "video") return <Video className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

export function ResourceMediaUploader({
  organizationId,
  resourceType,
  resourceId,
  pendingFiles,
  onPendingFilesChange,
  className,
  allowedKinds = ["image", "video", "document"],
  maxVideos,
  variant = "default",
  labels,
  immediate = false,
}: ResourceMediaUploaderProps) {
  const copy = { ...defaultLabels, ...labels };
  const media = useResourceMediaQuery(organizationId, resourceType, resourceId);
  const operation = useOperationState({ errorMessage: "Media action failed." });
  const [validationError, setValidationError] = useState<string | null>(null);
  const canUpload = Boolean(organizationId && resourceId);
  const accept = [
    allowedKinds.includes("image") ? "image/*" : null,
    allowedKinds.includes("video") ? "video/*" : null,
    allowedKinds.includes("document") ? "application/pdf" : null,
  ].filter(Boolean).join(",");
  const existingVideoCount = media?.filter((asset) => asset.kind === "video").length ?? 0;
  const pendingVideoCount = pendingFiles.filter((file) => file.type.startsWith("video/")).length;
  const pendingPreviews = useMemo(() => {
    return pendingFiles.map((file) => ({
      file,
      kind: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document",
      url: file.type.startsWith("image/") || file.type.startsWith("video/") ? URL.createObjectURL(file) : null,
    }));
  }, [pendingFiles]);

  useEffect(() => {
    return () => pendingPreviews.forEach((preview) => {
      if (preview.url) URL.revokeObjectURL(preview.url);
    });
  }, [pendingPreviews]);

  async function addFiles(files: FileList | null) {
    setValidationError(null);
    const accepted: File[] = [];
    let nextVideoCount = existingVideoCount + pendingVideoCount;

    for (const file of Array.from(files ?? [])) {
      const kind: MediaKind = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document";
      if (!allowedKinds.includes(kind)) {
        setValidationError(copy.unsupported);
        continue;
      }
      if (kind === "video" && typeof maxVideos === "number" && nextVideoCount >= maxVideos) {
        setValidationError(copy.videoLimit);
        continue;
      }
      if (kind === "video") nextVideoCount += 1;
      accepted.push(file);
    }

    const next = accepted;
    if (!next.length) return;

    if (immediate && organizationId && resourceId) {
      await operation.run(() =>
        uploadAndAttachMedia({
          organizationId,
          resourceType,
          resourceId,
          files: next,
        }), { successMessage: "Media uploaded." },
      );
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

  return (
    <section className={cn("rounded-[28px] border border-zinc-100 bg-white p-4 dark:border-white/10 dark:bg-[#0A0A0A] md:p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">{copy.title}</h3>
          <p className="mt-1 max-w-xl text-xs font-semibold leading-relaxed text-zinc-400">{copy.description}</p>
        </div>
      </div>

      <label className={cn(
        "mt-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-zinc-200 bg-zinc-50/70 p-5 text-center transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-white/20 dark:hover:bg-white/[0.04]",
        variant === "review" ? "min-h-28" : "min-h-32",
        operation.isRunning && "pointer-events-none opacity-60",
      )}>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-zinc-900 shadow-sm shadow-zinc-950/[0.04] dark:bg-white/10 dark:text-white dark:shadow-none">
          <UploadCloud className="h-5 w-5" />
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">{copy.pick}</span>
        <span className="max-w-md text-xs font-semibold leading-relaxed text-zinc-400">{copy.description}</span>
        <input
          type="file"
          className="sr-only"
          multiple
          accept={accept}
          onChange={(event) => void addFiles(event.target.files)}
        />
      </label>

      {pendingFiles.length > 0 && (
        <div className="mt-4 rounded-[24px] border border-zinc-100 bg-zinc-50/50 p-4 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{copy.queued}</p>
            {canUpload && (
              <Button type="button" size="sm" onClick={() => void uploadPending()} disabled={operation.isRunning}>
                {copy.upload}
              </Button>
            )}
          </div>
          <div className={cn("mt-3 flex flex-wrap gap-3", variant !== "review" && "sm:grid sm:grid-cols-2")}>
            {pendingPreviews.map((preview, index) => (
              <div key={`${preview.file.name}-${index}`} className={cn(
                "group relative overflow-hidden rounded-2xl bg-white dark:bg-[#0A0A0A]",
                variant === "review" ? "h-28 min-w-28 flex-[1_1_128px] border border-zinc-100 dark:border-white/10" : "flex min-w-0 items-center justify-between gap-3 px-3 py-2",
              )}>
                {variant === "review" && preview.url ? (
                  preview.kind === "image" ? (
                    <Image src={preview.url} alt={preview.file.name} fill sizes="160px" className="object-cover" />
                  ) : (
                    <video src={preview.url} className="h-full w-full object-cover" muted playsInline />
                  )
                ) : null}
                <span className={cn(
                  "truncate text-xs font-bold text-zinc-600 dark:text-zinc-300",
                  variant === "review" && "absolute inset-x-2 bottom-2 rounded-xl bg-black/55 px-2 py-1 text-[10px] text-white backdrop-blur",
                )}>{preview.file.name}</span>
                <button
                  type="button"
                  className={cn("text-zinc-300 hover:text-red-500", variant === "review" && "absolute right-2 top-2 rounded-full bg-black/45 p-1 text-white backdrop-blur hover:text-red-200")}
                  onClick={() => onPendingFilesChange(pendingFiles.filter((_, fileIndex) => fileIndex !== index))}
                  aria-label={`Remove ${preview.file.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {validationError && <p className="mt-3 text-xs font-bold text-amber-600 dark:text-amber-300">{validationError}</p>}

      {media && media.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((asset) => (
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
                    Cover
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
