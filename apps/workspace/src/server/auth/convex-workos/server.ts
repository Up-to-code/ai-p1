import { fetchAction, fetchMutation, fetchQuery, preloadQuery } from "convex/nextjs";
import type { Preloaded } from "convex/react";
import type { ArgsAndOptions, FunctionReference, FunctionReturnType } from "convex/server";
import { AsyncLocalStorage } from "node:async_hooks";
import { authTokenOptions, resolveConvexAuthToken } from "./token";

const isConvexAuthError = authTokenOptions.jwtCache.isAuthError as (error: unknown) => boolean;

const authHeadersStorage = new AsyncLocalStorage<Headers>();

type OptionalArgs<FuncRef extends FunctionReference<"query" | "mutation" | "action">> =
  FuncRef["_args"] extends Record<string, never>
    ? [args?: FuncRef["_args"]]
    : [args: FuncRef["_args"]];

function authArgs<FuncRef extends FunctionReference<"query" | "mutation" | "action">>(
  args: OptionalArgs<FuncRef>,
  token?: string,
): ArgsAndOptions<FuncRef, { token?: string }> {
  return [args[0], { token }] as ArgsAndOptions<FuncRef, { token?: string }>;
}

async function currentRequestHeaders() {
  const honoHeaders = authHeadersStorage.getStore();
  if (honoHeaders) return new Headers(honoHeaders);

  const { headers } = await import("next/headers");
  return new Headers(await headers());
}

async function getTokenFromHeaders(headers: Headers, options?: { forceRefresh?: boolean }) {
  return resolveConvexAuthToken(headers, undefined, options);
}

async function getRequestToken(options?: { forceRefresh?: boolean }) {
  return getTokenFromHeaders(await currentRequestHeaders(), options);
}

async function callWithRequestToken<
  FnType extends "query" | "mutation" | "action",
  Fn extends FunctionReference<FnType>,
>(fn: (token?: string) => Promise<FunctionReturnType<Fn>>) {
  const token = await getRequestToken();
  try {
    return await fn(token);
  } catch (error) {
    if (!isConvexAuthError(error)) throw error;
    const freshToken = await getRequestToken({ forceRefresh: true });
    return fn(freshToken);
  }
}

export function runWithAuthHeaders<T>(headers: Headers, operation: () => T | Promise<T>) {
  return authHeadersStorage.run(new Headers(headers), operation);
}

export async function isAuthenticated() {
  return Boolean(await getRequestToken().catch(() => undefined));
}

export const handler = {
  GET: async () => Response.json({ error: "Legacy auth endpoint has been removed. Use WorkOS AuthKit." }, { status: 410 }),
  POST: async () => Response.json({ error: "Legacy auth endpoint has been removed. Use WorkOS AuthKit." }, { status: 410 }),
};

export const getToken = () => getRequestToken();

export async function preloadAuthQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: OptionalArgs<Query>
): Promise<Preloaded<Query>> {
  return callWithRequestToken<"query", Query>((token) => preloadQuery(query, ...authArgs<Query>(args, token)));
}

export async function fetchAuthQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: OptionalArgs<Query>
): Promise<FunctionReturnType<Query>> {
  return callWithRequestToken<"query", Query>((token) => fetchQuery(query, ...authArgs<Query>(args, token)));
}

export async function fetchAuthMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  ...args: OptionalArgs<Mutation>
): Promise<FunctionReturnType<Mutation>> {
  return callWithRequestToken<"mutation", Mutation>((token) => fetchMutation(mutation, ...authArgs<Mutation>(args, token)));
}

export async function fetchAuthAction<Action extends FunctionReference<"action">>(
  action: Action,
  ...args: OptionalArgs<Action>
): Promise<FunctionReturnType<Action>> {
  return callWithRequestToken<"action", Action>((token) => fetchAction(action, ...authArgs<Action>(args, token)));
}
