"use client";

import { TaskListView } from "@/domains/tasks/components/views/task-list-view";
import {
  TaskRoutePagination,
  TaskRouteState,
} from "@/domains/tasks/components/views/task-route-shared";
import { useTaskWorkspace } from "@/domains/tasks/components/task-workspace-provider";

export default function TaskListPage() {
  const workspace = useTaskWorkspace();
  return (
    <TaskRouteState>
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <TaskListView
            tasks={workspace.pagedTasks}
            memberOptions={workspace.memberOptions}
            onTaskOpen={workspace.openTask}
            onTaskUpdate={workspace.updateTask}
            onTaskCreate={workspace.createTask}
            onTaskMove={workspace.moveTask}
          />
        </div>
        <TaskRoutePagination />
      </div>
    </TaskRouteState>
  );
}
