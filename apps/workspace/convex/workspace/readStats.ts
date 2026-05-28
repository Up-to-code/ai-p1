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
  return new Set(rows.map(value)).size;
}

export function clientStats(clients: Doc<"clients">[]) {
  const active = activeRows(clients);
  const statuses = countFieldValues(active, (client) => client.status, ["active", "inactive"] as const);
  const types = countFieldValues(active, (client) => client.type, ["Buyer", "Tenant", "Investor", "Broker"] as const);

  return {
    total: active.length,
    active: statuses.active,
    inactive: statuses.inactive,
    buyers: types.Buyer,
    tenants: types.Tenant,
    investors: types.Investor,
    brokers: types.Broker,
    stages: countFieldValues(active, (client) => client.pipelineStage, [
      "new",
      "qualified",
      "viewing",
      "negotiation",
      "closed",
    ] as const),
  };
}

export function projectStats(projects: Doc<"projects">[]) {
  const active = activeRows(projects);
  const statuses = countFieldValues(active, (project) => project.status, [
    "approved",
    "pending",
    "draft",
    "rejected",
  ] as const);

  return {
    total: active.length,
    approved: statuses.approved,
    pending: statuses.pending,
    draft: statuses.draft,
    rejected: statuses.rejected,
  };
}

export function propertyStats(units: Doc<"propertyUnits">[]) {
  const active = activeRows(units);
  const statuses = countFieldValues(active, (unit) => unit.status, [
    "available",
    "pending",
    "reserved",
    "sold",
    "draft",
  ] as const);

  return {
    total: active.length,
    available: statuses.available,
    pending: statuses.pending,
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
    owners: uniqueCount(active, (event) => event.owner),
  };
}

export function auditStats(
  events: Doc<"organizationAuditEvents">[],
  categoryForAction: (action: string) => string,
) {
  const businessCategories = new Set(["projects", "properties", "clients", "calendar", "media"]);
  const peopleCategories = new Set(["organization", "people", "roles", "invites"]);
  const categories = events.map((event) => categoryForAction(event.action));

  return {
    total: events.length,
    people: countWhere(categories, (category) => peopleCategories.has(category)),
    business: countWhere(categories, (category) => businessCategories.has(category)),
    latestAt: events[0]?.createdAt,
  };
}
