"use client";

import * as React from "react";
import { UploadCloud, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  accept?: string;
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxSizeInMB = 10,
  accept = "image/*,application/pdf",
  className,
  ...props
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFiles = (files: File[]) => {
    setError(null);
    if (selectedFiles.length + files.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files.`);
      return false;
    }

    for (const file of files) {
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setError(`File ${file.name} exceeds the ${maxSizeInMB}MB limit.`);
        return false;
      }
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (validateFiles(droppedFiles)) {
      const newFiles = [...selectedFiles, ...droppedFiles];
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (validateFiles(selected)) {
        const newFiles = [...selectedFiles, ...selected];
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);
      }
    }
  };

  const removeFile = (indexToRemove: number) => {
    const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border/60 hover:border-primary/50 bg-background-elevated hover:bg-background"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-text-primary">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-text-muted">
            SVG, PNG, JPG or PDF (max. {maxSizeInMB}MB)
          </p>
        </div>
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div 
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background-elevated"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <File className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                  <p className="text-xs text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-text-muted hover:text-red-500 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
