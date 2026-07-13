import type { ToolContext } from "eve/tools";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { FunctionReference, FunctionReturnType } from "convex/server";
import type { ArgsAndOptions } from "convex/server";
import { requireWorkspaceActorToken } from "./workspace-actor";

type OptionalArgs<FuncRef extends FunctionReference<"query" | "mutation" | "action">> =
  FuncRef["_args"] extends Record<string, never>
    ? [args?: FuncRef["_args"]]
    : [args: FuncRef["_args"]];

function authArgs<FuncRef extends FunctionReference<"query" | "mutation" | "action">>(
  args: OptionalArgs<FuncRef>,
  token: string | null,
): ArgsAndOptions<FuncRef, { token?: string }> {
  return [
    args[0],
    ...(token ? [{ token }] : []),
  ] as ArgsAndOptions<FuncRef, { token?: string }>;
}

export async function fetchAuthQuery<Query extends FunctionReference<"query">>(
  ctx: ToolContext,
  query: Query,
  ...args: OptionalArgs<Query>
): Promise<FunctionReturnType<Query>> {
  const token = requireWorkspaceActorToken(ctx, "convexToken");
  return fetchQuery(query, ...authArgs<Query>(args, token));
}

export async function fetchAuthMutation<Mutation extends FunctionReference<"mutation">>(
  ctx: ToolContext,
  mutation: Mutation,
  ...args: OptionalArgs<Mutation>
): Promise<FunctionReturnType<Mutation>> {
  const token = requireWorkspaceActorToken(ctx, "convexToken");
  return fetchMutation(mutation, ...authArgs<Mutation>(args, token));
}
