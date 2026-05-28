import type { Doc, Id } from "../_generated/dataModel";
import { activeRows } from "./readStats";

export type DashboardOverviewRows = {
  displayProjects: Doc<"projects">[];
  allProjects: Doc<"projects">[];
  approvedProjects: Doc<"projects">[];
  pendingProjects: Doc<"projects">[];
  availableUnits: Doc<"propertyUnits">[];
  pendingUnits: Doc<"propertyUnits">[];
  draftUnits: Doc<"propertyUnits">[];
  tasks: Doc<"clientTasks">[];
  events: Doc<"calendarEvents">[];
};

type ClientLookup = (clientId: Id<"clients">) => Promise<Doc<"clients"> | null>;
type DashboardActiveRows = {
  displayProjects: Doc<"projects">[];
  allProjects: Doc<"projects">[];
  approvedProjects: Doc<"projects">[];
  pendingProjects: Doc<"projects">[];
  availableUnits: Doc<"propertyUnits">[];
  pendingUnits: Doc<"propertyUnits">[];
  draftUnits: Doc<"propertyUnits">[];
  openTasks: Doc<"clientTasks">[];
  events: Doc<"calendarEvents">[];
};

function isoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function isoTime(timestamp: number) {
  return new Date(timestamp).toISOString().slice(11, 16);
}

function activeDashboardRows(rows: DashboardOverviewRows): DashboardActiveRows {
  return {
    displayProjects: activeRows(rows.displayProjects),
    allProjects: activeRows(rows.allProjects),
    approvedProjects: activeRows(rows.approvedProjects),
    pendingProjects: activeRows(rows.pendingProjects),
    availableUnits: activeRows(rows.availableUnits),
    pendingUnits: activeRows(rows.pendingUnits),
    draftUnits: activeRows(rows.draftUnits),
    openTasks: activeRows(rows.tasks).filter((task) => task.status === "open"),
    events: activeRows(rows.events),
  };
}

function dashboardEndOfDay(now: number) {
  const today = new Date(now);
  today.setHours(23, 59, 59, 999);
  return today.getTime();
}

function dashboardCounts(active: DashboardActiveRows, now: number) {
  const todayEnd = dashboardEndOfDay(now);
  const blockedProjectIds = new Set([
    ...active.pendingProjects.map((project) => project._id),
    ...active.allProjects.filter((project) => project.syncState === "blocked").map((project) => project._id),
  ]);

  return {
    dueToday: active.openTasks.filter((task) => task.dueAt && task.dueAt <= todayEnd).length,
    availableUnits: active.availableUnits.length,
    reviewUnits: active.pendingUnits.length + active.draftUnits.length,
    readyProjects: active.approvedProjects.filter((project) => project.syncState === "synced").length,
    blockedProjects: blockedProjectIds.size,
    totalProjects: active.allProjects.length,
  };
}

function dashboardProjectCards(active: DashboardActiveRows) {
  return active.displayProjects.map((project) => ({
    id: project._id,
    name: project.name,
    reference: project.reference,
    city: project.city,
    status: project.status,
    units: project.units,
    priceRange: project.priceRange,
  }));
}

async function dashboardWeekEvents(active: DashboardActiveRows, getClient: ClientLookup) {
  return Promise.all(
    active.events
      .sort((a, b) => a.startAt - b.startAt)
      .slice(0, 20)
      .map(async (event) => {
        const client = event.clientId ? await getClient(event.clientId) : null;
        const linkedTask = active.openTasks.find((task) => task.calendarEventId === event._id);
        return {
          id: event._id,
          title: event.title,
          date: isoDate(event.startAt),
          time: isoTime(event.startAt),
          owner: event.owner,
          clientName: client && !client.deletedAt ? client.name : undefined,
          priority: linkedTask?.priority ?? ("normal" as const),
          type: event.type,
        };
      }),
  );
}

export async function dashboardOverview(rows: DashboardOverviewRows, getClient: ClientLookup, now = Date.now()) {
  const active = activeDashboardRows(rows);
  const weekEvents = await dashboardWeekEvents(active, getClient);

  return {
    counts: dashboardCounts(active, now),
    projects: dashboardProjectCards(active),
    weekEvents,
  };
}
