import type { ToolContext } from "eve/tools";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { FunctionReference, FunctionReturnType } from "convex/server";
import type { ArgsAndOptions } from "convex/server";

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

function getTokenFromContext(ctx: ToolContext): string | null {
  const token = ctx.session.auth.current?.attributes?.convexToken;
  if (typeof token === "string" && token.length > 0) return token;
  return null;
}

export async function fetchAuthQuery<Query extends FunctionReference<"query">>(
  ctx: ToolContext,
  query: Query,
  ...args: OptionalArgs<Query>
): Promise<FunctionReturnType<Query>> {
  const token = getTokenFromContext(ctx);
  return fetchQuery(query, ...authArgs<Query>(args, token));
}

export async function fetchAuthMutation<Mutation extends FunctionReference<"mutation">>(
  ctx: ToolContext,
  mutation: Mutation,
  ...args: OptionalArgs<Mutation>
): Promise<FunctionReturnType<Mutation>> {
  const token = getTokenFromContext(ctx);
  return fetchMutation(mutation, ...authArgs<Mutation>(args, token));
}
