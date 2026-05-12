"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Check,
  Copy,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Globe2,
  ImageIcon,
  Loader2,
  Lock,
  Pencil,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useOperationState } from "@/lib/utils/operation-state";
import { useTranslations } from "next-intl";
import {
  deleteMediaRequest,
  setMediaShareVisibilityRequest,
  uploadAndAttachMedia,
  useResourceMediaQuery,
  type MediaKind,
} from "../api/media";

type MediaAsset = NonNullable<ReturnType<typeof useResourceMediaQuery>>[number];

type ClientDocumentsManagerProps = {
  organizationId?: string;
  clientId: string;
};

type UploadStatus = "idle" | "uploading" | "uploaded";
type ShareVisibility = "private" | "public";
type PendingUpload = {
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

function formatSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function fileTypeLabel(file: File, extension: string) {
  if (file.type.startsWith("image/")) return extension ? extension.slice(1).toUpperCase() : "IMAGE";
  if (file.type === "application/pdf") return "PDF";
  return extension ? extension.slice(1).toUpperCase() : "FILE";
}

function mediaTypeLabel(kind: MediaKind, mimeType: string) {
  if (kind === "image") return mimeType.split("/")[1]?.toUpperCase() || "IMAGE";
  if (mimeType === "application/pdf") return "PDF";
  return kind.toUpperCase();
}

function shareUrl(mediaId: string) {
  if (typeof window === "undefined") return `/f/${mediaId}`;
  return `${window.location.origin}/f/${mediaId}`;
}

async function copyText(value: string, unavailableMessage: string) {
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

function pendingUploadName({ file, baseName, extension }: PendingUpload) {
  return `${baseName.trim() || splitFileName(file.name).baseName}${extension}`;
}

function renamedFile(item: PendingUpload) {
  const safeName = pendingUploadName(item);
  if (safeName === item.file.name) return item.file;

  return new File([item.file], safeName, {
    type: item.file.type,
    lastModified: item.file.lastModified,
  });
}

function openLocalFile(file: File) {
  const url = URL.createObjectURL(file);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function QueuedFilePreview({ file, extension }: { file: File; extension: string }) {
  const isImage = file.type.startsWith("image/");
  const previewUrl = useMemo(() => (isImage ? URL.createObjectURL(file) : null), [file, isImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (isImage && previewUrl) {
    return (
      <div
        className="h-16 w-16 shrink-0 rounded-2xl border border-zinc-200 bg-zinc-100 bg-cover bg-center dark:border-white/10 dark:bg-white/[0.04]"
        style={{ backgroundImage: `url(${previewUrl})` }}
        aria-label={`Preview of ${file.name}`}
      />
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">
      <FileText className="h-5 w-5" />
      <span className="mt-1 max-w-12 truncate text-[9px] font-black uppercase tracking-widest">{fileTypeLabel(file, extension)}</span>
    </div>
  );
}

function SavedFilePreview({ asset }: { asset: MediaAsset }) {
  if (asset.kind === "image") {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[20px] bg-zinc-100 dark:bg-white/[0.04]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-t-[20px] bg-zinc-100 text-zinc-500 dark:bg-white/[0.04] dark:text-zinc-300">
      {asset.kind === "video" ? <ImageIcon className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
      <span className="mt-3 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest dark:bg-black/20">
        {mediaTypeLabel(asset.kind, asset.mimeType)}
      </span>
    </div>
  );
}

export function ClientDocumentsManager({ organizationId, clientId }: ClientDocumentsManagerProps) {
  const t = useTranslations("Clients.detail.documents");
  const common = useTranslations("Common");
  const media = useResourceMediaQuery(organizationId, "client", clientId);
  const uploadOperation = useOperationState({ errorMessage: t("uploadFailed") });
  const mediaOperation = useOperationState({ errorMessage: t("actionFailed") });
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingUpload[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [shareAssetId, setShareAssetId] = useState<string | null>(null);
  const [shareAction, setShareAction] = useState<ShareVisibility | "copy" | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const mediaList = useMemo(() => media ?? [], [media]);
  const activeShareAsset = useMemo(
    () => mediaList.find((asset) => asset._id === shareAssetId) ?? null,
    [mediaList, shareAssetId],
  );
  const isLoading = media === undefined;
  const canUpload = Boolean(organizationId);

  function addFiles(files: FileList | File[]) {
    setValidationError(null);
    const accepted: PendingUpload[] = [];

    for (const file of Array.from(files)) {
      const kind = inferLocalKind(file);
      if (kind !== "image" && file.type !== "application/pdf") {
        setValidationError(t("unsupported"));
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

    if (accepted.length > 0) {
      setUploadStatus("idle");
      setPendingFiles((current) => [...current, ...accepted]);
    }
  }

  function closeUploadDialog(open: boolean) {
    setIsUploadOpen(open);
    if (!open && !uploadOperation.isRunning) {
      setPendingFiles([]);
      setUploadStatus("idle");
      setValidationError(null);
    }
  }

  async function saveUpload() {
    if (!organizationId || pendingFiles.length === 0) return;

    setUploadStatus("uploading");
    await uploadOperation.run(
      () =>
        uploadAndAttachMedia({
          organizationId,
          resourceType: "client",
          resourceId: clientId,
          files: pendingFiles.map(renamedFile),
        }),
      {
        successMessage: t("uploaded"),
        onSuccess: () => {
          setUploadStatus("uploaded");
          setPendingFiles([]);
          setTimeout(() => closeUploadDialog(false), 450);
        },
        onError: () => setUploadStatus("idle"),
      },
    );
  }

  function openShareDialog(asset: MediaAsset) {
    mediaOperation.clearError();
    setCopiedShareLink(false);
    setShareAction(null);
    setShareAssetId(asset._id);
  }

  function closeShareDialog(open: boolean) {
    if (open) return;
    if (mediaOperation.isRunning) return;
    setShareAssetId(null);
    setCopiedShareLink(false);
    setShareAction(null);
    mediaOperation.clearError();
  }

  async function updateVisibility(asset: MediaAsset, visibility: ShareVisibility) {
    if (visibility === (asset.shareVisibility ?? "private")) return;

    setShareAction(visibility);
    await mediaOperation.run(
      () => {
        if (!organizationId) throw new Error(t("shareLoading"));
        return setMediaShareVisibilityRequest(organizationId, asset._id, visibility);
      },
      {
        successMessage: visibility === "private" ? t("madePrivate") : t("publicEnabled"),
        onSuccess: () => {
          setCopiedShareLink(false);
        },
      },
    );
    setShareAction(null);
  }

  async function copyPublicShareLink(asset: MediaAsset) {
    setShareAction("copy");
    await mediaOperation.run(
      () => {
        if ((asset.shareVisibility ?? "private") !== "public") throw new Error(t("shareLinkPrivateError"));
        return copyText(shareUrl(asset._id), t("clipboardUnavailable"));
      },
      {
        successMessage: t("linkCopied"),
        onSuccess: () => setCopiedShareLink(true),
      },
    );
    setShareAction(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold text-zinc-400">{t("eyebrow")}</p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-zinc-900 dark:text-white">{t("title")}</h3>
        </div>
        <Button type="button" onClick={() => setIsUploadOpen(true)} className="h-10 rounded-xl px-4 text-xs font-black uppercase tracking-widest" disabled={!canUpload}>
          <UploadCloud className="me-2 h-3.5 w-3.5" />
          {t("open")}
        </Button>
      </div>

      <section className="min-h-[280px]">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-[24px] border border-dashed border-zinc-200 text-zinc-400 dark:border-white/10">
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
            {common("loading")}
          </div>
        ) : mediaList.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-zinc-200 bg-zinc-50/40 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <FileText className="h-8 w-8 text-zinc-300" />
            <p className="mt-3 text-sm font-black text-zinc-900 dark:text-white">{t("emptyTitle")}</p>
            <p className="mt-1 text-xs font-semibold text-zinc-400">{t("emptyDesc")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mediaList.map((asset) => {
              const visibility = asset.shareVisibility ?? "private";
              const url = shareUrl(asset._id);
              return (
                <article key={asset._id} className="overflow-hidden rounded-[20px] border border-zinc-100 bg-white dark:border-white/10 dark:bg-[#0A0A0A]">
                  <SavedFilePreview asset={asset} />
                  <div className="space-y-3 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
                          {mediaTypeLabel(asset.kind, asset.mimeType)}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400">{formatSize(asset.size)}</span>
                      </div>
                      <h4 className="mt-3 truncate text-sm font-black text-zinc-900 dark:text-white" title={asset.name}>{asset.name}</h4>
                      <p className="mt-2 truncate rounded-xl bg-zinc-50 px-3 py-2 text-[10px] font-bold text-zinc-500 dark:bg-white/[0.03] dark:text-zinc-300">
                        {visibility === "public" ? url : t("shareLinkUnavailable")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openShareDialog(asset)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-2.5 text-start transition hover:border-zinc-200 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                      aria-label={t("openShareSettings", { name: asset.name })}
                    >
                      <span className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        visibility === "public" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-300",
                      )}>
                        {visibility === "public" ? <Globe2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-bold text-zinc-400">{t("visibilityLabel")}</span>
                        <span className="mt-0.5 block text-xs font-black text-zinc-900 dark:text-white">
                          {visibility === "public" ? t("public") : t("private")}
                        </span>
                      </span>
                      <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-zinc-600 shadow-sm dark:bg-white/10 dark:text-zinc-200">
                        {t("manageShare")}
                      </span>
                    </button>

                    <div className="flex items-center justify-end gap-1.5 border-t border-zinc-100 pt-3 dark:border-white/10">
                      <a href={url} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white" aria-label={t("openFile", { name: asset.name })}>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <a href={asset.url} target="_blank" rel="noreferrer" download={asset.name} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white" aria-label={t("downloadFile", { name: asset.name })}>
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => openShareDialog(asset)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label={t("openShareSettings", { name: asset.name })}
                        disabled={mediaOperation.isRunning}
                      >
                        {visibility === "public" ? <Globe2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => organizationId && void mediaOperation.run(() => deleteMediaRequest(organizationId, asset._id), { successMessage: t("deleted") })}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                        aria-label={t("deleteFile", { name: asset.name })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {mediaOperation.error && !shareAssetId && <p className="text-xs font-bold text-red-500">{mediaOperation.error}</p>}

      <Dialog open={Boolean(shareAssetId)} onOpenChange={closeShareDialog}>
        <DialogContent className="max-w-lg overflow-hidden rounded-[28px] border-zinc-100 bg-white p-0 shadow-none dark:border-white/10 dark:bg-[#0A0A0A]">
          <DialogHeader className="border-b border-zinc-100 p-5 dark:border-white/10">
            <DialogTitle className="text-lg font-black tracking-tight">{t("shareTitle")}</DialogTitle>
            <DialogDescription className="text-xs font-semibold text-zinc-400">
              {t("shareDesc")}
            </DialogDescription>
          </DialogHeader>

          {!activeShareAsset ? (
            <div className="flex min-h-48 items-center justify-center p-6 text-sm font-bold text-zinc-400">
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t("shareLoading")}
            </div>
          ) : (
            <div className="space-y-4 p-5">
              <div className="rounded-[22px] border border-zinc-100 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("currentFile")}</p>
                <p className="mt-2 truncate text-sm font-black text-zinc-900 dark:text-white" title={activeShareAsset.name}>
                  {activeShareAsset.name}
                </p>
                <p className="mt-1 text-xs font-semibold text-zinc-400">
                  {mediaTypeLabel(activeShareAsset.kind, activeShareAsset.mimeType)} - {formatSize(activeShareAsset.size)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(["private", "public"] as const).map((visibility) => {
                  const isSelected = (activeShareAsset.shareVisibility ?? "private") === visibility;
                  const isThisActionRunning = mediaOperation.isRunning && shareAction === visibility;
                  return (
                    <button
                      key={visibility}
                      type="button"
                      onClick={() => void updateVisibility(activeShareAsset, visibility)}
                      disabled={mediaOperation.isRunning || isSelected || !organizationId}
                      className={cn(
                        "min-h-32 rounded-[22px] border p-4 text-start transition",
                        isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                          : "border-zinc-100 bg-white text-zinc-900 hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]",
                      )}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-2xl",
                          isSelected ? "bg-white/15" : "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-200",
                        )}>
                          {isThisActionRunning ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : visibility === "public" ? (
                            <Globe2 className="h-4 w-4" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </span>
                        {isSelected && <CheckCircle2 className="h-4 w-4" />}
                      </span>
                      <span className="mt-4 block text-sm font-black">
                        {visibility === "public" ? t("sharePublicTitle") : t("sharePrivateTitle")}
                      </span>
                      <span className={cn(
                        "mt-2 block text-xs font-semibold leading-5",
                        isSelected ? "text-white/70 dark:text-zinc-600" : "text-zinc-400",
                      )}>
                        {visibility === "public" ? t("sharePublicDesc") : t("sharePrivateDesc")}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[22px] border border-zinc-100 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("shareLink")}</p>
                    <p className="mt-1 truncate text-xs font-bold text-zinc-500 dark:text-zinc-300">
                      {(activeShareAsset.shareVisibility ?? "private") === "public" ? shareUrl(activeShareAsset._id) : t("shareLinkUnavailable")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl px-3 text-[10px] font-black"
                      onClick={() => void copyPublicShareLink(activeShareAsset)}
                      disabled={mediaOperation.isRunning || (activeShareAsset.shareVisibility ?? "private") !== "public"}
                    >
                      {mediaOperation.isRunning && shareAction === "copy" ? <Loader2 className="me-2 h-3.5 w-3.5 animate-spin" /> : <Copy className="me-2 h-3.5 w-3.5" />}
                      {copiedShareLink ? t("copied") : t("copyPublicLink")}
                    </Button>
                    <a
                      href={shareUrl(activeShareAsset._id)}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "inline-flex h-9 items-center justify-center rounded-xl border border-zinc-100 bg-white px-3 text-[10px] font-black text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
                        (activeShareAsset.shareVisibility ?? "private") !== "public" && "pointer-events-none opacity-50",
                      )}
                    >
                      <ExternalLink className="me-2 h-3.5 w-3.5" />
                      {t("openPublicLink")}
                    </a>
                  </div>
                </div>
              </div>

              {!organizationId && (
                <div className="flex items-center rounded-2xl border border-zinc-100 bg-zinc-50 px-3 py-3 text-xs font-bold text-zinc-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300">
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t("shareLoading")}
                </div>
              )}

              {mediaOperation.error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-xs font-bold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                  {t("shareError", { error: mediaOperation.error })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadOpen} onOpenChange={closeUploadDialog}>
        <DialogContent className="max-w-2xl rounded-[28px] border-zinc-100 bg-white p-0 shadow-none dark:border-white/10 dark:bg-[#0A0A0A]">
          <DialogHeader className="border-b border-zinc-100 p-5 dark:border-white/10">
            <DialogTitle className="text-lg font-black tracking-tight">{t("uploadTitle")}</DialogTitle>
            <DialogDescription className="text-xs font-semibold text-zinc-400">
              {t("uploadModalDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 p-5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(event) => {
                event.preventDefault();
                addFiles(event.dataTransfer.files);
              }}
              className="flex min-h-36 w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-zinc-200 bg-zinc-50/70 p-6 text-center transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-900 shadow-sm dark:bg-white/10 dark:text-white">
                <UploadCloud className="h-5 w-5" />
              </span>
              <span className="mt-3 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">{t("chooseFiles")}</span>
              <span className="mt-2 text-xs font-semibold text-zinc-400">{t("uploadHint")}</span>
              <input
                ref={inputRef}
                type="file"
                className="sr-only"
                multiple
                accept="image/*,application/pdf"
                onChange={(event) => {
                  if (event.target.files) addFiles(event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            </button>

            {validationError && <p className="text-xs font-bold text-amber-600 dark:text-amber-300">{validationError}</p>}

            <div className="rounded-[24px] border border-zinc-100 bg-zinc-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("queuedFiles")}</p>
                {uploadStatus === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
                {uploadStatus === "uploaded" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </div>
              <div className="mt-3">
                {pendingFiles.length === 0 ? (
                  <p className="rounded-2xl bg-white px-3 py-3 text-xs font-semibold text-zinc-400 dark:bg-white/[0.03]">{t("noQueued")}</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {pendingFiles.map((item) => (
                      <article key={item.id} className="rounded-[20px] border border-zinc-100 bg-white p-3 dark:border-white/10 dark:bg-[#0E0E0E]">
                        <div className="flex gap-3">
                          <QueuedFilePreview file={item.file} extension={item.extension} />
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="rounded-full bg-zinc-100 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
                                {fileTypeLabel(item.file, item.extension)}
                              </span>
                              <span className="text-[10px] font-bold text-zinc-400">{formatSize(item.file.size)}</span>
                            </div>

                            {item.isEditing ? (
                              <div className="flex min-w-0 items-center rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-black/20">
                                <input
                                  value={item.baseName}
                                  onChange={(event) => {
                                    const nextName = event.target.value;
                                    setPendingFiles((current) =>
                                      current.map((queued) => queued.id === item.id ? { ...queued, baseName: nextName } : queued),
                                    );
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      setPendingFiles((current) =>
                                        current.map((queued) => queued.id === item.id ? { ...queued, isEditing: false } : queued),
                                      );
                                    }
                                  }}
                                  className="h-8 min-w-0 flex-1 rounded-l-xl bg-transparent px-2 text-xs font-bold text-zinc-900 outline-none dark:text-white"
                                  aria-label={`Edit file name for ${item.file.name}`}
                                  autoFocus
                                />
                                {item.extension && (
                                  <span className="shrink-0 border-s border-zinc-200 px-2 text-xs font-black text-zinc-400 dark:border-white/10">
                                    {item.extension}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="truncate text-xs font-black text-zinc-800 dark:text-zinc-100" title={pendingUploadName(item)}>
                                {pendingUploadName(item)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-zinc-100 pt-3 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => openLocalFile(item.file)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label={t("viewQueued", { name: pendingUploadName(item) })}
                            disabled={uploadOperation.isRunning}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPendingFiles((current) =>
                                current.map((queued) => queued.id === item.id ? { ...queued, isEditing: !queued.isEditing } : queued),
                              );
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label={item.isEditing ? t("saveName", { name: pendingUploadName(item) }) : t("editName", { name: pendingUploadName(item) })}
                            disabled={uploadOperation.isRunning}
                          >
                            {item.isEditing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingFiles((current) => current.filter((queued) => queued.id !== item.id))}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                            aria-label={t("removeQueued", { name: pendingUploadName(item) })}
                            disabled={uploadOperation.isRunning}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {uploadOperation.error && <p className="text-xs font-bold text-red-500">{uploadOperation.error}</p>}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 p-5 dark:border-white/10 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => closeUploadDialog(false)} disabled={uploadOperation.isRunning}>
              {common("cancel")}
            </Button>
            <Button type="button" onClick={() => void saveUpload()} disabled={pendingFiles.length === 0 || uploadOperation.isRunning || !canUpload}>
              {uploadOperation.isRunning ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <UploadCloud className="me-2 h-4 w-4" />}
              {common("save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
