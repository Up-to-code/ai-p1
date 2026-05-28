import { describe, expect, it } from "vitest";
import {
  compactEventType,
  compactScheduleTitle,
  dashboardDesk,
  dashboardWeekRange,
  latestDashboardClients,
  latestDashboardProjects,
} from "./dashboard-view-model";

describe("dashboard view-model", () => {
  it("calculates dashboard week range from the current day", () => {
    const range = dashboardWeekRange(new Date("2026-05-28T10:00:00.000Z"));
    const start = new Date(range.startAt);
    const end = new Date(range.endAt);

    expect([start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes()]).toEqual([2026, 4, 24, 0, 0]);
    expect([end.getFullYear(), end.getMonth(), end.getDate(), end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds()]).toEqual([2026, 4, 30, 23, 59, 59, 999]);
  });

  it("projects today's and upcoming events", () => {
    const events = [
      { id: "past", date: "2026-05-27", time: "09:00", title: "Past", owner: "A", type: "call", priority: "normal" as const },
      { id: "today", date: "2026-05-28", time: "10:00", title: "Today", owner: "A", type: "call", priority: "high" as const },
      { id: "future", date: "2026-05-29", time: "11:00", title: "Future", owner: "A", type: "visit", priority: "urgent" as const },
    ];

    expect(dashboardDesk(events, new Date("2026-05-28T12:00:00"), 10)).toEqual({
      todayEvents: [events[1]],
      upcomingEvents: [events[1], events[2]],
    });
  });

  it("sorts latest clients and projects by newest timestamps", () => {
    expect(latestDashboardClients([
      { id: "older", createdAt: 1, added: "" },
      { id: "newer", createdAt: 3, added: "" },
      { id: "middle", createdAt: 2, added: "" },
    ], 2).map((client) => client.id)).toEqual(["newer", "middle"]);

    expect(latestDashboardProjects([
      { id: "older", updatedAt: 1_000 },
      { id: "newer", createdAt: 3_000 },
      { id: "middle", updated: "1970-01-01T00:00:02.000Z" },
    ], 2).map((project) => project.id)).toEqual(["newer", "middle"]);
  });

  it("compacts schedule titles and event types", () => {
    expect(compactScheduleTitle("call 12 - Follow up with client")).toBe("Follow up with client");
    expect(compactEventType(
      { id: "1", date: "2026-05-28", time: "09:00", title: "anything", owner: "A", type: "site_viewing", priority: "normal" },
      (type) => `translated:${type}`,
    )).toBe("translated:site-viewing");
    expect(compactEventType(
      { id: "2", date: "2026-05-28", time: "09:00", title: "customThing 123", owner: "A", type: "customThing", priority: "normal" },
      (type) => `translated:${type}`,
    )).toBe("customthing");
  });
});
