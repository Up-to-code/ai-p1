import type { CacheKeyParts } from "@qentrah/platform-core/effect-api";

export type {
  CacheKeyParts,
  CachePolicy,
  CacheScope,
  CacheService,
} from "@qentrah/platform-core/effect-api";

export type CacheDecision = "hit" | "miss" | "skip" | "revalidate" | "bypass";

export interface PerUserCacheKey extends CacheKeyParts {
  readonly scope: "per-user";
}

export interface PerCheckerCacheKey extends CacheKeyParts {
  readonly scope: "per-checker";
  readonly checkerName: string;
}
