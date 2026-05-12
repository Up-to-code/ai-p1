export type BackendErrorSeverity = "info" | "warning" | "error" | "critical";
export type BackendErrorCode = string;

export interface BackendErrorShape {
  readonly code: BackendErrorCode;
  readonly message: string;
  readonly severity: BackendErrorSeverity;
}
