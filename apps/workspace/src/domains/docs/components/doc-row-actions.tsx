"use client";

import { useState } from "react";
import { PopoverMenu } from "@qentrah/our-platform-components";
import { MoreHorizontal, Trash2, FolderInput } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
        <PopoverMenu
          align="right"
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={(e) => e.stopPropagation()}
              aria-label="Document actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          }
          items={[
            {
              key: "move",
              label: "Move to...",
              icon: <FolderInput className="h-3 w-3" />,
              onClick: () => setMoving(true),
            },
            {
              key: "delete",
              label: "Delete",
              icon: <Trash2 className="h-3 w-3" />,
              destructive: true,
              onClick: () => setDeleting(true),
            },
          ]}
        />
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
