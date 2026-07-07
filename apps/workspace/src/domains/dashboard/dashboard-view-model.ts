type DashboardEvent = {
  id?: string;
  date: string;
  time?: string;
  title: string;
  type: string;
  [key: string]: unknown;
};

type TimestampedRow = {
  createdAt?: number;
  updatedAt?: number;
  updated?: string;
};

export function dashboardWeekRange(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { startAt: start.toISOString(), endAt: end.toISOString() };
}

function eventTimestamp(event: DashboardEvent) {
  return new Date(`${event.date}T${event.time || "00:00"}`).getTime();
}

export function dashboardDesk<TEvent extends DashboardEvent>(
  events: TEvent[],
  now = new Date(),
  limit = 5,
) {
  const todayKey = now.toISOString().slice(0, 10);
  const nowMs = now.getTime();
  const ordered = [...events].sort((a, b) => eventTimestamp(a) - eventTimestamp(b));

  return {
    todayEvents: ordered.filter((event) => event.date === todayKey).slice(0, limit),
    upcomingEvents: ordered
      .filter((event) => eventTimestamp(event) >= nowMs || event.date === todayKey)
      .slice(0, limit),
  };
}

function rowTimestamp(row: TimestampedRow) {
  if (typeof row.updatedAt === "number") return row.updatedAt;
  if (typeof row.createdAt === "number") return row.createdAt;
  if (row.updated) return new Date(row.updated).getTime();
  return 0;
}

export function latestDashboardClients<TClient extends TimestampedRow>(clients: TClient[], limit = 5) {
  return [...clients].sort((a, b) => rowTimestamp(b) - rowTimestamp(a)).slice(0, limit);
}

export function latestDashboardProjects<TProject extends TimestampedRow>(projects: TProject[], limit = 5) {
  return [...projects].sort((a, b) => rowTimestamp(b) - rowTimestamp(a)).slice(0, limit);
}

export function compactScheduleTitle(title: string) {
  return title.replace(/^[a-zA-Z]+\s+\d+\s*-\s*/, "").trim();
}

export function compactEventType(event: DashboardEvent, translate: (type: string) => string) {
  const normalized = event.type.toLowerCase();
  const knownTypes = new Set(["call", "visit", "meeting", "deadline", "task"]);
  return knownTypes.has(normalized) ? translate(event.type) : normalized;
}
