import { AsyncLocalStorage } from "node:async_hooks";
import { fetchAction, fetchMutation, fetchQuery, preloadQuery } from "convex/nextjs";
import type { Preloaded } from "convex/react";
import type { ArgsAndOptions, FunctionReference, FunctionReturnType } from "convex/server";
import { auth, getAuth } from "@clerk/nextjs/server";

type OptionalArgs<FuncRef extends FunctionReference<"query" | "mutation" | "action">> =
  FuncRef["_args"] extends Record<string, never>
    ? [args?: FuncRef["_args"]]
    : [args: FuncRef["_args"]];

function clerkArgs<FuncRef extends FunctionReference<"query" | "mutation" | "action">>(
  args: OptionalArgs<FuncRef>,
  token: string | null,
): ArgsAndOptions<FuncRef, { token?: string }> {
  return [
    args[0],
    ...(token ? [{ token }] : []),
  ] as ArgsAndOptions<FuncRef, { token?: string }>;
}

const authRequestStore = new AsyncLocalStorage<Request>();

export function runWithAuthHeaders<T>(headers: Headers, operation: () => T | Promise<T>) {
  const request = new Request("https://qentrah.internal/api/auth-context", { headers });
  return authRequestStore.run(request, operation);
}

async function getRequestAuth() {
  const request = authRequestStore.getStore();
  if (request) {
    return getAuth(request as never, { acceptsToken: "session_token" });
  }

  return auth();
}

export async function isAuthenticated() {
  const session = await getRequestAuth();
  return Boolean(session.userId);
}

export async function getToken() {
  const session = await getRequestAuth();
  return session.getToken({ template: "convex" });
}

export async function preloadAuthQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: OptionalArgs<Query>
): Promise<Preloaded<Query>> {
  return preloadQuery(query, ...clerkArgs<Query>(args, await getToken()));
}

export async function fetchAuthQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: OptionalArgs<Query>
): Promise<FunctionReturnType<Query>> {
  return fetchQuery(query, ...clerkArgs<Query>(args, await getToken()));
}

export async function fetchAuthMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  ...args: OptionalArgs<Mutation>
): Promise<FunctionReturnType<Mutation>> {
  return fetchMutation(mutation, ...clerkArgs<Mutation>(args, await getToken()));
}

export async function fetchAuthAction<Action extends FunctionReference<"action">>(
  action: Action,
  ...args: OptionalArgs<Action>
): Promise<FunctionReturnType<Action>> {
  return fetchAction(action, ...clerkArgs<Action>(args, await getToken()));
}
