import {
  qentrahPartnerResourceAudience,
  qentrahPartnerTokenEndpoint,
} from "../core.js";
import {
  createQentrahServiceAppClient,
  type QentrahPartnerResource,
  type QentrahPartnerResourceRequestOptions,
} from "../service-app/index.js";
import type { QentrahPartnerTokenSet } from "../types.js";

export type QentrahPartnerSectionId =
  | "overview"
  | "flow"
  | "credentials"
  | "organization"
  | "clients"
  | "assets"
  | "projects"
  | "tasks"
  | "calendar"
  | "media"
  | "webhooks"
  | "results";

export type QentrahPartnerOperation = "read" | "create" | "update" | "delete";

export type QentrahPartnerSectionConfig = {
  id: QentrahPartnerSectionId;
  label: string;
  description: string;
  requiredScopes: string[];
  operations: QentrahPartnerOperation[];
  emptyState: string;
  endpoint?: string;
  paginated?: boolean;
};

export type QentrahPartnerCredentialSnapshot = {
  connected: boolean;
  organizationId?: string;
  tokenExpiresAt?: number;
  workspaceBaseUrl: string;
  resourceAudience: string;
  requestedScopes: string[];
  grantedScopes: string[];
};

export type QentrahPartnerOperationResult = {
  sectionId: QentrahPartnerSectionId;
  operation: QentrahPartnerOperation;
  method: string;
  path: string;
  status: number;
  ok: boolean;
  timestamp: number;
  requestSummary: string;
  responseSummary: string;
  error?: string;
  response?: unknown;
};

export type QentrahPartnerRenderField = {
  key: string;
  value: string;
};

export type QentrahPartnerRenderRow = {
  key: string;
  title: string;
  fields: QentrahPartnerRenderField[];
};

export type QentrahPartnerConsoleFilters = {
  limit?: number;
  cursor?: string;
  search?: string;
  type?: string;
  indexStart?: string | number;
  indexEnd?: string | number;
  startDate?: string;
  endDate?: string;
  resourceType?: string;
  resourceId?: string;
};

export type QentrahPartnerHarnessSession = {
  accessToken?: string;
  access_token?: string;
  tokenType?: string;
  token_type?: string;
  expiresIn?: number;
  expires_in?: number;
  obtainedAt?: number;
  obtained_at?: number;
  refreshToken?: string;
  refresh_token?: string;
  scope?: string;
  organizationId?: string;
  organization_id?: string;
};

export type QentrahPartnerResourceOperationInput = {
  workspaceBaseUrl: string;
  session: QentrahPartnerHarnessSession | null | undefined;
  sectionId: QentrahPartnerSectionId;
  operation?: QentrahPartnerOperation;
  resource?: QentrahPartnerResource;
  path: string;
  input?: Record<string, unknown>;
  options?: QentrahPartnerResourceRequestOptions;
  requiredScopes?: string[];
  grantedScopes?: readonly string[];
  fetcher?: typeof fetch;
};

export type QentrahPartnerConsoleServiceConfig = {
  workspaceBaseUrl: string;
  partnerAppUrl?: string;
  redirectUri: string;
  requestedScopes: string[];
  grantedScopes?: string[];
  session?: QentrahPartnerHarnessSession | null;
  fetcher?: typeof fetch;
};

export const qentrahPartnerSections: QentrahPartnerSectionConfig[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Connection health, scope readiness, and current integration status.",
    requiredScopes: [],
    operations: [],
    emptyState: "Authorize Workspace to start testing resource calls.",
  },
  {
    id: "flow",
    label: "OAuth Flow",
    description: "Authorization code plus PKCE lifecycle and endpoints.",
    requiredScopes: [],
    operations: [],
    emptyState: "OAuth flow metadata is always available.",
  },
  {
    id: "credentials",
    label: "Credentials",
    description: "Sanitized runtime credentials and granted scope state.",
    requiredScopes: [],
    operations: [],
    emptyState: "No credential session is connected.",
  },
  {
    id: "organization",
    label: "Organization",
    description: "Read the authorized organization context.",
    requiredScopes: ["organization:read"],
    operations: ["read"],
    emptyState: "No organization response loaded.",
    endpoint: "/api/qentrah/me",
  },
  {
    id: "clients",
    label: "Clients",
    description: "Read clients and test create, update, and delete writes.",
    requiredScopes: ["client:read", "client:create", "client:update", "client:delete"],
    operations: ["read", "create", "update", "delete"],
    emptyState: "No clients loaded yet.",
    endpoint: "/api/qentrah/clients",
    paginated: true,
  },
  {
    id: "assets",
    label: "Assets",
    description: "Read asset inventory visible to the partner app.",
    requiredScopes: ["asset:read"],
    operations: ["read"],
    emptyState: "No assets loaded yet.",
    endpoint: "/api/qentrah/assets",
    paginated: true,
  },
  {
    id: "projects",
    label: "Projects",
    description: "Read Workspace project records.",
    requiredScopes: ["project:read"],
    operations: ["read"],
    emptyState: "No projects loaded yet.",
    endpoint: "/api/qentrah/projects",
    paginated: true,
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Read follow-up tasks and action work.",
    requiredScopes: ["task:read"],
    operations: ["read"],
    emptyState: "No tasks loaded yet.",
    endpoint: "/api/qentrah/tasks",
    paginated: true,
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Read calendar events for the authorized organization.",
    requiredScopes: ["calendar:read"],
    operations: ["read"],
    emptyState: "No calendar events loaded yet.",
    endpoint: "/api/qentrah/calendar",
    paginated: true,
  },
  {
    id: "media",
    label: "Media",
    description: "Read media for a specific resource type and resource id.",
    requiredScopes: ["media:read"],
    operations: ["read"],
    emptyState: "Enter a resource type and id to load media.",
    endpoint: "/api/qentrah/media",
    paginated: true,
  },
  {
    id: "webhooks",
    label: "Webhooks",
    description: "Send client lifecycle webhook events through the stored authorization.",
    requiredScopes: [],
    operations: ["create", "update", "delete"],
    emptyState: "Send a webhook event to capture the response.",
    endpoint: "/api/qentrah/webhooks",
  },
  {
    id: "results",
    label: "Test Results",
    description: "Latest operation result by section, including failures.",
    requiredScopes: [],
    operations: [],
    emptyState: "Run a resource request to capture a test result.",
  },
];

export const qentrahPartnerSectionIds = qentrahPartnerSections.map((section) => section.id);

export function findQentrahPartnerSection(id: string): QentrahPartnerSectionConfig {
  return qentrahPartnerSections.find((section) => section.id === id) ?? qentrahPartnerSections[0]!;
}

export function qentrahMissingScopes(requiredScopes: readonly string[], grantedScopes: readonly string[]) {
  return requiredScopes.filter((scope) => !grantedScopes.includes(scope));
}

export function qentrahSectionCanRun(section: QentrahPartnerSectionConfig, grantedScopes: readonly string[]) {
  return qentrahMissingScopes(section.requiredScopes, grantedScopes).length === 0;
}

export function qentrahScopesNeedReauthorization(requestedScopes: readonly string[], grantedScopes: readonly string[]) {
  return qentrahMissingScopes(requestedScopes, grantedScopes).length > 0;
}

export function qentrahGrantedScopesFromTokenSet(tokenSet: Pick<QentrahPartnerTokenSet, "scope"> | { scope?: string } | null | undefined) {
  return (tokenSet?.scope ?? "")
    .split(/\s+/u)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

const sensitiveKeyPattern = /access_token|accessToken|refresh_token|refreshToken|client_secret|clientSecret|authorization|password|secret|token|apiKey|partnerKey|keyValue/i;

export function sanitizeQentrahPartnerPayload(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    return value
      .replace(/Bearer\s+[A-Za-z0-9._-]+/giu, "Bearer [redacted]")
      .replace(/sandbox_(access|refresh)_[A-Za-z0-9._-]+/giu, "[redacted]")
      .replace(/partners_secret_[A-Za-z0-9._-]+/giu, "[redacted]")
      .replace(/mcp_secret_[A-Za-z0-9._-]+/giu, "[redacted]")
      .replace(/(client_secret=)[^&\s]+/giu, "$1[redacted]")
      .replace(/(access_token=)[^&\s]+/giu, "$1[redacted]")
      .replace(/(refresh_token=)[^&\s]+/giu, "$1[redacted]");
  }
  if (Array.isArray(value)) return value.map(sanitizeQentrahPartnerPayload);
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      sensitiveKeyPattern.test(key) ? "[redacted]" : sanitizeQentrahPartnerPayload(entry),
    ]));
  }
  return value;
}

export function summarizeQentrahPartnerPayload(value: unknown) {
  const safeValue = sanitizeQentrahPartnerPayload(value);
  if (safeValue === null || safeValue === undefined) return "empty";
  if (Array.isArray(safeValue)) return `${safeValue.length} item${safeValue.length === 1 ? "" : "s"}`;
  if (typeof safeValue === "object") {
    const keys = Object.keys(safeValue as Record<string, unknown>);
    return keys.length ? keys.slice(0, 5).join(", ") : "object";
  }
  const text = String(safeValue);
  return text.length > 100 ? `${text.slice(0, 97)}...` : text;
}

export function qentrahPartnerDataItems(data: unknown) {
  const value = data && typeof data === "object" && "data" in data ? (data as { data?: unknown }).data : data;
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

export function qentrahPartnerDisplayTitle(value: unknown, fallback: string) {
  if (!value || typeof value !== "object") return fallback;
  const record = value as Record<string, unknown>;
  return String(record.name ?? record.title ?? record.id ?? record._id ?? fallback);
}

export function qentrahPartnerCompactFields(value: unknown, limit = 5): QentrahPartnerRenderField[] {
  if (!value || typeof value !== "object") return [];
  const record = sanitizeQentrahPartnerPayload(value) as Record<string, unknown>;
  return Object.entries(record)
    .filter(([key, entry]) => !["_creationTime", "createdAt", "updatedAt"].includes(key) && entry !== null && entry !== undefined && typeof entry !== "object")
    .slice(0, limit)
    .map(([key, entry]) => ({ key, value: String(entry) }));
}

export function qentrahPartnerApplyIndexRange<TItem>(items: TItem[], start?: string | number, end?: string | number) {
  const first = Number(start);
  const last = Number(end);
  const startIndex = Number.isFinite(first) && first > 0 ? Math.floor(first) - 1 : 0;
  const endIndex = Number.isFinite(last) && last > 0 ? Math.floor(last) : undefined;
  return items.slice(startIndex, endIndex);
}

export function qentrahPartnerRenderRows(input: {
  data: unknown;
  section: Pick<QentrahPartnerSectionConfig, "label">;
  indexStart?: string | number;
  indexEnd?: string | number;
  fieldLimit?: number;
}): QentrahPartnerRenderRow[] {
  return qentrahPartnerApplyIndexRange(qentrahPartnerDataItems(input.data), input.indexStart, input.indexEnd)
    .map((item, index) => ({
      key: String((item as { id?: unknown })?.id ?? index),
      title: qentrahPartnerDisplayTitle(item, `${input.section.label} ${index + 1}`),
      fields: qentrahPartnerCompactFields(item, input.fieldLimit),
    }));
}

export function qentrahPartnerResponseMessage(value: unknown) {
  if (!value || typeof value !== "object") return summarizeQentrahPartnerPayload(value);
  const record = value as { message?: unknown; error?: unknown };
  return String(record.message ?? record.error ?? summarizeQentrahPartnerPayload(value));
}

export function qentrahPartnerFilterKey(sectionId: QentrahPartnerSectionId) {
  return ["assets", "projects"].includes(sectionId) ? "status" : "type";
}

export function qentrahPartnerFilterPlaceholder(sectionId: QentrahPartnerSectionId) {
  if (sectionId === "clients") return "Buyer, Tenant, Investor";
  if (sectionId === "assets") return "available, reserved, sold";
  if (sectionId === "projects") return "pending, approved";
  return "custom type";
}

export function buildQentrahPartnerResourceSearchParams(sectionId: QentrahPartnerSectionId, filters: QentrahPartnerConsoleFilters = {}) {
  const params = new URLSearchParams();
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.cursor?.trim()) params.set("cursor", filters.cursor.trim());
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.type?.trim()) params.set(qentrahPartnerFilterKey(sectionId), filters.type.trim());
  if (filters.indexStart) params.set("indexStart", String(filters.indexStart));
  if (filters.indexEnd) params.set("indexEnd", String(filters.indexEnd));
  if (filters.startDate) params.set("startAt", String(new Date(filters.startDate).getTime()));
  if (filters.endDate) params.set("endAt", String(new Date(`${filters.endDate}T23:59:59.999`).getTime()));
  if (sectionId === "media") {
    if (filters.resourceType?.trim()) params.set("resourceType", filters.resourceType.trim());
    if (filters.resourceId?.trim()) params.set("resourceId", filters.resourceId.trim());
  }
  return params;
}

export function createQentrahPartnerOperationResult(input: {
  sectionId: QentrahPartnerSectionId;
  operation: QentrahPartnerOperation;
  method: string;
  path: string;
  status: number;
  response: unknown;
  requestSummary: string;
  timestamp?: number;
}): QentrahPartnerOperationResult {
  const ok = input.status >= 200 && input.status < 300;
  return {
    sectionId: input.sectionId,
    operation: input.operation,
    method: input.method,
    path: input.path,
    status: input.status,
    ok,
    timestamp: input.timestamp ?? Date.now(),
    requestSummary: input.requestSummary,
    responseSummary: summarizeQentrahPartnerPayload(input.response),
    error: ok ? undefined : qentrahPartnerResponseMessage(input.response),
    response: sanitizeQentrahPartnerPayload(input.response),
  };
}

export function createQentrahCredentialSnapshot(input: {
  workspaceBaseUrl: string;
  requestedScopes: string[];
  session?: QentrahPartnerHarnessSession | null;
}): QentrahPartnerCredentialSnapshot {
  const session = input.session;
  const expiresIn = session?.expiresIn ?? session?.expires_in;
  const obtainedAt = session?.obtainedAt ?? session?.obtained_at;
  const tokenExpiresAt = expiresIn && obtainedAt ? obtainedAt + expiresIn * 1000 : undefined;
  return {
    connected: Boolean(session?.accessToken ?? session?.access_token),
    organizationId: session?.organizationId ?? session?.organization_id,
    tokenExpiresAt,
    workspaceBaseUrl: input.workspaceBaseUrl,
    resourceAudience: qentrahPartnerResourceAudience(input.workspaceBaseUrl),
    requestedScopes: input.requestedScopes,
    grantedScopes: qentrahGrantedScopesFromTokenSet(session),
  };
}

export function createQentrahPartnerConsoleService(config: QentrahPartnerConsoleServiceConfig) {
  const grantedScopes = config.grantedScopes ?? qentrahGrantedScopesFromTokenSet(config.session);
  return {
    sections: qentrahPartnerSections,
    sectionIds: qentrahPartnerSectionIds,
    findSection: findQentrahPartnerSection,
    credentialSnapshot() {
      return createQentrahCredentialSnapshot({
        workspaceBaseUrl: config.workspaceBaseUrl,
        requestedScopes: config.requestedScopes,
        session: config.session,
      });
    },
    lifecycle() {
      return buildQentrahPartnerOAuthLifecycle({
        workspaceBaseUrl: config.workspaceBaseUrl,
        partnerAppUrl: config.partnerAppUrl,
        redirectUri: config.redirectUri,
        requestedScopes: config.requestedScopes,
      });
    },
    missingScopes(sectionId: QentrahPartnerSectionId) {
      return qentrahMissingScopes(findQentrahPartnerSection(sectionId).requiredScopes, grantedScopes);
    },
    canRun(sectionId: QentrahPartnerSectionId) {
      return qentrahSectionCanRun(findQentrahPartnerSection(sectionId), grantedScopes);
    },
    needsReauthorization() {
      return grantedScopes.length > 0 && qentrahScopesNeedReauthorization(config.requestedScopes, grantedScopes);
    },
    searchParams(sectionId: QentrahPartnerSectionId, filters: QentrahPartnerConsoleFilters = {}) {
      return buildQentrahPartnerResourceSearchParams(sectionId, filters);
    },
    renderRows(data: unknown, sectionId: QentrahPartnerSectionId, filters: QentrahPartnerConsoleFilters = {}) {
      return qentrahPartnerRenderRows({
        data,
        section: findQentrahPartnerSection(sectionId),
        indexStart: filters.indexStart,
        indexEnd: filters.indexEnd,
      });
    },
    responseMessage: qentrahPartnerResponseMessage,
    result: createQentrahPartnerOperationResult,
    sanitize: sanitizeQentrahPartnerPayload,
    summarize: summarizeQentrahPartnerPayload,
    async runResourceOperation(input: Omit<QentrahPartnerResourceOperationInput, "workspaceBaseUrl" | "session" | "fetcher" | "grantedScopes">) {
      return runQentrahPartnerResourceOperation({
        ...input,
        workspaceBaseUrl: config.workspaceBaseUrl,
        session: config.session,
        fetcher: config.fetcher,
        grantedScopes,
      });
    },
  };
}

export function buildQentrahPartnerOAuthLifecycle(input: {
  workspaceBaseUrl: string;
  partnerAppUrl?: string;
  redirectUri: string;
  requestedScopes: string[];
}) {
  const authorizeUrl = new URL("/oauth/authorize", input.workspaceBaseUrl).toString();
  return {
    title: "See the full authorization code + PKCE path.",
    badge: "No implicit flow",
    phases: [
      ["Authorize request", "The browser starts authorization through the partner backend with state and S256 PKCE."],
      ["Workspace consent", "The user chooses an organization and reviews requested service scopes."],
      ["Callback validation", "The partner backend validates state, reads the verifier, and receives the authorization code."],
      ["Token exchange", "The backend exchanges code plus verifier for tokens. Tokens never touch the browser."],
      ["Workspace APIs", "Backend routes call Qentrah using the stored bearer token and partner resource audience."],
    ] as const,
    endpoints: {
      authorize: authorizeUrl,
      callback: input.redirectUri,
      token: qentrahPartnerTokenEndpoint(input.workspaceBaseUrl),
      resource: qentrahPartnerResourceAudience(input.workspaceBaseUrl),
      partnerApp: input.partnerAppUrl,
    },
    requestedScopes: input.requestedScopes,
  };
}

function accessTokenFromSession(session: QentrahPartnerHarnessSession | null | undefined) {
  return session?.accessToken ?? session?.access_token ?? "";
}

function organizationIdFromSession(session: QentrahPartnerHarnessSession | null | undefined) {
  return session?.organizationId ?? session?.organization_id ?? "";
}

function failureResult(input: {
  sectionId: QentrahPartnerSectionId;
  operation: QentrahPartnerOperation;
  method: string;
  path: string;
  status: number;
  error: string;
  response?: unknown;
  request?: unknown;
}): QentrahPartnerOperationResult {
  return {
    sectionId: input.sectionId,
    operation: input.operation,
    method: input.method,
    path: input.path,
    status: input.status,
    ok: false,
    timestamp: Date.now(),
    requestSummary: summarizeQentrahPartnerPayload(input.request ?? input.path),
    responseSummary: summarizeQentrahPartnerPayload(input.response ?? input.error),
    error: input.error,
    response: sanitizeQentrahPartnerPayload(input.response),
  };
}

export async function runQentrahPartnerResourceOperation(input: QentrahPartnerResourceOperationInput): Promise<QentrahPartnerOperationResult> {
  const operation = input.operation ?? "read";
  const method = operation === "read" ? "GET" : operation === "update" ? "PATCH" : operation === "delete" ? "DELETE" : "POST";
  const accessToken = accessTokenFromSession(input.session);
  const organizationId = organizationIdFromSession(input.session);
  const requiredScopes = input.requiredScopes ?? findQentrahPartnerSection(input.sectionId).requiredScopes;
  const grantedScopes = input.grantedScopes ?? qentrahGrantedScopesFromTokenSet(input.session);
  const missingScopes = qentrahMissingScopes(requiredScopes, grantedScopes);

  if (!accessToken) {
    return failureResult({ sectionId: input.sectionId, operation, method, path: input.path, status: 401, error: "missing_bearer" });
  }
  if (!organizationId) {
    return failureResult({ sectionId: input.sectionId, operation, method, path: input.path, status: 400, error: "missing_organization_id" });
  }
  if (missingScopes.length > 0) {
    return failureResult({
      sectionId: input.sectionId,
      operation,
      method,
      path: input.path,
      status: 403,
      error: "missing_scope",
      response: { missingScopes },
    });
  }

  try {
    const client = createQentrahServiceAppClient({
      workspaceBaseUrl: input.workspaceBaseUrl,
      accessToken,
      fetcher: input.fetcher,
    });
    let response: unknown;
    if (operation === "read") {
      if (!input.resource) throw new Error("resource is required for read operations.");
      response = input.resource === "organization"
        ? await client.me({ organizationId })
        : await client.list({ organizationId, resource: input.resource, options: input.options });
    } else {
      if (input.resource !== "client") throw new Error("Only client write operations are supported.");
      if (operation === "create") response = await client.createClient({ organizationId, input: input.input ?? {} });
      if (operation === "update") response = await client.updateClient({ organizationId, clientId: String(input.input?.id ?? ""), input: input.input ?? {} });
      if (operation === "delete") response = await client.deleteClient({ organizationId, clientId: String(input.input?.id ?? "") });
    }
    return {
      sectionId: input.sectionId,
      operation,
      method,
      path: input.path,
      status: 200,
      ok: true,
      timestamp: Date.now(),
      requestSummary: summarizeQentrahPartnerPayload(input.input ?? input.options ?? input.path),
      responseSummary: summarizeQentrahPartnerPayload(response),
      response: sanitizeQentrahPartnerPayload(response),
    };
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error && typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : 500;
    const message = error instanceof Error ? error.message : "workspace_api_error";
    return failureResult({ sectionId: input.sectionId, operation, method, path: input.path, status, error: message });
  }
}
