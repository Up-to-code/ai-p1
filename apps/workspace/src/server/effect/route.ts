import * as Sentry from "@sentry/nextjs";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Cause, Effect, Exit, Option } from "effect";
import type { z } from "zod";
import {
  BadRequest,
  type ApiRuntimeError,
  apiErrorPayload,
  normalizeApiError,
  rateLimitHeaderRecord,
  type RateLimitResult,
} from "@qentrah/platform-core/effect-api";

type JsonSuccessOptions<TValue> = {
  readonly status?: ContentfulStatusCode;
  readonly fallbackError?: string;
  readonly headers?: Record<string, string>;
  readonly rateLimit?: RateLimitResult;
  readonly onSuccess?: (value: TValue, c: Context) => Response;
};

export function parseJsonBody<TValue>(
  c: Context,
  schema: z.ZodType<TValue>,
  invalidMessage: string,
): Effect.Effect<TValue, BadRequest> {
  return Effect.gen(function* () {
    const text = yield* Effect.tryPromise({
      try: () => c.req.text(),
      catch: () => new BadRequest("Request body must be valid JSON."),
    });
    const json = yield* Effect.try({
      try: () => JSON.parse(text) as unknown,
      catch: () => new BadRequest("Request body must be valid JSON."),
    });
    const parsed = schema.safeParse(json);

    if (!parsed.success) {
      return yield* Effect.fail(new BadRequest(invalidMessage, parsed.error.flatten().fieldErrors));
    }

    return parsed.data;
  });
}

export function routePromise<TValue>(
  run: () => Promise<TValue>,
  fallbackError: string,
): Effect.Effect<TValue, ApiRuntimeError> {
  return Effect.tryPromise({
    try: run,
    catch: (error: unknown) => normalizeApiError(error, fallbackError),
  });
}

export function routeSync<TValue>(
  run: () => TValue,
  fallbackError: string,
): Effect.Effect<TValue, ApiRuntimeError> {
  return Effect.try({
    try: run,
    catch: (error: unknown) => normalizeApiError(error, fallbackError),
  });
}

export async function runEffectRoute<TValue>(
  c: Context,
  program: Effect.Effect<TValue, unknown>,
  options: JsonSuccessOptions<TValue> = {},
) {
  const exit = await Effect.runPromiseExit(program);

  if (Exit.isSuccess(exit)) {
    const value = exit.value;
    if (options.headers) {
      for (const [key, headerValue] of Object.entries(options.headers)) c.header(key, headerValue);
    }
    if (options.rateLimit) {
      for (const [key, headerValue] of Object.entries(rateLimitHeaderRecord(options.rateLimit))) {
        c.header(key, headerValue);
      }
    }
    if (options.onSuccess) return options.onSuccess(value, c);
    return c.json(value, options.status ?? 200);
  }

  const failed = Cause.failureOption(exit.cause);
  const error = Option.isSome(failed) ? failed.value : exit.cause;
  const apiError = normalizeApiError(error, options.fallbackError);
  if (apiError.status >= 500) {
    Sentry.captureException(error, {
      tags: {
        route: c.req.path,
        method: c.req.method,
      },
    });
  }
  if (apiError.headers) {
    for (const [key, headerValue] of Object.entries(apiError.headers)) c.header(key, headerValue);
  }
  return c.json(apiErrorPayload(apiError), apiError.status as ContentfulStatusCode);
}
