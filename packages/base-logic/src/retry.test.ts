import { describe, expect, it, vi } from "vitest";
import { getBackoffWithJitter, isRetryableError, withRetry } from "./retry";
import { safeJsonParse } from "./safe-parse";

describe("@anan/base-logic retry and parsing", () => {
  it("detects retryable transport errors", () => {
    expect(isRetryableError(new Error("upstream 503"))).toBe(true);
    expect(isRetryableError(new Error("validation failed"))).toBe(false);
  });

  it("computes bounded jittered backoff", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(getBackoffWithJitter(1, {
      maxAttempts: 3,
      initialBackoffMs: 100,
      base: 2,
      maxBackoffMs: 250,
      jitter: 0.1,
    })).toBe(200);
    vi.restoreAllMocks();
  });

  it("retries retryable async work", async () => {
    vi.useFakeTimers();
    const task = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce("ok");

    const result = withRetry(task, {
      maxAttempts: 2,
      initialBackoffMs: 1,
      base: 1,
      maxBackoffMs: 1,
      jitter: 0,
    });

    await vi.runAllTimersAsync();
    await expect(result).resolves.toBe("ok");
    expect(task).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("parses JSON safely", () => {
    expect(safeJsonParse<{ ok: true }>("{\"ok\":true}")).toEqual({
      ok: true,
      value: { ok: true },
    });
    expect(safeJsonParse("{")).toMatchObject({ ok: false });
  });
});
