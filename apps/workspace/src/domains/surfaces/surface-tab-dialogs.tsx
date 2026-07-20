"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SurfaceTabProjection } from "@convex/workspaceSurfaces/helpers";
import { SavedViewSharingDialog } from "@/domains/tasks/components/saved-view-sharing-dialog";

export type SavedViewType =
  | "table"
  | "board"
  | "list"
  | "calendar"
  | "timeline"
  | "dashboard"
  | "fileManager";

function savedViewForSharing(tab: SurfaceTabProjection): any {
  return {
    _id: tab.savedView.id,
    _creationTime: 0,
    userId: "",
    name: tab.savedView.name,
    resourceType: "project",
    viewType: tab.savedView.viewType as SavedViewType,
    scope: "workspace",
    config: tab.savedView.config,
    sharingMode: tab.savedView.sharingMode,
    revision: tab.savedView.revision,
    canConfigure: tab.capabilities.canRename,
    canShare: tab.capabilities.canShare,
    canDelete: tab.capabilities.canRemove,
    canSetDefault: false,
    createdAt: 0,
    updatedAt: 0,
  };
}

export function SurfaceTabDialogs({
  renameTab,
  onRenameClose,
  onRenameSubmit,
  renameValue,
  onRenameValueChange,
  renamePending,
  shareTab,
  onShareClose,
  organizationId,
}: {
  renameTab: SurfaceTabProjection | null;
  onRenameClose: () => void;
  onRenameSubmit: () => void;
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  renamePending: boolean;
  shareTab: SurfaceTabProjection | null;
  onShareClose: () => void;
  organizationId?: string;
}) {
  return (
    <>
      <Dialog open={Boolean(renameTab)} onOpenChange={(open) => !open && onRenameClose()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename view</DialogTitle>
            <DialogDescription>Change the tab label for this view.</DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(event) => onRenameValueChange(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") onRenameSubmit(); }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={onRenameClose}>Cancel</Button>
            <Button onClick={onRenameSubmit} disabled={!renameValue.trim() || renamePending}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SavedViewSharingDialog
        view={shareTab ? savedViewForSharing(shareTab) : null}
        organizationId={organizationId}
        open={Boolean(shareTab)}
        onOpenChange={(open: boolean) => !open && onShareClose()}
      />
    </>
  );
}
