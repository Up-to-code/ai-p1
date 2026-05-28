import { describe, expect, it, vi } from "vitest";
import { dashboardOverview, type DashboardOverviewRows } from "./dashboardOverview";
import type { Doc } from "../_generated/dataModel";

function project(input: Record<string, unknown>) {
  return input as unknown as Doc<"projects">;
}

function unit(input: Record<string, unknown>) {
  return input as unknown as Doc<"propertyUnits">;
}

function task(input: Record<string, unknown>) {
  return input as unknown as Doc<"clientTasks">;
}

function event(input: Record<string, unknown>) {
  return input as unknown as Doc<"calendarEvents">;
}

function rows(input: Partial<DashboardOverviewRows>): DashboardOverviewRows {
  return {
    displayProjects: [],
    allProjects: [],
    approvedProjects: [],
    pendingProjects: [],
    availableUnits: [],
    pendingUnits: [],
    draftUnits: [],
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
          project({ _id: "project_1", name: "North", reference: "PRJ-1", city: "Riyadh", status: "approved", units: 12, priceRange: "1M" }),
          project({ _id: "project_deleted", deletedAt: 1 }),
        ],
        allProjects: [
          project({ _id: "project_1", status: "approved", syncState: "synced" }),
          project({ _id: "project_2", status: "pending", syncState: "blocked" }),
          project({ _id: "project_deleted", deletedAt: 1 }),
        ],
        approvedProjects: [
          project({ _id: "project_1", status: "approved", syncState: "synced" }),
        ],
        pendingProjects: [
          project({ _id: "project_2", status: "pending", syncState: "blocked" }),
        ],
        availableUnits: [unit({ _id: "unit_1" })],
        pendingUnits: [unit({ _id: "unit_2" })],
        draftUnits: [unit({ _id: "unit_3" }), unit({ _id: "unit_deleted", deletedAt: 1 })],
        tasks: [
          task({ _id: "task_1", status: "open", dueAt: 1_700_000_000_000, priority: "urgent", calendarEventId: "event_1" as Doc<"clientTasks">["calendarEventId"] }),
          task({ _id: "task_done", status: "done", dueAt: 1_700_000_000_000 }),
        ],
        events: [
          event({ _id: "event_1", title: "Visit", startAt: 1_699_999_900_000, owner: "Agent", clientId: "client_1" as Doc<"calendarEvents">["clientId"], type: "visit" }),
          event({ _id: "event_deleted", deletedAt: 1 }),
        ],
      }),
      vi.fn(async () => ({ _id: "client_1", name: "Sara" }) as Doc<"clients">),
      1_700_000_000_000,
    );

    expect(overview.counts).toEqual({
      dueToday: 1,
      availableUnits: 1,
      reviewUnits: 2,
      readyProjects: 1,
      blockedProjects: 1,
      totalProjects: 2,
    });
    expect(overview.projects).toEqual([
      { id: "project_1", name: "North", reference: "PRJ-1", city: "Riyadh", status: "approved", units: 12, priceRange: "1M" },
    ]);
    expect(overview.weekEvents).toEqual([
      {
        id: "event_1",
        title: "Visit",
        date: "2023-11-14",
        time: "22:11",
        owner: "Agent",
        clientName: "Sara",
        priority: "urgent",
        type: "visit",
      },
    ]);
  });

  it("sorts and limits week events while hiding deleted linked clients", async () => {
    const events = Array.from({ length: 22 }, (_, index) =>
      event({
        _id: `event_${index}`,
        title: `Event ${index}`,
        startAt: 1_700_000_000_000 + (21 - index) * 60_000,
        owner: "Agent",
        clientId: "client_deleted" as Doc<"calendarEvents">["clientId"],
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
      clientName: undefined,
      priority: "normal",
    });
    expect(overview.weekEvents.at(-1)?.id).toBe("event_2");
  });
});
