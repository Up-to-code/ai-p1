import type { Doc, Id } from "../_generated/dataModel";
import { activeRows } from "./readStats";

export type DashboardOverviewRows = {
  displayProjects: Doc<"projects">[];
  allProjects: Doc<"projects">[];
  activeProjects: Doc<"projects">[];
  blockedProjects: Doc<"projects">[];
  approvedAssets: Doc<"assets">[];
  reviewAssets: Doc<"assets">[];
  draftAssets: Doc<"assets">[];
  tasks: Doc<"tasks">[];
  events: Doc<"calendarEvents">[];
};

type ClientLookup = (clientId: Id<"clients">) => Promise<Doc<"clients"> | null>;
type DashboardActiveRows = {
  displayProjects: Doc<"projects">[];
  allProjects: Doc<"projects">[];
  activeProjects: Doc<"projects">[];
  blockedProjects: Doc<"projects">[];
  approvedAssets: Doc<"assets">[];
  reviewAssets: Doc<"assets">[];
  draftAssets: Doc<"assets">[];
  openTasks: Doc<"tasks">[];
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
    activeProjects: activeRows(rows.activeProjects),
    blockedProjects: activeRows(rows.blockedProjects),
    approvedAssets: activeRows(rows.approvedAssets),
    reviewAssets: activeRows(rows.reviewAssets),
    draftAssets: activeRows(rows.draftAssets),
    openTasks: activeRows(rows.tasks).filter((task) => task.status !== "done" && task.status !== "canceled"),
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
  return {
    dueToday: active.openTasks.filter((task) => task.dueDate && Date.parse(task.dueDate) <= todayEnd).length,
    availableAssets: active.approvedAssets.length,
    reviewAssets: active.reviewAssets.length + active.draftAssets.length,
    readyProjects: active.activeProjects.length,
    blockedProjects: active.blockedProjects.length,
    totalProjects: active.allProjects.length,
  };
}

function dashboardProjectCards(active: DashboardActiveRows) {
  return active.displayProjects.map((project) => ({
    id: project._id,
    name: project.name,
    status: project.status,
    health: project.health,
    budget: project.budget,
  }));
}

async function dashboardWeekEvents(active: DashboardActiveRows, getClient: ClientLookup) {
  return Promise.all(
    active.events
      .sort((a, b) => a.startAt - b.startAt)
      .slice(0, 20)
      .map(async (event) => {
        return {
          id: event._id,
          title: event.title,
          date: isoDate(event.startAt),
          time: isoTime(event.startAt),
          owner: event.ownerUserId ?? event.createdByUserId,
          priority: "normal" as const,
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
