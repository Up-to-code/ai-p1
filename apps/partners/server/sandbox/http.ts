import { sha256 } from "./crypto";
import type { SandboxAction, SandboxResource } from "./resources";
import { sandboxStore } from "./store";

export type SandboxAccess = {
  ok: true;
  partnerAuthSubject: string;
  partnerAppId: string;
  organizationId: string;
  clientId: string;
  scopes: string[];
  appName?: string;
};

export function formValue(body: URLSearchParams, key: string) {
  return body.get(key)?.trim() ?? "";
}

export function scopesFrom(value: string) {
  return value.split(/\s+/u).map((scope) => scope.trim()).filter(Boolean);
}

export function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

export function oauthError(error: string, status = 400, description?: string) {
  return json({ error, ...(description ? { error_description: description } : {}) }, { status });
}

export async function optionalJson(request: Request) {
  const text = await request.text();
  if (!text.trim()) return {};
  return JSON.parse(text) as unknown;
}

export function bearerToken(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.has("access_token") || url.searchParams.has("token")) {
    throw new Response(JSON.stringify({ error: "Bearer tokens must use the Authorization header." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new Response(JSON.stringify({ error: "missing_bearer" }), {
      status: 401,
      headers: { "content-type": "application/json", "www-authenticate": "Bearer" },
    });
  }
  return match[1].trim();
}

export async function requireSandboxAccess(
  request: Request,
  organizationId: string,
  resource: SandboxResource,
  action: SandboxAction,
) {
  const token = bearerToken(request);
  const validation = await sandboxStore.validateAccess({
    accessTokenHash: sha256(token),
    organizationId,
    resource,
    action,
  });

  if (!validation.ok) {
    throw new Response(JSON.stringify({ error: validation.reason ?? "sandbox_access_denied" }), {
      status: validation.reason === "scope_denied" ? 403 : 401,
      headers: { "content-type": "application/json" },
    });
  }
  return validation;
}

export async function recordLog(input: {
  access?: SandboxAccess;
  request: Request;
  status: number;
  startedAt: number;
  input?: unknown;
  response?: unknown;
  error?: string;
}) {
  await sandboxStore.recordRequestLog({
    partnerAuthSubject: input.access?.partnerAuthSubject,
    partnerAppId: input.access?.partnerAppId,
    organizationId: input.access?.organizationId,
    method: input.request.method,
    path: new URL(input.request.url).pathname,
    status: input.status,
    latencyMs: Date.now() - input.startedAt,
    scopes: input.access?.scopes ?? [],
    input: input.input,
    response: input.response,
    error: input.error,
  }).catch(() => null);
}
