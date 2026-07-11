"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Trash2,
  SlidersHorizontal,
  MoreHorizontal,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  WorkOsDocEditor,
  type DocEditorMetaField,
  type DocEditorMentionOption,
} from "@/components/shared/work-os-doc-editor";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { deleteDocRequest, useDocsQuery, useUpdateDocMutation } from "../api/docs";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import type { DocFormValues, DocRecord, CustomField } from "../docs.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CustomFieldsModal } from "./custom-fields-modal";
import { DocumentCustomFields } from "./document-custom-fields";
import { listOrganizationMembers } from "@/domains/organization/api/members";
import { useDocumentDraft } from "../hooks/use-document-draft";

export function DocEditor({
  doc,
  organizationId,
  onSaved,
  onDeleted,
  onClose,
}: {
  doc: DocRecord;
  organizationId: string;
  onSaved?: () => void;
  onDeleted?: () => void;
  onClose?: () => void;
}) {
  const t = useTranslations("Docs");
  const updateDoc = useUpdateDocMutation();
  const relatedDocsResult = useDocsQuery(organizationId, {
    projectId: doc.projectId ?? undefined,
  });
  const relatedTasksResult = useTasksQuery(organizationId, {
    projectId: doc.projectId ?? null,
  });
  const membersResult = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId),
    enabled: Boolean(organizationId),
  });

  const persistDocument = useCallback(
    (values: DocFormValues) => updateDoc(organizationId, doc.id, values),
    [doc.id, organizationId, updateDoc],
  );
  const {
    draft,
    isSaving,
    saveMode,
    hasUnsavedChanges,
    updateDraft,
    updateBody,
    saveDraft,
  } = useDocumentDraft({
    doc,
    organizationId,
    persist: persistDocument,
    onSaved,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mentionOptions = useMemo<DocEditorMentionOption[]>(() => {
    const memberOptions =
      membersResult.data?.map((member) => {
        const userId = member.userId || member.user?.id || member.id;
        return {
          id: userId,
          label: member.user?.name || member.user?.email || userId,
          helper: ["Member", member.user?.email, member.role].filter(Boolean).join(" · "),
          type: "member" as const,
          href: `/team?memberId=${encodeURIComponent(userId)}`,
        };
      }) ?? [];

    const docOptions =
      relatedDocsResult.data
        ?.filter((relatedDoc) => relatedDoc.id !== doc.id)
        .slice(0, 40)
        .map((relatedDoc) => ({
          id: relatedDoc.id,
          label: relatedDoc.title || "Untitled document",
          helper: ["Document", ...(relatedDoc.tags ?? []).slice(0, 3)].join(" · "),
          type: "doc" as const,
          href: `/docs/${relatedDoc.id}`,
        })) ?? [];

    const taskOptions =
      relatedTasksResult.data
        ?.slice(0, 40)
        .map((task) => ({
          id: task.id,
          label: task.title || "Untitled task",
          helper: ["Task", task.status, task.priority].filter(Boolean).join(" · "),
          type: "task" as const,
          href: `/tasks/${task.id}`,
        })) ?? [];

    return [...memberOptions, ...docOptions, ...taskOptions];
  }, [doc.id, membersResult.data, relatedDocsResult.data, relatedTasksResult.data]);

  const fields: DocEditorMetaField[] = [
    {
      key: "custom-fields",
      icon: <SlidersHorizontal className="h-3.5 w-3.5" />,
      label: "Custom fields",
      value: (
        <DocumentCustomFields
          fields={draft.customFields ?? []}
          onChange={(customFields) => updateDraft({ customFields })}
          onManage={() => setShowCustomFieldsModal(true)}
        />
      ),
      fullWidth: true,
    },
  ];

  const saveCustomFields = useCallback((customFields: CustomField[]) => {
    updateDraft({ customFields });
  }, [updateDraft]);

  async function confirmDelete() {
    setIsDeleting(true);
    try {
      await deleteDocRequest(organizationId, doc.id);
      onDeleted?.();
    } catch (error) {
      throw error;
    } finally {
      setIsDeleting(false);
      setDeleting(false);
    }
  }

  return (
    <div className={cn("flex h-full flex-col", isFullscreen && "fixed inset-0 z-50 bg-background")}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} className="h-8 w-8 shrink-0" aria-label="Back to documents">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-0 max-w-[min(50vw,36rem)] truncate text-sm font-semibold text-foreground" title={draft.title || "Untitled document"}>
            {draft.title || "Untitled document"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={saveDraft}
              disabled={isSaving || !hasUnsavedChanges}
              className="h-8 rounded-lg px-3 text-xs transition-all duration-200"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
              {saveMode === "autosaving" ? "Autosaving…" : saveMode === "local" ? "Autosave in 1 min" : "Autosave on"}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" className="h-8 w-8" aria-label="More document actions" />}>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setShowCustomFieldsModal(true)}><SlidersHorizontal />Manage fields</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsFullscreen(!isFullscreen)}>{isFullscreen ? <Minimize2 /> : <Maximize2 />}{isFullscreen ? "Exit full screen" : "Full screen"}</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}><Trash2 />Delete document</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Doc editor */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <WorkOsDocEditor
          title={draft.title}
          body={draft.content}
          fields={fields}
          titlePlaceholder={t("form.titlePlaceholder") || "Document title"}
          bodyPlaceholder={
            t("form.bodyPlaceholder") ||
            "Start writing... Type / for commands"
          }
          isSaving={isSaving}
          onTitleBlur={(v) => {
            if (v !== draft.title) {
              updateDraft({ title: v });
            }
          }}
          onBodyChange={updateBody}
          onBodyBlur={updateBody}
          mentionOptions={mentionOptions}
          compactFormatting
        />
      </div>

      <DeleteRecordDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t("actions.deleteDoc")}
        description={t("actions.deleteDesc", { title: draft.title })}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
      />

      <CustomFieldsModal
        open={showCustomFieldsModal}
        onOpenChange={setShowCustomFieldsModal}
        customFields={draft.customFields || []}
        onSave={saveCustomFields}
      />
    </div>
  );
}
