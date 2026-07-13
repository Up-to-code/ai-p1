import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTask,
  deleteTask,
  updateTask,
  type TaskInput,
} from "./lifecycle";
import {
  cancelQueuedJobsForSource,
  scheduleTaskReminders,
} from "../notifications/helpers";
import {
  emitRichTextMentionEvents,
  emitTaskAssignmentEvents,
} from "../notifications/inbox_events";

vi.mock("../notifications/helpers", () => ({
  cancelQueuedJobsForSource: vi.fn(async () => undefined),
  scheduleTaskReminders: vi.fn(async () => undefined),
}));
vi.mock("../notifications/inbox_events", () => ({
  emitRichTextMentionEvents: vi.fn(async () => undefined),
  emitTaskAssignmentEvents: vi.fn(async () => undefined),
}));
vi.mock("../projects/rollup", () => ({
  updateProjectRollup: vi.fn(async () => undefined),
  validateStrictTaskDates: vi.fn(async () => undefined),
}));

const taskInput: TaskInput = {
  title: "Prepare kickoff",
  status: "todo",
  priority: "normal",
};

function lifecycleContext(seed: Array<Record<string, unknown>> = []) {
  const records = new Map(seed.map((record) => [String(record._id), { ...record }]));
  const audits: Array<Record<string, unknown>> = [];
  let sequence = seed.length;
  const db = {
    get: vi.fn(async (id: string) => records.get(id) ?? null),
    insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
      if (table === "organizationAuditEvents") {
        audits.push({ ...value });
        return `audit_${audits.length}`;
      }
      const id = `task_${++sequence}`;
      records.set(id, { _id: id, _creationTime: Date.now(), _table: table, ...value });
      return id;
    }),
    patch: vi.fn(async (id: string, patch: Record<string, unknown>) => {
      const existing = records.get(id);
      if (!existing) throw new Error("missing record");
      records.set(id, { ...existing, ...patch });
    }),
    delete: vi.fn(async (id: string) => { records.delete(id); }),
    query: vi.fn((table: string) => ({
      withIndex: vi.fn(() => ({
        first: vi.fn(async () => records.get("project_space_1") ?? null),
        collect: vi.fn(async () => [...records.values()].filter((record) => record._table === table)),
      })),
    })),
  };
  return { ctx: { db, scheduler: {} } as never, db, records, audits };
}

function storedTask(overrides: Record<string, unknown> = {}) {
  return {
    _id: "task_1",
    _creationTime: Date.now(),
    organizationId: "org_1",
    ...taskInput,
    visibility: "private",
    recordState: "active",
    createdByUserId: "user_1",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("Task lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-13T10:00:00.000Z"));
  });

  it("persists checklist/start-date contract fields and emits shared effects", async () => {
    const state = lifecycleContext();
    const result = await createTask(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_1",
      input: {
        ...taskInput,
        startDate: "2026-07-13",
        checklist: [{ id: "one", title: "Review", done: false }],
      },
    });

    expect(result).toMatchObject({
      id: "task_1",
      startDate: "2026-07-13",
      checklist: [{ id: "one", title: "Review", done: false }],
    });
    expect(scheduleTaskReminders).toHaveBeenCalledTimes(1);
    expect(emitTaskAssignmentEvents).toHaveBeenCalledTimes(1);
    expect(emitRichTextMentionEvents).toHaveBeenCalledTimes(1);
    expect(state.audits).toHaveLength(1);
  });

  it("persists unscoped Tasks as organization-visible by default", async () => {
    const state = lifecycleContext();
    const result = await createTask(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_1",
      input: taskInput,
    });

    expect(result.visibility).toBe("workspace");
    expect(state.records.get("task_1")?.visibility).toBe("workspace");
  });

  it("rejects a cross-Organization Client relation before persistence", async () => {
    const state = lifecycleContext([{ _id: "client_1", organizationId: "org_other" }]);
    await expect(createTask(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_1",
      input: { ...taskInput, clientId: "client_1" },
    })).rejects.toThrow("Task links must reference active records in this organization.");
    expect(state.db.insert).not.toHaveBeenCalled();
  });

  it("sets completion once, preserves it while done, and clears it when reopened", async () => {
    const state = lifecycleContext([storedTask()]);
    await updateTask(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_1",
      taskId: "task_1" as never,
      input: { status: "done" },
    });
    const completedAt = state.records.get("task_1")?.completedAt;
    expect(completedAt).toBe(Date.now());

    vi.setSystemTime(new Date("2026-07-13T11:00:00.000Z"));
    await updateTask(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_1",
      taskId: "task_1" as never,
      input: { title: "Renamed" },
    });
    expect(state.records.get("task_1")?.completedAt).toBe(completedAt);

    await updateTask(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_1",
      taskId: "task_1" as never,
      input: { status: "inProgress" },
    });
    expect(state.records.get("task_1")).toHaveProperty("completedAt", undefined);
  });

  it("soft-deletes once without duplicate reminder cancellation or audit", async () => {
    const state = lifecycleContext([storedTask()]);
    const args = {
      organizationId: "org_1",
      actorUserId: "user_1",
      taskId: "task_1" as never,
    };
    await deleteTask(state.ctx, args);
    await expect(deleteTask(state.ctx, args)).rejects.toThrow("Task was not found.");
    expect(cancelQueuedJobsForSource).toHaveBeenCalledTimes(1);
    expect(state.audits).toHaveLength(1);
  });
});
