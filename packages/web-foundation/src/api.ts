import { DomainError, toErrorResponse, type DomainErrorShape } from "@anan/platform-core/errors";

export type JsonResponseInit = ResponseInit & {
  status?: number;
};

export type ValidationIssue = {
  message?: string;
  path?: PropertyKey[];
};

export type ValidationFailure = {
  issues?: ValidationIssue[];
  message?: string;
};

export type ValidationResult<TData> =
  | { success: true; data: TData }
  | { success: false; error?: ValidationFailure };

export type JsonValidator<TData> = {
  safeParse(input: unknown): ValidationResult<TData>;
};

export type BridgeSecretCandidate = {
  header: string;
  value?: string | null;
};

export type AuthBridgeHeadersInput = {
  bridgeHeader: string;
  bridgeSecret: string;
  cookie?: string | null;
  origin?: string | null;
  requestUrl?: string | null;
};

export function jsonResponse<TBody>(body: TBody, init?: JsonResponseInit): Response {
  return Response.json(body, init);
}

export function okJsonResponse<TBody extends Record<string, unknown>>(body: TBody = { ok: true } as unknown as TBody): Response {
  return jsonResponse(body);
}

export function okResponse<TBody extends Record<string, unknown>>(body: TBody = { ok: true } as unknown as TBody): Response {
  return okJsonResponse(body);
}

export function createdJsonResponse<TBody>(body: TBody): Response {
  return jsonResponse(body, { status: 201 });
}

export function createdResponse<TBody>(body: TBody): Response {
  return createdJsonResponse(body);
}

export function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}

export function deletedResponse<TBody extends Record<string, unknown> | null = { deleted: true }>(
  body: TBody = { deleted: true } as unknown as TBody,
): Response {
  return body === null ? noContentResponse() : jsonResponse(body);
}

export function domainErrorResponse(shape: DomainErrorShape): Response {
  return toErrorResponse(new DomainError(shape));
}

export function invalidJsonResponse(message = "Request body must be valid JSON"): Response {
  return domainErrorResponse({
    code: "INVALID_REQUEST",
    message,
    status: 400,
  });
}

export function validationErrorResponse(message = "Invalid request payload"): Response {
  return domainErrorResponse({
    code: "INVALID_ARGUMENT",
    message,
    status: 400,
  });
}

export async function safeJsonBody<TBody = unknown>(
  request: Request,
  fallback: TBody | null = null,
): Promise<TBody | null> {
  try {
    return (await request.json()) as TBody;
  } catch {
    return fallback;
  }
}

export async function safeResponseJson<TBody = unknown>(
  response: Response,
  fallback: TBody,
): Promise<TBody> {
  try {
    return (await response.json()) as TBody;
  } catch {
    return fallback;
  }
}

export function copySetCookieHeaders(source: Response, target: Response): void {
  const getSetCookie = (source.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const cookies = typeof getSetCookie === "function"
    ? getSetCookie.call(source.headers)
    : [source.headers.get("set-cookie")].filter((value): value is string => Boolean(value));
  for (const cookie of cookies) {
    target.headers.append("set-cookie", cookie);
  }
}

export function isExistingAccountResponse(status: number, body: unknown): boolean {
  return status === 409 || JSON.stringify(body).toLowerCase().includes("already");
}

export function getJsonMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
    return body.message;
  }
  return fallback;
}

export function resolveBridgeSecret(
  candidates: BridgeSecretCandidate[],
  errorMessage: string,
): { header: string; value: string } {
  for (const candidate of candidates) {
    const value = candidate.value?.trim();
    if (value) {
      return { header: candidate.header, value };
    }
  }
  throw new Error(errorMessage);
}

export function buildAuthBridgeHeaders(input: AuthBridgeHeadersInput): HeadersInit {
  const origin = input.origin?.trim()
    || (input.requestUrl ? new URL(input.requestUrl).origin : undefined);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    [input.bridgeHeader]: input.bridgeSecret,
    cookie: input.cookie ?? "",
  };

  if (origin) {
    headers.origin = origin;
    headers.referer = input.requestUrl ?? `${origin}/`;
  }

  return headers;
}

export async function readJsonBody<TBody = unknown>(request: Request, maxBytes = 1_048_576): Promise<TBody> {
  let text: string;
  try {
    text = await request.text();
  } catch {
    throw new DomainError({
      code: "INVALID_REQUEST",
      message: "Request body could not be read",
      status: 400,
    });
  }
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new DomainError({
      code: "PAYLOAD_TOO_LARGE",
      message: "Request body is too large",
      status: 413,
    });
  }
  if (!text.trim()) {
    return {} as TBody;
  }
  try {
    return JSON.parse(text) as TBody;
  } catch {
    throw new DomainError({
      code: "INVALID_REQUEST",
      message: "Request body must be valid JSON",
      status: 400,
    });
  }
}

function validationMessage(error: ValidationFailure | undefined, fallback: string): string {
  return error?.issues?.[0]?.message ?? error?.message ?? fallback;
}

export async function parseJsonBody<TBody>(
  request: Request,
  schema: JsonValidator<TBody>,
  message = "Invalid request payload",
): Promise<TBody> {
  const body = await readJsonBody(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: validationMessage(parsed.error, message),
      status: 400,
    });
  }
  return parsed.data;
}

export async function routeHandler<TBody>(
  handler: () => Promise<TBody> | TBody,
  init?: JsonResponseInit,
): Promise<Response> {
  try {
    return jsonResponse(await handler(), init);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function handleRoute<TBody>(
  handler: () => Promise<TBody | Response> | TBody | Response,
  init?: JsonResponseInit,
): Promise<Response> {
  try {
    const result = await handler();
    return result instanceof Response ? result : jsonResponse(result, init);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function mutationRouteHandler<TBody>(
  handler: () => Promise<TBody> | TBody,
): Promise<Response> {
  return routeHandler(handler, { status: 201 });
}
