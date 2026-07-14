import { describe, expect, it } from "vitest";
import type { TaskRecord } from "../tasks.types";
import { scheduleTasks, timelinePosition, timelineRange } from "./task-schedule";

function task(id: string, dates: Pick<TaskRecord, "startDate" | "dueDate">): TaskRecord {
  return { id, title: id, status: "todo", priority: "normal", createdByUserId: "user", createdAt: 1, updatedAt: 1, ...dates };
}

describe("task schedule", () => {
  it("uses real ranges and treats due-only tasks as milestones", () => {
    const scheduled = scheduleTasks([
      task("range", { startDate: "2026-07-10", dueDate: "2026-07-14" }),
      task("milestone", { dueDate: "2026-07-20" }),
      task("unscheduled", {}),
    ]);
    expect(scheduled.map(({ task: item }) => item.id)).toEqual(["range", "milestone"]);
    expect(scheduled[0].isMilestone).toBe(false);
    expect(scheduled[1].isMilestone).toBe(true);
    const range = timelineRange(scheduled);
    expect(range).not.toBeNull();
    expect(timelinePosition(scheduled[0], range!).width).toBeGreaterThan(0);
    expect(timelinePosition(scheduled[1], range!).width).toBe(0);
  });

  it("does not invent a duration when an end date precedes the start", () => {
    const [scheduled] = scheduleTasks([task("invalid-range", { startDate: "2026-07-20", dueDate: "2026-07-10" })]);
    expect(scheduled.end).toEqual(scheduled.start);
    expect(scheduled.isMilestone).toBe(true);
  });
});
