import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const MAX_ADMIN_PAGE_SIZE = 100;
const PLATFORM_AUDIT_ORGANIZATION_ID = "platform";

const adminDomainValidator = v.union(
  v.literal("organizations"),
  v.literal("users"),
  v.literal("apps"),
  v.literal("oauth-clients"),
  v.literal("partner-connections"),
  v.literal("api-keys"),
  v.literal("mcp-connections"),
  v.literal("webhooks"),
  v.literal("ai-activity"),
  v.literal("audit-logs"),
  v.literal("workspace-data"),
);

const adminActionValidator = v.union(
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("suspended"),
  v.literal("request_changes"),
  v.literal("reply"),
  v.literal("internal_note"),
  v.literal("pause"),
  v.literal("revoke"),
  v.literal("restore"),
  v.literal("archive"),
);

type AdminDomain = typeof adminDomainValidator.type;
type PaginationOpts = typeof paginationOptsValidator.type;
type AdminListArgs = {
  adminServiceToken: string;
  domain: AdminDomain;
  paginationOpts: PaginationOpts;
  search?: string;
  filters?: Record<string, unknown>;
};

function configuredAdminToken() {
  return process.env.ADMIN_CONVEX_SERVICE_TOKEN ?? process.env.WORKSPACE_ADMIN_SERVICE_TOKEN ?? "";
}

function timingSafeEqual(a: string, b: string) {
  const maxLength = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let index = 0; index < maxLength; index += 1) {
    diff |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return diff === 0;
}

function assertAdminServiceToken(token: string) {
  const configured = configuredAdminToken();
  if (!configured || !timingSafeEqual(token, configured)) {
    throw new Error("Invalid admin service token.");
  }
}

function boundedPaginationOpts(paginationOpts: PaginationOpts) {
  return {
    ...paginationOpts,
    numItems: Math.max(1, Math.min(paginationOpts.numItems, MAX_ADMIN_PAGE_SIZE)),
  };
}

function pageWarnings(search?: string) {
  return search?.trim()
    ? ["Search is bounded to indexed paginated results. Use specific ids, status, or organization filters for large data sets."]
    : [];
}

function matchesSearch(search: string | undefined, values: Array<string | undefined | null>) {
  const normalized = search?.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) => (value ?? "").toLowerCase().includes(normalized));
}

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

function appSummary(app: Doc<"partnerApps">) {
  return {
    id: app._id,
    title: app.name,
    subtitle: app.publisherName ?? app.oauthClientId,
    status: app.status,
    href: `/apps/${app._id}`,
    updatedAt: app.updatedAt,
    fields: [
      field("Logo", app.logoUrl ?? ""),
      field("Homepage", app.homepageUrl ?? ""),
      field("OAuth client", app.oauthClientId),
      field("Publisher", app.publisherName ?? "unknown"),
      field("Scopes", app.allowedScopes.length),
      field("Redirect URIs", app.redirectUris.length),
      field("Partner reply", app.partnerReviewReply ? "configured" : "not set"),
    ],
  };
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
    title: connection.oauthClientId,
    subtitle: connection.organizationId,
    status: statusFor(connection.status),
    href: `/partner-connections/${connection._id}`,
    updatedAt: connection.updatedAt,
    fields: [
      field("Scopes", connection.scopes.length),
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

function workspaceSummary(record: Doc<"projects"> | Doc<"propertyUnits"> | Doc<"clients"> | Doc<"clientTasks"> | Doc<"calendarEvents"> | Doc<"mediaAssets">) {
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
    properties,
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
    ctx.db.query("propertyUnits").withIndex("by_organization_updated", (q) => q.eq("organizationId", organizationId)).order("desc").take(6),
    ctx.db.query("clients").withIndex("by_organization_updated", (q) => q.eq("organizationId", organizationId)).order("desc").take(6),
    ctx.db.query("clientTasks").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("calendarEvents").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("mediaAssets").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("organizationApiKeys").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("organizationMcpConnections").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("organizationPartnerConnections").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("organizationAuditEvents").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
    ctx.db.query("organizationInviteLinks").withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId)).take(6),
  ]);

  const memberIds = Array.from(new Set([
    ...projects.map((record) => record.createdByUserId),
    ...properties.map((record) => record.createdByUserId),
    ...clients.map((record) => record.createdByUserId),
    ...tasks.map((record) => record.createdByUserId),
    ...calendar.map((record) => record.createdByUserId),
    ...media.map((record) => record.createdByUserId),
    ...apiKeys.map((record) => record.createdByUserId),
    ...mcpConnections.map((record) => record.createdByUserId),
    ...partnerConnections.map((record) => record.authorizedByUserId),
    ...invites.map((record) => record.createdByUserId),
    ...invites.flatMap((record) => record.usedByUserId ? [record.usedByUserId] : []),
  ].filter(Boolean))).slice(0, 12);

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

  const notifications = [
    ...projects.filter((record) => record.status === "pending").map((record) => ({
      id: `${record._id}:pending-project`,
      tone: "warning",
      title: "Project pending review",
      description: record.name,
      href: `/workspace-data/${record._id}`,
      createdAt: record.updatedAt,
    })),
    ...partnerConnections.filter((record) => record.status === "paused" || record.status === "revoked").map((record) => ({
      id: `${record._id}:partner-connection`,
      tone: record.status === "revoked" ? "danger" : "warning",
      title: "Partner connection needs attention",
      description: `${record.oauthClientId} is ${record.status}.`,
      href: `/partner-connections/${record._id}`,
      createdAt: record.updatedAt,
    })),
    ...apiKeys.filter((record) => record.status === "revoked").map((record) => ({
      id: `${record._id}:api-key`,
      tone: "danger",
      title: "API key revoked",
      description: record.name,
      href: `/api-keys/${record._id}`,
      createdAt: record.updatedAt,
    })),
  ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);

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
      description: "Projects, units, clients, tasks, bookings, and media owned by this organization.",
      href: `/organizations/${org._id}?tab=business`,
      rows: [
        ...projects.map(workspaceSummary),
        ...properties.map(workspaceSummary),
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
  const page = await pagePromise;
  const filtered = page.page.filter((record) => matchesSearch(search, searchValues(record)));
  return {
    rows: filtered.map(mapRecord),
    isDone: page.isDone,
    continueCursor: page.continueCursor,
    warnings: pageWarnings(search),
  };
}

async function listPartnerApps(ctx: QueryCtx, args: AdminListArgs) {
  const status = typeof args.filters?.status === "string" ? args.filters.status : undefined;
  const paginationOpts = boundedPaginationOpts(args.paginationOpts);
  const pagePromise = status && ["pending", "approved", "rejected", "suspended"].includes(status)
    ? ctx.db.query("partnerApps")
      .withIndex("by_status_updated", (q) => q.eq("status", status as "pending" | "approved" | "rejected" | "suspended"))
      .order("desc")
      .paginate(paginationOpts)
    : ctx.db.query("partnerApps").withIndex("by_updated").order("desc").paginate(paginationOpts);

  return withPage(pagePromise, appSummary, args.search, (app) => [
    app.name,
    app.publisherName,
    app.oauthClientId,
    app.partnersAppId,
    app.partnersClientId,
    app.status,
  ]);
}

async function listWorkspaceData(ctx: QueryCtx, args: AdminListArgs) {
  const family = typeof args.filters?.family === "string" ? args.filters.family : "projects";
  const paginationOpts = boundedPaginationOpts(args.paginationOpts);
  if (family === "properties") {
    return withPage(ctx.db.query("propertyUnits").withIndex("by_updated").order("desc").paginate(paginationOpts), workspaceSummary, args.search, (record) => [record.title, record.reference, record.organizationId, record.status]);
  }
  if (family === "clients") {
    return withPage(ctx.db.query("clients").withIndex("by_updated").order("desc").paginate(paginationOpts), workspaceSummary, args.search, (record) => [record.name, record.contact, record.organizationId, record.status]);
  }
  if (family === "tasks") {
    return withPage(ctx.db.query("clientTasks").withIndex("by_updated").order("desc").paginate(paginationOpts), workspaceSummary, args.search, (record) => [record.title, record.organizationId, record.status]);
  }
  if (family === "calendar") {
    return withPage(ctx.db.query("calendarEvents").withIndex("by_updated").order("desc").paginate(paginationOpts), workspaceSummary, args.search, (record) => [record.title, record.owner, record.organizationId, record.status]);
  }
  if (family === "media") {
    return withPage(ctx.db.query("mediaAssets").withIndex("by_updated").order("desc").paginate(paginationOpts), workspaceSummary, args.search, (record) => [record.name, record.key, record.organizationId, record.kind]);
  }
  return withPage(ctx.db.query("projects").withIndex("by_updated").order("desc").paginate(paginationOpts), workspaceSummary, args.search, (record) => [record.name, record.reference, record.organizationId, record.status]);
}

export const listDomain = query({
  args: {
    adminServiceToken: v.string(),
    domain: adminDomainValidator,
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    filters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    assertAdminServiceToken(args.adminServiceToken);
    const paginationOpts = boundedPaginationOpts(args.paginationOpts);

    if (args.domain === "organizations") {
      return withPage(ctx.db.query("organizations").withIndex("by_updated").order("desc").paginate(paginationOpts), organizationSummary, args.search, (org) => [org.name, org.legalName, org.organizationId, org.email]);
    }
    if (args.domain === "users") {
      return withPage(ctx.db.query("userProfiles").withIndex("by_updated").order("desc").paginate(paginationOpts), userSummary, args.search, (profile) => [profile.userId]);
    }
    if (args.domain === "apps" || args.domain === "oauth-clients") {
      return listPartnerApps(ctx, args);
    }
    if (args.domain === "partner-connections") {
      return withPage(ctx.db.query("organizationPartnerConnections").withIndex("by_status_updated").order("desc").paginate(paginationOpts), partnerConnectionSummary, args.search, (record) => [record.oauthClientId, record.organizationId, record.status]);
    }
    if (args.domain === "api-keys") {
      return withPage(ctx.db.query("organizationApiKeys").withIndex("by_status_updated").order("desc").paginate(paginationOpts), apiKeySummary, args.search, (record) => [record.name, record.organizationId, record.keyId, record.status]);
    }
    if (args.domain === "mcp-connections") {
      return withPage(ctx.db.query("organizationMcpConnections").withIndex("by_status_updated").order("desc").paginate(paginationOpts), mcpSummary, args.search, (record) => [record.name, record.organizationId, record.publicId, record.status]);
    }
    if (args.domain === "webhooks") {
      return withPage(ctx.db.query("partnerWebhookEndpoints").withIndex("by_status_updated").order("desc").paginate(paginationOpts), webhookEndpointSummary, args.search, (record) => [record.url, record.organizationId, record.status]);
    }
    if (args.domain === "ai-activity") {
      return withPage(ctx.db.query("agentRuns").withIndex("by_status_created").order("desc").paginate(paginationOpts), aiRunSummary, args.search, (record) => [record.model, record.organizationId, record.status, record.error]);
    }
    if (args.domain === "audit-logs") {
      return withPage(ctx.db.query("organizationAuditEvents").withIndex("by_created").order("desc").paginate(paginationOpts), auditSummary, args.search, (record) => [record.action, record.summary, record.organizationId, record.actorUserId]);
    }
    return listWorkspaceData(ctx, args);
  },
});

async function findRecord(ctx: QueryCtx, domain: AdminDomain, id: string) {
  if (domain === "organizations") return ctx.db.get(ctx.db.normalizeId("organizations", id) as Id<"organizations">);
  if (domain === "users") return ctx.db.get(ctx.db.normalizeId("userProfiles", id) as Id<"userProfiles">);
  if (domain === "apps" || domain === "oauth-clients") return ctx.db.get(ctx.db.normalizeId("partnerApps", id) as Id<"partnerApps">);
  if (domain === "partner-connections") return ctx.db.get(ctx.db.normalizeId("organizationPartnerConnections", id) as Id<"organizationPartnerConnections">);
  if (domain === "api-keys") return ctx.db.get(ctx.db.normalizeId("organizationApiKeys", id) as Id<"organizationApiKeys">);
  if (domain === "mcp-connections") return ctx.db.get(ctx.db.normalizeId("organizationMcpConnections", id) as Id<"organizationMcpConnections">);
  if (domain === "webhooks") {
    const endpoint = await ctx.db.get(ctx.db.normalizeId("partnerWebhookEndpoints", id) as Id<"partnerWebhookEndpoints">);
    if (endpoint) return endpoint;
    return ctx.db.get(ctx.db.normalizeId("partnerWebhookDeliveries", id) as Id<"partnerWebhookDeliveries">);
  }
  if (domain === "ai-activity") return ctx.db.get(ctx.db.normalizeId("agentRuns", id) as Id<"agentRuns">);
  if (domain === "audit-logs") return ctx.db.get(ctx.db.normalizeId("organizationAuditEvents", id) as Id<"organizationAuditEvents">);
  const tables = ["projects", "propertyUnits", "clients", "clientTasks", "calendarEvents", "mediaAssets"] as const;
  for (const table of tables) {
    const normalized = ctx.db.normalizeId(table, id);
    if (normalized) {
      const record = await ctx.db.get(normalized);
      if (record) return record;
    }
  }
  return null;
}

function summarizeRecord(domain: AdminDomain, record: NonNullable<Awaited<ReturnType<typeof findRecord>>>) {
  if (domain === "organizations") return organizationSummary(record as Doc<"organizations">);
  if (domain === "users") return userSummary(record as Doc<"userProfiles">);
  if (domain === "apps" || domain === "oauth-clients") return appSummary(record as Doc<"partnerApps">);
  if (domain === "partner-connections") return partnerConnectionSummary(record as Doc<"organizationPartnerConnections">);
  if (domain === "api-keys") return apiKeySummary(record as Doc<"organizationApiKeys">);
  if (domain === "mcp-connections") return mcpSummary(record as Doc<"organizationMcpConnections">);
  if (domain === "webhooks" && "eventType" in record) return webhookDeliverySummary(record as Doc<"partnerWebhookDeliveries">);
  if (domain === "webhooks") return webhookEndpointSummary(record as Doc<"partnerWebhookEndpoints">);
  if (domain === "ai-activity") return aiRunSummary(record as Doc<"agentRuns">);
  if (domain === "audit-logs") return auditSummary(record as Doc<"organizationAuditEvents">);
  return workspaceSummary(record as Doc<"projects">);
}

function auditEventsForRecord(record: { _id: string; organizationId?: string; updatedAt?: number; createdAt?: number }, actor: string) {
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

export const getDomainRecord = query({
  args: {
    adminServiceToken: v.string(),
    domain: adminDomainValidator,
    id: v.string(),
    actorEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAdminServiceToken(args.adminServiceToken);
    const record = await findRecord(ctx, args.domain, args.id);
    if (!record) return null;
    const organizationRaw = args.domain === "organizations"
      ? await organizationDashboard(ctx, record as Doc<"organizations">)
      : null;
    return {
      record: summarizeRecord(args.domain, record),
      raw: args.domain === "apps" || args.domain === "oauth-clients"
        ? {
          redirectUris: (record as Doc<"partnerApps">).redirectUris,
          allowedScopes: (record as Doc<"partnerApps">).allowedScopes,
          description: (record as Doc<"partnerApps">).description,
          callbackUrl: (record as Doc<"partnerApps">).callbackUrl ?? null,
          partnerReviewReply: (record as Doc<"partnerApps">).partnerReviewReply ?? null,
          internalReviewNotes: (record as Doc<"partnerApps">).internalReviewNotes ?? null,
        }
        : organizationRaw
          ? organizationRaw
        : null,
      auditTimeline: auditEventsForRecord(record, args.actorEmail ?? "admin"),
    };
  },
});

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

export const runDomainAction = mutation({
  args: {
    adminServiceToken: v.string(),
    domain: adminDomainValidator,
    id: v.string(),
    actionId: adminActionValidator,
    reason: v.optional(v.string()),
    partnerReply: v.optional(v.string()),
    internalNote: v.optional(v.string()),
    actorEmail: v.string(),
  },
  handler: async (ctx, args) => {
    assertAdminServiceToken(args.adminServiceToken);
    const now = Date.now();

    if (args.domain === "apps" || args.domain === "oauth-clients") {
      const appId = ctx.db.normalizeId("partnerApps", args.id);
      if (!appId) throw new Error("Partner app was not found.");
      const app = await ctx.db.get(appId);
      if (!app) throw new Error("Partner app was not found.");

      const patch: Partial<Doc<"partnerApps">> = { updatedAt: now };
      if (["approved", "rejected", "suspended"].includes(args.actionId)) {
        patch.status = args.actionId as "approved" | "rejected" | "suspended";
        patch.reviewNotes = args.reason;
        patch.partnerReviewReply = args.partnerReply ?? args.reason;
        patch.reviewedByUserId = args.actorEmail;
        patch.reviewedAt = now;
      } else if (args.actionId === "reply" || args.actionId === "request_changes") {
        patch.partnerReviewReply = args.partnerReply ?? args.reason;
        patch.reviewNotes = args.reason;
      } else if (args.actionId === "internal_note") {
        patch.internalReviewNotes = args.internalNote ?? args.reason;
      } else {
        throw new Error("Unsupported partner app action.");
      }

      await ctx.db.patch(appId, patch);
      const auditId = await writeAudit(ctx, {
        actorEmail: args.actorEmail,
        action: `admin.partner_app.${args.actionId}`,
        target: appId,
        summary: args.reason ?? args.partnerReply ?? "Partner app admin action recorded.",
      });
      const next = await ctx.db.get(appId);
      return { record: appSummary(next!), auditId, nextState: next!.status };
    }

    const statusPatch = args.actionId === "revoke"
      ? "revoked"
      : args.actionId === "pause" || args.actionId === "suspended"
        ? "paused"
        : args.actionId === "restore"
          ? "active"
          : null;

    let record: Awaited<ReturnType<typeof findRecord>> = null;
    if (args.domain === "partner-connections") {
      const id = ctx.db.normalizeId("organizationPartnerConnections", args.id);
      if (!id || !statusPatch) throw new Error("Unsupported action.");
      await ctx.db.patch(id, { status: statusPatch as "active" | "paused" | "revoked", updatedAt: now, revokedAt: statusPatch === "revoked" ? now : undefined });
      record = await ctx.db.get(id);
    } else if (args.domain === "api-keys") {
      const id = ctx.db.normalizeId("organizationApiKeys", args.id);
      if (!id || !["active", "revoked"].includes(statusPatch ?? "")) throw new Error("Unsupported action.");
      await ctx.db.patch(id, { status: statusPatch as "active" | "revoked", updatedAt: now, revokedAt: statusPatch === "revoked" ? now : undefined });
      record = await ctx.db.get(id);
    } else if (args.domain === "mcp-connections") {
      const id = ctx.db.normalizeId("organizationMcpConnections", args.id);
      if (!id || !statusPatch) throw new Error("Unsupported action.");
      await ctx.db.patch(id, { status: statusPatch as "active" | "paused" | "revoked", updatedAt: now, revokedAt: statusPatch === "revoked" ? now : undefined });
      record = await ctx.db.get(id);
    } else if (args.domain === "webhooks") {
      const id = ctx.db.normalizeId("partnerWebhookEndpoints", args.id);
      if (!id || !statusPatch) throw new Error("Unsupported action.");
      await ctx.db.patch(id, { status: statusPatch as "active" | "paused" | "revoked", updatedAt: now, revokedAt: statusPatch === "revoked" ? now : undefined });
      record = await ctx.db.get(id);
    } else {
      throw new Error("This domain is read-only until a reversible Workspace control exists.");
    }

    if (!record) throw new Error("Record was not found.");
    const auditId = await writeAudit(ctx, {
      actorEmail: args.actorEmail,
      organizationId: "organizationId" in record ? record.organizationId : undefined,
      action: `admin.${args.domain}.${args.actionId}`,
      target: args.id,
      summary: args.reason ?? "Admin control action recorded.",
    });

    return {
      record: summarizeRecord(args.domain, record),
      auditId,
      nextState: "status" in record ? String(record.status) : "updated",
    };
  },
});
