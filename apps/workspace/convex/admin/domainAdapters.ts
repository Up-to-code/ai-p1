import { paginationOptsValidator } from "convex/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  adminListPage,
  boundedAdminPaginationOpts,
} from "./listSurface";
import {
  adminOrganizationMemberIds,
  adminOrganizationNotifications,
} from "./organizationDashboard";

const PLATFORM_AUDIT_ORGANIZATION_ID = "platform";

export type AdminDomain =
  | "organizations"
  | "users"
  | "apps"
  | "oauth-clients"
  | "partner-connections"
  | "api-keys"
  | "mcp-connections"
  | "webhooks"
  | "ai-activity"
  | "audit-logs"
  | "workspace-data";

export type AdminActionId =
  | "approved"
  | "rejected"
  | "suspended"
  | "request_changes"
  | "reply"
  | "internal_note"
  | "pause"
  | "revoke"
  | "restore"
  | "archive";

type PaginationOpts = typeof paginationOptsValidator.type;

export type AdminListInput = {
  domain: AdminDomain;
  paginationOpts: PaginationOpts;
  search?: string;
  filters?: Record<string, unknown>;
};

export type AdminRecord =
  | Doc<"organizations">
  | Doc<"userProfiles">
  | Doc<"organizationPartnerConnections">
  | Doc<"organizationApiKeys">
  | Doc<"organizationMcpConnections">
  | Doc<"partnerWebhookEndpoints">
  | Doc<"partnerWebhookDeliveries">
  | Doc<"agentRuns">
  | Doc<"organizationAuditEvents">
  | Doc<"projects">
  | Doc<"clients">
  | Doc<"tasks">
  | Doc<"calendarEvents">
  | Doc<"mediaAssets">;

type WorkspaceRecord =
  | Doc<"projects">
  | Doc<"clients">
  | Doc<"tasks">
  | Doc<"calendarEvents">
  | Doc<"mediaAssets">;

type DomainAdapter = {
  list: (ctx: QueryCtx, args: AdminListInput) => Promise<unknown>;
  find: (ctx: QueryCtx, id: string) => Promise<AdminRecord | null>;
  summarize: (record: AdminRecord) => unknown;
  detailRaw?: (ctx: QueryCtx, record: AdminRecord) => Promise<unknown>;
  runAction?: (ctx: MutationCtx, args: AdminRunActionInput) => Promise<AdminRecord | null>;
};

type AdminRunActionInput = {
  domain: AdminDomain;
  id: string;
  actionId: AdminActionId;
};

type StatusMutationDb = {
  patch(id: string, patch: Record<string, unknown>): Promise<void>;
  get(id: string): Promise<AdminRecord | null>;
};

function redactSecret(last4?: string) {
  return {
    configured: Boolean(last4),
    redacted: true,
    last4: last4 ?? null,
  };
}

function statusFor(value: string | undefined) {
  if (!value) return "muted";
  if (["active", "approved", "succeeded", "accepted", "completed", "allowed"].includes(value)) return "active";
  if (["pending", "delivering", "running", "draft"].includes(value)) return "pending";
  if (["rejected", "revoked", "failed", "blocked", "canceled"].includes(value)) return "danger";
  if (["suspended", "paused"].includes(value)) return "warning";
  return "muted";
}

function updatedAt(record: { updatedAt?: number; createdAt?: number; startedAt?: number }) {
  return record.updatedAt ?? record.createdAt ?? record.startedAt ?? Date.now();
}

function field(label: string, value: unknown, secret = false) {
  return { label, value: typeof value === "string" ? value : JSON.stringify(value), secret };
}

function organizationSummary(org: Doc<"organizations">) {
  return {
    id: org._id,
    title: org.name,
    subtitle: org.legalName || org.organizationId,
    status: "active",
    href: `/organizations/${org._id}`,
    updatedAt: org.updatedAt,
    fields: [
      field("Logo", ""),
      field("Organization ID", org.organizationId),
      field("Type", org.type),
      field("Email", org.email),
      field("Website", org.website),
    ],
  };
}

function userSummary(profile: Doc<"userProfiles">) {
  return {
    id: profile._id,
    title: profile.userId,
    subtitle: "Workspace user profile",
    status: "active",
    href: `/users/${profile._id}`,
    updatedAt: profile.updatedAt,
    fields: [
      field("User ID", profile.userId),
      field("Avatar", profile.avatarUrl ? "configured" : "not configured"),
      field("Platform admin", "operator-controlled outside Admin UI"),
    ],
  };
}

function apiKeySummary(key: Doc<"organizationApiKeys">) {
  return {
    id: key._id,
    title: key.name,
    subtitle: key.organizationId,
    status: statusFor(key.status),
    href: `/api-keys/${key._id}`,
    updatedAt: key.updatedAt,
    fields: [
      field("Key", redactSecret(key.keyLast4), true),
      field("Permissions", key.permissions.length),
      field("Usage", key.usageCount),
      field("Last used", key.lastUsedAt ? new Date(key.lastUsedAt).toISOString() : "never"),
    ],
  };
}

function mcpSummary(connection: Doc<"organizationMcpConnections">) {
  return {
    id: connection._id,
    title: connection.name,
    subtitle: connection.organizationId,
    status: statusFor(connection.status),
    href: `/mcp-connections/${connection._id}`,
    updatedAt: connection.updatedAt,
    fields: [
      field("Public ID", connection.publicId),
      field("Key", redactSecret(connection.keyLast4), true),
      field("Permissions", connection.permissions.length),
      field("Usage", connection.usageCount),
    ],
  };
}

function partnerConnectionSummary(connection: Doc<"organizationPartnerConnections">) {
  return {
    id: connection._id,
    title: connection.partnersClientId,
    subtitle: connection.organizationId,
    status: statusFor(connection.status),
    href: `/partner-connections/${connection._id}`,
    updatedAt: connection.updatedAt,
    fields: [
      field("Scopes", connection.scopes.length),
      field("Partner app", connection.partnersAppId),
      field("Authorized by", connection.authorizedByUserId),
      field("Expires", connection.expiresAt ? new Date(connection.expiresAt).toISOString() : "not set"),
    ],
  };
}

function webhookEndpointSummary(endpoint: Doc<"partnerWebhookEndpoints">) {
  return {
    id: endpoint._id,
    title: endpoint.url,
    subtitle: endpoint.organizationId ?? "global partner endpoint",
    status: statusFor(endpoint.status),
    href: `/webhooks/${endpoint._id}`,
    updatedAt: endpoint.updatedAt,
    fields: [
      field("Events", endpoint.events.length),
      field("Signing secret", redactSecret(endpoint.signingSecret.slice(-4)), true),
      field("Partner app", endpoint.partnerAppId),
    ],
  };
}

function webhookDeliverySummary(delivery: Doc<"partnerWebhookDeliveries">) {
  return {
    id: delivery._id,
    title: delivery.eventType,
    subtitle: delivery.organizationId,
    status: statusFor(delivery.status),
    href: `/webhooks/${delivery._id}`,
    updatedAt: delivery.updatedAt,
    fields: [
      field("Event ID", delivery.eventId),
      field("Attempts", delivery.attemptCount),
      field("Last status", delivery.lastStatus ?? "none"),
      field("Payload", "redacted", true),
    ],
  };
}

function aiRunSummary(run: Doc<"agentRuns">) {
  return {
    id: run._id,
    title: run.model,
    subtitle: run.organizationId,
    status: statusFor(run.status),
    href: `/ai-activity/${run._id}`,
    updatedAt: run.completedAt ?? run.startedAt,
    fields: [
      field("Thread", run.threadId),
      field("Created by", run.createdByUserId),
      field("Error", run.error ?? "none"),
    ],
  };
}

function auditSummary(event: Doc<"organizationAuditEvents">) {
  return {
    id: event._id,
    title: event.action,
    subtitle: event.summary,
    status: "active",
    href: `/audit-logs/${event._id}`,
    updatedAt: event.createdAt,
    fields: [
      field("Organization", event.organizationId),
      field("Actor", event.actorUserId),
      field("Target", event.target),
    ],
  };
}

function workspaceSummary(record: WorkspaceRecord) {
  const title = "name" in record
    ? record.name
    : "title" in record
      ? record.title
      : (record as Doc<"mediaAssets">).key;
  const status = "status" in record ? String(record.status) : "active";
  return {
    id: record._id,
    title,
    subtitle: record.organizationId,
    status: statusFor(status),
    href: `/workspace-data/${record._id}`,
    updatedAt: updatedAt(record),
    fields: [
      field("Organization", record.organizationId),
      field("Kind", record._creationTime ? "workspace" : "record"),
      field("Deleted", "deletedAt" in record && record.deletedAt ? "yes" : "no"),
    ],
  };
}

async function organizationDashboard(ctx: QueryCtx, org: Doc<"organizations">) {
  const organizationId = org.organizationId;
  const [
    projects,
    clients,
    tasks,
    calendar,
    media,
    apiKeys,
    mcpConnections,
    partnerConnections,
    auditEvents,
    invites,
  ] = await Promise.all([
    ctx.db.query("projects").withIndex("by_organization_updated", (q) => q.eq("organizationId", organizationId)).order("desc").take(6),
    ctx.db.query("clients").withIndex("by_organization_updated", (q) => q.eq("organizationId", organizationId)).order("desc").take(6),
    ctx.db.query("tasks").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("calendarEvents").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("mediaAssets").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("organizationApiKeys").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("organizationMcpConnections").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("organizationPartnerConnections").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("organizationAuditEvents").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("organizationInviteLinks").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
  ]);

  const memberIds = adminOrganizationMemberIds({
    projects,
    clients,
    tasks,
    calendar,
    media,
    apiKeys,
    mcpConnections,
    partnerConnections,
    invites,
  });

  const memberProfiles = await Promise.all(memberIds.map(async (userId) => {
    const profile = await ctx.db.query("userProfiles").withIndex("by_user_id", (q) => q.eq("userId", userId)).first();
    return { userId, profile };
  }));

  const memberRows = memberProfiles.map(({ userId, profile }, index) => ({
    id: userId,
    title: `Workspace member ${index + 1}`,
    subtitle: "Email and name require auth profile sync",
    status: "active",
    href: `/organizations/${org._id}`,
    updatedAt: profile?.updatedAt ?? org.updatedAt,
    fields: [
      field("Avatar", profile?.avatarUrl ?? ""),
      field("Email", "Not synced from auth profile"),
      field("Source", "activity, access, or invite"),
      field("Internal user ref", userId, true),
      field("Admin role", "not assignable in Admin UI"),
    ],
  }));

  const notifications = adminOrganizationNotifications({ projects, partnerConnections, apiKeys });

  const sections = [
    {
      id: "members",
      title: "Members and access",
      description: "People observed through invites, created records, API keys, MCP links, and partner authorizations.",
      href: `/organizations/${org._id}?tab=members`,
      rows: memberRows,
      warnings: memberRows.length === 0 ? ["No member activity is visible for this organization yet."] : [],
    },
    {
      id: "submissions",
      title: "Partner and access submissions",
      description: "Partner authorizations, organization API keys, and MCP access for this organization.",
      href: `/organizations/${org._id}?tab=access`,
      rows: [
        ...partnerConnections.map(partnerConnectionSummary),
        ...apiKeys.map(apiKeySummary),
        ...mcpConnections.map(mcpSummary),
      ],
      warnings: [],
    },
    {
      id: "business",
      title: "Business data",
      description: "Projects, clients, tasks, bookings, and media owned by this organization.",
      href: `/organizations/${org._id}?tab=business`,
      rows: [
        ...projects.map(workspaceSummary),
        ...clients.map(workspaceSummary),
        ...tasks.map(workspaceSummary),
        ...calendar.map(workspaceSummary),
        ...media.map(workspaceSummary),
      ],
      warnings: [],
    },
    {
      id: "audit",
      title: "Audit and register",
      description: "Latest organization audit events and changes visible to Super Admin.",
      href: `/organizations/${org._id}?tab=audit`,
      rows: auditEvents.map(auditSummary),
      warnings: auditEvents.length === 0 ? ["No audit events found for this organization."] : [],
    },
  ];

  return { organizationSections: sections, notifications };
}

async function withPage<T>(
  pagePromise: Promise<{ page: T[]; isDone: boolean; continueCursor: string }>,
  mapRecord: (record: T) => unknown,
  search: string | undefined,
  searchValues: (record: T) => Array<string | undefined | null>,
) {
  return adminListPage(await pagePromise, { mapRecord, search, searchValues });
}

async function listWorkspaceData(ctx: QueryCtx, args: AdminListInput) {
  const family = typeof args.filters?.family === "string" ? args.filters.family : "projects";
  const paginationOpts = boundedAdminPaginationOpts(args.paginationOpts);
  if (family === "clients") {
    return withPage(ctx.db.query("clients").withIndex("by_updated").order("desc").paginate(paginationOpts), workspaceSummary, args.search, (record) => [record.name, record.email, record.phone, record.organizationId, record.status]);
  }
  if (family === "tasks") {
    return withPage(ctx.db.query("tasks").withIndex("by_updated").order("desc").paginate(paginationOpts), workspaceSummary, args.search, (record) => [record.title, record.organizationId, record.status]);
  }
  if (family === "calendar") {
    return withPage(ctx.db.query("calendarEvents").withIndex("by_updated").order("desc").paginate(paginationOpts), workspaceSummary, args.search, (record) => [record.title, record.ownerUserId, record.organizationId, record.status]);
  }
  if (family === "media") {
    return withPage(ctx.db.query("mediaAssets").withIndex("by_updated").order("desc").paginate(paginationOpts), workspaceSummary, args.search, (record) => [record.name, record.key, record.organizationId, record.kind]);
  }
  return withPage(ctx.db.query("projects").withIndex("by_updated").order("desc").paginate(paginationOpts), workspaceSummary, args.search, (record) => [record.name, record.organizationId, record.status, record.health]);
}

async function findWorkspaceRecord(ctx: QueryCtx, id: string) {
  const tables = ["projects", "clients", "tasks", "calendarEvents", "mediaAssets"] as const;
  for (const table of tables) {
    const normalized = ctx.db.normalizeId(table, id);
    if (normalized) {
      const record = await ctx.db.get(normalized);
      if (record) return record;
    }
  }
  return null;
}

function readonlyActionError(): never {
  throw new Error("This domain is read-only until a reversible Workspace control exists.");
}

function unsupportedCatalogActionError(): never {
  throw new Error("Workspace no longer reviews partner apps. Use Partners as the source of truth.");
}

function statusPatchFor(actionId: AdminActionId) {
  return actionId === "revoke"
    ? "revoked"
    : actionId === "pause" || actionId === "suspended"
      ? "paused"
      : actionId === "restore"
        ? "active"
        : null;
}

function statusMutationAdapter<TTable extends "organizationPartnerConnections" | "organizationApiKeys" | "organizationMcpConnections" | "partnerWebhookEndpoints">(
  table: TTable,
  allowedStatuses: string[],
) {
  return async (ctx: MutationCtx, args: AdminRunActionInput) => {
    const id = ctx.db.normalizeId(table, args.id);
    const nextStatus = statusPatchFor(args.actionId);
    if (!id || !nextStatus || !allowedStatuses.includes(nextStatus)) throw new Error("Unsupported action.");
    const db = ctx.db as unknown as StatusMutationDb;
    await db.patch(id, {
      status: nextStatus,
      updatedAt: Date.now(),
      revokedAt: nextStatus === "revoked" ? Date.now() : undefined,
    });
    return db.get(id);
  };
}

const catalogUnavailableAdapter: DomainAdapter = {
  list: async () => ({
    rows: [],
    isDone: true,
    continueCursor: "",
    warnings: ["Workspace no longer stores partner app catalog records. Use Partners as the source of truth."],
  }),
  find: async () => null,
  summarize: () => null,
  runAction: async () => unsupportedCatalogActionError(),
};

export const adminDomainAdapters: Record<AdminDomain, DomainAdapter> = {
  organizations: {
    list: (ctx, args) => withPage(ctx.db.query("organizations").withIndex("by_updated").order("desc").paginate(boundedAdminPaginationOpts(args.paginationOpts)), organizationSummary, args.search, (org) => [org.name, org.legalName, org.organizationId, org.email]),
    find: (ctx, id) => ctx.db.get(ctx.db.normalizeId("organizations", id) as Id<"organizations">),
    summarize: (record) => organizationSummary(record as Doc<"organizations">),
    detailRaw: (ctx, record) => organizationDashboard(ctx, record as Doc<"organizations">),
  },
  users: {
    list: (ctx, args) => withPage(ctx.db.query("userProfiles").withIndex("by_updated").order("desc").paginate(boundedAdminPaginationOpts(args.paginationOpts)), userSummary, args.search, (profile) => [profile.userId]),
    find: (ctx, id) => ctx.db.get(ctx.db.normalizeId("userProfiles", id) as Id<"userProfiles">),
    summarize: (record) => userSummary(record as Doc<"userProfiles">),
  },
  apps: catalogUnavailableAdapter,
  "oauth-clients": catalogUnavailableAdapter,
  "partner-connections": {
    list: (ctx, args) => withPage(ctx.db.query("organizationPartnerConnections").withIndex("by_status_updated").order("desc").paginate(boundedAdminPaginationOpts(args.paginationOpts)), partnerConnectionSummary, args.search, (record) => [record.partnersClientId, record.partnersAppId, record.organizationId, record.status]),
    find: (ctx, id) => ctx.db.get(ctx.db.normalizeId("organizationPartnerConnections", id) as Id<"organizationPartnerConnections">),
    summarize: (record) => partnerConnectionSummary(record as Doc<"organizationPartnerConnections">),
    runAction: statusMutationAdapter("organizationPartnerConnections", ["active", "paused", "revoked"]),
  },
  "api-keys": {
    list: (ctx, args) => withPage(ctx.db.query("organizationApiKeys").withIndex("by_status_updated").order("desc").paginate(boundedAdminPaginationOpts(args.paginationOpts)), apiKeySummary, args.search, (record) => [record.name, record.organizationId, record.keyId, record.status]),
    find: (ctx, id) => ctx.db.get(ctx.db.normalizeId("organizationApiKeys", id) as Id<"organizationApiKeys">),
    summarize: (record) => apiKeySummary(record as Doc<"organizationApiKeys">),
    runAction: statusMutationAdapter("organizationApiKeys", ["active", "revoked"]),
  },
  "mcp-connections": {
    list: (ctx, args) => withPage(ctx.db.query("organizationMcpConnections").withIndex("by_status_updated").order("desc").paginate(boundedAdminPaginationOpts(args.paginationOpts)), mcpSummary, args.search, (record) => [record.name, record.organizationId, record.publicId, record.status]),
    find: (ctx, id) => ctx.db.get(ctx.db.normalizeId("organizationMcpConnections", id) as Id<"organizationMcpConnections">),
    summarize: (record) => mcpSummary(record as Doc<"organizationMcpConnections">),
    runAction: statusMutationAdapter("organizationMcpConnections", ["active", "paused", "revoked"]),
  },
  webhooks: {
    list: (ctx, args) => withPage(ctx.db.query("partnerWebhookEndpoints").withIndex("by_status_updated").order("desc").paginate(boundedAdminPaginationOpts(args.paginationOpts)), webhookEndpointSummary, args.search, (record) => [record.url, record.organizationId, record.status]),
    find: async (ctx, id) => {
      const endpoint = await ctx.db.get(ctx.db.normalizeId("partnerWebhookEndpoints", id) as Id<"partnerWebhookEndpoints">);
      if (endpoint) return endpoint;
      return ctx.db.get(ctx.db.normalizeId("partnerWebhookDeliveries", id) as Id<"partnerWebhookDeliveries">);
    },
    summarize: (record) => "eventType" in record
      ? webhookDeliverySummary(record as Doc<"partnerWebhookDeliveries">)
      : webhookEndpointSummary(record as Doc<"partnerWebhookEndpoints">),
    runAction: statusMutationAdapter("partnerWebhookEndpoints", ["active", "paused", "revoked"]),
  },
  "ai-activity": {
    list: (ctx, args) => withPage(ctx.db.query("agentRuns").withIndex("by_status_created").order("desc").paginate(boundedAdminPaginationOpts(args.paginationOpts)), aiRunSummary, args.search, (record) => [record.model, record.organizationId, record.status, record.error]),
    find: (ctx, id) => ctx.db.get(ctx.db.normalizeId("agentRuns", id) as Id<"agentRuns">),
    summarize: (record) => aiRunSummary(record as Doc<"agentRuns">),
    runAction: async () => readonlyActionError(),
  },
  "audit-logs": {
    list: (ctx, args) => withPage(ctx.db.query("organizationAuditEvents").withIndex("by_created").order("desc").paginate(boundedAdminPaginationOpts(args.paginationOpts)), auditSummary, args.search, (record) => [record.action, record.summary, record.organizationId, record.actorUserId]),
    find: (ctx, id) => ctx.db.get(ctx.db.normalizeId("organizationAuditEvents", id) as Id<"organizationAuditEvents">),
    summarize: (record) => auditSummary(record as Doc<"organizationAuditEvents">),
    runAction: async () => readonlyActionError(),
  },
  "workspace-data": {
    list: listWorkspaceData,
    find: findWorkspaceRecord,
    summarize: (record) => workspaceSummary(record as WorkspaceRecord),
    runAction: async () => readonlyActionError(),
  },
};

export async function listAdminDomain(ctx: QueryCtx, args: AdminListInput) {
  return adminDomainAdapters[args.domain].list(ctx, args);
}

export async function findAdminDomainRecord(ctx: QueryCtx, domain: AdminDomain, id: string) {
  return adminDomainAdapters[domain].find(ctx, id);
}

export function summarizeAdminDomainRecord(domain: AdminDomain, record: AdminRecord) {
  return adminDomainAdapters[domain].summarize(record);
}

export async function detailRawForAdminDomainRecord(ctx: QueryCtx, domain: AdminDomain, record: AdminRecord) {
  return adminDomainAdapters[domain].detailRaw?.(ctx, record) ?? null;
}

export function auditEventsForAdminRecord(record: { _id: string; organizationId?: string; updatedAt?: number; createdAt?: number }, actor: string) {
  return [
    {
      id: `${record._id}:inspect`,
      actor,
      action: "admin.record.inspect",
      summary: "Record loaded through privileged Convex admin function.",
      createdAt: Date.now(),
    },
    {
      id: `${record._id}:source`,
      actor: "convex",
      action: "admin.record.source",
      summary: `Organization scope: ${record.organizationId ?? PLATFORM_AUDIT_ORGANIZATION_ID}.`,
      createdAt: updatedAt(record),
    },
  ];
}

async function writeAudit(ctx: MutationCtx, input: {
  actorEmail: string;
  organizationId?: string;
  action: string;
  target: string;
  summary: string;
}) {
  return ctx.db.insert("organizationAuditEvents", {
    organizationId: input.organizationId ?? PLATFORM_AUDIT_ORGANIZATION_ID,
    actorUserId: input.actorEmail,
    actorType: "user",
    action: input.action,
    target: input.target,
    summary: input.summary,
    createdAt: Date.now(),
  });
}

export async function runAdminDomainAction(ctx: MutationCtx, args: AdminRunActionInput & {
  actorEmail: string;
  reason?: string;
}) {
  const record = await adminDomainAdapters[args.domain].runAction?.(ctx, args) ?? readonlyActionError();
  if (!record) throw new Error("Record was not found.");
  const auditId = await writeAudit(ctx, {
    actorEmail: args.actorEmail,
    organizationId: "organizationId" in record ? record.organizationId : undefined,
    action: `admin.${args.domain}.${args.actionId}`,
    target: args.id,
    summary: args.reason ?? "Admin control action recorded.",
  });

  return {
    record: summarizeAdminDomainRecord(args.domain, record),
    auditId,
    nextState: "status" in record ? String(record.status) : "updated",
  };
}
