"use client";

import { useEffect } from "react";
import { useResourceWorkspaceExtension } from "@/components/shared";
import { TASK_STAGES } from "../tasks.constants";
import { TaskTableFieldsPanel } from "./task-table-fields-panel";
import { useTaskWorkspace } from "./task-workspace-provider";
import { TaskBoardView } from "./views/task-board-view";
import { TaskListView } from "./views/task-list-view";
import { TaskTableView } from "./views/task-table-view";
import { TaskCalendarWorkspaceView } from "./views/task-calendar-workspace-view";
import { TaskTimelineWorkspaceView } from "./views/task-timeline-workspace-view";
import { TaskRoutePagination, TaskRouteState } from "./views/task-route-shared";

function TaskRouteShell({ children }: { children: React.ReactNode }) {
  return (
    <TaskRouteState>
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        <TaskRoutePagination />
      </div>
    </TaskRouteState>
  );
}

export function TaskBoardRouteAdapter() {
  const workspace = useTaskWorkspace();
  return (
    <TaskRouteShell>
      <TaskBoardView tasks={workspace.pagedTasks} stages={TASK_STAGES} organizationId={workspace.organizationId} onCardMove={workspace.moveTask} onTaskCreate={workspace.createTask} onTaskUpdate={workspace.updateTask} onTaskDelete={workspace.deleteTask} onTaskOpen={workspace.openTask} currentUserId={workspace.currentUserId} memberOptions={workspace.memberOptions} />
    </TaskRouteShell>
  );
}

export function TaskListRouteAdapter() {
  const workspace = useTaskWorkspace();
  return (
    <TaskRouteShell>
      <TaskListView tasks={workspace.pagedTasks} memberOptions={workspace.memberOptions} onTaskOpen={workspace.openTask} onTaskUpdate={workspace.updateTask} onTaskCreate={workspace.createTask} onTaskMove={workspace.moveTask} />
    </TaskRouteShell>
  );
}

export function TaskTableRouteAdapter() {
  const workspace = useTaskWorkspace();
  const { closeExtensionPanel, openExtensionPanel } = useResourceWorkspaceExtension();
  // The extension host is browser-owned; close this route's panel on unmount.
  useEffect(() => closeExtensionPanel, [closeExtensionPanel]);

  const openFields = () => {
    if (!workspace.organizationId) return;
    openExtensionPanel(<TaskTableFieldsPanel organizationId={workspace.organizationId} open embedded onClose={closeExtensionPanel} />, "Task fields");
  };

  return (
    <TaskRouteShell>
      <TaskTableView tasks={workspace.pagedTasks} organizationId={workspace.organizationId} projectId={workspace.projectId} spaceId={workspace.spaceId} memberOptions={workspace.memberOptions} onTaskOpen={workspace.openTask} onTaskUpdate={workspace.updateTask} onTaskDelete={workspace.deleteTask} onTaskCreate={workspace.createTask} onTaskMove={workspace.moveTask} onOpenFields={openFields} viewState={workspace.viewState} onViewStateChange={workspace.updateViewState} onTasksBulk={workspace.bulkTasks} />
    </TaskRouteShell>
  );
}

export function TaskCalendarRouteAdapter() {
  const workspace = useTaskWorkspace();
  return <TaskCalendarWorkspaceView tasks={workspace.tasks} onTaskOpen={workspace.openTask} />;
}

export function TaskTimelineRouteAdapter() {
  const workspace = useTaskWorkspace();
  return <TaskTimelineWorkspaceView tasks={workspace.tasks} onTaskOpen={workspace.openTask} />;
}
