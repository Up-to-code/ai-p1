export type DomainErrorShape = {
  code: string;
  message: string;
  status: number;
};

export const DOMAIN_STATUS_BY_CODE: Readonly<Record<string, number>> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  ACCOUNT_INACTIVE: 403,
  ROLE_PENDING: 403,
  ROLE_REJECTED: 403,
  VERIFICATION_REQUIRED: 403,
  AUTH_CONFIGURATION_ERROR: 503,
  UPSTREAM_UNAVAILABLE: 503,
  NOT_FOUND: 404,
  ORGANIZATION_EXISTS: 409,
  INVITE_EXISTS: 409,
  MEMBER_EXISTS: 409,
  USERNAME_TAKEN: 409,
  INVALID_ARGUMENT: 400,
  INVALID_REQUEST: 400,
  INVALID_CLIENT: 400,
  INVALID_GRANT: 400,
  INVALID_REDIRECT_URI: 400,
  INVALID_SCOPE: 400,
  INVITE_EXPIRED: 410,
  RATE_LIMITED: 429,
};

export class DomainError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(shape: DomainErrorShape) {
    super(shape.message);
    this.name = "DomainError";
    this.code = shape.code;
    this.status = shape.status;
  }
}

function parseConvexErrorPayload(error: unknown): { code?: string; message?: string } | null {
  const data = (error as { data?: unknown } | null)?.data;
  if (data && typeof data === "object") {
    return data as { code?: string; message?: string };
  }

  const message = error instanceof Error ? error.message : typeof error === "string" ? error : null;
  if (!message) return null;

  const jsonStart = message.indexOf("{");
  const jsonEnd = message.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) return null;

  try {
    return JSON.parse(message.slice(jsonStart, jsonEnd + 1)) as { code?: string; message?: string };
  } catch {
    return null;
  }
}

export function normalizeDomainError(error: unknown): DomainError {
  if (error instanceof DomainError) {
    return error;
  }

  const convexPayload = parseConvexErrorPayload(error);
  if (convexPayload?.code && convexPayload?.message) {
    return new DomainError({
      code: convexPayload.code,
      message: convexPayload.message,
      status: DOMAIN_STATUS_BY_CODE[convexPayload.code] ?? 500,
    });
  }

  if (error instanceof Error) {
    return new DomainError({
      code: "INTERNAL_ERROR",
      message: error.message || "Unexpected server error",
      status: 500,
    });
  }

  return new DomainError({
    code: "INTERNAL_ERROR",
    message: "Unexpected server error",
    status: 500,
  });
}

export function toErrorResponse(error: unknown): Response {
  const domainError = normalizeDomainError(error);
  return Response.json(
    {
      code: domainError.code,
      message: domainError.message,
      status: domainError.status,
    } satisfies DomainErrorShape,
    { status: domainError.status },
  );
}
