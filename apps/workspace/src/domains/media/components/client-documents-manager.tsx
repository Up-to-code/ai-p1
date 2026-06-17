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
} from "../api/media";
import {
  copyText,
  fileTypeLabel,
  finishPendingUploadEdit,
  formatSize,
  mediaTypeLabel,
  openLocalFile,
  pendingUploadName,
  removePendingUpload,
  renamedFile,
  selectPendingDocumentUploads,
  shareUrl,
  togglePendingUploadEdit,
  updatePendingUploadBaseName,
  type PendingUpload,
  type ShareVisibility,
  type UploadStatus,
} from "../document-view-model";

type MediaAsset = NonNullable<ReturnType<typeof useResourceMediaQuery>>[number];

type ClientDocumentsManagerProps = {
  organizationId?: string;
  clientId: string;
};

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
        className="h-16 w-16 shrink-0 rounded-2xl border border-border bg-muted bg-cover bg-center"
        style={{ backgroundImage: `url(${previewUrl})` }}
        aria-label={`Preview of ${file.name}`}
      />
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground">
      <FileText className="h-5 w-5" />
      <span className="mt-1 max-w-12 truncate text-[9px] font-black uppercase tracking-widest">{fileTypeLabel(file, extension)}</span>
    </div>
  );
}

function SavedFilePreview({ asset }: { asset: MediaAsset }) {
  if (asset.kind === "image") {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[20px] bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset.url} alt={asset.name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-t-[20px] bg-muted text-muted-foreground">
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
    const { accepted, validationError: nextValidationError } = selectPendingDocumentUploads(files, t("unsupported"));
    setValidationError(nextValidationError);

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
          <h3 className="mt-1 text-lg font-black tracking-tight text-foreground">{t("title")}</h3>
        </div>
        <Button type="button" onClick={() => setIsUploadOpen(true)} className="h-10 rounded-xl px-4 text-xs font-black uppercase tracking-widest" disabled={!canUpload}>
          <UploadCloud className="me-2 h-3.5 w-3.5" />
          {t("open")}
        </Button>
      </div>

      <section className="min-h-[280px]">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-[24px] border border-dashed border-border text-zinc-400">
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
            {common("loading")}
          </div>
        ) : mediaList.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-muted/40 text-center">
            <FileText className="h-8 w-8 text-zinc-300" />
            <p className="mt-3 text-sm font-black text-foreground">{t("emptyTitle")}</p>
            <p className="mt-1 text-xs font-semibold text-zinc-400">{t("emptyDesc")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mediaList.map((asset) => {
              const visibility = asset.shareVisibility ?? "private";
              const url = shareUrl(asset._id);
              return (
                <article key={asset._id} className="overflow-hidden rounded-[20px] border border-border bg-card">
                  <SavedFilePreview asset={asset} />
                  <div className="space-y-3 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          {mediaTypeLabel(asset.kind, asset.mimeType)}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400">{formatSize(asset.size)}</span>
                      </div>
                      <h4 className="mt-3 truncate text-sm font-black text-foreground" title={asset.name}>{asset.name}</h4>
                      <p className="mt-2 truncate rounded-xl bg-muted px-3 py-2 text-[10px] font-bold text-muted-foreground">
                        {visibility === "public" ? url : t("shareLinkUnavailable")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openShareDialog(asset)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-muted p-2.5 text-start transition hover:border-border hover:bg-muted"
                      aria-label={t("openShareSettings", { name: asset.name })}
                    >
                      <span className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        visibility === "public" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-muted text-muted-foreground",
                      )}>
                        {visibility === "public" ? <Globe2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-bold text-zinc-400">{t("visibilityLabel")}</span>
                        <span className="mt-0.5 block text-xs font-black text-foreground">
                          {visibility === "public" ? t("public") : t("private")}
                        </span>
                      </span>
                      <span className="rounded-full bg-card px-3 py-1.5 text-[10px] font-black text-muted-foreground shadow-sm">
                        {t("manageShare")}
                      </span>
                    </button>

                    <div className="flex items-center justify-end gap-1.5 border-t border-border pt-3">
                      <a href={url} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-muted hover:text-foreground" aria-label={t("openFile", { name: asset.name })}>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <a href={asset.url} target="_blank" rel="noreferrer" download={asset.name} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-muted hover:text-foreground" aria-label={t("downloadFile", { name: asset.name })}>
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => openShareDialog(asset)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-muted hover:text-foreground"
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
        <DialogContent className="max-w-lg overflow-hidden rounded-[28px] border-border bg-card p-0 shadow-none">
          <DialogHeader className="border-b border-border p-5">
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
              <div className="rounded-[22px] border border-border bg-muted p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("currentFile")}</p>
                <p className="mt-2 truncate text-sm font-black text-foreground" title={activeShareAsset.name}>
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
                          : "border-border bg-card text-foreground hover:border-border",
                      )}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-2xl",
                          isSelected ? "bg-white/15" : "bg-muted text-muted-foreground",
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

              <div className="rounded-[22px] border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("shareLink")}</p>
                    <p className="mt-1 truncate text-xs font-bold text-muted-foreground">
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
                        "inline-flex h-9 items-center justify-center rounded-xl border border-border bg-card px-3 text-[10px] font-black text-foreground transition hover:bg-muted",
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
                <div className="flex items-center rounded-2xl border border-border bg-muted px-3 py-3 text-xs font-bold text-muted-foreground">
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
        <DialogContent className="max-w-2xl rounded-[28px] border-border bg-card p-0 shadow-none">
          <DialogHeader className="border-b border-border p-5">
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
              className="flex min-h-36 w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-muted/70 p-6 text-center transition hover:border-border hover:bg-muted"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-foreground shadow-sm">
                <UploadCloud className="h-5 w-5" />
              </span>
              <span className="mt-3 text-[10px] font-black uppercase tracking-widest text-foreground">{t("chooseFiles")}</span>
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

            <div className="rounded-[24px] border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("queuedFiles")}</p>
                {uploadStatus === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
                {uploadStatus === "uploaded" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </div>
              <div className="mt-3">
                {pendingFiles.length === 0 ? (
                  <p className="rounded-2xl bg-card px-3 py-3 text-xs font-semibold text-zinc-400">{t("noQueued")}</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {pendingFiles.map((item) => (
                      <article key={item.id} className="rounded-[20px] border border-border bg-card p-3">
                        <div className="flex gap-3">
                          <QueuedFilePreview file={item.file} extension={item.extension} />
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <span className="rounded-full bg-muted px-2 py-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                {fileTypeLabel(item.file, item.extension)}
                              </span>
                              <span className="text-[10px] font-bold text-zinc-400">{formatSize(item.file.size)}</span>
                            </div>

                            {item.isEditing ? (
                              <div className="flex min-w-0 items-center rounded-xl border border-border bg-muted">
                                <input
                                  value={item.baseName}
                                  onChange={(event) => {
                                    const nextName = event.target.value;
                                    setPendingFiles((current) =>
                                      updatePendingUploadBaseName(current, item.id, nextName),
                                    );
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      setPendingFiles((current) =>
                                        finishPendingUploadEdit(current, item.id),
                                      );
                                    }
                                  }}
                                  className="h-8 min-w-0 flex-1 rounded-l-xl bg-transparent px-2 text-xs font-bold text-foreground outline-none"
                                  aria-label={`Edit file name for ${item.file.name}`}
                                  autoFocus
                                />
                                {item.extension && (
                                  <span className="shrink-0 border-s border-border px-2 text-xs font-black text-zinc-400">
                                    {item.extension}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="truncate text-xs font-black text-foreground" title={pendingUploadName(item)}>
                                {pendingUploadName(item)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-border pt-3">
                          <button
                            type="button"
                            onClick={() => openLocalFile(item.file)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-muted hover:text-foreground"
                            aria-label={t("viewQueued", { name: pendingUploadName(item) })}
                            disabled={uploadOperation.isRunning}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPendingFiles((current) =>
                                togglePendingUploadEdit(current, item.id),
                              );
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-muted hover:text-foreground"
                            aria-label={item.isEditing ? t("saveName", { name: pendingUploadName(item) }) : t("editName", { name: pendingUploadName(item) })}
                            disabled={uploadOperation.isRunning}
                          >
                            {item.isEditing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingFiles((current) => removePendingUpload(current, item.id))}
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

          <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
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
