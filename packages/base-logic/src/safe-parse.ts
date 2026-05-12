export type SafeParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: Error };

export function safeJsonParse<T = unknown>(value: string): SafeParseResult<T> {
  try {
    return { ok: true, value: JSON.parse(value) as T };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error("Invalid JSON"),
    };
  }
}
