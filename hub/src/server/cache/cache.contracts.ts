export type CacheScope = "global" | "per-user" | "per-organization" | "per-team" | "per-checker";
export type CacheDecision = "hit" | "miss" | "skip" | "revalidate" | "bypass";

export interface CacheKeyParts {
  readonly scope: CacheScope;
  readonly namespace: string;
  readonly parts: readonly string[];
}

export interface PerUserCacheKey extends CacheKeyParts {
  readonly scope: "per-user";
}

export interface PerCheckerCacheKey extends CacheKeyParts {
  readonly scope: "per-checker";
  readonly checkerName: string;
}
