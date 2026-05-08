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
    <div className="border-b border-zinc-100 px-4 pb-3 pt-4 dark:border-white/10" dir={isRtl ? "rtl" : "ltr"}>
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
                "group relative flex w-[160px] shrink-0 flex-col overflow-hidden rounded-[20px] border bg-white dark:bg-white/[0.04]",
                hasError
                  ? "border-red-200 dark:border-red-500/20"
                  : "border-zinc-200 dark:border-white/10",
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                {attachment.previewUrl ? (
                  <img
                    src={attachment.previewUrl}
                    alt={attachment.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-500 dark:text-zinc-300">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                )}
                
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                      isUploading
                        ? "bg-slate-900/80 text-white"
                        : hasError
                          ? "bg-red-500/90 text-white"
                          : "bg-white/90 text-slate-700",
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
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/75 text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-[1px]">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <div className={cn("space-y-0.5 px-3 py-2", isRtl ? "text-right" : "text-left")}>
                <div className="line-clamp-1 truncate text-[11px] font-bold text-zinc-700 dark:text-zinc-200">
                  {attachment.file.name}
                </div>
                <p className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500">
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
