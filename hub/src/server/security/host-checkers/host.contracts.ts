export interface TrustedHostPolicy {
  readonly mode: "disabled" | "report-only" | "enforce";
  readonly trustedHostRuleIds: readonly string[];
}
