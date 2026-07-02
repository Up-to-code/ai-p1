"use client";

import { useAccountContext } from "@/domains/auth";
import { useTaskQuery, useTasksQuery } from "../api/tasks";
import { taskDocumentContext } from "../tasks.constants";
import { useTaskMentionOptions, useMemberOptions } from "./task-hooks";
import { TaskEditor } from "./task-editor";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

interface TaskEditModalProps {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Side-sheet that opens when a board card is clicked.
 * Self-contained: fetches the task and wires up the full TaskEditor.
 */
export function TaskEditModal({ taskId, open, onClose }: TaskEditModalProps) {
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (account.workspace.organizationId ?? undefined)
      : undefined;

  const taskResult = useTaskQuery(organizationId, taskId ?? "");
  const task = taskResult.data;

  const { data: memberOptions } = useMemberOptions(organizationId, account.user);

  const siblingTasksResult = useTasksQuery(organizationId, {
    status: "all",
    projectId: task?.projectId ?? null,
  });
  const siblingTasks = siblingTasksResult.data ?? [];

  const detailContext =
    organizationId && task
      ? taskDocumentContext(organizationId, task.projectId, task.projectId)
      : undefined;

  const mentionOptions = useTaskMentionOptions({
    organizationId,
    context: detailContext,
    members: memberOptions,
    tasks: siblingTasks,
  });

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-2xl p-0 gap-0 overflow-hidden"
      >
        {/* Loading / not ready states */}
        {(!task || !organizationId) && (
          <div className="flex h-full items-center justify-center">
            {taskResult.error ? (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <p className="text-sm font-semibold text-destructive">
                  Failed to load task
                </p>
                <button
                  type="button"
                  onClick={() => taskResult.refetch()}
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
            )}
          </div>
        )}

        {/* Editor — only rendered when task is loaded */}
        {task && organizationId && (
          <TaskEditor
            key={task.id}
            task={task}
            organizationId={organizationId}
            memberOptions={memberOptions}
            mentionOptions={mentionOptions}
            onSaved={onClose}
            onDeleted={onClose}
            onClose={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
