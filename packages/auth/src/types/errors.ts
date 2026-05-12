export type AuthErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_TOKEN"
  | "INSUFFICIENT_SCOPE"
  | "INVALID_AUTH_CONTEXT"
  | "AUTH_CONFIGURATION_ERROR";

const AUTH_ERROR_STATUS: Record<AuthErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_TOKEN: 401,
  INSUFFICIENT_SCOPE: 403,
  INVALID_AUTH_CONTEXT: 401,
  AUTH_CONFIGURATION_ERROR: 503,
};

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly status: number;

  constructor(code: AuthErrorCode, message: string, status = AUTH_ERROR_STATUS[code]) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

export function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;
  if (error instanceof Error) return new AuthError("INVALID_AUTH_CONTEXT", error.message);
  return new AuthError("INVALID_AUTH_CONTEXT", "Invalid authentication context");
}
