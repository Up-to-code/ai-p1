import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./lifecycle", () => ({
  mergeTaskPatch: vi.fn((task, patch) => ({ ...task, ...patch })),
  updateTask: vi.fn(async () => undefined),
  deleteTask: vi.fn(async () => undefined),
}));

import { executeBulkTaskAction } from "./bulk";
import { deleteTask, updateTask } from "./lifecycle";

function task(id: string, organizationId = "org_1") {
  return { _id: id, organizationId, title: id, status: "todo", priority: "normal" };
}

function context(records: Record<string, ReturnType<typeof task>>) {
  return {
    db: {
      normalizeId: vi.fn((_table: string, id: string) => id.startsWith("bad") ? null : id),
      get: vi.fn(async (id: string) => records[id] ?? null),
    },
  } as never;
}

function access(denied = new Set<string>()) {
  return {
    actor: { userId: "actor_1" },
    organizationId: "org_1",
    canUpdate: vi.fn(async (record) => !denied.has(record._id)),
    canDelete: vi.fn(async (record) => !denied.has(record._id)),
    assertCanCreate: vi.fn(async () => undefined),
  } as never;
}

describe("bulk Task lifecycle adapter", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reports missing and forbidden records while completing allowed records once", async () => {
    const result = await executeBulkTaskAction(
      context({ allowed: task("allowed"), denied: task("denied"), foreign: task("foreign", "org_2") }),
      { organizationId: "org_1", action: "complete", taskIds: ["allowed", "denied", "foreign", "bad-id", "allowed"] },
      access(new Set(["denied"])),
    );
    expect(result).toMatchObject({ requested: 4, succeeded: 1, failed: 3 });
    expect(result.outcomes).toEqual([
      { taskId: "allowed", status: "succeeded" },
      { taskId: "denied", status: "failed", reason: "forbidden" },
      { taskId: "foreign", status: "failed", reason: "not_found" },
      { taskId: "bad-id", status: "failed", reason: "not_found" },
    ]);
    expect(updateTask).toHaveBeenCalledOnce();
  });

  it("uses delete authorization and the canonical delete lifecycle", async () => {
    const result = await executeBulkTaskAction(
      context({ one: task("one") }),
      { organizationId: "org_1", action: "delete", taskIds: ["one"] },
      access(),
    );
    expect(result.succeeded).toBe(1);
    expect(deleteTask).toHaveBeenCalledOnce();
  });

  it("does not convert unexpected lifecycle failures into a committed partial result", async () => {
    vi.mocked(updateTask).mockRejectedValueOnce(new Error("effect failed"));
    await expect(executeBulkTaskAction(
      context({ one: task("one") }),
      { organizationId: "org_1", action: "complete", taskIds: ["one"] },
      access(),
    )).rejects.toThrow("effect failed");
  });
});
