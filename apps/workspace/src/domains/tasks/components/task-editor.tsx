"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Circle,
  FolderKanban,
  UserRound,
  CalendarDays,
  Flag,
  Tag,
  Trash2,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  WorkOsDocEditor,
  type DocEditorMentionOption,
  type DocEditorMetaField,
} from "@/components/shared/work-os-doc-editor";
import { WorkspaceDatePicker } from "@/components/shared";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import {
  taskFormValuesFromRecord,
} from "../api/tasks";
import type { TaskFormValues, TaskRecord } from "../tasks.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  taskDocumentContext,
} from "../tasks.constants";
import { StatusPicker, PriorityPicker, AssigneePicker, ProjectPicker } from "./task-pickers";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { taskHref } from "./task-hooks";
import { taskLog } from "../task-log";
import { CustomFieldsSection } from "@/components/shared/custom-fields/custom-fields-section";
import { useTaskMutations } from "../hooks/use-task-mutations";

// ─── Form helpers ──────────────────────────────────────────────────────────────

function editorDate(value?: string) {
  return value ? new Date(`${value}T12:00:00`) : undefined;
}

function storedDate(value: Date | undefined) {
  return value ? format(value, "yyyy-MM-dd") : "";
}

// ─── Task Editor panel ────────────────────────────────────────────────────────

/**
 * Renders the doc-editor for a single task.
 * Used both inside the Task Workspace modal and standalone Task detail screen.
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
  const { saveTask, deleteTask } = useTaskMutations(organizationId);
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
  const serverDraft = useMemo(() => taskFormValuesFromRecord(task), [task]);
  const [draft, setDraft] = useState<TaskFormValues>(serverDraft);
  const projectName = projectList.find((project) => project.id === draft.projectId)?.name;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const savedSnapshot = useMemo(() => taskFormValuesFromRecord(task), [task]);
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
      await saveTask(task, draft);
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
  }, [draft, saveTask, storageKey, task, toast, onSaved]);

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
        <WorkspaceDatePicker
          startDate={editorDate(draft.startDate)}
          dueDate={editorDate(draft.dueDate)}
          defaultField="start"
          onStartDateChange={(date) => updateDraft({ startDate: storedDate(date) })}
          onDueDateChange={(date) => updateDraft({ dueDate: storedDate(date) })}
          className="h-7 bg-transparent px-2 text-xs hover:bg-[var(--q-sidebar-accent)]"
        />
      ),
    },
    {
      key: "dueDate",
      icon: <CalendarDays className="h-3.5 w-3.5" />,
      label: "End date",
      value: (
        <WorkspaceDatePicker
          startDate={editorDate(draft.startDate)}
          dueDate={editorDate(draft.dueDate)}
          defaultField="due"
          onStartDateChange={(date) => updateDraft({ startDate: storedDate(date) })}
          onDueDateChange={(date) => updateDraft({ dueDate: storedDate(date) })}
          className="h-7 bg-transparent px-2 text-xs hover:bg-[var(--q-sidebar-accent)]"
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
    {
      key: "tags",
      icon: <Tag className="h-3.5 w-3.5" />,
      label: "Tags",
      value: (
        <input
          value={draft.tags}
          onChange={(event) => updateDraft({ tags: event.target.value })}
          placeholder="Add tags…"
          className="h-7 w-full rounded-md bg-transparent px-2 text-xs outline-none placeholder:text-muted-foreground hover:bg-muted/50 focus:bg-muted/50"
        />
      ),
    },
  ];

  async function confirmDelete() {
    taskLog.info("delete:start", { taskId: task.id });
    setBusyId("delete");
    try {
      await deleteTask(task);
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
        "relative flex h-full w-full flex-col bg-background",
        isFullscreen && "rounded-none",
      )}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/75 bg-background px-5">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="sm"
            onClick={saveDraft}
            disabled={Boolean(busyId) || !hasUnsavedChanges}
            className="h-7 rounded-md px-3 text-xs transition-all duration-200"
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
      <div className="min-h-0 flex-1 overflow-y-auto bg-background">
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
          contentClassName="max-w-[980px] px-8 pb-8 pt-7 sm:px-12"
          titleClassName="text-[1.75rem] leading-tight"
          editorMinHeightClassName="min-h-[260px]"
          fieldLayout="compact"
          bodyLabel="Description"
          editorEngine="tiptap"
          contentHeader={
            <div className="mb-4 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1 font-semibold text-foreground">
                  <Circle className="size-3" /> Task
                </span>
                <span className="truncate">{projectName ?? "Personal task"}</span>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground/70">{task.id.slice(-8)}</span>
            </div>
          }
        />
        <div className="mx-auto max-w-[980px] border-t border-border/75 px-8 pb-12 pt-5 sm:px-12">
          <h3 className="mb-3 text-xs font-semibold text-foreground">Custom fields</h3>
          <CustomFieldsSection recordType="task" recordId={task.id} allowCreate />
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
