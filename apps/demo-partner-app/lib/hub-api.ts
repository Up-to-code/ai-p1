import { demoConfig } from "./config";
import type { TokenSession } from "./session";

export type HubApiErrorCode =
  | "missing_bearer"
  | "wrong_organization"
  | "app_not_approved"
  | "connection_not_found"
  | "connection_expired"
  | "scope_denied"
  | "hub_api_error";

export class HubApiError extends Error {
  constructor(
    message: string,
    public readonly code: HubApiErrorCode,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function parseHubError(response: Response) {
  const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null;
  const code = (payload?.error ?? "hub_api_error") as HubApiErrorCode;
  return new HubApiError(payload?.message ?? code, code, response.status);
}

async function hubFetch<T>(path: string, session: TokenSession, init?: RequestInit, fetcher: typeof fetch = fetch) {
  if (!session.organizationId) throw new HubApiError("Organization id is missing from this demo session.", "hub_api_error", 400);
  const config = demoConfig();
  const response = await fetcher(new URL(path, config.hubBaseUrl), {
    ...init,
    headers: {
      authorization: `Bearer ${session.access_token}`,
      "content-type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) throw await parseHubError(response);
  return response.json() as Promise<T>;
}

export function mePath(organizationId: string) {
  return `/api/v1/partner/organizations/${organizationId}/me`;
}

export function clientsPath(organizationId: string) {
  return `/api/v1/partner/organizations/${organizationId}/clients`;
}

export function clientPath(organizationId: string, clientId: string) {
  return `/api/v1/partner/organizations/${organizationId}/clients/${clientId}`;
}

export function propertiesPath(organizationId: string) {
  return `/api/v1/partner/organizations/${organizationId}/properties`;
}

export function loadAnanMe(session: TokenSession, fetcher?: typeof fetch) {
  return hubFetch<Record<string, unknown>>(mePath(session.organizationId ?? ""), session, undefined, fetcher);
}

export function loadAnanClients(session: TokenSession, fetcher?: typeof fetch) {
  return hubFetch<Record<string, unknown>>(clientsPath(session.organizationId ?? ""), session, undefined, fetcher);
}

export function loadAnanProperties(session: TokenSession, fetcher?: typeof fetch) {
  return hubFetch<Record<string, unknown>>(propertiesPath(session.organizationId ?? ""), session, undefined, fetcher);
}

export function createAnanClient(session: TokenSession, input: unknown, fetcher?: typeof fetch) {
  return hubFetch<Record<string, unknown>>(clientsPath(session.organizationId ?? ""), session, {
    method: "POST",
    body: JSON.stringify(input),
  }, fetcher);
}

export function updateAnanClient(session: TokenSession, clientId: string, input: unknown, fetcher?: typeof fetch) {
  return hubFetch<Record<string, unknown>>(clientPath(session.organizationId ?? "", clientId), session, {
    method: "PATCH",
    body: JSON.stringify(input),
  }, fetcher);
}
