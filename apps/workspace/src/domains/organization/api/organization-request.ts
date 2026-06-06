"use client";

export type OrganizationApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

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

export function organizationApiPath(organizationId: string, ...segments: string[]) {
  const encoded = [organizationId, ...segments].map((segment) => encodeURIComponent(segment));
  return `/api/v1/organizations/${encoded.join("/")}`;
}

export async function requestOrganizationAction<T>(
  url: string,
  method: OrganizationApiMethod,
  body: unknown,
  fallback: string,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return readOrganizationJsonResponse<T>(response, fallback);
}
