import { organizationResourcePath } from "./routing";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.error ?? fallbackMessage);
  }
  if (payload && "error" in payload && Object.keys(payload).length === 1) {
    throw new Error(payload.error ?? fallbackMessage);
  }
  return payload as T;
}

export async function workspaceFetch<T>(
  organizationId: string,
  path: string,
  options: { method: HttpMethod; body?: unknown; fallbackMessage: string },
): Promise<T> {
  const response = await fetch(organizationResourcePath(organizationId, path), {
    method: options.method,
    headers: options.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  return parseJsonResponse<T>(response, options.fallbackMessage);
}

export async function workspaceMutation<T>(
  organizationId: string,
  path: string,
  options: { method: "POST" | "PATCH" | "DELETE"; body?: unknown; fallbackMessage: string },
) {
  return workspaceFetch<T>(organizationId, path, options);
}
