import { AsyncLocalStorage } from "node:async_hooks";
import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import type { ArgsAndOptions, FunctionReference, FunctionReturnType } from "convex/server";
import { getToken as getBetterAuthToken } from "@convex-dev/better-auth/utils";
import { resolveAuthTopology } from "@qentrah/auth/config";
import { readAuthCredential } from "@qentrah/auth/credentials";
import {
  AuthHttpRequestError,
  createAuthHttpClient,
  type AuthHttpRequestOptions,
} from "@qentrah/auth/http";
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

export type AuthRequestContext = Readonly<{ headers: Headers }>;

const requestStore = new AsyncLocalStorage<AuthRequestContext>();

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL!;
const authTopology = resolveAuthTopology();
const authHttp = createAuthHttpClient({
  baseUrl: authTopology.authIssuer,
  fetch: (...args) => globalThis.fetch(...args),
  credentialProvider: () => {
    const headers = getRequestHeaders();
    return headers ? readAuthCredential(headers) : null;
  },
});

function isLoopbackHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/gu, "");
  return normalized === "localhost"
    || normalized === "::1"
    || normalized === "0.0.0.0"
    || normalized.startsWith("127.");
}

/**
 * Next may select a different local port when the configured one is occupied.
 * In development, keep server-side Better Auth calls on the same trusted
 * loopback origin as the browser request instead of silently calling another
 * local application. Production always uses the canonical configured issuer.
 */
function requestScopedAuthIssuer() {
  if (process.env.NODE_ENV === "production") return authTopology.authIssuer;

  const incoming = getRequestHeaders();
  for (const candidate of [incoming?.get("origin"), incoming?.get("referer")]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (isLoopbackHostname(url.hostname)) return `${url.origin}/api/auth`;
    } catch {
      // Ignore malformed ambient headers and retain the configured issuer.
    }
  }

  return authTopology.authIssuer;
}

function requestScopedAuthHttp() {
  const issuer = requestScopedAuthIssuer();
  if (issuer === authTopology.authIssuer) return authHttp;
  return createAuthHttpClient({
    baseUrl: issuer,
    fetch: (...args) => globalThis.fetch(...args),
    credentialProvider: () => {
      const headers = getRequestHeaders();
      return headers ? readAuthCredential(headers) : null;
    },
  });
}

export function runWithAuthHeaders<T>(headers: Headers, operation: () => T | Promise<T>) {
  return requestStore.run({ headers: new Headers(headers) }, operation);
}

export function getRequestHeaders(): Headers | null {
  const headers = requestStore.getStore()?.headers;
  return headers ? new Headers(headers) : null;
}

export const authRequestStore = requestStore;

/** Resolve authentication in the current Next.js request context. */
export async function isAuthenticated(): Promise<boolean> {
  return nextIsAuthenticated();
}

function requestOriginHeaders() {
  const incoming = getRequestHeaders();
  const headers = new Headers();
  headers.set("origin", authTopology.workspaceOrigin);

  if (incoming) {
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
  options: AuthHttpRequestOptions = {},
): Promise<T> {
  return requestScopedAuthHttp().request<T>(path, {
    ...options,
    headers: new Headers([
      ...requestOriginHeaders().entries(),
      ...new Headers(options.headers).entries(),
    ]),
    // Better Auth endpoint-specific normalization remains owned by the
    // organization/session Adapter that requested this typed result.
    parse: (value) => value as T,
  });
}

export { AuthHttpRequestError, AuthHttpRequestError as BetterAuthRequestError };

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
