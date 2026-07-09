"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Tags,
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
import { useToast } from "@/components/ui/toast";
import { logger } from "@/lib/logger";
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

function persistedDocFormKey(values: DocFormValues) {
  return JSON.stringify({
    title: values.title,
    content: values.content,
    folderId: values.folderId,
    projectId: values.projectId,
    visibility: values.visibility,
    tags: values.tags,
  });
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
  const updateDoc = useUpdateDocMutation();
  const relatedDocsResult = useDocsQuery(organizationId, {
    projectId: doc.projectId ?? undefined,
  });
  const relatedTasksResult = useTasksQuery(organizationId, {
    projectId: doc.projectId ?? null,
  });

  const [draft, setDraft] = useState<DocFormValues>(() => formFromDoc(doc));
  const [lastPersistedKey, setLastPersistedKey] = useState(() => persistedDocFormKey(formFromDoc(doc)));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const latestDraftRef = useRef(draft);
  const lastPersistedKeyRef = useRef(lastPersistedKey);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveVersionRef = useRef(0);

  const hasUnsavedChanges = persistedDocFormKey(draft) !== lastPersistedKey;

  const markPersisted = useCallback((key: string) => {
    lastPersistedKeyRef.current = key;
    setLastPersistedKey(key);
  }, []);

  useEffect(() => {
    latestDraftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    const nextServerDraft = formFromDoc(doc);
    const nextServerKey = persistedDocFormKey(nextServerDraft);
    const currentKey = persistedDocFormKey(latestDraftRef.current);
    const hasLocalChanges = currentKey !== lastPersistedKeyRef.current;

    if (!hasLocalChanges || currentKey === nextServerKey) {
      latestDraftRef.current = nextServerDraft;
      setDraft(nextServerDraft);
      markPersisted(nextServerKey);
    }
  }, [
    doc.id,
    doc.title,
    doc.content,
    doc.folderId,
    doc.projectId,
    doc.visibility,
    doc.tags,
    doc.updatedAt,
    markPersisted,
  ]);

  const persistDraft = useCallback(async (nextDraft: DocFormValues, options?: { showToast?: boolean }) => {
    const nextKey = persistedDocFormKey(nextDraft);
    if (nextKey === lastPersistedKeyRef.current) return;

    const saveVersion = ++saveVersionRef.current;
    setBusyId("patch");
    try {
      await updateDoc(organizationId, doc.id, nextDraft);
      markPersisted(nextKey);
      if (options?.showToast) {
        toast.toast({ title: t("form.savedToast"), type: "success" });
      }
      onSaved?.();
    } catch (error) {
      logger.error("docs.save_failed", { docId: doc.id, error });
      if (options?.showToast) {
        toast.toast({ title: "Document could not be saved.", type: "error" });
      }
    } finally {
      if (saveVersion === saveVersionRef.current) setBusyId(null);
    }
  }, [doc.id, markPersisted, onSaved, organizationId, t, toast, updateDoc]);

  const scheduleAutosave = useCallback(
    (nextDraft: DocFormValues) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        void persistDraft(nextDraft);
      }, 700);
    },
    [persistDraft],
  );

  const updateDraft = useCallback(
    (partial: Partial<DocFormValues>, options?: { autosave?: boolean }) => {
      setDraft((current) => {
        const next = { ...current, ...partial };
        latestDraftRef.current = next;
        if (options?.autosave) scheduleAutosave(next);
        return next;
      });
    },
    [scheduleAutosave],
  );

  const flushAutosave = useCallback(
    (options?: { showToast?: boolean }) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      return persistDraft(latestDraftRef.current, options);
    },
    [persistDraft],
  );

  const saveDraft = useCallback(() => {
    void flushAutosave({ showToast: true });
  }, [flushAutosave]);

  const handleBodyBlur = useCallback((html: string) => {
    const next = { ...latestDraftRef.current, content: html };
    latestDraftRef.current = next;
    setDraft(next);
    void flushAutosave();
  }, [flushAutosave]);

  const mentionOptions = useMemo<DocEditorMentionOption[]>(() => {
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

    return [...docOptions, ...taskOptions];
  }, [doc.id, relatedDocsResult.data, relatedTasksResult.data]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const fields: DocEditorMetaField[] = [
    {
      key: "visibility",
      icon: <Globe className="h-3.5 w-3.5" />,
      label: t("form.visibility"),
      value: (
        <select
          value={draft.visibility}
          onChange={(e) => updateDraft({ visibility: e.target.value as DocFormValues["visibility"] }, { autosave: true })}
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
    {
      key: "tags",
      icon: <Tags className="h-3.5 w-3.5" />,
      label: "Tags",
      value: (
        <input
          value={draft.tags}
          onChange={(event) => updateDraft({ tags: event.target.value }, { autosave: true })}
          placeholder="Add labels, comma separated"
          className="h-7 w-full rounded-lg border border-transparent bg-transparent px-2 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-border hover:bg-card focus:border-border focus:bg-card"
        />
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
              const next = { ...latestDraftRef.current, title: v };
              latestDraftRef.current = next;
              setDraft(next);
              void persistDraft(next);
            }
          }}
          onBodyChange={(html) => {
            if (html !== latestDraftRef.current.content) {
              updateDraft({ content: html }, { autosave: true });
            }
          }}
          onBodyBlur={handleBodyBlur}
          mentionOptions={mentionOptions}
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
