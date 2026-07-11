import { describe, expect, it } from "vitest";
import type { TaskRecord } from "@/domains/tasks/tasks.types";
import { buildWorkspaceTaskGroups, localDateKey, taskDueDateKey } from "./workspace-command-center";

function task(overrides: Partial<TaskRecord> & Pick<TaskRecord, "id" | "title">): TaskRecord {
  return {
    status: "todo",
    priority: "normal",
    createdByUserId: "other-user",
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe("workspace command center", () => {
  it("classifies only active canonical task records", () => {
    const groups = buildWorkspaceTaskGroups([
      task({ id: "today", title: "Today", dueDate: "2026-07-10", assigneeUserId: "me" }),
      task({ id: "late", title: "Late", dueDate: "2026-07-09", priority: "urgent" }),
      task({ id: "waiting", title: "Waiting", status: "waiting" }),
      task({ id: "delegated", title: "Delegated", createdByUserId: "me", assigneeUserId: "teammate" }),
      task({ id: "done", title: "Done", status: "done", dueDate: "2026-07-01" }),
      task({ id: "deleted", title: "Deleted", _deleted: true }),
    ], "me", "2026-07-10");

    expect(groups.active.map(({ id }) => id)).not.toContain("done");
    expect(groups.active.map(({ id }) => id)).not.toContain("deleted");
    expect(groups.today.map(({ id }) => id)).toEqual(["today"]);
    expect(groups.overdue.map(({ id }) => id)).toEqual(["late"]);
    expect(groups.waiting.map(({ id }) => id)).toEqual(["waiting"]);
    expect(groups.assignedToMe.map(({ id }) => id)).toEqual(["today"]);
    expect(groups.delegated.map(({ id }) => id)).toEqual(["delegated"]);
    expect(groups.unscheduled.map(({ id }) => id)).toEqual(["waiting", "delegated"]);
  });

  it("uses stable local date keys without timezone conversion", () => {
    expect(localDateKey(new Date(2026, 6, 10, 23, 30))).toBe("2026-07-10");
    expect(taskDueDateKey("2026-07-10T23:00:00.000Z")).toBe("2026-07-10");
    expect(taskDueDateKey("not-a-date")).toBeNull();
  });
});
