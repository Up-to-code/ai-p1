import { normalizeQentrahBaseUrl } from "../core.js";

export type QentrahPartnerResource = "organization" | "client" | "asset" | "project" | "calendar" | "task" | "media";
export type QentrahPartnerAction = "read" | "create" | "update" | "delete";
export type QentrahPartnerResourceRequestOptions = {
  limit?: number;
  cursor?: string;
  search?: string;
  type?: string;
  status?: string;
  startAt?: number;
  endAt?: number;
  indexStart?: number;
  indexEnd?: number;
  resourceType?: string;
  resourceId?: string;
};

export type QentrahServiceAppClientOptions = {
  workspaceBaseUrl: string;
  accessToken: string;
  fetcher?: typeof fetch;
};

type JsonInput = Record<string, unknown>;

export class QentrahServiceAppRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code = "workspace_api_error",
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "QentrahServiceAppRequestError";
  }
}

async function parseJsonResponse(response: Response) {
  const payload = await response.json().catch(() => null) as unknown;
  if (!response.ok) {
    const errorPayload = payload && typeof payload === "object" ? payload as { error?: unknown; message?: unknown } : null;
    const code = errorPayload?.error ? String(errorPayload.error) : "workspace_api_error";
    const message = errorPayload?.message
      ? String(errorPayload.message)
      : errorPayload?.error
        ? String(errorPayload.error)
        : `Qentrah partner API request failed with ${response.status}.`;
    throw new QentrahServiceAppRequestError(message, response.status, code, payload);
  }
  return payload;
}

function partnerApiUrl(workspaceBaseUrl: string, organizationId: string, path = "") {
  return new URL(`/api/v1/partner/organizations/${encodeURIComponent(organizationId)}${path}`, normalizeQentrahBaseUrl(workspaceBaseUrl)).toString();
}

function collectionQuery(options: QentrahPartnerResourceRequestOptions = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.set("limit", String(Math.max(1, Math.min(100, Math.floor(options.limit)))));
  if (options.cursor) params.set("cursor", options.cursor);
  if (options.search) params.set("search", options.search);
  if (options.type) params.set("type", options.type);
  if (options.status) params.set("status", options.status);
  if (options.startAt) params.set("startAt", String(Math.floor(options.startAt)));
  if (options.endAt) params.set("endAt", String(Math.floor(options.endAt)));
  if (options.indexStart) params.set("indexStart", String(Math.max(1, Math.floor(options.indexStart))));
  if (options.indexEnd) params.set("indexEnd", String(Math.max(1, Math.floor(options.indexEnd))));
  if (options.resourceType) params.set("resourceType", options.resourceType);
  if (options.resourceId) params.set("resourceId", options.resourceId);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function collectionPath(resource: QentrahPartnerResource) {
  if (resource === "organization") return "/me";
  if (resource === "asset") return "/assets";
  if (resource === "calendar") return "/calendar";
  if (resource === "media") return "/media";
  return `/${resource}s`;
}

function requireClientId(clientId: string) {
  const trimmed = clientId.trim();
  if (!trimmed) throw new QentrahServiceAppRequestError("clientId is required.", 400, "missing_client_id");
  return trimmed;
}

async function restRequest(input: {
  fetcher: typeof fetch;
  workspaceBaseUrl: string;
  organizationId: string;
  accessToken: string;
  path: string;
  method?: string;
  body?: unknown;
}) {
  const response = await input.fetcher(partnerApiUrl(input.workspaceBaseUrl, input.organizationId, input.path), {
    method: input.method ?? "GET",
    headers: {
      authorization: `Bearer ${input.accessToken}`,
      "content-type": "application/json",
    },
    ...(input.body === undefined ? {} : { body: JSON.stringify(input.body) }),
  });
  return parseJsonResponse(response);
}

export function createQentrahServiceAppClient(options: QentrahServiceAppClientOptions) {
  const fetcher = options.fetcher ?? fetch;
  const baseHeaders = {
    authorization: `Bearer ${options.accessToken}`,
    "content-type": "application/json",
  };
  const listResource = (input: {
    organizationId: string;
    resource: Exclude<QentrahPartnerResource, "organization">;
    options?: QentrahPartnerResourceRequestOptions;
  }) => restRequest({
    fetcher,
    workspaceBaseUrl: options.workspaceBaseUrl,
    organizationId: input.organizationId,
    accessToken: options.accessToken,
    path: `${collectionPath(input.resource)}${collectionQuery(input.options)}`,
  });

  return {
    async me(input: { organizationId: string }) {
      return restRequest({
        fetcher,
        workspaceBaseUrl: options.workspaceBaseUrl,
        organizationId: input.organizationId,
        accessToken: options.accessToken,
        path: "/me",
      });
    },
    async list(input: {
      organizationId: string;
      resource: Exclude<QentrahPartnerResource, "organization">;
      options?: QentrahPartnerResourceRequestOptions;
    }) {
      return listResource(input);
    },
    async listClients(input: { organizationId: string; options?: QentrahPartnerResourceRequestOptions }) {
      return listResource({ organizationId: input.organizationId, resource: "client", options: input.options });
    },
    async listAssets(input: { organizationId: string; options?: QentrahPartnerResourceRequestOptions }) {
      return listResource({ organizationId: input.organizationId, resource: "asset", options: input.options });
    },
    async listProjects(input: { organizationId: string; options?: QentrahPartnerResourceRequestOptions }) {
      return listResource({ organizationId: input.organizationId, resource: "project", options: input.options });
    },
    async listTasks(input: { organizationId: string; options?: QentrahPartnerResourceRequestOptions }) {
      return listResource({ organizationId: input.organizationId, resource: "task", options: input.options });
    },
    async listCalendar(input: { organizationId: string; options?: QentrahPartnerResourceRequestOptions }) {
      return listResource({ organizationId: input.organizationId, resource: "calendar", options: input.options });
    },
    async listMedia(input: { organizationId: string; options?: QentrahPartnerResourceRequestOptions }) {
      return listResource({ organizationId: input.organizationId, resource: "media", options: input.options });
    },
    async createClient(input: { organizationId: string; input?: JsonInput }) {
      return restRequest({
        fetcher,
        workspaceBaseUrl: options.workspaceBaseUrl,
        organizationId: input.organizationId,
        accessToken: options.accessToken,
        path: "/clients",
        method: "POST",
        body: input.input ?? {},
      });
    },
    async updateClient(input: { organizationId: string; clientId: string; input?: JsonInput }) {
      return restRequest({
        fetcher,
        workspaceBaseUrl: options.workspaceBaseUrl,
        organizationId: input.organizationId,
        accessToken: options.accessToken,
        path: `/clients/${encodeURIComponent(requireClientId(input.clientId))}`,
        method: "PATCH",
        body: input.input ?? {},
      });
    },
    async deleteClient(input: { organizationId: string; clientId: string }) {
      return restRequest({
        fetcher,
        workspaceBaseUrl: options.workspaceBaseUrl,
        organizationId: input.organizationId,
        accessToken: options.accessToken,
        path: `/clients/${encodeURIComponent(requireClientId(input.clientId))}`,
        method: "DELETE",
      });
    },
    async read(input: { organizationId: string; resource: QentrahPartnerResource; input?: JsonInput }) {
      const response = await fetcher(partnerApiUrl(options.workspaceBaseUrl, input.organizationId, `/resources/${input.resource}/read`), {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({ action: "read", input: input.input ?? {} }),
      });
      return parseJsonResponse(response);
    },
    async write(input: {
      organizationId: string;
      resource: "client";
      action: Exclude<QentrahPartnerAction, "read">;
      input?: JsonInput;
      idempotencyKey?: string;
    }) {
      const response = await fetcher(partnerApiUrl(options.workspaceBaseUrl, input.organizationId, `/resources/${input.resource}/${input.action}`), {
        method: "POST",
        headers: {
          ...baseHeaders,
          ...(input.idempotencyKey ? { "idempotency-key": input.idempotencyKey } : {}),
        },
        body: JSON.stringify({ input: input.input ?? {} }),
      });
      return parseJsonResponse(response);
    },
    async sendWebhook(input: {
      organizationId: string;
      eventType: string;
      eventId: string;
      data: unknown;
      idempotencyKey?: string;
    }) {
      const response = await fetcher(partnerApiUrl(options.workspaceBaseUrl, input.organizationId, "/webhooks/inbound"), {
        method: "POST",
        headers: {
          ...baseHeaders,
          ...(input.idempotencyKey ? { "idempotency-key": input.idempotencyKey } : {}),
        },
        body: JSON.stringify({
          eventId: input.eventId,
          eventType: input.eventType,
          occurredAt: Date.now(),
          idempotencyKey: input.idempotencyKey,
          data: input.data,
        }),
      });
      return parseJsonResponse(response);
    },
  };
}
