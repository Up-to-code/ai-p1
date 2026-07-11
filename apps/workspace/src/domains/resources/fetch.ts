import { organizationApiPath, organizationResourcePath } from "./routing";
import { logger } from "@/lib/logger";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";
type WorkspacePath = string | readonly string[];

const resourceLogger = logger.withModule('resources');

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const text = await response.text();
  let payload: { error?: string } | null = null;
  try {
    payload = JSON.parse(text) as { error?: string } | null;
  } catch {
    resourceLogger.error('parseJsonResponse: invalid JSON', {
      status: response.status,
      ok: response.ok,
      body: text.slice(0, 500),
    });
  }
  if (!response.ok) {
    throw new Error(payload?.error ?? fallbackMessage);
  }
  if (payload && "error" in payload && Object.keys(payload).length === 1) {
    throw new Error(payload.error ?? fallbackMessage);
  }
  if (payload === null) {
    throw new Error(`Server returned empty response (${response.status}).`);
  }
  return payload as T;
}

export async function workspaceFetch<T>(
  organizationId: string,
  path: WorkspacePath,
  options: { method: HttpMethod; body?: unknown; fallbackMessage: string },
): Promise<T> {
  const url = typeof path === "string"
    ? organizationResourcePath(organizationId, path)
    : organizationApiPath(organizationId, ...path);
  const response = await fetch(url, {
    method: options.method,
    headers: options.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  return parseJsonResponse<T>(response, options.fallbackMessage);
}

export async function workspaceMutation<T>(
  organizationId: string,
  path: WorkspacePath,
  options: { method: "POST" | "PATCH" | "DELETE"; body?: unknown; fallbackMessage: string },
) {
  return workspaceFetch<T>(organizationId, path, options);
}
