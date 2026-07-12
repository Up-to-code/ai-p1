"use client";

import { useEffect } from "react";
import { useResourceWorkspaceExtension } from "@/components/shared";
import { TaskTableFieldsPanel } from "@/domains/tasks/components/task-table-fields-panel";
import { TaskTableView } from "@/domains/tasks/components/views/task-table-view";
import {
  TaskRoutePagination,
  TaskRouteState,
} from "@/domains/tasks/components/views/task-route-shared";
import { useTaskWorkspace } from "@/domains/tasks/components/task-workspace-provider";

export default function TaskTablePage() {
  const workspace = useTaskWorkspace();
  const { closeExtensionPanel, openExtensionPanel } =
    useResourceWorkspaceExtension();
  useEffect(() => closeExtensionPanel, [closeExtensionPanel]);

  const openFields = () => {
    if (!workspace.organizationId) return;
    openExtensionPanel(
      <TaskTableFieldsPanel
        organizationId={workspace.organizationId}
        open
        embedded
        onClose={closeExtensionPanel}
      />,
      "Task fields",
    );
  };
  return (
    <TaskRouteState>
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <TaskTableView
            tasks={workspace.pagedTasks}
            organizationId={workspace.organizationId}
            projectId={workspace.projectId}
            spaceId={workspace.spaceId}
            memberOptions={workspace.memberOptions}
            onTaskOpen={workspace.openTask}
            onTaskUpdate={workspace.updateTask}
            onTaskDelete={workspace.deleteTask}
            onTaskCreate={workspace.createTask}
            onTaskMove={workspace.moveTask}
            onOpenFields={openFields}
          />
        </div>
        <TaskRoutePagination />
      </div>
    </TaskRouteState>
  );
}
