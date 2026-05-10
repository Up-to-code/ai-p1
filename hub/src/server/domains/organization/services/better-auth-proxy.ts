import type { Context } from "hono";
import { OrganizationActionError } from "../errors/action-error";

export type BetterAuthSession = {
  session?: {
    userId?: string;
    activeOrganizationId?: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
};

function authUrl(c: Context, path: string) {
  return new URL(`/api/auth${path}`, c.req.url).toString();
}

function authHeaders(c: Context, contentType = false) {
  const headers = new Headers();
  const origin = new URL(c.req.url).origin;
  const cookie = c.req.header("cookie");
  headers.set("origin", origin);
  if (cookie) {
    headers.set("cookie", cookie);
  }
  if (contentType) {
    headers.set("content-type", "application/json");
  }
  return headers;
}

async function readAuthResponse<T>(response: Response, fallback: string): Promise<T> {
  const payload = await response.json().catch(() => null) as
    | { error?: { message?: string; code?: string }; message?: string; code?: string }
    | T
    | null;

  if (!response.ok) {
    const maybeError = payload as { error?: { message?: string; code?: string }; message?: string; code?: string } | null;
    throw new OrganizationActionError(
      maybeError?.error?.message ?? maybeError?.message ?? maybeError?.error?.code ?? maybeError?.code ?? fallback,
      response.status,
    );
  }

  return payload as T;
}

export async function getBetterAuthSession(c: Context) {
  const response = await fetch(authUrl(c, "/get-session"), {
    method: "GET",
    headers: authHeaders(c),
  });

  const session = await readAuthResponse<BetterAuthSession | null>(
    response,
    "Session could not be loaded.",
  );

  if (!session?.user?.id) {
    throw new OrganizationActionError("You must be signed in.", 401);
  }

  return session;
}

export async function callBetterAuth<T>(
  c: Context,
  path: string,
  input: {
    method?: "GET" | "POST";
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    fallback: string;
  },
) {
  const url = new URL(authUrl(c, path));
  Object.entries(input.query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    method: input.method ?? (input.body === undefined ? "GET" : "POST"),
    headers: authHeaders(c, input.body !== undefined),
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
  });

  return readAuthResponse<T>(response, input.fallback);
}
