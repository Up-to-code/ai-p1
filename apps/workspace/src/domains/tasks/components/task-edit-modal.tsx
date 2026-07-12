"use client";

import { useState } from "react";
import { useAuthSession } from "@/domains/auth";
import { useTaskQuery, useTasksQuery } from "../api/tasks";
import { taskDocumentContext } from "../tasks.constants";
import { useTaskMentionOptions, useMemberOptions } from "./task-hooks";
import { TaskEditor } from "./task-editor";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface TaskEditModalProps {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Centered document modal shared by task table and board interactions.
 * Self-contained: fetches the task and wires up the full TaskEditor.
 */
export function TaskEditModal({ taskId, open, onClose }: TaskEditModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const closeEditor = () => {
    setIsFullscreen(false);
    onClose();
  };
  const session = useAuthSession();
  const workspaceStatus = session.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  const taskResult = useTaskQuery(organizationId, taskId ?? "");
  const task = taskResult.data;

  const { data: memberOptions } = useMemberOptions(organizationId, session.user);

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
    <Dialog
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          closeEditor();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        containerClassName={isFullscreen ? "p-0" : undefined}
        style={
          isFullscreen
            ? { width: "100vw", maxWidth: "none", height: "100vh" }
            : { width: "94vw", maxWidth: "1180px", height: "92vh" }
        }
        className={cn(
          "gap-0 overflow-hidden border-border/80 bg-background p-0 shadow-2xl",
          isFullscreen && "rounded-none border-0 ring-0",
        )}
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
            onSaved={closeEditor}
            onDeleted={closeEditor}
            onClose={closeEditor}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen((current) => !current)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
