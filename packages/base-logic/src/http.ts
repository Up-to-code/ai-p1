import { HTTP_RETRY_POLICY, withRetry } from "./retry";

function readPositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

type FetchJsonOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  env?: {
    WEB_FETCH_TIMEOUT_MS?: string;
    WEB_FETCH_MAX_RETRIES?: string;
  };
};

export async function fetchJsonWithRetry<T>(
  url: string,
  init: RequestInit,
  options: FetchJsonOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? readPositiveInt(options.env?.WEB_FETCH_TIMEOUT_MS, 8000);
  const maxRetries = options.maxRetries ?? readPositiveInt(options.env?.WEB_FETCH_MAX_RETRIES, 2);

  return await withRetry<T>(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.ok) return (await response.json()) as T;
      const text = await response.text().catch(() => "");
      throw new Error(`http_${response.status} ${text.slice(0, 120)}`);
    } finally {
      clearTimeout(timeout);
    }
  }, {
    ...HTTP_RETRY_POLICY,
    maxAttempts: maxRetries + 1,
  });
}
