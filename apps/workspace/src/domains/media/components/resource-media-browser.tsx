"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, ImageIcon, Plus, Star, Trash2, UploadCloud, Video } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOperationState } from "@/lib/utils/operation-state";
import {
  deleteMediaRequest,
  setMediaCoverRequest,
  useResourceMediaQuery,
  type MediaKind,
  type MediaResourceType,
} from "../api/media";
import { ResourceMediaUploader } from "./resource-media-uploader";

type ResourceMediaAsset = NonNullable<ReturnType<typeof useResourceMediaQuery>>[number];

type ResourceMediaBrowserProps = {
  organizationId?: string;
  resourceType: MediaResourceType;
  resourceId?: string;
  mode: "gallery" | "documents";
  title: string;
  description?: string;
  addLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  uploadTitle: string;
  uploadDescription: string;
  uploadPick: string;
  unsupported: string;
  openLabel?: string;
  coverLabel?: string;
  deleteLabel?: string;
  statusQueued?: string;
  statusUploading?: string;
  statusUploaded?: string;
  statusFailed?: string;
  removeLabel?: string;
  retryLabel?: string;
  imageLimit?: string;
  previewLimit?: number;
  className?: string;
};

function assetKindIcon(kind: MediaKind) {
  if (kind === "image") return ImageIcon;
  if (kind === "video") return Video;
  return FileText;
}

function formatSize(size?: number) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourceMediaBrowser({
  organizationId,
  resourceType,
  resourceId,
  mode,
  title,
  description,
  addLabel,
  emptyTitle,
  emptyDescription,
  uploadTitle,
  uploadDescription,
  uploadPick,
  unsupported,
  openLabel = "Open",
  coverLabel = "Cover",
  deleteLabel = "Delete",
  statusQueued,
  statusUploading,
  statusUploaded,
  statusFailed,
  removeLabel,
  retryLabel,
  imageLimit,
  previewLimit,
  className,
}: ResourceMediaBrowserProps) {
  const media = useResourceMediaQuery(organizationId, resourceType, resourceId);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const operation = useOperationState({ errorMessage: "Media action failed." });
  const allowedKinds: MediaKind[] = mode === "gallery" ? ["image", "video"] : ["document"];
  const assets = useMemo(
    () => (media ?? [])
      .filter((asset) => allowedKinds.includes(asset.kind))
      .sort((a, b) => {
        if (mode !== "gallery") return 0;
        return Number(b.isCover) - Number(a.isCover);
      }),
    [allowedKinds, media],
  );
  const galleryPreviewLimit = mode === "gallery" ? Math.min(previewLimit ?? 5, 5) : previewLimit;
  const visibleAssets = typeof galleryPreviewLimit === "number" ? assets.slice(0, galleryPreviewLimit) : assets;
  const overflowCount = typeof galleryPreviewLimit === "number" ? Math.max(0, assets.length - galleryPreviewLimit) : 0;
  const activeAsset = viewerIndex !== null ? assets[viewerIndex] : null;
  const hasAssets = assets.length > 0;

  const closeUpload = (open: boolean) => {
    setUploadOpen(open);
    if (!open) setPendingFiles([]);
  };

  const moveViewer = (direction: -1 | 1) => {
    if (viewerIndex === null || assets.length === 0) return;
    setViewerIndex((viewerIndex + direction + assets.length) % assets.length);
  };

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-black text-zinc-950 dark:text-white">{title}</h2>
          {description && <p className="mt-1 text-xs font-semibold leading-5 text-zinc-500 dark:text-zinc-400">{description}</p>}
        </div>
        <Button type="button" onClick={() => setUploadOpen(true)} className="h-9 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest">
          <Plus className="me-2 h-3.5 w-3.5" />
          {addLabel}
        </Button>
      </div>

      {media === undefined ? (
        mode === "gallery" ? <GallerySkeleton /> : <DocumentSkeleton />
      ) : !hasAssets ? (
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="flex min-h-44 w-full flex-col items-center justify-center gap-2 border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-8 text-center text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
        >
          <UploadCloud className="h-6 w-6 text-zinc-400" />
          <span className="text-sm font-black text-zinc-800 dark:text-white">{emptyTitle}</span>
          <span className="max-w-md text-xs font-semibold leading-5 text-zinc-500">{emptyDescription}</span>
        </button>
      ) : mode === "gallery" ? (
        <div className="grid min-h-[320px] grid-cols-2 gap-2 md:grid-cols-4 md:grid-rows-2">
          {visibleAssets.map((asset, index) => {
            const Icon = assetKindIcon(asset.kind);
            const isOverflowTile = overflowCount > 0 && index === visibleAssets.length - 1;
            return (
              <GalleryAssetTile
                key={asset._id}
                asset={asset}
                icon={Icon}
                isPremium={index === 0}
                isOverflowTile={isOverflowTile}
                overflowCount={overflowCount}
                coverLabel={coverLabel}
                priority={index === 0}
                onClick={() => setViewerIndex(index)}
              />
            );
          })}
        </div>
      ) : (
        <div className="divide-y divide-zinc-200/70 border-y border-zinc-200/70 dark:divide-white/10 dark:border-white/10">
          {assets.map((asset) => (
            <div key={asset._id} className="grid gap-3 py-3 text-start md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-300">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-zinc-950 dark:text-white">{asset.name}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{asset.mimeType} {formatSize(asset.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:justify-end">
                <a href={asset.url} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-white/10 dark:hover:text-white">
                  {openLabel}
                </a>
                <button type="button" onClick={() => operation.run(() => deleteMediaRequest(asset.organizationId, asset._id), { successMessage: "Document deleted." })} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10" aria-label={`${deleteLabel} ${asset.name}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {operation.error && <p className="text-xs font-bold text-red-500">{operation.error}</p>}

      <Dialog open={viewerIndex !== null} onOpenChange={(open) => !open && setViewerIndex(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl border-zinc-200 bg-zinc-950 p-0 text-white dark:border-white/10" overlayClassName="bg-black/75 supports-backdrop-filter:backdrop-blur-sm">
          {activeAsset && (
            <div className="grid max-h-[90vh] grid-rows-[auto_minmax(0,1fr)_auto]">
              <DialogHeader className="border-b border-white/10 p-4 pe-14 text-start">
                <DialogTitle className="text-sm font-black text-white">{title}</DialogTitle>
                <DialogDescription className="text-xs font-bold text-white/45">{viewerIndex! + 1} / {assets.length}</DialogDescription>
              </DialogHeader>
              <div className="relative flex min-h-[48vh] items-center justify-center bg-black">
                {activeAsset.kind === "image" ? (
                  <Image src={activeAsset.url} alt="" fill sizes="90vw" className="object-contain" />
                ) : (
                  <video src={activeAsset.url} className="max-h-[70vh] w-full object-contain" controls />
                )}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-white/10 p-3">
                <Button type="button" variant="outline" onClick={() => moveViewer(-1)} className="h-9 rounded-lg border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {activeAsset.kind === "image" && !activeAsset.isCover && (
                    <Button type="button" variant="outline" onClick={() => operation.run(() => setMediaCoverRequest(activeAsset.organizationId, activeAsset._id), { successMessage: "Cover updated." })} className="h-9 rounded-lg border-white/15 bg-white/5 text-white hover:bg-white/10">
                      <Star className="me-2 h-3.5 w-3.5" />
                      {coverLabel}
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={() => operation.run(() => deleteMediaRequest(activeAsset.organizationId, activeAsset._id), { successMessage: "Media deleted.", onSuccess: () => setViewerIndex(null) })} className="h-9 rounded-lg border-red-500/40 bg-red-500/10 text-red-100 hover:bg-red-500/20">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button type="button" variant="outline" onClick={() => moveViewer(1)} className="h-9 rounded-lg border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadOpen} onOpenChange={closeUpload}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto rounded-2xl border-zinc-200 bg-zinc-50 p-6 text-zinc-900 dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white">
          <DialogHeader className="pe-10 text-start">
            <DialogTitle className="text-lg font-black">{uploadTitle}</DialogTitle>
            <DialogDescription className="mt-2 text-xs font-semibold leading-5 text-zinc-500">{uploadDescription}</DialogDescription>
          </DialogHeader>
          <div className="mt-5">
            <ResourceMediaUploader
              organizationId={organizationId}
              resourceType={resourceType}
              resourceId={resourceId}
              pendingFiles={pendingFiles}
              onPendingFilesChange={setPendingFiles}
              immediate
              hideExisting
              allowedKinds={allowedKinds}
              labels={{
                hideHeader: true,
                hideDropDescription: true,
                pick: uploadPick,
                unsupported,
                statusQueued,
                statusUploading,
                statusUploaded,
                statusFailed,
                remove: removeLabel,
                retry: retryLabel,
                imageLimit,
              }}
              className="rounded-none border-0 bg-transparent p-0 dark:border-0 dark:bg-transparent"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function GallerySkeleton() {
  return (
    <div className="grid min-h-[320px] grid-cols-2 gap-2 md:grid-cols-4 md:grid-rows-2" aria-hidden="true">
      <div className="relative col-span-2 row-span-2 overflow-hidden bg-zinc-100 dark:bg-white/[0.04]">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-100 via-zinc-200/80 to-zinc-100 dark:from-white/[0.04] dark:via-white/[0.08] dark:to-white/[0.04]" />
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="relative min-h-36 overflow-hidden bg-zinc-100 dark:bg-white/[0.04]">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-100 via-zinc-200/70 to-zinc-100 dark:from-white/[0.04] dark:via-white/[0.08] dark:to-white/[0.04]" />
        </div>
      ))}
    </div>
  );
}

function DocumentSkeleton() {
  return (
    <div className="divide-y divide-zinc-200/70 border-y border-zinc-200/70 dark:divide-white/10 dark:border-white/10" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="grid gap-3 py-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-white/[0.06]" />
            <span className="h-4 w-52 max-w-[60vw] animate-pulse rounded bg-zinc-100 dark:bg-white/[0.06]" />
          </div>
          <span className="h-8 w-20 animate-pulse rounded-lg bg-zinc-100 dark:bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

function GalleryAssetTile({
  asset,
  icon: Icon,
  isPremium,
  isOverflowTile,
  overflowCount,
  coverLabel,
  priority,
  onClick,
}: {
  asset: ResourceMediaAsset;
  icon: typeof ImageIcon;
  isPremium: boolean;
  isOverflowTile: boolean;
  overflowCount: number;
  coverLabel: string;
  priority?: boolean;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(asset.kind !== "image");

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative min-h-36 overflow-hidden bg-zinc-100 text-start text-zinc-400 transition-opacity hover:opacity-95 dark:bg-white/[0.04]",
        isPremium && "col-span-2 row-span-2 min-h-[320px]",
      )}
      aria-label={asset.name}
    >
      {!loaded && <span className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-zinc-100 via-zinc-200/80 to-zinc-100 dark:from-white/[0.04] dark:via-white/[0.08] dark:to-white/[0.04]" />}
      {asset.kind === "image" ? (
        <Image
          src={asset.url}
          alt=""
          fill
          priority={priority}
          sizes={isPremium ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
          className={cn("object-cover transition duration-500", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
        />
      ) : asset.kind === "video" ? (
        <video src={asset.url} className="h-full w-full object-cover" muted playsInline onLoadedData={() => setLoaded(true)} />
      ) : (
        <Icon className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2" />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 opacity-70 transition-opacity group-hover:opacity-90" />
      {isPremium && asset.isCover && (
        <span className="absolute start-3 top-3 bg-white/95 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-950">
          {coverLabel}
        </span>
      )}
      {isOverflowTile && (
        <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
          <span className="text-3xl font-black">+{overflowCount}</span>
        </span>
      )}
    </button>
  );
}
