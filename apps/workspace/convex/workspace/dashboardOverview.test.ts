import { describe, expect, it, vi } from "vitest";
import { dashboardOverview, type DashboardOverviewRows } from "./dashboardOverview";
import type { Doc } from "../_generated/dataModel";

function project(input: Record<string, unknown>) {
  return input as unknown as Doc<"projects">;
}

function task(input: Record<string, unknown>) {
  return input as unknown as Doc<"tasks">;
}

function event(input: Record<string, unknown>) {
  return input as unknown as Doc<"calendarEvents">;
}

function rows(input: Partial<DashboardOverviewRows>): DashboardOverviewRows {
  return {
    displayProjects: [],
    allProjects: [],
    activeProjects: [],
    blockedProjects: [],
    tasks: [],
    events: [],
    ...input,
  };
}

describe("Workspace dashboard overview", () => {
  it("preserves count, project card, and event enrichment behavior", async () => {
    const overview = await dashboardOverview(
      rows({
        displayProjects: [
          project({ _id: "project_1", name: "North", status: "active", health: "onTrack", budget: 12000 }),
          project({ _id: "project_deleted", deletedAt: 1 }),
        ],
        allProjects: [
          project({ _id: "project_1", status: "active", health: "onTrack" }),
          project({ _id: "project_2", status: "paused", health: "blocked" }),
          project({ _id: "project_deleted", deletedAt: 1 }),
        ],
        activeProjects: [
          project({ _id: "project_1", status: "active", health: "onTrack" }),
        ],
        blockedProjects: [
          project({ _id: "project_2", status: "paused", health: "blocked" }),
        ],
        tasks: [
          task({ _id: "task_1", status: "todo", dueDate: "2023-11-14", priority: "urgent" }),
          task({ _id: "task_done", status: "done", dueDate: "2023-11-14" }),
        ],
        events: [
          event({ _id: "event_1", title: "Visit", startAt: 1_699_999_900_000, ownerUserId: "Agent", createdByUserId: "creator", type: "meeting" }),
          event({ _id: "event_deleted", deletedAt: 1 }),
        ],
      }),
      vi.fn(async () => ({ _id: "client_1", name: "Sara" }) as Doc<"clients">),
      1_700_000_000_000,
    );

    expect(overview.counts).toEqual({
      dueToday: 1,
      availableAssets: 0,
      reviewAssets: 0,
      readyProjects: 1,
      blockedProjects: 1,
      totalProjects: 2,
    });
    expect(overview.projects).toEqual([
      { id: "project_1", name: "North", status: "active", health: "onTrack", budget: 12000 },
    ]);
    expect(overview.weekEvents).toEqual([
      {
        id: "event_1",
        title: "Visit",
        date: "2023-11-14",
        time: "22:11",
        owner: "Agent",
        priority: "normal",
        type: "meeting",
      },
    ]);
  });

  it("sorts and limits week events while hiding deleted linked clients", async () => {
    const events = Array.from({ length: 22 }, (_, index) =>
      event({
        _id: `event_${index}`,
        title: `Event ${index}`,
        startAt: 1_700_000_000_000 + (21 - index) * 60_000,
        ownerUserId: "Agent",
        createdByUserId: "creator",
        type: "meeting",
      }),
    );

    const overview = await dashboardOverview(
      rows({ events }),
      vi.fn(async () => ({ _id: "client_deleted", name: "Hidden", deletedAt: 1 }) as Doc<"clients">),
      1_700_000_000_000,
    );

    expect(overview.weekEvents).toHaveLength(20);
    expect(overview.weekEvents[0]).toMatchObject({
      id: "event_21",
      title: "Event 21",
      priority: "normal",
    });
    expect(overview.weekEvents.at(-1)?.id).toBe("event_2");
  });
});
