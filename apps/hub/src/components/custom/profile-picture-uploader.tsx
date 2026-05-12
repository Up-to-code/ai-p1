"use client";

import { useMemo, useRef, useState } from "react";
import { Camera, Check, Loader2, UploadCloud, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { uploadFiles } from "@/lib/uploadthing";
import { authClient } from "@/lib/auth-client";

interface ProfilePictureUploaderProps {
  image: string | null;
  initials: string;
  name: string;
  uploadLabel: string;
  cropTitle?: string;
  labels: {
    apply: string;
    cancel: string;
    zoom: string;
    chooseImage: string;
    cropPrepareError: string;
    cropExportError: string;
    saveError: string;
    uploadMissingUrl: string;
    uploadFailed: string;
    remove: string;
    uploadSavedTitle: string;
    uploadSavedDescription: string;
    removeSavedTitle: string;
    removeSavedDescription: string;
  };
}

type UploadResult = {
  key?: string;
  url?: string;
};

type CropPosition = {
  x: number;
  y: number;
};

type ImageSize = {
  width: number;
  height: number;
};

type DragState = {
  clientX: number;
  clientY: number;
  startX: number;
  startY: number;
  pointerScale: number;
};

const CROP_OUTPUT_SIZE = 512;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getCoverLayout(size: ImageSize, zoom: number, position: CropPosition) {
  const baseScale = Math.max(CROP_OUTPUT_SIZE / size.width, CROP_OUTPUT_SIZE / size.height);
  const scale = baseScale * zoom;
  const renderedWidth = size.width * scale;
  const renderedHeight = size.height * scale;
  const minX = Math.min(0, CROP_OUTPUT_SIZE - renderedWidth);
  const minY = Math.min(0, CROP_OUTPUT_SIZE - renderedHeight);
  const x = clamp((CROP_OUTPUT_SIZE - renderedWidth) / 2 + position.x, minX, 0);
  const y = clamp((CROP_OUTPUT_SIZE - renderedHeight) / 2 + position.y, minY, 0);

  return { scale, renderedWidth, renderedHeight, x, y };
}

function clampCropPosition(size: ImageSize, zoom: number, position: CropPosition) {
  const baseScale = Math.max(CROP_OUTPUT_SIZE / size.width, CROP_OUTPUT_SIZE / size.height);
  const scale = baseScale * zoom;
  const renderedWidth = size.width * scale;
  const renderedHeight = size.height * scale;
  const centerX = (CROP_OUTPUT_SIZE - renderedWidth) / 2;
  const centerY = (CROP_OUTPUT_SIZE - renderedHeight) / 2;
  const minX = Math.min(0, CROP_OUTPUT_SIZE - renderedWidth) - centerX;
  const maxX = -centerX;
  const minY = Math.min(0, CROP_OUTPUT_SIZE - renderedHeight) - centerY;
  const maxY = -centerY;

  return {
    x: clamp(position.x, minX, maxX),
    y: clamp(position.y, minY, maxY),
  };
}

async function createCroppedAvatar(file: File, zoom: number, position: CropPosition, labels: ProfilePictureUploaderProps["labels"]) {
  const bitmap = await createImageBitmap(file);
  const layout = getCoverLayout({ width: bitmap.width, height: bitmap.height }, zoom, position);
  const sx = -layout.x / layout.scale;
  const sy = -layout.y / layout.scale;
  const cropSize = CROP_OUTPUT_SIZE / layout.scale;
  const canvas = document.createElement("canvas");
  canvas.width = CROP_OUTPUT_SIZE;
  canvas.height = CROP_OUTPUT_SIZE;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error(labels.cropPrepareError);
  }

  context.drawImage(bitmap, sx, sy, cropSize, cropSize, 0, 0, CROP_OUTPUT_SIZE, CROP_OUTPUT_SIZE);

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error(labels.cropExportError));
        return;
      }

      resolve(new File([blob], "profile-picture.webp", { type: "image/webp" }));
    }, "image/webp", 0.92);
  });
}

async function saveAvatar(avatarUrl: string, avatarKey: string | undefined, saveError: string) {
  const response = await fetch("/api/v1/profile/avatar", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ avatarUrl, avatarKey }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? saveError);
  }

  const { error } = await authClient.updateUser({ image: avatarUrl });
  if (error) {
    throw new Error(error.message ?? saveError);
  }
}

async function removeAvatar(saveError: string) {
  const response = await fetch("/api/v1/profile/avatar", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? saveError);
  }

  const { error } = await authClient.updateUser({ image: null });
  if (error) {
    throw new Error(error.message ?? saveError);
  }
}

export function ProfilePictureUploader({
  image,
  initials,
  name,
  uploadLabel,
  labels,
  cropTitle = "Crop profile picture",
}: ProfilePictureUploaderProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cropPosition, setCropPosition] = useState<CropPosition>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const previewLayout = imageSize ? getCoverLayout(imageSize, zoom, cropPosition) : null;

  function openCropper(nextFile: File) {
    if (!nextFile.type.startsWith("image/")) {
      setError(labels.chooseImage);
      return;
    }

    setError(null);
    setZoom(1);
    setCropPosition({ x: 0, y: 0 });
    setProgress(0);
    setFile(nextFile);
    setImageSize(null);
  }

  function closeCropper() {
    if (isUploading) return;
    setFile(null);
    setProgress(0);
    setError(null);
    setCropPosition({ x: 0, y: 0 });
    setIsPanning(false);
    setImageSize(null);
    dragRef.current = null;
  }

  function startPan(event: React.PointerEvent<HTMLDivElement>) {
    if (isUploading) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      startX: cropPosition.x,
      startY: cropPosition.y,
      pointerScale: CROP_OUTPUT_SIZE / rect.width,
    };
    setIsPanning(true);
  }

  function movePan(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current || isUploading || !imageSize) return;
    const nextPosition = {
      x: dragRef.current.startX + (event.clientX - dragRef.current.clientX) * dragRef.current.pointerScale,
      y: dragRef.current.startY + (event.clientY - dragRef.current.clientY) * dragRef.current.pointerScale,
    };

    setCropPosition(clampCropPosition(imageSize, zoom, nextPosition));
  }

  function endPan(event: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function applyCropAndUpload() {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const croppedFile = await createCroppedAvatar(file, zoom, cropPosition, labels);
      const [uploaded] = await uploadFiles("profilePicture", {
        files: [croppedFile],
        onUploadProgress: ({ progress: nextProgress }) => setProgress(nextProgress),
      });
      const result = uploaded as UploadResult;
      const avatarUrl = result.url;

      if (!avatarUrl) {
        throw new Error(labels.uploadMissingUrl);
      }

      await saveAvatar(avatarUrl, result.key, labels.saveError);
      toast({
        title: labels.uploadSavedTitle,
        description: labels.uploadSavedDescription,
        type: "success",
      });
      closeCropper();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : labels.uploadFailed;
      setError(message);
      toast({ title: labels.uploadFailed, description: message, type: "error" });
    } finally {
      setIsUploading(false);
    }
  }

  async function removeProfilePicture() {
    setIsUploading(true);
    setError(null);

    try {
      await removeAvatar(labels.saveError);
      toast({
        title: labels.removeSavedTitle,
        description: labels.removeSavedDescription,
        type: "success",
      });
      closeCropper();
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
      <div
        className={cn(
          "relative shrink-0 h-24 w-24 rounded-[28px] border-2 border-dashed transition-all",
          isDragging
            ? "border-blue-400 bg-blue-50 dark:bg-blue-500/10"
            : "border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-zinc-800"
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const droppedFile = event.dataTransfer.files?.[0];
          if (droppedFile) openCropper(droppedFile);
        }}
      >
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[26px]">
          {image ? (
            <img src={image} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="select-none text-2xl font-black tracking-tight text-zinc-400 dark:text-zinc-500">
              {initials}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-2 -end-2 flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 transition-transform hover:scale-105 active:scale-95 dark:bg-white"
          aria-label={uploadLabel}
        >
          <Camera className="h-3.5 w-3.5 text-white dark:text-zinc-900" />
        </button>
        {image && (
          <button
            type="button"
            onClick={removeProfilePicture}
            disabled={isUploading}
            className="absolute -top-2 -end-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-zinc-500 ring-1 ring-zinc-200 transition-colors hover:text-red-600 disabled:opacity-50 dark:bg-zinc-900 dark:ring-white/10"
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
        <DialogContent className="max-w-md rounded-[28px] border-zinc-100 bg-white p-6 shadow-none dark:border-white/10 dark:bg-[#111]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">{cropTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-black">
              <div
                className={cn(
                  "relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[28px] touch-none select-none",
                  isUploading ? "cursor-wait" : isPanning ? "cursor-grabbing" : "cursor-grab"
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
                      left: `${(previewLayout.x / CROP_OUTPUT_SIZE) * 100}%`,
                      top: `${(previewLayout.y / CROP_OUTPUT_SIZE) * 100}%`,
                      width: `${(previewLayout.renderedWidth / CROP_OUTPUT_SIZE) * 100}%`,
                      height: `${(previewLayout.renderedHeight / CROP_OUTPUT_SIZE) * 100}%`,
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
                <Label htmlFor="avatar-zoom" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <ZoomIn className="me-1 inline h-3 w-3" />
                  {labels.zoom}
                </Label>
                <span className="text-[10px] font-black text-zinc-400">{Math.round(progress)}%</span>
              </div>
              <input
                id="avatar-zoom"
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
                    setCropPosition((current) => clampCropPosition(imageSize, nextZoom, current));
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
            <Button type="button" onClick={applyCropAndUpload} disabled={isUploading} className="rounded-full bg-zinc-900 px-6 text-white hover:bg-black">
              {isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Check className="me-2 h-4 w-4" />}
              {labels.apply}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
