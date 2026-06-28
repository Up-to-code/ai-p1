"use client";

import { workspaceFetch, organizationApiPath } from "@/domains/resources/workspace-resource-request";

export type OrganizationApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

export { organizationApiPath };

/**
 * @deprecated Prefer `workspaceFetch` for new code.
 *   Migrate existing call sites to `workspaceFetch` directly.
 */
export async function readOrganizationJsonResponse<T>(response: Response, fallback: string): Promise<T> {
  const payload = await response.json().catch(() => ({ error: fallback })) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? fallback);
  }
  if ("error" in payload && Object.keys(payload).length === 1) {
    throw new Error(payload.error ?? fallback);
  }
  return payload as T;
}

/**
 * @deprecated Use `workspaceFetch` or `workspaceMutation` instead.
 *   This wrapper exists only for backward compatibility.
 */
export async function requestOrganizationAction<T>(
  url: string,
  method: OrganizationApiMethod,
  body: unknown,
  fallback: string,
  _fetcher: typeof fetch = fetch,
) {
  // Extract organizationId and path segments from the full URL
  // URL format: /api/v1/organizations/:id/:segments...
  const match = url.match(/^\/api\/v1\/organizations\/([^/]+)(?:\/(.+))?$/);
  if (!match) {
    throw new Error(`Invalid organization API URL: ${url}`);
  }
  const [, organizationId, rest = ""] = match;
  return workspaceFetch<T>(organizationId, rest, { method, body, fallbackMessage: fallback });
}
