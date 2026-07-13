import { authCredentialHeaders, type AuthCredential } from "../credentials/index.js";

export type AuthCredentialProvider = () => AuthCredential | null | Promise<AuthCredential | null>;

export type AuthHttpQuery = Record<string, string | number | boolean | null | undefined>;

export type AuthHttpRequestOptions<Result = unknown> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: AuthHttpQuery;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  parse?: (value: unknown) => Result;
};

export type ParsedAuthHttpRequestOptions<Result> = AuthHttpRequestOptions<Result> & {
  parse: (value: unknown) => Result;
};

export type AuthHttpClientOptions = {
  baseUrl: string;
  credentialProvider?: AuthCredentialProvider;
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
};

export type AuthHttpRequestErrorCode =
  | "AUTH_HTTP_ERROR"
  | "AUTH_INVALID_RESPONSE"
  | "AUTH_NETWORK_ERROR"
  | "AUTH_REQUEST_TIMEOUT";

export class AuthHttpRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: AuthHttpRequestErrorCode,
    public readonly method: string,
    public readonly path: string,
  ) {
    super(message);
    this.name = "AuthHttpRequestError";
  }
}

function normalizeBaseUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Auth HTTP base URL must use HTTP or HTTPS");
  }
  if (url.username || url.password) {
    throw new Error("Auth HTTP base URL must not contain credentials");
  }
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/+$/u, "");
}

function requestUrl(baseUrl: string, path: string, query: AuthHttpQuery | undefined): URL {
  const normalizedPath = path.trim();
  if (!normalizedPath || /^([a-z][a-z\d+.-]*:)?\/\//iu.test(normalizedPath)) {
    throw new Error("Auth HTTP request path must be relative");
  }
  const url = new URL(`${baseUrl}/${normalizedPath.replace(/^\/+/, "")}`);
  for (const [name, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(name, String(value));
  }
  return url;
}

function safeErrorDetails(value: unknown): { message?: string; code?: string } {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  const message = [record.message, record.error].find((candidate) => typeof candidate === "string");
  return {
    message: typeof message === "string" ? message.slice(0, 300) : undefined,
    code: typeof record.code === "string" ? record.code.slice(0, 100) : undefined,
  };
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  const contentType = response.headers.get("content-type") ?? "";
  const mayBeJson = contentType.toLowerCase().includes("json")
    || /^[\s\n\r]*[\[{]/u.test(text);
  if (!mayBeJson) return text;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Invalid JSON response");
  }
}

function requestSignal(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abort = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", abort, { once: true });

  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    dispose: () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    },
  };
}

/**
 * Creates a cross-runtime authentication HTTP client with one credential,
 * timeout, JSON, query, no-store, and safe-error policy.
 */
export function createAuthHttpClient(options: AuthHttpClientOptions) {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = options.timeoutMs ?? 5_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("Auth HTTP timeout must be a positive number");
  }
  const fetchImplementation = options.fetch ?? globalThis.fetch;

  function request<Result>(path: string, requestOptions: ParsedAuthHttpRequestOptions<Result>): Promise<Result>;
  function request(path: string, requestOptions?: AuthHttpRequestOptions): Promise<unknown>;
  async function request<Result>(
    path: string,
    requestOptions: AuthHttpRequestOptions<Result> = {},
  ): Promise<Result | unknown> {
    const method = requestOptions.method ?? (requestOptions.body === undefined ? "GET" : "POST");
    const url = requestUrl(baseUrl, path, requestOptions.query);
    const headers = new Headers(requestOptions.headers);
    headers.set("accept", "application/json");
    headers.set("accept-encoding", "identity");
    headers.set("cache-control", "no-store");
    if (requestOptions.body !== undefined) headers.set("content-type", "application/json");

    const credential = await options.credentialProvider?.();
    authCredentialHeaders(credential).forEach((value, name) => headers.set(name, value));
    const linkedSignal = requestSignal(requestOptions.signal, timeoutMs);

    try {
      const response = await fetchImplementation(url, {
        method,
        headers,
        body: requestOptions.body === undefined ? undefined : JSON.stringify(requestOptions.body),
        cache: "no-store",
        signal: linkedSignal.signal,
      });
      let value: unknown;
      try {
        value = await parseResponse(response);
      } catch {
        throw new AuthHttpRequestError(
          "Authentication server returned an invalid response",
          response.status || 502,
          "AUTH_INVALID_RESPONSE",
          method,
          url.pathname,
        );
      }

      if (!response.ok) {
        const details = safeErrorDetails(value);
        throw new AuthHttpRequestError(
          details.message ?? `Authentication request failed with status ${response.status}`,
          response.status,
          "AUTH_HTTP_ERROR",
          method,
          url.pathname,
        );
      }
      return requestOptions.parse ? requestOptions.parse(value) : value;
    } catch (error) {
      if (error instanceof AuthHttpRequestError) throw error;
      if (linkedSignal.timedOut()) {
        throw new AuthHttpRequestError(
          "Authentication request timed out",
          408,
          "AUTH_REQUEST_TIMEOUT",
          method,
          url.pathname,
        );
      }
      throw new AuthHttpRequestError(
        "Authentication request failed",
        0,
        "AUTH_NETWORK_ERROR",
        method,
        url.pathname,
      );
    } finally {
      linkedSignal.dispose();
    }
  }

  return { request };
}

export type AuthHttpClient = ReturnType<typeof createAuthHttpClient>;
