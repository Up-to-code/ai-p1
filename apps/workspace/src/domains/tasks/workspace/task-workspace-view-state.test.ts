import { describe, expect, it } from "vitest";
import {
  defaultTaskWorkspaceViewState,
  parseTaskWorkspaceViewState,
  resolveTaskWorkspaceViewHref,
  taskWorkspaceStateFromSavedView,
  taskWorkspaceStateToSavedView,
  writeTaskWorkspaceViewState,
  selectTaskWorkspaceRecords,
} from "./task-workspace-view-state";

describe("TaskWorkspace view-state codec", () => {
  it("normalizes untrusted URL values and bounds search", () => {
    const params = new URLSearchParams({ filter: "unknown", group: "status", direction: "up", search: `  ${"x".repeat(250)}  ` });
    expect(parseTaskWorkspaceViewState(params)).toEqual({
      ...defaultTaskWorkspaceViewState,
      groupBy: "status",
      search: "x".repeat(200),
    });
  });

  it("serializes defaults compactly and preserves unrelated scope state", () => {
    const result = writeTaskWorkspaceViewState(
      new URLSearchParams("project=project_1&filter=my"),
      { ...defaultTaskWorkspaceViewState, groupBy: "priority" },
    );
    expect(result.toString()).toBe("project=project_1&group=priority");
  });

  it("does not navigate when a controlled view reports the current route state", () => {
    const current = new URLSearchParams("project=project_1&group=priority");
    const state = {
      ...defaultTaskWorkspaceViewState,
      groupBy: "priority" as const,
    };

    expect(resolveTaskWorkspaceViewHref("/tasks/table", current, state)).toBeNull();
    expect(resolveTaskWorkspaceViewHref("/tasks/table", current, {
      ...state,
      density: "normal",
    })).toBe("/tasks/table?project=project_1&group=priority&density=normal");
  });

  it("round-trips every validated saved-view field", () => {
    const state = {
      ...defaultTaskWorkspaceViewState,
      filter: "overdue" as const,
      groupBy: "status" as const,
      sortBy: "dueDate" as const,
      sortDirection: "asc" as const,
      density: "compact" as const,
      search: "launch",
      columnOrder: ["title", "status", "priority"],
      columnWidths: { title: 420, status: 140 },
      columnVisibility: { title: true, priority: false },
    };
    const config = taskWorkspaceStateToSavedView(state);
    expect(config).not.toHaveProperty("taskTableVersion");
    expect(taskWorkspaceStateFromSavedView(config)).toEqual(state);
  });

  it("sanitizes column ids and clamps persisted widths", () => {
    const state = parseTaskWorkspaceViewState(new URLSearchParams({
      columns: "title,<script>,status,title",
      widths: "title:2,status:5000,bad!:100",
      hidden: "priority,bad!",
    }));
    expect(state.columnOrder).toEqual(["title", "status"]);
    expect(state.columnWidths).toEqual({ title: 48, status: 1200 });
    expect(state.columnVisibility).toEqual({ priority: false });
  });

  it("selects the same filter and search result for every view adapter", () => {
    const tasks = [
      { id: "one", title: "Launch plan", status: "todo", priority: "normal", assigneeUserId: "me", tags: ["release"] },
      { id: "two", title: "Backlog", status: "todo", priority: "normal", assigneeUserId: "other" },
    ] as never[];
    const state = { ...defaultTaskWorkspaceViewState, filter: "my" as const, search: "launch" };
    expect(selectTaskWorkspaceRecords(tasks, state, "me").map((task) => task.id)).toEqual(["one"]);
  });
});
