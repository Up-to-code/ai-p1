import { normalizeQentrahBaseUrl } from "../core.js";

export type QentrahPartnerResource = "organization" | "client" | "property" | "project" | "calendar" | "task" | "media";
export type QentrahPartnerAction = "read" | "create" | "update" | "delete";

export type QentrahServiceAppClientOptions = {
  workspaceBaseUrl: string;
  accessToken: string;
  fetcher?: typeof fetch;
};

type JsonInput = Record<string, unknown>;

async function parseJsonResponse(response: Response) {
  const payload = await response.json().catch(() => null) as unknown;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload
      ? String((payload as { error?: unknown }).error)
      : `Qentrah partner API request failed with ${response.status}.`;
    throw new Error(message);
  }
  return payload;
}

function partnerApiUrl(workspaceBaseUrl: string, organizationId: string, path = "") {
  return new URL(`/api/v1/partner/organizations/${encodeURIComponent(organizationId)}${path}`, normalizeQentrahBaseUrl(workspaceBaseUrl)).toString();
}

export function createQentrahServiceAppClient(options: QentrahServiceAppClientOptions) {
  const fetcher = options.fetcher ?? fetch;
  const baseHeaders = {
    authorization: `Bearer ${options.accessToken}`,
    "content-type": "application/json",
  };

  return {
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
