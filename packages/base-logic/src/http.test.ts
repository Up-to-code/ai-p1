import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchJsonWithRetry } from "./http";

describe("@anan/base-logic http", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns parsed JSON on success", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: "test" }),
    } as Response);

    await expect(
      fetchJsonWithRetry("https://example.com", { method: "GET" }, { timeoutMs: 1000, maxRetries: 0 }),
    ).resolves.toEqual({ data: "test" });
  });

  it("throws response text on non-ok response without retries", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Server error"),
    } as Response);

    await expect(
      fetchJsonWithRetry("https://example.com", { method: "GET" }, { maxRetries: 0 }),
    ).rejects.toThrow("http_500");
  });
});
