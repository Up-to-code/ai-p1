export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UPSTREAM_UNAVAILABLE"
  | "INTERNAL_ERROR";

export type ApiErrorStatus = 400 | 401 | 403 | 404 | 409 | 429 | 500 | 503;

export type ApiErrorPayload = {
  error: string;
  code: ApiErrorCode | string;
  status: ApiErrorStatus | number;
  issues?: unknown;
};

export class ApiRuntimeError extends Error {
  readonly code: ApiErrorCode | string;
  readonly status: ApiErrorStatus | number;
  readonly issues?: unknown;
  readonly headers?: Record<string, string>;

  constructor(options: {
    code: ApiErrorCode | string;
    message: string;
    status: ApiErrorStatus | number;
    issues?: unknown;
    headers?: Record<string, string>;
  }) {
    super(options.message);
    this.name = this.constructor.name;
    this.code = options.code;
    this.status = options.status;
    this.issues = options.issues;
    this.headers = options.headers;
  }
}

export class BadRequest extends ApiRuntimeError {
  constructor(message = "Invalid request.", issues?: unknown) {
    super({ code: "BAD_REQUEST", message, status: 400, issues });
  }
}

export class Unauthorized extends ApiRuntimeError {
  constructor(message = "Sign in again to continue.") {
    super({ code: "UNAUTHORIZED", message, status: 401 });
  }
}

export class Forbidden extends ApiRuntimeError {
  constructor(message = "You do not have permission to perform this action.") {
    super({ code: "FORBIDDEN", message, status: 403 });
  }
}

export class NotFound extends ApiRuntimeError {
  constructor(message = "The requested record was not found.") {
    super({ code: "NOT_FOUND", message, status: 404 });
  }
}

export class Conflict extends ApiRuntimeError {
  constructor(message = "The request conflicts with the current state.") {
    super({ code: "CONFLICT", message, status: 409 });
  }
}

export class RateLimited extends ApiRuntimeError {
  constructor(message = "Too many requests. Try again in a moment.", retryAfterMs?: number) {
    super({
      code: "RATE_LIMITED",
      message,
      status: 429,
      headers: retryAfterMs
        ? { "Retry-After": String(Math.max(1, Math.ceil(retryAfterMs / 1000))) }
        : undefined,
    });
  }
}

export class UpstreamUnavailable extends ApiRuntimeError {
  constructor(message = "A required upstream service is unavailable.") {
    super({ code: "UPSTREAM_UNAVAILABLE", message, status: 503 });
  }
}

export class Internal extends ApiRuntimeError {
  constructor(message = "Internal Server Error") {
    super({ code: "INTERNAL_ERROR", message, status: 500 });
  }
}

export function normalizeApiError(error: unknown, fallback = "Internal Server Error") {
  if (error instanceof ApiRuntimeError) return error;

  const status = (error as { status?: unknown } | null)?.status;
  const code = (error as { code?: unknown } | null)?.code;
  const message = error instanceof Error ? error.message : "";

  if (typeof status === "number" && status >= 400 && status <= 599) {
    return new ApiRuntimeError({
      code: typeof code === "string" ? code : statusToCode(status),
      message: message || fallback,
      status,
    });
  }

  if (/Unauthenticated/i.test(message)) return new Unauthorized();
  if (/platform admin required|permission|not have access|forbidden/i.test(message)) return new Forbidden();
  if (/not found/i.test(message)) return new NotFound();
  if (/rate.?limit/i.test(message)) return new RateLimited();
  if (/invalid|required|must be|denied/i.test(message)) return new BadRequest(message);

  return new Internal(fallback);
}

export function apiErrorPayload(error: ApiRuntimeError): ApiErrorPayload {
  return {
    error: error.message,
    code: error.code,
    status: error.status,
    ...(error.issues === undefined ? {} : { issues: error.issues }),
  };
}

function statusToCode(status: number): ApiErrorCode {
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 429) return "RATE_LIMITED";
  if (status === 503) return "UPSTREAM_UNAVAILABLE";
  return "INTERNAL_ERROR";
}
