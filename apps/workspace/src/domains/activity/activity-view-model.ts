export type AuditCategory =
  | "organization"
  | "people"
  | "roles"
  | "projects"
  | "assets"
  | "clients"
  | "calendar"
  | "media"
  | "invites";

export type AuditEvent = {
  id: string;
  actorUserId: string;
  action: string;
  category: AuditCategory;
  target: string;
  summary: string;
  createdAt: number;
};

export type AuditStats = {
  total: number;
  people: number;
  business: number;
  latestAt?: number;
};

export function activityCategoryTone(
  category: AuditCategory,
): "success" | "warning" | "danger" | "neutral" | "info" {
  if (category === "projects" || category === "assets") return "success";
  if (category === "clients" || category === "calendar" || category === "media") return "info";
  if (category === "invites") return "warning";
  if (category === "people" || category === "roles") return "danger";
  return "neutral";
}

export function activityActionLabel(action: string) {
  return action
    .split(".")
    .filter((part) => part !== "organization")
    .map((part) => part.replace(/_/g, " "))
    .join(" ");
}

export function shortActivityActor(value: string) {
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function activityRelativeTime(value: number, locale: string, now = Date.now()) {
  const diffSeconds = Math.round((value - now) / 1000);
  const absolute = Math.abs(diffSeconds);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  const [unit, seconds] = units.find(([, threshold]) => absolute >= threshold) ?? ["second", 1];
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    Math.round(diffSeconds / seconds),
    unit,
  );
}
