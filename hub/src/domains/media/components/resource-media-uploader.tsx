"use client";

import Image from "next/image";
import { FileText, ImageIcon, Star, Trash2, UploadCloud, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deleteMediaRequest,
  setMediaCoverRequest,
  uploadAndAttachMedia,
  useResourceMediaQuery,
  type MediaResourceType,
} from "../api/media";
import { useOperationState } from "@/lib/utils/operation-state";

type ResourceMediaUploaderProps = {
  organizationId?: string;
  resourceType: MediaResourceType;
  resourceId?: string;
  pendingFiles: File[];
  onPendingFilesChange: (files: File[]) => void;
  labels?: {
    title?: string;
    description?: string;
    pick?: string;
    queued?: string;
    upload?: string;
    setCover?: string;
    delete?: string;
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
  labels,
  immediate = false,
}: ResourceMediaUploaderProps) {
  const copy = { ...defaultLabels, ...labels };
  const media = useResourceMediaQuery(organizationId, resourceType, resourceId);
  const operation = useOperationState({ errorMessage: "Media action failed." });
  const canUpload = Boolean(organizationId && resourceId);

  async function addFiles(files: FileList | null) {
    const next = Array.from(files ?? []);
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
    <section className="rounded-[24px] border border-zinc-100 bg-white p-5 dark:border-white/10 dark:bg-[#0A0A0A]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">{copy.title}</h3>
          <p className="mt-1 max-w-xl text-xs font-semibold text-zinc-400">{copy.description}</p>
        </div>
        <label className={cn(
          "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5",
          operation.isRunning && "pointer-events-none opacity-60",
        )}>
          <UploadCloud className="h-4 w-4" />
          {copy.pick}
          <input
            type="file"
            className="sr-only"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={(event) => void addFiles(event.target.files)}
          />
        </label>
      </div>

      {pendingFiles.length > 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-zinc-200 p-4 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{copy.queued}</p>
            {canUpload && (
              <Button type="button" size="sm" onClick={() => void uploadPending()} disabled={operation.isRunning}>
                {copy.upload}
              </Button>
            )}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {pendingFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2 dark:bg-white/[0.03]">
                <span className="truncate text-xs font-bold text-zinc-600 dark:text-zinc-300">{file.name}</span>
                <button
                  type="button"
                  className="text-zinc-300 hover:text-red-500"
                  onClick={() => onPendingFilesChange(pendingFiles.filter((_, fileIndex) => fileIndex !== index))}
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
