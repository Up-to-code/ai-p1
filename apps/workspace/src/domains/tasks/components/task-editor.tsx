"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Circle,
  FolderKanban,
  UserRound,
  CalendarDays,
  Flag,
  Trash2,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  WorkOsDocEditor,
  type DocEditorMentionOption,
  type DocEditorMetaField,
} from "@/components/shared/work-os-doc-editor";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import {
  deleteTaskRequest,
  updateTaskRequest,
} from "../api/tasks";
import type { TaskFormValues, TaskRecord } from "../tasks.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  taskDocumentContext,
} from "../tasks.constants";
import { StatusPicker, PriorityPicker, DueDatePicker, AssigneePicker, ProjectPicker } from "./task-pickers";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { taskHref } from "./task-hooks";
import { taskLog } from "../task-log";
import { CustomFieldsSection } from "@/components/shared/custom-fields/custom-fields-section";

// ─── Form helpers ──────────────────────────────────────────────────────────────

function formFromTask(task: TaskRecord): TaskFormValues {
  return {
    title: task.title,
    status: task.status,
    pipelineOrder: task.pipelineOrder,
    priority: task.priority,
    visibility: task.visibility ?? "team",
    assigneeUserId: task.assigneeUserId ?? "",
    assigneeUserIds: task.assigneeUserIds ?? (task.assigneeUserId ? [task.assigneeUserId] : []),
    clientId: task.clientId ?? "",
    projectId: task.projectId ?? "",
    startDate: task.startDate ?? new Date(task.createdAt).toISOString().slice(0, 10),
    dueDate: task.dueDate ?? "",
    description: task.description ?? "",
    tags: (task.tags ?? []).join(", "),
  };
}

// ─── Task Editor panel ────────────────────────────────────────────────────────

/**
 * Renders the doc-editor for a single task.
 * Used both inside the split-pane TasksScreen and standalone TaskDetailScreen.
 */
export function TaskEditor({
  task,
  organizationId,
  memberOptions,
  mentionOptions,
  onSaved,
  onDeleted,
  onClose,
  showBackLink = false,
  routeProjectId = null,
  isFullscreen = false,
  onToggleFullscreen,
}: {
  task: TaskRecord;
  organizationId: string;
  memberOptions: WorkOsPickerOption[];
  mentionOptions: DocEditorMentionOption[];
  onSaved?: () => void;
  onDeleted?: () => void;
  onClose?: () => void;
  showBackLink?: boolean;
  routeProjectId?: string | null;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}) {
  const t = useTranslations("Tasks");
  const toast = useToast();
  const context = useMemo(
    () => taskDocumentContext(organizationId, routeProjectId, task.projectId),
    [organizationId, routeProjectId, task.projectId],
  );

  const storageKey = `task-draft:${organizationId}:${task.id}`;
  const projectOptions = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const projectList = useMemo(
    () => projectOptions.data ?? [],
    [projectOptions.data],
  );
  const serverDraft = useMemo(() => formFromTask(task), [task]);
  const [draft, setDraft] = useState<TaskFormValues>(serverDraft);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const savedSnapshot = useMemo(() => formFromTask(task), [task]);
  const hasUnsavedChanges =
    JSON.stringify(draft) !== JSON.stringify(savedSnapshot);

  useEffect(() => {
    if (draftLoaded) return;
    let cancelled = false;
    (async () => {
      const { getItem } = await import("@/domains/storage");
      const cached = await getItem("drafts", storageKey);
      if (cancelled) return;
      if (cached?.value && typeof cached.value === "object") {
        setDraft((prev) => ({ ...prev, ...(cached.value as Partial<TaskFormValues>) }));
      }
      setDraftLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [storageKey, draftLoaded]);

  useEffect(() => {
    if (!draftLoaded) return;
    const timer = setTimeout(() => {
      (async () => {
        const { setItem } = await import("@/domains/storage");
        await setItem("drafts", storageKey, draft as Record<string, unknown>);
      })();
    }, 300);
    return () => clearTimeout(timer);
  }, [draft, storageKey, draftLoaded]);

  const updateDraft = useCallback((partial: Partial<TaskFormValues>) => {
    setDraft((current) => ({ ...current, ...partial }));
  }, []);

  const saveDraft = useCallback(async () => {
    taskLog.info("save:start", { taskId: task.id });
    setBusyId("patch");
    try {
      await updateTaskRequest(organizationId, task.id, draft);
      const { removeItem } = await import("@/domains/storage");
      await removeItem("drafts", storageKey);
      taskLog.info("save:success", { taskId: task.id });
      toast.toast({ title: t("form.savedToast"), type: "success" });
      onSaved?.();
    } catch (error) {
      taskLog.error("save:failed", { taskId: task.id, error: String(error) });
      throw error;
    } finally {
      setBusyId(null);
    }
  }, [draft, organizationId, task.id, storageKey, toast, onSaved]);

  const fields: DocEditorMetaField[] = [
    {
      key: "status",
      icon: <Circle className="h-3.5 w-3.5" />,
      label: t("form.status"),
      value: (
        <StatusPicker
          value={draft.status}
          onChange={(v) => updateDraft({ status: v })}
          t={t}
        />
      ),
    },
    {
      key: "priority",
      icon: <Flag className="h-3.5 w-3.5" />,
      label: t("form.priority"),
      value: (
        <PriorityPicker
          value={draft.priority}
          onChange={(v) => updateDraft({ priority: v })}
          t={t}
        />
      ),
    },
    {
      key: "assignee",
      icon: <UserRound className="h-3.5 w-3.5" />,
      label: t("form.assignee"),
      value: (
        <AssigneePicker
          values={draft.assigneeUserIds ?? []}
          onChange={(values) => updateDraft({ assigneeUserIds: values, assigneeUserId: values[0] ?? "" })}
          options={memberOptions}
          t={t}
        />
      ),
    },
    {
      key: "startDate",
      icon: <CalendarDays className="h-3.5 w-3.5" />,
      label: "Start date",
      value: (
        <DueDatePicker
          value={draft.startDate ?? ""}
          onChange={(v) => updateDraft({ startDate: v })}
          label="Start date"
          required
        />
      ),
    },
    {
      key: "dueDate",
      icon: <CalendarDays className="h-3.5 w-3.5" />,
      label: "End date",
      value: (
        <DueDatePicker
          value={draft.dueDate}
          onChange={(v) => updateDraft({ dueDate: v })}
          label="End date"
        />
      ),
    },
    {
      key: "project",
      icon: <FolderKanban className="h-3.5 w-3.5" />,
      label: t("form.project"),
      value: (
        <ProjectPicker
          value={draft.projectId}
          onChange={(v) => updateDraft({ projectId: v })}
          options={projectList}
          t={t}
        />
      ),
    },
  ];

  async function confirmDelete() {
    taskLog.info("delete:start", { taskId: task.id });
    setBusyId("delete");
    try {
      await deleteTaskRequest(organizationId, task.id);
      taskLog.info("delete:success", { taskId: task.id });
      onDeleted?.();
    } catch (error) {
      taskLog.error("delete:failed", { taskId: task.id, error: String(error) });
      throw error;
    } finally {
      setBusyId(null);
      setDeleting(false);
    }
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        isFullscreen ? "fixed inset-0 z-[60] w-screen h-screen bg-background" : "relative",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3 shrink-0">
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
            onClick={() => setDeleting(true)}
            title="Delete task"
            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit full screen" : "Full screen"}
            className="transition-all duration-200 h-8 w-8"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
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

      {/* ── Doc editor ── */}
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <WorkOsDocEditor
          title={draft.title}
          body={draft.description}
          fields={fields}
          titlePlaceholder={t("form.titlePlaceholder") || "Task title"}
          bodyPlaceholder={
            t("form.descriptionPlaceholder") ||
            "Add description… Type / for commands"
          }
          isSaving={busyId === "patch"}
          onTitleBlur={(v) => {
            if (v !== draft.title) updateDraft({ title: v });
          }}
          onBodyChange={(html) => {
            if (html !== draft.description) updateDraft({ description: html });
          }}
          onBodyBlur={() => {}}
          mentionOptions={mentionOptions}
          documentContext={context}
          compactFormatting
        />
        <div className="mx-auto mt-6 max-w-4xl border-t border-border pt-5">
          <CustomFieldsSection recordType="task" recordId={task.id} />
        </div>
      </div>

      <DeleteRecordDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t("actions.deleteTask")}
        description={t("actions.deleteDesc", { title: draft.title })}
        isDeleting={busyId === "delete"}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
