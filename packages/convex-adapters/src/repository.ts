import {
  fetchAction as convexFetchAction,
  fetchMutation as convexFetchMutation,
  fetchQuery as convexFetchQuery,
} from "convex/nextjs";
import type { UnsafeApiRecord } from "@anan/platform-core/convex-api";
import { getApiRefs } from "./api";

export type ConvexToken = string;
export type OriginPayload<T extends Record<string, unknown>> = T & { origin?: string };
export type ConvexArgs = unknown;
export type RepositorySuccessResult<TValue> = { ok: true; value: TValue };
export type RepositoryErrorResult = { ok: false; error: string };
export type RepositoryResult<TValue> = RepositorySuccessResult<TValue> | RepositoryErrorResult;
export type ConvexFetchOptions = {
  token?: string;
};

export function withOptionalOrigin<T extends Record<string, unknown>>(
  payload: T,
  origin?: string,
): OriginPayload<T> {
  return origin === undefined ? payload : { ...payload, origin };
}

export function unwrapRepositoryField<TRecord extends Record<string, unknown>, TKey extends keyof TRecord>(
  record: TRecord,
  key: TKey,
): TRecord[TKey] {
  return record[key];
}

export function unwrapRepositoryResult<TValue>(result: RepositoryResult<TValue>): TValue {
  if (result.ok) {
    return result.value;
  }

  throw new Error(result.error);
}

export function createRepositoryRefs<TRefs extends Record<string, unknown>>(
  apiUnsafe: UnsafeApiRecord,
  path: string,
): TRefs {
  return getApiRefs<TRefs>(apiUnsafe, path);
}

export async function fetchQueryWithToken<TResult>(
  ref: unknown,
  args: ConvexArgs = {},
  token: string,
): Promise<TResult> {
  return convexFetchQuery(ref as never, args as never, { token }) as Promise<TResult>;
}

export async function fetchMutationWithToken<TResult>(
  ref: unknown,
  args: ConvexArgs = {},
  token: string,
): Promise<TResult> {
  return convexFetchMutation(ref as never, args as never, { token }) as Promise<TResult>;
}

export async function fetchActionWithToken<TResult>(
  ref: unknown,
  args: ConvexArgs = {},
  token: string,
): Promise<TResult> {
  return convexFetchAction(ref as never, args as never, { token }) as Promise<TResult>;
}

export async function fetchPublicQuery<TResult>(
  ref: unknown,
  args: ConvexArgs = {},
): Promise<TResult> {
  return convexFetchQuery(ref as never, args as never) as Promise<TResult>;
}

export async function fetchPublicMutation<TResult>(
  ref: unknown,
  args: ConvexArgs = {},
): Promise<TResult> {
  return convexFetchMutation(ref as never, args as never) as Promise<TResult>;
}

export function fetchQuery<TResult>(
  ref: unknown,
  args: ConvexArgs = {},
  options?: ConvexFetchOptions,
): Promise<TResult> {
  return options?.token ? fetchQueryWithToken<TResult>(ref, args, options.token) : fetchPublicQuery<TResult>(ref, args);
}

export function fetchMutation<TResult>(
  ref: unknown,
  args: ConvexArgs = {},
  options?: ConvexFetchOptions,
): Promise<TResult> {
  return options?.token ? fetchMutationWithToken<TResult>(ref, args, options.token) : fetchPublicMutation<TResult>(ref, args);
}

export function fetchAction<TResult>(
  ref: unknown,
  args: ConvexArgs = {},
  options?: ConvexFetchOptions,
): Promise<TResult> {
  return options?.token ? fetchActionWithToken<TResult>(ref, args, options.token) : convexFetchAction(ref as never, args as never) as Promise<TResult>;
}

export function queryRef<TResult>(
  token: ConvexToken,
  ref: unknown,
  args: ConvexArgs = {},
): Promise<TResult> {
  return fetchQueryWithToken<TResult>(ref, args, token);
}

export function mutationRef<TResult>(
  token: ConvexToken,
  ref: unknown,
  args: ConvexArgs = {},
): Promise<TResult> {
  return fetchMutationWithToken<TResult>(ref, args, token);
}

export function actionRef<TResult>(
  token: ConvexToken,
  ref: unknown,
  args: ConvexArgs = {},
): Promise<TResult> {
  return fetchActionWithToken<TResult>(ref, args, token);
}

export function publicQueryRef<TResult>(
  ref: unknown,
  args: ConvexArgs = {},
): Promise<TResult> {
  return fetchPublicQuery<TResult>(ref, args);
}

export function publicMutationRef<TResult>(
  ref: unknown,
  args: ConvexArgs = {},
): Promise<TResult> {
  return fetchPublicMutation<TResult>(ref, args);
}

export async function voidMutationRef(
  token: ConvexToken,
  ref: unknown,
  args: ConvexArgs = {},
): Promise<void> {
  await fetchMutationWithToken(ref, args, token);
}

export function createTokenForwardingFetchers(token: string) {
  return {
    query: <TResult>(ref: unknown, args: ConvexArgs = {}) => fetchQueryWithToken<TResult>(ref, args, token),
    mutation: <TResult>(ref: unknown, args: ConvexArgs = {}) => fetchMutationWithToken<TResult>(ref, args, token),
    action: <TResult>(ref: unknown, args: ConvexArgs = {}) => fetchActionWithToken<TResult>(ref, args, token),
  };
}

export function createPublicFetchers() {
  return {
    query: <TResult>(ref: unknown, args: ConvexArgs = {}) => fetchPublicQuery<TResult>(ref, args),
    mutation: <TResult>(ref: unknown, args: ConvexArgs = {}) => fetchPublicMutation<TResult>(ref, args),
  };
}
