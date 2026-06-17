"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { Camera, Check, Loader2, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { uploadFiles } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { updateAuthOrganization } from "../api/clerk-organization-api";
import {
  clampLogoCropPosition,
  organizationLogoCoverLayout,
  organizationLogoOutputSize,
  type CropPosition,
  type ImageSize,
} from "../organization-logo-view-model";

type DragState = {
  clientX: number;
  clientY: number;
  startX: number;
  startY: number;
  pointerScale: number;
};
type UploadResult = { key?: string; url?: string };

async function createCroppedLogo(file: File, zoom: number, position: CropPosition) {
  const bitmap = await createImageBitmap(file);
  const layout = organizationLogoCoverLayout({ width: bitmap.width, height: bitmap.height }, zoom, position);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = organizationLogoOutputSize;
  canvas.height = organizationLogoOutputSize;

  if (!context) {
    throw new Error("Image crop could not be prepared.");
  }

  const sx = -layout.x / layout.scale;
  const sy = -layout.y / layout.scale;
  const cropSize = organizationLogoOutputSize / layout.scale;
  context.drawImage(bitmap, sx, sy, cropSize, cropSize, 0, 0, organizationLogoOutputSize, organizationLogoOutputSize);

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Image crop could not be exported."));
        return;
      }

      resolve(new File([blob], "organization-logo.webp", { type: "image/webp" }));
    }, "image/webp", 0.92);
  });
}

export function OrganizationLogoUploader({
  organizationId,
  name,
  logo,
  initials,
  labels,
  onSaved,
}: {
  organizationId: string;
  name: string;
  logo: string | null;
  initials: string;
  labels: {
    upload: string;
    remove: string;
    cropTitle: string;
    apply: string;
    cancel: string;
    zoom: string;
    chooseImage: string;
    savedTitle: string;
    savedDescription: string;
    removedTitle: string;
    removedDescription: string;
    uploadFailed: string;
  };
  onSaved: (logo: string | null) => void | Promise<void>;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [progress, setProgress] = useState(0);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [cropPosition, setCropPosition] = useState<CropPosition>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const previewLayout = imageSize ? organizationLogoCoverLayout(imageSize, zoom, cropPosition) : null;

  function openCropper(nextFile: File) {
    if (!nextFile.type.startsWith("image/")) {
      setError(labels.chooseImage);
      return;
    }

    setError(null);
    setProgress(0);
    setZoom(1);
    setCropPosition({ x: 0, y: 0 });
    setImageSize(null);
    setFile(nextFile);
  }

  function closeCropper() {
    if (isUploading) return;
    setFile(null);
    setProgress(0);
    setError(null);
    setImageSize(null);
    setCropPosition({ x: 0, y: 0 });
    setIsPanning(false);
    dragRef.current = null;
  }

  function startPan(event: PointerEvent<HTMLDivElement>) {
    if (isUploading) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      startX: cropPosition.x,
      startY: cropPosition.y,
      pointerScale: organizationLogoOutputSize / rect.width,
    };
    setIsPanning(true);
  }

  function movePan(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current || isUploading || !imageSize) return;
    const nextPosition = {
      x: dragRef.current.startX + (event.clientX - dragRef.current.clientX) * dragRef.current.pointerScale,
      y: dragRef.current.startY + (event.clientY - dragRef.current.clientY) * dragRef.current.pointerScale,
    };
    setCropPosition(clampLogoCropPosition(imageSize, zoom, nextPosition));
  }

  function endPan(event: PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function applyLogo() {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const croppedFile = await createCroppedLogo(file, zoom, cropPosition);
      const [uploaded] = await uploadFiles("organizationLogo", {
        files: [croppedFile],
        onUploadProgress: ({ progress: nextProgress }) => setProgress(nextProgress),
      });
      const result = uploaded as UploadResult;
      const logoUrl = result.url;

      if (!logoUrl) {
        throw new Error(labels.uploadFailed);
      }

      await updateAuthOrganization(organizationId, { logo: logoUrl });
      await onSaved(logoUrl);
      toast({ title: labels.savedTitle, description: labels.savedDescription, type: "success" });
      closeCropper();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : labels.uploadFailed;
      setError(message);
      toast({ title: labels.uploadFailed, description: message, type: "error" });
    } finally {
      setIsUploading(false);
    }
  }

  async function removeLogo() {
    setIsUploading(true);
    setError(null);

    try {
      await updateAuthOrganization(organizationId, { logo: "" });
      await onSaved(null);
      toast({ title: labels.removedTitle, description: labels.removedDescription, type: "success" });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : labels.uploadFailed;
      setError(message);
      toast({ title: labels.uploadFailed, description: message, type: "error" });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <div className="relative h-24 w-24 shrink-0 rounded-[28px] border border-border bg-card">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[27px]">
          {logo ? (
            <img src={logo} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="select-none text-2xl font-black tracking-tight text-muted-foreground">{initials}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-2 -end-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary transition-transform hover:scale-105 active:scale-95"
          aria-label={labels.upload}
        >
          <Camera className="h-3.5 w-3.5 text-primary-foreground" />
        </button>
        {logo && (
          <button
            type="button"
            onClick={removeLogo}
            disabled={isUploading}
            className="absolute -top-2 -end-2 flex h-8 w-8 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-sm ring-1 ring-border transition-colors hover:text-red-600 disabled:opacity-50"
            aria-label={labels.remove}
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const selectedFile = event.target.files?.[0];
            if (selectedFile) openCropper(selectedFile);
            event.currentTarget.value = "";
          }}
        />
      </div>

      <Dialog open={Boolean(file)} onOpenChange={(open) => !open && closeCropper()}>
        <DialogContent className="max-w-md rounded-[28px] border-border bg-card p-6 shadow-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">{labels.cropTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-[28px] border border-border bg-muted">
              <div
                className={cn(
                  "relative mx-auto aspect-square w-full max-w-sm touch-none select-none overflow-hidden rounded-[28px]",
                  isUploading ? "cursor-wait" : isPanning ? "cursor-grabbing" : "cursor-grab",
                )}
                onPointerDown={startPan}
                onPointerMove={movePan}
                onPointerUp={endPan}
                onPointerCancel={endPan}
              >
                {previewUrl && previewLayout && (
                  <img
                    src={previewUrl}
                    alt=""
                    onLoad={(event) => {
                      setImageSize({
                        width: event.currentTarget.naturalWidth,
                        height: event.currentTarget.naturalHeight,
                      });
                    }}
                    className="pointer-events-none absolute max-w-none"
                    style={{
                      left: `${(previewLayout.x / organizationLogoOutputSize) * 100}%`,
                      top: `${(previewLayout.y / organizationLogoOutputSize) * 100}%`,
                      width: `${(previewLayout.renderedWidth / organizationLogoOutputSize) * 100}%`,
                      height: `${(previewLayout.renderedHeight / organizationLogoOutputSize) * 100}%`,
                    }}
                  />
                )}
                {previewUrl && !previewLayout && (
                  <img
                    src={previewUrl}
                    alt=""
                    onLoad={(event) => {
                      setImageSize({
                        width: event.currentTarget.naturalWidth,
                        height: event.currentTarget.naturalHeight,
                      });
                    }}
                    className="pointer-events-none h-full w-full object-contain opacity-0"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-2 ring-inset ring-white/80 dark:ring-white/40" />
                <div className="pointer-events-none absolute left-1/3 top-0 h-full w-px bg-white/35" />
                <div className="pointer-events-none absolute left-2/3 top-0 h-full w-px bg-white/35" />
                <div className="pointer-events-none absolute left-0 top-1/3 h-px w-full bg-white/35" />
                <div className="pointer-events-none absolute left-0 top-2/3 h-px w-full bg-white/35" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="organization-logo-zoom" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <ZoomIn className="me-1 inline h-3 w-3" />
                  {labels.zoom}
                </Label>
                <span className="text-[10px] font-black text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <input
                id="organization-logo-zoom"
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                disabled={isUploading}
                onChange={(event) => {
                  const nextZoom = Number(event.target.value);
                  setZoom(nextZoom);
                  if (imageSize) {
                    setCropPosition((current) => clampLogoCropPosition(imageSize, nextZoom, current));
                  }
                }}
                className="w-full accent-zinc-900"
              />
            </div>

            {error && <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">{error}</p>}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="ghost" onClick={closeCropper} disabled={isUploading}>
              <X className="me-2 h-4 w-4" />
              {labels.cancel}
            </Button>
            <Button type="button" onClick={applyLogo} disabled={isUploading} className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-black">
              {isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Check className="me-2 h-4 w-4" />}
              {labels.apply}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
