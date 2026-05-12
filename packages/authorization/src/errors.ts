import type { AnanAuthorizationErrorCode } from "./types";

export class AnanAuthorizationError extends Error {
  readonly code: AnanAuthorizationErrorCode;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(code: AnanAuthorizationErrorCode, message: string, options?: { status?: number; cause?: unknown }) {
    super(message);
    this.name = "AnanAuthorizationError";
    this.code = code;
    this.status = options?.status;
    this.cause = options?.cause;
  }
}

export function normalizeAuthorizationError(error: unknown): AnanAuthorizationError {
  if (error instanceof AnanAuthorizationError) return error;
  return new AnanAuthorizationError("network_error", error instanceof Error ? error.message : "Authorization failed", {
    cause: error,
  });
}
