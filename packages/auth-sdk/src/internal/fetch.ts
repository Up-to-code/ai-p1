export async function fetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init.timeoutMs ?? 10_000);
  try {
    const response = await fetch(input, {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: {
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
    });
    const body = await response.json().catch(() => ({})) as T & { error?: string; message?: string };
    if (!response.ok) {
      throw new Error(body.message ?? body.error ?? `Request failed with ${response.status}`);
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}
