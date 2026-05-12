export type CheckerDecision = "allow" | "block" | "review" | "skip";
export type CheckerSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface CheckerContext {
  readonly requestId?: string;
  readonly checkerName: string;
  readonly scope?: string;
}

export interface CheckerResult {
  readonly decision: CheckerDecision;
  readonly severity: CheckerSeverity;
  readonly reasonCode: string;
}
