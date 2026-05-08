export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly backoff: "none" | "fixed" | "exponential";
}

export interface RetryAttemptMetadata {
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly reasonCode?: string;
}
