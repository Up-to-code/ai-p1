"use client";

import { useCallback, useState } from "react";
import {
  FolderOpen,
  Globe,
  Lock,
  Users,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  WorkOsDocEditor,
  type DocEditorMetaField,
} from "@/components/shared/work-os-doc-editor";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { updateDocRequest, deleteDocRequest } from "../api/docs";
import type { DocFormValues, DocRecord, CustomField } from "../docs.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CustomFieldsModal } from "./custom-fields-modal";

function formFromDoc(doc: DocRecord): DocFormValues {
  return {
    title: doc.title,
    content: doc.content ?? "",
    folderId: doc.folderId ?? "",
    projectId: doc.projectId ?? "",
    visibility: doc.visibility ?? "team",
    tags: (doc.tags ?? []).join(", "),
    customFields: doc.customFields ?? [],
  };
}

const VISIBILITY_OPTIONS = [
  { value: "private", label: "Private", icon: Lock },
  { value: "team", label: "Team", icon: Users },
  { value: "workspace", label: "Workspace", icon: Globe },
] as const;

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
  const toast = useToast();

  const [draft, setDraft] = useState<DocFormValues>(() => formFromDoc(doc));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const savedSnapshot = formFromDoc(doc);
  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(savedSnapshot);

  const updateDraft = useCallback((partial: Partial<DocFormValues>) => {
    setDraft((current) => ({ ...current, ...partial }));
  }, []);

  const saveDraft = useCallback(async () => {
    setBusyId("patch");
    try {
      await updateDocRequest(organizationId, doc.id, draft);
      toast.toast({ title: t("form.savedToast"), type: "success" });
      onSaved?.();
    } catch (error) {
      throw error;
    } finally {
      setBusyId(null);
    }
  }, [draft, organizationId, doc.id, toast, onSaved, t]);

  // Auto-save on blur
  const handleBodyBlur = useCallback(
    (html: string) => {
      if (html !== draft.content) {
        updateDraft({ content: html });
        // Auto-save when body changes
        updateDocRequest(organizationId, doc.id, {
          ...draft,
          content: html,
        }).catch(() => {});
      }
    },
    [draft, organizationId, doc.id, updateDraft],
  );

  const fields: DocEditorMetaField[] = [
    {
      key: "visibility",
      icon: <Globe className="h-3.5 w-3.5" />,
      label: t("form.visibility"),
      value: (
        <select
          value={draft.visibility}
          onChange={(e) => updateDraft({ visibility: e.target.value as DocFormValues["visibility"] })}
          className="h-6 rounded-lg border border-border bg-card px-2 text-[11px] font-medium text-foreground outline-none"
        >
          {VISIBILITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ),
    },
  ];

  const handleAddCustomField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      name: "New Field",
      type: "text",
      value: "",
    };
    updateDraft({ customFields: [...(draft.customFields || []), newField] });
  };

  const handleUpdateCustomField = (fieldId: string, updates: Partial<CustomField>) => {
    const updatedFields = (draft.customFields || []).map((field) =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    updateDraft({ customFields: updatedFields });
  };

  const handleDeleteCustomField = (fieldId: string) => {
    const updatedFields = (draft.customFields || []).filter((field) => field.id !== fieldId);
    updateDraft({ customFields: updatedFields });
  };

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

  return (
    <div className={cn("flex h-full flex-col", isFullscreen && "fixed inset-0 z-50 bg-background")}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="sm"
            onClick={saveDraft}
            disabled={Boolean(busyId) || !hasUnsavedChanges}
            className="h-8 rounded-xl text-xs transition-all duration-200"
          >
            {busyId === "patch" ? "Saving..." : t("form.saveBtn")}
          </Button>
          {hasUnsavedChanges && !busyId && (
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 transition-opacity duration-300">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Minimize" : "Maximize"}
            className="transition-all duration-200 h-8 w-8"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomFieldsModal(true)}
            className="h-8 text-xs"
          >
            Custom Fields
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            title="Close"
            className="transition-all duration-200 hover:bg-destructive/10 hover:text-destructive h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
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
          isSaving={busyId === "patch"}
          onTitleBlur={(v) => {
            if (v !== draft.title) {
              updateDraft({ title: v });
              // Auto-save title
              updateDocRequest(organizationId, doc.id, {
                ...draft,
                title: v,
              }).catch(() => {});
            }
          }}
          onBodyChange={(html) => {
            if (html !== draft.content) {
              // Defer state update to avoid setState during render
              requestAnimationFrame(() => updateDraft({ content: html }));
            }
          }}
          onBodyBlur={handleBodyBlur}
          compactFormatting
        />
      </div>

      <DeleteRecordDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t("actions.deleteDoc")}
        description={t("actions.deleteDesc", { title: draft.title })}
        isDeleting={busyId === "delete"}
        onConfirm={confirmDelete}
      />

      <CustomFieldsModal
        open={showCustomFieldsModal}
        onOpenChange={setShowCustomFieldsModal}
        customFields={draft.customFields || []}
        onSave={(fields) => updateDraft({ customFields: fields })}
      />
    </div>
  );
}
