export type DashboardEvent = {
  id: string;
  date: string;
  time: string;
  title: string;
  owner: string;
  clientName?: string;
  type: string;
  priority: "normal" | "high" | "urgent";
};

export type DashboardOverview = {
  weekEvents: DashboardEvent[];
};

export function parseDashboardDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function dashboardStartOfDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function dashboardWeekDays(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function dashboardWeekRange(date: Date) {
  const days = dashboardWeekDays(date);
  const start = dashboardStartOfDay(days[0]);
  const end = new Date(days[days.length - 1]);
  end.setHours(23, 59, 59, 999);
  return { startAt: start.getTime(), endAt: end.getTime() };
}

export function isDashboardSameDay(left: Date | undefined, right: Date) {
  return Boolean(
    left &&
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate(),
  );
}

export function dashboardDesk(events: DashboardEvent[], today: Date, limit = 10) {
  const todayStart = dashboardStartOfDay(today);
  return {
    todayEvents: events
      .filter((event) => isDashboardSameDay(parseDashboardDate(event.date), today))
      .slice(0, limit),
    upcomingEvents: events
      .filter((event) => {
        const eventDate = parseDashboardDate(event.date);
        return eventDate ? eventDate.getTime() >= todayStart.getTime() : false;
      })
      .slice(0, limit),
  };
}

export function latestDashboardClients<TClient extends { createdAt?: number; added: string }>(clients: TClient[], limit = 6) {
  return [...clients]
    .sort((left, right) => {
      const leftTime = left.createdAt ?? Date.parse(left.added) ?? 0;
      const rightTime = right.createdAt ?? Date.parse(right.added) ?? 0;
      return rightTime - leftTime;
    })
    .slice(0, limit);
}

export function latestDashboardProjects<TProject extends {
  createdAt?: number;
  updatedAt?: number;
  updated?: string;
}>(projects: TProject[], limit = 8) {
  return [...projects]
    .sort((left, right) => {
      const leftTime = left.createdAt ?? left.updatedAt ?? Date.parse(left.updated ?? "") ?? 0;
      const rightTime = right.createdAt ?? right.updatedAt ?? Date.parse(right.updated ?? "") ?? 0;
      return rightTime - leftTime;
    })
    .slice(0, limit);
}

export function compactScheduleTitle(value: string) {
  return value
    .replace(/^\s*[a-z]+\s+\d+\s*-\s*/i, "")
    .replace(/\s+/g, " ")
    .trim() || value;
}

const knownCalendarTypes = new Set([
  "visit",
  "call",
  "meeting",
  "client-visit",
  "site-viewing",
  "appointment",
  "signing",
  "follow-up",
  "handover",
  "audit",
  "custom",
]);

export function compactEventType(event: DashboardEvent, translateType: (type: string) => string) {
  const rawType = event.type || event.title.match(/^\s*([a-z]+)/i)?.[1] || "";
  const normalized = rawType.replace(/_/g, "-").trim().toLowerCase();
  if (knownCalendarTypes.has(normalized)) return translateType(normalized);

  const fallback = normalized.replace(/-/g, " ").split(/\s+/).filter(Boolean)[0];
  return (fallback || translateType("custom")).slice(0, 12);
}
