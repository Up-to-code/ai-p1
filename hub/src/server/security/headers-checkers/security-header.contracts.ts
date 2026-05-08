export interface SecurityHeaderPolicy {
  readonly mode: "disabled" | "report-only" | "enforce";
  readonly policyName: string;
}
