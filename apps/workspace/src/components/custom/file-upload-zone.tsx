"use client";

import { useId, useState, type ChangeEvent, type DragEvent, type KeyboardEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  label: ReactNode;
  description?: string;
  className?: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
}

export function FileUploadZone({
  label,
  description,
  className,
  accept,
  multiple = false,
  onFilesSelected,
}: FileUploadZoneProps) {
  const t = useTranslations("Onboarding.common");
  const inputId = useId();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  function selectFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const nextFiles = multiple ? files : files.slice(0, 1);
    setSelectedFiles(nextFiles);
    onFilesSelected?.(nextFiles);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFiles(event.target.files);
    event.currentTarget.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    selectFiles(event.dataTransfer.files);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLLabelElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.getElementById(inputId)?.click();
    }
  }
  
  return (
    <div className="space-y-3 w-full">
      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</div>
      <label
        htmlFor={inputId}
        tabIndex={0}
        role="button"
        className={cn(
          "border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-muted/50 hover:bg-muted transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/20 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-400/30 dark:focus-visible:ring-offset-background",
          className
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
      >
        <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          {selectedFiles.length > 0 ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 transition-colors" />
          ) : (
            <UploadCloud className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
        <p className="text-[11px] font-black uppercase tracking-widest text-foreground mb-2">
          {selectedFiles.length > 0 ? t("selectedFiles", { count: selectedFiles.length }) : t("uploadOrDrag")}
        </p>
        {description && <p className="text-[10px] font-bold text-muted-foreground max-w-sm">{description}</p>}
        {selectedFiles.length > 0 && (
          <p className="mt-3 max-w-sm truncate text-[10px] font-bold text-muted-foreground" title={selectedFiles.map((file) => file.name).join(", ")}>
            {selectedFiles.map((file) => file.name).join(", ")}
          </p>
        )}
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={handleInputChange}
        />
      </label>
    </div>
  );
}
