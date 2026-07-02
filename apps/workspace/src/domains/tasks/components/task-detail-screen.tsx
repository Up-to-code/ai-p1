"use client";

import { useAuthSession } from "@/domains/auth";
import { DetailNotFoundState, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useTranslations } from "next-intl";
import { useTaskQuery, useTasksQuery } from "../api/tasks";
import { taskDocumentContext } from "../tasks.constants";
import { useTaskMentionOptions, useMemberOptions } from "./task-hooks";
import { TaskEditor } from "./task-editor";

export function TaskDetailScreen({ id }: { id: string }) {
  const t = useTranslations("Tasks");
  const session = useAuthSession();
  const workspaceStatus = session.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;
  const taskResult = useTaskQuery(organizationId, id);
  const task = taskResult.data;
  const { data: memberOptions } = useMemberOptions(organizationId, session.user);
  const detailTasksResult = useTasksQuery(organizationId, {
    status: "all",
    projectId: task?.projectId ?? null,
  });
  const detailTasks = detailTasksResult.data ?? [];
  const detailContext =
    organizationId && task
      ? taskDocumentContext(organizationId, task.projectId, task.projectId)
      : undefined;
  const mentionOptions = useTaskMentionOptions({
    organizationId,
    context: detailContext,
    members: memberOptions,
    tasks: detailTasks,
  });

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex h-full flex-col">
        <WorkspaceQueryState status={workspaceStatus} variant="detail" />
      </div>
    );
  }

  if (taskResult.error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {taskResult.error}
        </p>
        <button
          type="button"
          onClick={() => taskResult.refetch()}
          className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (task === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (task === null) {
    return (
      <div className="p-8">
        <DetailNotFoundState
          title={t("detail.notFoundTitle")}
          description={t("detail.notFoundDescription")}
          backHref="/tasks"
          backLabel={t("detail.backToTasks")}
        />
      </div>
    );
  }

  if (!organizationId) return null;

  return (
    <div className="flex h-full flex-col">
      <TaskEditor
        key={task.id}
        task={task}
        organizationId={organizationId}
        memberOptions={memberOptions}
        mentionOptions={mentionOptions}
        showBackLink
      />
    </div>
  );
}
