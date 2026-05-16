import { Cache, Duration, Effect } from "effect";
import {
  BadRequest,
  Forbidden,
  Internal,
  type ApiRuntimeError,
  normalizeApiError,
} from "./effect-api-errors";

export type CacheScope = "global" | "per-user" | "per-organization" | "per-team" | "per-checker";

export interface CacheKeyParts {
  readonly scope: CacheScope;
  readonly namespace: string;
  readonly parts: readonly string[];
}

export interface CachePolicy {
  readonly ttlMs: number;
  readonly capacity?: number;
  readonly sensitive?: boolean;
}

export interface CacheService {
  getOrCompute<Value, Error = never>(
    key: CacheKeyParts,
    policy: CachePolicy,
    compute: () => Effect.Effect<Value, Error>,
  ): Effect.Effect<Value, Error | ApiRuntimeError>;
  invalidate(key: CacheKeyParts): Effect.Effect<void>;
  invalidateAll(): Effect.Effect<void>;
}

type CacheLoader = () => Effect.Effect<unknown, unknown>;

export function buildCacheKey(key: CacheKeyParts) {
  const namespace = key.namespace.trim();
  if (!namespace) throw new BadRequest("Cache namespace is required.");
  const parts = key.parts.map((part) => part.trim()).filter(Boolean);
  return [key.scope, namespace, ...parts].join(":");
}

export function assertCachePolicySafe(key: CacheKeyParts, policy: CachePolicy) {
  if (policy.ttlMs <= 0) throw new BadRequest("Cache TTL must be greater than zero.");
  if (policy.sensitive && key.scope === "global") {
    throw new Forbidden("Sensitive cache entries must use an organization, user, team, or checker scope.");
  }
  if (policy.sensitive && key.parts.length === 0) {
    throw new Forbidden("Sensitive cache entries must include scoped key parts.");
  }
}

export function createMemoryCacheService(): CacheService {
  const loaders = new Map<string, CacheLoader>();
  const caches = new Map<string, Promise<Cache.Cache<string, unknown, unknown>>>();

  const getCache = (policy: CachePolicy) => {
    const policyKey = `${policy.capacity ?? 500}:${policy.ttlMs}`;
    let cache = caches.get(policyKey);
    if (!cache) {
      cache = Effect.runPromise(
        Cache.make<string, unknown, unknown>({
          capacity: policy.capacity ?? 500,
          timeToLive: Duration.millis(policy.ttlMs),
          lookup: (key) => {
            const loader = loaders.get(key);
            return loader ? loader() : Effect.fail(new Internal("Cache loader is no longer available."));
          },
        }),
      );
      caches.set(policyKey, cache);
    }
    return cache;
  };

  return {
    getOrCompute: <Value, Error = never>(
      key: CacheKeyParts,
      policy: CachePolicy,
      compute: () => Effect.Effect<Value, Error>,
    ) => Effect.gen(function* () {
      const cacheKey = yield* Effect.try({
        try: () => {
          assertCachePolicySafe(key, policy);
          return buildCacheKey(key);
        },
        catch: (error) => normalizeApiError(error, "Invalid cache policy."),
      });
      const cache = yield* Effect.promise(() => getCache(policy));
      loaders.set(cacheKey, compute as CacheLoader);
      return yield* (cache.get(cacheKey) as Effect.Effect<Value, Error | ApiRuntimeError>).pipe(
        Effect.ensuring(Effect.sync(() => {
          loaders.delete(cacheKey);
        })),
      );
    }),
    invalidate: (key) => Effect.gen(function* () {
      const cacheKey = buildCacheKey(key);
      const resolvedCaches = yield* Effect.promise(() => Promise.all(caches.values()));
      yield* Effect.all(resolvedCaches.map((cache) => cache.invalidate(cacheKey)), { discard: true });
    }),
    invalidateAll: () => Effect.gen(function* () {
      const resolvedCaches = yield* Effect.promise(() => Promise.all(caches.values()));
      yield* Effect.all(resolvedCaches.map((cache) => cache.invalidateAll), { discard: true });
    }),
  };
}
