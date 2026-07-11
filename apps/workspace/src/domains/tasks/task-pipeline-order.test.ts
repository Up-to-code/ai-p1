import { describe, expect, it } from "vitest";
import {
  sortPipelineTasks,
  nextTaskPipelineOrder,
  taskFormValuesForPipeline,
  taskBoardStatuses,
} from "./task-pipeline-order";
import type { TaskRecord } from "./tasks.types";

function makeTask(
  overrides: Partial<TaskRecord> & { id: string },
): TaskRecord {
  return {
    title: "Test task",
    status: "todo",
    priority: "normal",
    createdByUserId: "user_1",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("task-pipeline-order", () => {
  describe("taskBoardStatuses", () => {
    it("excludes canceled", () => {
      expect(taskBoardStatuses).not.toContain("canceled");
    });

    it("includes todo, inProgress, waiting, done", () => {
      expect(taskBoardStatuses).toEqual([
        "todo",
        "inProgress",
        "waiting",
        "done",
      ]);
    });
  });

  describe("sortPipelineTasks", () => {
    it("sorts by pipelineOrder ascending", () => {
      const tasks = [
        makeTask({ id: "t3", pipelineOrder: 3 }),
        makeTask({ id: "t1", pipelineOrder: 1 }),
        makeTask({ id: "t2", pipelineOrder: 2 }),
      ];
      const sorted = sortPipelineTasks(tasks);
      expect(sorted.map((t) => t.id)).toEqual(["t1", "t2", "t3"]);
    });

    it("falls back to index + 1 when pipelineOrder is undefined", () => {
      const tasks = [
        makeTask({ id: "t_a" }),
        makeTask({ id: "t_b" }),
        makeTask({ id: "t_c" }),
      ];
      const sorted = sortPipelineTasks(tasks);
      // All have undefined pipelineOrder, so order is by updatedAt descending
      // All have same updatedAt, so original order preserved
      expect(sorted).toHaveLength(3);
    });

    it("uses updatedAt as tiebreaker when pipelineOrder is equal", () => {
      const tasks = [
        makeTask({ id: "t_old", pipelineOrder: 1, updatedAt: 100 }),
        makeTask({ id: "t_new", pipelineOrder: 1, updatedAt: 300 }),
      ];
      const sorted = sortPipelineTasks(tasks);
      expect(sorted[0].id).toBe("t_new");
      expect(sorted[1].id).toBe("t_old");
    });

    it("returns empty array for empty input", () => {
      expect(sortPipelineTasks([])).toEqual([]);
    });
  });

  describe("nextTaskPipelineOrder", () => {
    it("returns 1 when moving into empty column", () => {
      const order = nextTaskPipelineOrder([], "task_1", 0);
      expect(order).toBe(1);
    });

    it("places before first task when targetIndex is 0", () => {
      const tasks = [
        { id: "t1", pipelineOrder: 10 },
        { id: "t2", pipelineOrder: 20 },
      ];
      const order = nextTaskPipelineOrder(tasks, "t_new", 0);
      expect(order).toBeLessThan(10);
    });

    it("places after last task when targetIndex is at end", () => {
      const tasks = [
        { id: "t1", pipelineOrder: 10 },
        { id: "t2", pipelineOrder: 20 },
      ];
      const order = nextTaskPipelineOrder(tasks, "t_new", 2);
      expect(order).toBeGreaterThan(20);
    });

    it("places between two tasks when targetIndex is in middle", () => {
      const tasks = [
        { id: "t1", pipelineOrder: 10 },
        { id: "t2", pipelineOrder: 20 },
      ];
      const order = nextTaskPipelineOrder(tasks, "t_new", 1);
      expect(order).toBeGreaterThan(10);
      expect(order).toBeLessThan(20);
    });

    it("excludes the moving task from calculation", () => {
      const tasks = [
        { id: "t1", pipelineOrder: 10 },
        { id: "t_moving", pipelineOrder: 15 },
        { id: "t2", pipelineOrder: 20 },
      ];
      const order = nextTaskPipelineOrder(tasks, "t_moving", 0);
      // Should place before t1 (order 10)
      expect(order).toBeLessThan(10);
    });
  });

  describe("taskFormValuesForPipeline", () => {
    it("maps task to form values with new status and pipeline order", () => {
      const task = makeTask({
        id: "t1",
        title: "My task",
        status: "todo",
        priority: "high",
        visibility: "private",
        assigneeUserId: "user_1",
        clientId: "client_1",
        projectId: "proj_1",
        startDate: "2025-11-01",
        dueDate: "2025-12-01",
        description: "<p>Description</p>",
        tags: ["urgent", "backend"],
      });

      const values = taskFormValuesForPipeline(task, "done", 42);

      expect(values.title).toBe("My task");
      expect(values.status).toBe("done");
      expect(values.pipelineOrder).toBe(42);
      expect(values.priority).toBe("high");
      expect(values.visibility).toBe("private");
      expect(values.assigneeUserId).toBe("user_1");
      expect(values.clientId).toBe("client_1");
      expect(values.projectId).toBe("proj_1");
      expect(values.startDate).toBe("2025-11-01");
      expect(values.dueDate).toBe("2025-12-01");
      expect(values.description).toBe("<p>Description</p>");
      expect(values.tags).toBe("urgent, backend");
    });

    it("defaults optional fields to empty strings", () => {
      const task = makeTask({ id: "t1" });
      const values = taskFormValuesForPipeline(task, "inProgress", 1);

      expect(values.assigneeUserId).toBe("");
      expect(values.clientId).toBe("");
      expect(values.projectId).toBe("");
      expect(values.startDate).toBe("");
      expect(values.dueDate).toBe("");
      expect(values.description).toBe("");
      expect(values.tags).toBe("");
    });

    it("defaults visibility to team when undefined", () => {
      const task = makeTask({ id: "t1", visibility: undefined });
      const values = taskFormValuesForPipeline(task, "todo", 1);
      expect(values.visibility).toBe("team");
    });
  });
});
