export type QentrahPartnerAuthErrorCode =
  | "CONFIGURATION_ERROR"
  | "AUTHORIZATION_DENIED"
  | "INVALID_STATE"
  | "TOKEN_EXCHANGE_FAILED"
  | "ORGANIZATION_AUTHORIZATION_MISSING"
  | "MISSING_RAW_BODY"
  | "STALE_TIMESTAMP"
  | "INVALID_SIGNATURE"
  | "UNSUPPORTED_RUNTIME";

export class QentrahPartnerAuthError extends Error {
  readonly code: QentrahPartnerAuthErrorCode;
  readonly status: number;

  constructor(code: QentrahPartnerAuthErrorCode, message: string, status = 400) {
    super(message);
    this.name = "QentrahPartnerAuthError";
    this.code = code;
    this.status = status;
  }
}

export function isQentrahPartnerAuthError(error: unknown): error is QentrahPartnerAuthError {
  return error instanceof QentrahPartnerAuthError;
}
