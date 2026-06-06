import { describe, expect, it } from "vitest";
import {
  defaultReminderRules,
  nextRecurringTime,
  normalizeReminderRules,
  recipientKey,
  scheduledAtForRule,
  type ReminderRule,
} from "./helpers";

describe("notification reminder helpers", () => {
  it("keeps the v1 default reminder rules", () => {
    expect(defaultReminderRules.filter((rule) => rule.enabled).map((rule) => rule.id)).toEqual([
      "calendar-before-30",
      "calendar-before-5",
      "calendar-at-start",
      "task-before-30",
    ]);
  });

  it("computes before, at, after, and completion offsets", () => {
    const anchorAt = Date.UTC(2026, 5, 6, 12, 0, 0);
    const completedAt = anchorAt + 15 * 60_000;
    const baseRule = {
      id: "rule",
      sourceType: "calendarEvent",
      offsetMinutes: 10,
      enabled: true,
    } satisfies Omit<ReminderRule, "trigger">;

    expect(scheduledAtForRule(anchorAt, completedAt, { ...baseRule, trigger: "before_start" })).toBe(anchorAt - 10 * 60_000);
    expect(scheduledAtForRule(anchorAt, completedAt, { ...baseRule, trigger: "at_start" })).toBe(anchorAt);
    expect(scheduledAtForRule(anchorAt, completedAt, { ...baseRule, trigger: "after_start" })).toBe(anchorAt + 10 * 60_000);
    expect(scheduledAtForRule(anchorAt, completedAt, { ...baseRule, trigger: "after_complete" })).toBe(completedAt + 10 * 60_000);
    expect(scheduledAtForRule(anchorAt, undefined, { ...baseRule, trigger: "after_complete" })).toBeNull();
  });

  it("normalizes rule ids, offsets, and enabled flags", () => {
    expect(normalizeReminderRules([
      { id: "  custom  ", sourceType: "manualSchedule", trigger: "before_start", offsetMinutes: 4.9, enabled: true },
      { id: "", sourceType: "task", trigger: "before_start", offsetMinutes: 1, enabled: true },
    ])).toEqual([
      { id: "custom", sourceType: "manualSchedule", trigger: "before_start", offsetMinutes: 4, enabled: true },
    ]);
  });

  it("advances recurring schedules and honors the until bound", () => {
    const scheduledAt = Date.UTC(2026, 5, 6, 8, 0, 0);
    const dailySchedule = { recurrence: { frequency: "daily", interval: 2 } };
    const weeklySchedule = { recurrence: { frequency: "weekly", interval: 1 } };
    const monthlyExpiredSchedule = {
      recurrence: { frequency: "monthly", interval: 1, untilAt: Date.UTC(2026, 6, 1, 0, 0, 0) },
    };

    expect(nextRecurringTime(dailySchedule as never, scheduledAt)).toBe(scheduledAt + 2 * 24 * 60 * 60_000);
    expect(nextRecurringTime(weeklySchedule as never, scheduledAt)).toBe(scheduledAt + 7 * 24 * 60 * 60_000);
    expect(nextRecurringTime(monthlyExpiredSchedule as never, Date.UTC(2026, 6, 6, 8, 0, 0))).toBeNull();
  });

  it("uses user and installation for multi-device component keys", () => {
    expect(recipientKey("user_1", "installation_2")).toBe("user_1:installation_2");
  });
});
