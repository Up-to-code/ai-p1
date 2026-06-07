import { describe, expect, it } from "vitest";
import { nextTaskPipelineOrder, sortPipelineTasks, taskFormValuesForPipeline } from "./task-pipeline-order";
import type { TaskRecord } from "./tasks.types";

const baseTask: TaskRecord = {
  id: "task_1",
  title: "Prepare client update",
  status: "todo",
  priority: "normal",
  visibility: "team",
  createdByUserId: "sender_1",
  createdAt: 1,
  updatedAt: 1,
};

describe("task pipeline ordering", () => {
  it("sorts by persisted order with updated time as a tie breaker", () => {
    expect(sortPipelineTasks([
      { id: "b", pipelineOrder: 20, updatedAt: 1 },
      { id: "a", pipelineOrder: 10, updatedAt: 1 },
      { id: "c", pipelineOrder: 20, updatedAt: 9 },
    ])).toEqual([
      { id: "a", pipelineOrder: 10, updatedAt: 1 },
      { id: "c", pipelineOrder: 20, updatedAt: 9 },
      { id: "b", pipelineOrder: 20, updatedAt: 1 },
    ]);
  });

  it("creates first, beginning, middle, and end order values", () => {
    const tasks = [
      { id: "a", pipelineOrder: 10 },
      { id: "b", pipelineOrder: 20 },
      { id: "c", pipelineOrder: 30 },
    ];

    expect(nextTaskPipelineOrder([], "moving", 0)).toBe(1);
    expect(nextTaskPipelineOrder(tasks, "moving", 0)).toBe(9);
    expect(nextTaskPipelineOrder(tasks, "moving", 1)).toBe(15);
    expect(nextTaskPipelineOrder(tasks, "moving", 99)).toBe(31);
  });

  it("removes the moving task before calculating a same-column order", () => {
    expect(nextTaskPipelineOrder([
      { id: "a", pipelineOrder: 10 },
      { id: "moving", pipelineOrder: 20 },
      { id: "c", pipelineOrder: 30 },
    ], "moving", 1)).toBe(20);
  });

  it("builds task update form values for persisted pipeline moves", () => {
    expect(taskFormValuesForPipeline({
      ...baseTask,
      assigneeUserId: "user_1",
      clientId: "client_1",
      projectId: "project_1",
      dueDate: "2026-06-07",
      description: "Send summary",
      tags: ["client", "urgent"],
    }, "waiting", 42)).toEqual({
      title: "Prepare client update",
      status: "waiting",
      pipelineOrder: 42,
      priority: "normal",
      visibility: "team",
      assigneeUserId: "user_1",
      clientId: "client_1",
      projectId: "project_1",
      dueDate: "2026-06-07",
      description: "Send summary",
      tags: "client, urgent",
    });
  });
});
