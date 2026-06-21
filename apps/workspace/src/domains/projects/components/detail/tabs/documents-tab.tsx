"use client";

import React from "react";
import { type Project } from "../../../store/projects.types";
import { Folder, Upload, FileText, Image, File } from "lucide-react";

interface DocumentsTabProps {
  project: Project;
  organizationId: string;
}

export function DocumentsTab({ project, organizationId }: DocumentsTabProps) {
  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div className="rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-primary/30 hover:bg-muted/20 transition-colors cursor-pointer">
        <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm font-semibold text-muted-foreground">
          Drop files here or click to upload
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          Documents, images, and files for this project
        </p>
      </div>

      {/* Empty state */}
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Folder className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm font-semibold text-muted-foreground">
          No files uploaded yet
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          Upload files to keep project documents organized
        </p>
      </div>
    </div>
  );
}
