import { AsyncLocalStorage } from "node:async_hooks";
import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import type { ArgsAndOptions, FunctionReference, FunctionReturnType } from "convex/server";
import { getToken as getBetterAuthToken } from "@convex-dev/better-auth/utils";
import {
  fetchAuthAction as nextFetchAuthAction,
  fetchAuthMutation as nextFetchAuthMutation,
  fetchAuthQuery as nextFetchAuthQuery,
  getToken as nextGetToken,
  isAuthenticated as nextIsAuthenticated,
} from "./nextjs-auth-adapter";

export type AuthRequestSession = {
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

type OptionalArgs<FuncRef extends FunctionReference<"query" | "mutation" | "action">> =
  FuncRef["_args"] extends Record<string, never>
    ? [args?: FuncRef["_args"]]
    : [args: FuncRef["_args"]];

const requestStore = new AsyncLocalStorage<Request>();

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL!;
const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function runWithAuthHeaders<T>(headers: Headers, operation: () => T | Promise<T>) {
  const request = new Request("https://qentrah.internal/api/auth-context", { headers });
  return requestStore.run(request, operation);
}

export function getRequestHeaders(): Headers | null {
  return requestStore.getStore()?.headers ?? null;
}

export const authRequestStore = requestStore;

/** Resolve authentication in the current Next.js request context. */
export async function isAuthenticated(): Promise<boolean> {
  return nextIsAuthenticated();
}

function authHeaders() {
  const incoming = getRequestHeaders();
  const headers = new Headers();
  headers.set("content-type", "application/json");
  headers.set("origin", new URL(appBaseUrl).origin);

  if (incoming) {
    const cookie = incoming.get("cookie");
    if (cookie) headers.set("cookie", cookie);
    const authorization = incoming.get("authorization");
    if (authorization) headers.set("authorization", authorization);
    const origin = incoming.get("origin");
    if (origin) headers.set("origin", origin);
    const referer = incoming.get("referer");
    if (referer) headers.set("referer", referer);
  }

  return headers;
}

function tokenArgs<FuncRef extends FunctionReference<"query" | "mutation" | "action">>(
  args: OptionalArgs<FuncRef>,
  token: string | null,
): ArgsAndOptions<FuncRef, { token?: string }> {
  return [
    args[0],
    ...(token ? [{ token }] : []),
  ] as ArgsAndOptions<FuncRef, { token?: string }>;
}

export async function getConvexToken(): Promise<string | null> {
  const incoming = getRequestHeaders();
  if (!incoming) return (await nextGetToken().catch(() => null)) ?? null;

  const headers = new Headers(incoming);
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  headers.set("accept-encoding", "identity");

  const result = await getBetterAuthToken(convexSiteUrl, headers).catch(() => null);
  return result?.token ?? null;
}

export async function fetchAuthenticatedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: OptionalArgs<Query>
): Promise<FunctionReturnType<Query>> {
  if (!getRequestHeaders()) return nextFetchAuthQuery(query, ...args);
  return fetchQuery(query, ...tokenArgs<Query>(args, await getConvexToken()));
}

export async function fetchAuthenticatedMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  ...args: OptionalArgs<Mutation>
): Promise<FunctionReturnType<Mutation>> {
  if (!getRequestHeaders()) return nextFetchAuthMutation(mutation, ...args);
  return fetchMutation(mutation, ...tokenArgs<Mutation>(args, await getConvexToken()));
}

export async function fetchAuthenticatedAction<Action extends FunctionReference<"action">>(
  action: Action,
  ...args: OptionalArgs<Action>
): Promise<FunctionReturnType<Action>> {
  if (!getRequestHeaders()) return nextFetchAuthAction(action, ...args);
  return fetchAction(action, ...tokenArgs<Action>(args, await getConvexToken()));
}

export async function callBetterAuth<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
  } = {},
): Promise<T> {
  const url = new URL(`/api/auth${path}`, appBaseUrl);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    method: options.method ?? (options.body === undefined ? "GET" : "POST"),
    headers: authHeaders(),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    const message = betterAuthErrorMessage(text || res.statusText);
    throw new BetterAuthRequestError(message, res.status);
  }

  return res.json() as Promise<T>;
}

export class BetterAuthRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "BetterAuthRequestError";
  }
}

function betterAuthErrorMessage(value: string) {
  try {
    const parsed = JSON.parse(value) as { message?: unknown; error?: unknown; code?: unknown };
    if (typeof parsed.message === "string") return parsed.message;
    if (typeof parsed.error === "string") return parsed.error;
    if (typeof parsed.code === "string") return parsed.code;
  } catch {
    // Keep the raw response body below.
  }

  return value;
}

export async function getAuthRequestSession(): Promise<AuthRequestSession> {
  try {
    return await callBetterAuth<AuthRequestSession>("/get-session", { method: "GET" });
  } catch {
    return {};
  }
}

export async function getSessionUserId(): Promise<string | null> {
  const session = await getAuthRequestSession();
  return session.session?.userId ?? null;
}

// Concise names are part of the public server-auth Interface. The descriptive
// implementations above keep their behavior explicit inside this Module.
export {
  fetchAuthenticatedAction as fetchAuthAction,
  fetchAuthenticatedMutation as fetchAuthMutation,
  fetchAuthenticatedQuery as fetchAuthQuery,
};
