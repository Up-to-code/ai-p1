import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
  type CalendarEventInput,
} from "./lifecycle";
import {
  cancelQueuedJobsForSource,
  scheduleCalendarEventReminders,
} from "../notifications/helpers";

vi.mock("../notifications/helpers", () => ({
  cancelQueuedJobsForSource: vi.fn(async () => undefined),
  scheduleCalendarEventReminders: vi.fn(async () => undefined),
}));

const eventInput: CalendarEventInput = {
  title: "Kickoff",
  startAt: 100,
  endAt: 200,
  type: "meeting",
  status: "confirmed",
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
      const id = `event_${++sequence}`;
      records.set(id, { _id: id, _creationTime: Date.now(), ...value });
      return id;
    }),
    patch: vi.fn(async (id: string, patch: Record<string, unknown>) => {
      const current = records.get(id);
      if (!current) throw new Error("missing record");
      records.set(id, { ...current, ...patch });
    }),
  };
  return { ctx: { db, scheduler: {} } as never, db, records, audits };
}

describe("Calendar lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-13T09:00:00.000Z"));
  });

  it("rejects an invalid interval before persistence", async () => {
    const state = lifecycleContext();
    await expect(createCalendarEvent(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_1",
      input: { ...eventInput, startAt: 300, endAt: 200 },
    })).rejects.toThrow("Event end must not be before its start.");
    expect(state.db.insert).not.toHaveBeenCalled();
  });

  it("validates linked records in the same Organization", async () => {
    const state = lifecycleContext([{ _id: "project_1", organizationId: "org_other" }]);
    await expect(createCalendarEvent(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_1",
      input: { ...eventInput, projectId: "project_1" },
    })).rejects.toThrow("Project was not found in this organization.");
    expect(state.audits).toHaveLength(0);
  });

  it("patches without mirroring omitted fields and reschedules once", async () => {
    const state = lifecycleContext([{
      _id: "event_1",
      _creationTime: Date.now(),
      organizationId: "org_1",
      ...eventInput,
      recordState: "active",
      createdByUserId: "user_1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }]);

    const result = await updateCalendarEvent(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_2",
      eventId: "event_1" as never,
      input: { title: "Updated kickoff" },
    });

    expect(result).toMatchObject({ title: "Updated kickoff", startAt: 100, endAt: 200 });
    expect(scheduleCalendarEventReminders).toHaveBeenCalledTimes(1);
    expect(state.audits).toEqual([
      expect.objectContaining({ action: "calendar.update", actorUserId: "user_2" }),
    ]);
  });

  it("rejects a partial time change that conflicts with the persisted interval", async () => {
    const state = lifecycleContext([{
      _id: "event_1",
      organizationId: "org_1",
      ...eventInput,
      recordState: "active",
    }]);
    await expect(updateCalendarEvent(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_1",
      eventId: "event_1" as never,
      input: { startAt: 300 },
    })).rejects.toThrow("Event end must not be before its start.");
    expect(state.db.patch).not.toHaveBeenCalled();
  });

  it("soft-deletes once and does not duplicate cancellation or audit on retry", async () => {
    const state = lifecycleContext([{
      _id: "event_1",
      organizationId: "org_1",
      ...eventInput,
      recordState: "active",
    }]);
    const args = {
      organizationId: "org_1",
      actorUserId: "user_1",
      eventId: "event_1" as never,
    };
    await deleteCalendarEvent(state.ctx, args);
    await expect(deleteCalendarEvent(state.ctx, args)).rejects.toThrow("Calendar event was not found.");
    expect(cancelQueuedJobsForSource).toHaveBeenCalledTimes(1);
    expect(state.audits).toHaveLength(1);
  });
});
