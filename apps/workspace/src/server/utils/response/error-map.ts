import type { ContentfulStatusCode } from "hono/utils/http-status";

export type ErrorClass =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "PLATFORM_ADMIN_REQUIRED"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "VALIDATION"
  | "TIMEOUT"
  | "INTERNAL";

const STATUS_BY_CLASS: Record<ErrorClass, ContentfulStatusCode> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  PLATFORM_ADMIN_REQUIRED: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  VALIDATION: 400,
  TIMEOUT: 504,
  INTERNAL: 500,
};

export function classifyError(error: unknown): ErrorClass {
  if (error instanceof Error && error.name === "WorkspaceReadTimeoutError") return "TIMEOUT";

  if (hasStatus(error)) {
    const status = error.status;
    if (status === 401 || status === 403) return status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN";
    if (status === 404) return "NOT_FOUND";
    if (status === 409) return "VALIDATION";
    if (status === 429) return "RATE_LIMITED";
    if (status === 400 || status === 422) return "VALIDATION";
    if (status >= 500) return "INTERNAL";
  }

  const message = error instanceof Error ? error.message : "";
  if (/Unauthenticated/i.test(message)) return "UNAUTHENTICATED";
  if (/platform admin required/i.test(message)) return "PLATFORM_ADMIN_REQUIRED";
  if (/permission|not have access|forbidden/i.test(message)) return "FORBIDDEN";
  if (/not found/i.test(message)) return "NOT_FOUND";
  if (/rate.?limit/i.test(message)) return "RATE_LIMITED";
  if (/invalid|required|must be/i.test(message)) return "VALIDATION";

  return "INTERNAL";
}

function hasStatus(error: unknown): error is { status: number } {
  return typeof error === "object" && error !== null && "status" in error && typeof (error as { status: unknown }).status === "number";
}

export function errorStatus(error: unknown): ContentfulStatusCode {
  return STATUS_BY_CLASS[classifyError(error)];
}

const MESSAGES: Record<ErrorClass, (error: unknown) => string> = {
  UNAUTHENTICATED: () => "Sign in again to continue.",
  PLATFORM_ADMIN_REQUIRED: () => "Platform admin required.",
  FORBIDDEN: () => "You do not have permission to perform this action.",
  NOT_FOUND: () => "The requested workspace record was not found.",
  RATE_LIMITED: () => "Too many requests. Try again in a moment.",
  VALIDATION: (error) => (error instanceof Error ? error.message : "Invalid request."),
  TIMEOUT: () => "Workspace data took too long to load. Try again in a moment.",
  INTERNAL: () => "Internal Server Error",
};

export function errorMessage(error: unknown, fallback: string): string {
  const cls = classifyError(error);
  if (cls === "INTERNAL") return fallback;
  return MESSAGES[cls](error);
}

export function httpStatusFromCode(code: string): ContentfulStatusCode {
  if (code === "UNAUTHORIZED") return 401;
  if (code === "FORBIDDEN" || code === "ACCOUNT_INACTIVE" || code === "ROLE_PENDING" || code === "ROLE_REJECTED" || code === "VERIFICATION_REQUIRED") return 403;
  if (code === "NOT_FOUND") return 404;
  if (code === "ORGANIZATION_EXISTS" || code === "INVITE_EXISTS" || code === "MEMBER_EXISTS" || code === "USERNAME_TAKEN") return 409;
  if (code === "RATE_LIMITED") return 429;
  if (code === "AUTH_CONFIGURATION_ERROR" || code === "UPSTREAM_UNAVAILABLE") return 503;
  return 500;
}
