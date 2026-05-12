export interface ReferrerPolicyContract {
  readonly mode: "disabled" | "report-only" | "enforce";
  readonly policyName: string;
}
