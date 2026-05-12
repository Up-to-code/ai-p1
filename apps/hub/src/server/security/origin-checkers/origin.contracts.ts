export type BlockedOriginReason = "missing-origin" | "untrusted-origin" | "invalid-origin" | "policy-not-configured";

export interface AllowedOriginRule {
  readonly id: string;
  readonly description: string;
}

export interface OriginCheckPolicy {
  readonly mode: "disabled" | "report-only" | "enforce";
  readonly rules: readonly AllowedOriginRule[];
}
