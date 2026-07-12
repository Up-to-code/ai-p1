import type { QentrahAuthorizationErrorCode } from "./types.js";

export class QentrahAuthorizationError extends Error {
  readonly code: QentrahAuthorizationErrorCode;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(code: QentrahAuthorizationErrorCode, message: string, options?: { status?: number; cause?: unknown }) {
    super(message);
    this.name = "QentrahAuthorizationError";
    this.code = code;
    this.status = options?.status;
    this.cause = options?.cause;
  }
}

export function normalizeAuthorizationError(error: unknown): QentrahAuthorizationError {
  if (error instanceof QentrahAuthorizationError) return error;
  return new QentrahAuthorizationError("network_error", error instanceof Error ? error.message : "Authorization failed", {
    cause: error,
  });
}
