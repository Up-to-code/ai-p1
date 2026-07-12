"use client";

import { TaskBoardView } from "@/domains/tasks/components/views/task-board-view";
import {
  TaskRoutePagination,
  TaskRouteState,
} from "@/domains/tasks/components/views/task-route-shared";
import { useTaskWorkspace } from "@/domains/tasks/components/task-workspace-provider";
import { TASK_STAGES } from "@/domains/tasks/tasks.constants";

export default function TaskBoardPage() {
  const workspace = useTaskWorkspace();
  return (
    <TaskRouteState>
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <TaskBoardView
            tasks={workspace.pagedTasks}
            stages={TASK_STAGES}
            organizationId={workspace.organizationId}
            onCardMove={workspace.moveTask}
            onTaskCreate={workspace.createTask}
            onTaskUpdate={workspace.updateTask}
            onTaskDelete={workspace.deleteTask}
            onTaskOpen={workspace.openTask}
            currentUserId={workspace.currentUserId}
            memberOptions={workspace.memberOptions}
          />
        </div>
        <TaskRoutePagination />
      </div>
    </TaskRouteState>
  );
}
