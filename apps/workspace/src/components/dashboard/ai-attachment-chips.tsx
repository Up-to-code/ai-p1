"use client";
/* eslint-disable @next/next/no-img-element */

import { FileImage, FileText, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type PendingAttachment = {
  id: string;
  file: File;
  previewUrl: string | null;
  status: "pending" | "uploading" | "error";
  error?: string;
};

export function AiAttachmentChips({
  attachments,
  disabled = false,
  onRemove,
  isRtl = true,
}: {
  attachments: PendingAttachment[];
  disabled?: boolean;
  onRemove: (attachmentId: string) => void;
  isRtl?: boolean;
}) {
  const t = useTranslations("Assistant");
  
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-border px-4 pb-3 pt-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-wrap gap-3">
        {attachments.map((attachment) => {
          const isUploading = attachment.status === "uploading";
          const hasError = attachment.status === "error";
          const isImage = attachment.file.type.startsWith("image/");
          const Icon = isImage ? FileImage : FileText;
          
          return (
            <div
              key={attachment.id}
              className={cn(
                "group relative flex w-[160px] shrink-0 flex-col overflow-hidden rounded-[20px] border bg-card dark:bg-muted",
                hasError
                  ? "border-red-200 dark:border-red-500/20"
                  : "border-border",
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted dark:bg-card">
                {attachment.previewUrl ? (
                  <img
                    src={attachment.previewUrl}
                    alt={attachment.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-secondary-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                )}
                
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                      isUploading
                        ? "bg-foreground/80 text-background"
                        : hasError
                          ? "bg-red-500/90 text-background"
                          : "bg-card/90 text-secondary-foreground",
                    )}
                  >
                    {isUploading
                      ? t("statusUploading")
                      : hasError
                        ? t("statusUploadFailed")
                        : t("statusReady")}
                  </span>
                  <button
                    type="button"
                    disabled={disabled || isUploading}
                    onClick={() => onRemove(attachment.id)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground/75 text-background transition hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 backdrop-blur-[1px]">
                    <Loader2 className="h-5 w-5 animate-spin text-background" />
                  </div>
                )}
              </div>
              
              <div className={cn("space-y-0.5 px-3 py-2", isRtl ? "text-right" : "text-left")}>
                <div className="line-clamp-1 truncate text-[11px] font-bold text-secondary-foreground">
                  {attachment.file.name}
                </div>
                <p className="text-[9px] font-medium text-muted-foreground">
                  {(attachment.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
