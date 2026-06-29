const HTTP_QUERY_TIMEOUT_MS = 10_000;

export class HttpTimeoutError extends Error {
  constructor(message = "Request timed out.") {
    super(message);
    this.name = "HttpTimeoutError";
  }
}

export class HttpRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpRequestError";
    this.status = status;
  }
}

export function isHttpTimeoutError(error: unknown) {
  return error instanceof HttpTimeoutError || (error instanceof Error && error.name === "HttpTimeoutError");
}

export function normalizeErrorMessage(error: unknown) {
  if (isHttpTimeoutError(error)) {
    return "The request took too long. Check the connection and try again.";
  }
  return error instanceof Error ? error.message : "Request failed.";
}

export async function fetchJson<T>(
  url: string,
  options?: { timeoutMs?: number; fetcher?: typeof fetch; signal?: AbortSignal },
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? HTTP_QUERY_TIMEOUT_MS;
  const fetcher = options?.fetcher ?? fetch;
  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort(options?.signal?.reason);
  if (options?.signal?.aborted) abortFromCaller();
  else options?.signal?.addEventListener("abort", abortFromCaller, { once: true });
  const timeout = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  let response: Response;
  try {
    response = await fetcher(url, { signal: controller.signal });
  } catch (error) {
    if (timedOut) throw new HttpTimeoutError(`Request timed out after ${timeoutMs}ms.`);
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
    options?.signal?.removeEventListener("abort", abortFromCaller);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new HttpRequestError(payload.error ?? "Request failed.", response.status);
  }

  return payload as T;
}
