"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, FolderInput, Copy } from "lucide-react";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { deleteDocRequest, moveDocRequest } from "../api/docs";
import { DocFolderPickerModal } from "./doc-folder-picker-modal";
import type { DocRecord } from "../docs.types";

interface DocRowActionsProps {
  doc: DocRecord;
  organizationId: string;
  onDeleted?: () => void;
  onMoved?: () => void;
}

export function DocRowActions({
  doc,
  organizationId,
  onDeleted,
  onMoved,
}: DocRowActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [moving, setMoving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function confirmDelete() {
    setBusyId("delete");
    try {
      await deleteDocRequest(organizationId, doc.id);
      onDeleted?.();
    } catch (error) {
      throw error;
    } finally {
      setBusyId(null);
      setDeleting(false);
    }
  }

  async function handleMoveToFolder(folderId?: string) {
    setBusyId("move");
    try {
      await moveDocRequest(organizationId, doc.id, folderId);
      onMoved?.();
    } catch (error) {
      throw error;
    } finally {
      setBusyId(null);
      setMoving(false);
    }
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-muted hover:text-foreground transition-colors"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-7 z-50 w-40 rounded-xl border border-border bg-background shadow-lg py-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMoving(true);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
              >
                <FolderInput className="h-3 w-3" />
                Move to...
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleting(true);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <DeleteRecordDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete document"
        description={`Are you sure you want to delete "${doc.title}"?`}
        isDeleting={busyId === "delete"}
        onConfirm={confirmDelete}
      />

      {moving && (
        <DocFolderPickerModal
          onClose={() => setMoving(false)}
          onSelect={(folderId) => handleMoveToFolder(folderId)}
          currentFolderId={doc.folderId}
          organizationId={organizationId}
        />
      )}
    </>
  );
}
