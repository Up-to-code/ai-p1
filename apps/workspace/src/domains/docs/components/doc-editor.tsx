"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useToast } from "@/components/ui/toast";
import { logger } from "@/lib/logger";
import { CustomFieldsModal } from "./custom-fields-modal";
import { DocumentCustomFields } from "./document-custom-fields";
import { listOrganizationMembers } from "@/domains/organization/api/members";

const DOCUMENT_AUTOSAVE_DELAY = 60_000;

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
    customFields: values.customFields ?? [],
  });
}

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
  const membersResult = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId),
    enabled: Boolean(organizationId),
  });

  const [draft, setDraft] = useState<DocFormValues>(() => formFromDoc(doc));
  const [lastPersistedKey, setLastPersistedKey] = useState(() => persistedDocFormKey(formFromDoc(doc)));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [saveMode, setSaveMode] = useState<"saved" | "local" | "autosaving">("saved");

  const latestDraftRef = useRef(draft);
  const lastPersistedKeyRef = useRef(lastPersistedKey);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveVersionRef = useRef(0);

  const hasUnsavedChanges = persistedDocFormKey(draft) !== lastPersistedKey;
  const storageKey = `doc-draft:${organizationId}:${doc.id}`;

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
    doc.customFields,
    doc.updatedAt,
    markPersisted,
  ]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { getItem } = await import("@/domains/storage");
      const stored = await getItem("drafts", storageKey);
      if (cancelled) return;
      if (stored?.value && typeof stored.value === "object") {
        const restored = { ...formFromDoc(doc), ...(stored.value as Partial<DocFormValues>) };
        latestDraftRef.current = restored;
        setDraft(restored);
        setSaveMode("local");
      }
      setDraftLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [doc.id, organizationId, storageKey]);

  useEffect(() => {
    if (!draftLoaded || !hasUnsavedChanges) return;
    if (localDraftTimerRef.current) clearTimeout(localDraftTimerRef.current);
    localDraftTimerRef.current = setTimeout(() => {
      void (async () => {
        const { setItem } = await import("@/domains/storage");
        await setItem("drafts", storageKey, latestDraftRef.current as Record<string, unknown>);
      })();
    }, 300);
    return () => {
      if (localDraftTimerRef.current) clearTimeout(localDraftTimerRef.current);
    };
  }, [draft, draftLoaded, hasUnsavedChanges, storageKey]);

  const persistDraft = useCallback(async (nextDraft: DocFormValues, options?: { showToast?: boolean; automatic?: boolean }) => {
    const nextKey = persistedDocFormKey(nextDraft);
    if (nextKey === lastPersistedKeyRef.current) return;

    const saveVersion = ++saveVersionRef.current;
    if (options?.automatic) setSaveMode("autosaving");
    setBusyId("patch");
    try {
      await updateDoc(organizationId, doc.id, nextDraft);
      markPersisted(nextKey);
      setSaveMode("saved");
      const { removeItem } = await import("@/domains/storage");
      await removeItem("drafts", storageKey);
      if (options?.showToast) {
        toast.toast({ title: t("form.savedToast"), type: "success" });
      }
      onSaved?.();
    } catch (error) {
      logger.error("docs.save_failed", { docId: doc.id, error });
      if (options?.showToast) {
        toast.toast({ title: "Document could not be saved.", type: "error" });
      }
      setSaveMode("local");
    } finally {
      if (saveVersion === saveVersionRef.current) setBusyId(null);
    }
  }, [doc.id, markPersisted, onSaved, organizationId, storageKey, t, toast, updateDoc]);

  const scheduleServerAutosave = useCallback(
    (nextDraft: DocFormValues) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        void persistDraft(nextDraft, { automatic: true });
      }, DOCUMENT_AUTOSAVE_DELAY);
    },
    [persistDraft],
  );

  const updateDraft = useCallback(
    (partial: Partial<DocFormValues>, options?: { autosave?: boolean }) => {
      setDraft((current) => {
        const next = { ...current, ...partial };
        latestDraftRef.current = next;
        setSaveMode("local");
        scheduleServerAutosave(next);
        return next;
      });
    },
    [scheduleServerAutosave],
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
    setSaveMode("local");
    scheduleServerAutosave(next);
  }, [scheduleServerAutosave]);

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

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

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
              disabled={Boolean(busyId) || !hasUnsavedChanges}
              className="h-8 rounded-lg px-3 text-xs transition-all duration-200"
            >
              {busyId === "patch" ? "Saving..." : "Save"}
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
          isSaving={busyId === "patch"}
          onTitleBlur={(v) => {
            if (v !== draft.title) {
              updateDraft({ title: v });
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
        onSave={saveCustomFields}
      />
    </div>
  );
}
