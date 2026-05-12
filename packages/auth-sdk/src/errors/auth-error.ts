export type AuthSdkErrorCode =
  | "AUTH_REQUIRED"
  | "CSRF_INVALID"
  | "FORBIDDEN"
  | "INSUFFICIENT_SCOPE"
  | "INVALID_CLAIMS"
  | "NETWORK_ERROR"
  | "REFRESH_FAILED";

export class AuthSdkError extends Error {
  readonly code: AuthSdkErrorCode;
  readonly status: number;

  constructor(code: AuthSdkErrorCode, message: string, status = 400) {
    super(message);
    this.name = "AuthSdkError";
    this.code = code;
    this.status = status;
  }
}

export function isAuthSdkError(error: unknown): error is AuthSdkError {
  return error instanceof AuthSdkError;
}
