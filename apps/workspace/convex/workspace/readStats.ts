import type { Doc } from "../_generated/dataModel";

export function activeRows<TRow extends { deletedAt?: number }>(rows: TRow[]) {
  return rows.filter((row) => !row.deletedAt);
}

function countWhere<TRow>(rows: TRow[], matches: (row: TRow) => boolean) {
  return rows.reduce((count, row) => count + (matches(row) ? 1 : 0), 0);
}

function countFieldValues<TRow, TKey extends string>(
  rows: TRow[],
  fieldValue: (row: TRow) => string | undefined,
  keys: readonly TKey[],
) {
  return Object.fromEntries(keys.map((key) => [key, countWhere(rows, (row) => fieldValue(row) === key)])) as Record<
    TKey,
    number
  >;
}

function uniqueCount<TRow>(rows: TRow[], value: (row: TRow) => string | undefined) {
  return new Set(rows.map(value).filter((item): item is string => Boolean(item))).size;
}

export function clientStats(clients: Doc<"clients">[]) {
  const active = activeRows(clients);
  const statuses = countFieldValues(active, (client) => client.status, [
    "new",
    "active",
    "nurture",
    "inactive",
    "archived",
  ] as const);
  const types = countFieldValues(active, (client) => client.type, ["person", "organization"] as const);

  return {
    total: active.length,
    new: statuses.new,
    active: statuses.active,
    nurture: statuses.nurture,
    inactive: statuses.inactive,
    archived: statuses.archived,
    people: types.person,
    organizations: types.organization,
  };
}

export function projectStats(projects: Doc<"projects">[]) {
  const active = activeRows(projects);
  const statuses = countFieldValues(active, (project) => project.status, [
    "planned",
    "active",
    "paused",
    "completed",
    "archived",
  ] as const);
  const health = countFieldValues(active, (project) => project.health, ["onTrack", "atRisk", "blocked"] as const);

  return {
    total: active.length,
    planned: statuses.planned,
    active: statuses.active,
    paused: statuses.paused,
    completed: statuses.completed,
    archived: statuses.archived,
    onTrack: health.onTrack,
    atRisk: health.atRisk,
    blocked: health.blocked,
  };
}

export function assetStats(assets: Doc<"assets">[]) {
  const active = activeRows(assets);
  const statuses = countFieldValues(active, (asset) => asset.status, [
    "available",
    "pending",
    "reserved",
    "sold",
    "draft",
    "active",
    "review",
    "approved",
    "archived",
  ] as const);

  return {
    total: active.length,
    available: statuses.available + statuses.active + statuses.approved,
    pending: statuses.pending + statuses.review,
    reserved: statuses.reserved,
    sold: statuses.sold,
    draft: statuses.draft,
  };
}

export function calendarStats(events: Doc<"calendarEvents">[]) {
  const active = activeRows(events);
  const statuses = countFieldValues(active, (event) => event.status, ["confirmed", "pending", "draft"] as const);

  return {
    total: active.length,
    confirmed: statuses.confirmed,
    pending: statuses.pending,
    draft: statuses.draft,
    owners: uniqueCount(active, (event) => event.ownerUserId),
  };
}

export function auditStats(
  events: Doc<"organizationAuditEvents">[],
  categoryForAction: (action: string) => string,
) {
  const businessCategories = new Set(["projects", "assets", "clients", "calendar", "media"]);
  const peopleCategories = new Set(["organization", "people", "roles", "invites"]);
  const categories = events.map((event) => categoryForAction(event.action));

  return {
    total: events.length,
    people: countWhere(categories, (category) => peopleCategories.has(category)),
    business: countWhere(categories, (category) => businessCategories.has(category)),
    latestAt: events[0]?.createdAt,
  };
}
