import { describe, expect, it, vi } from "vitest";
import { syncTaskAssignments, taskAssigneeIds } from "./assignments";

function task(overrides: Record<string, unknown> = {}) {
  return {
    _id: "task_1",
    organizationId: "org_1",
    assigneeUserId: "primary",
    assigneeUserIds: ["primary", "additional"],
    updatedAt: 200,
    ...overrides,
  } as never;
}

function context(existing: Array<Record<string, unknown>> = []) {
  const insert = vi.fn(async () => "assignment_new");
  const patch = vi.fn(async () => undefined);
  const remove = vi.fn(async () => undefined);
  return {
    ctx: {
      db: {
        query: vi.fn(() => ({ withIndex: vi.fn(() => ({ collect: vi.fn(async () => existing) })) })),
        insert,
        patch,
        delete: remove,
      },
    } as never,
    insert,
    patch,
    remove,
  };
}

describe("Task assignment relation", () => {
  it("deduplicates primary and additional assignees", () => {
    expect(taskAssigneeIds(task())).toEqual(["primary", "additional"]);
  });

  it("adds, updates, and removes relations idempotently", async () => {
    const state = context([
      { _id: "old", userId: "removed", isPrimary: false, updatedAt: 100 },
      { _id: "primary", userId: "primary", isPrimary: false, updatedAt: 100 },
    ]);
    await syncTaskAssignments(state.ctx, task());
    expect(state.remove).toHaveBeenCalledWith("old");
    expect(state.patch).toHaveBeenCalledWith("primary", { isPrimary: true, updatedAt: 200 });
    expect(state.insert).toHaveBeenCalledWith("taskAssignments", expect.objectContaining({ userId: "additional", isPrimary: false }));
  });
});
