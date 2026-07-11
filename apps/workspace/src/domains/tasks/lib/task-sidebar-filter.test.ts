import { describe, expect, it } from "vitest";
import type { TaskRecord } from "../tasks.types";
import { filterTasksForSidebar } from "./task-sidebar-filter";

const now = new Date(2026, 6, 10, 12);

function task(overrides: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: "task-1",
    title: "Task",
    status: "todo",
    priority: "normal",
    createdByUserId: "creator",
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe("filterTasksForSidebar", () => {
  it("filters personal assignment views", () => {
    const tasks = [
      task({ id: "mine", assigneeUserId: "me" }),
      task({ id: "sent", createdByUserId: "me", assigneeUserId: "other" }),
      task({ id: "unassigned" }),
    ];

    expect(filterTasksForSidebar(tasks, "my", "me", now).map((item) => item.id)).toEqual(["mine"]);
    expect(filterTasksForSidebar(tasks, "assigned", "me", now).map((item) => item.id)).toEqual(["sent"]);
    expect(filterTasksForSidebar(tasks, "unassigned", "me", now).map((item) => item.id)).toEqual(["unassigned"]);
  });

  it("includes secondary assignees in My tasks", () => {
    const shared = task({ id: "shared", assigneeUserId: "owner", assigneeUserIds: ["owner", "me"] });

    expect(filterTasksForSidebar([shared], "my", "me", now).map((item) => item.id)).toEqual(["shared"]);
    expect(filterTasksForSidebar([shared], "unassigned", "me", now)).toEqual([]);
  });

  it("filters due-date, completion, and priority views", () => {
    const tasks = [
      task({ id: "overdue", dueDate: "2026-07-09" }),
      task({ id: "today", dueDate: "2026-07-10" }),
      task({ id: "upcoming", dueDate: "2026-07-12" }),
      task({ id: "done", status: "done" }),
      task({ id: "urgent", priority: "urgent" }),
    ];

    expect(filterTasksForSidebar(tasks, "overdue", "me", now).map((item) => item.id)).toEqual(["overdue"]);
    expect(filterTasksForSidebar(tasks, "today", "me", now).map((item) => item.id)).toEqual(["today"]);
    expect(filterTasksForSidebar(tasks, "upcoming", "me", now).map((item) => item.id)).toEqual(["upcoming"]);
    expect(filterTasksForSidebar(tasks, "completed", "me", now).map((item) => item.id)).toEqual(["done"]);
    expect(filterTasksForSidebar(tasks, "high-priority", "me", now).map((item) => item.id)).toEqual(["urgent"]);
  });
});
