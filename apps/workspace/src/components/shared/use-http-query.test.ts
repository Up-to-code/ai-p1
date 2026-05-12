import { describe, expect, it, vi, afterEach } from "vitest";
import {
  fetchJson,
  HttpRequestError,
  HttpTimeoutError,
  makeUrl,
  placeholderForSameOrganization,
} from "./use-http-query";

describe("use-http-query helpers", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("builds URLs with only present query params", () => {
    expect(makeUrl("/api/items", { q: "home", empty: "", page: 2, active: true })).toBe(
      "/api/items?active=true&page=2&q=home",
    );
  });

  it("returns JSON for a successful response", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ page: [1], isDone: true, continueCursor: "" }), { status: 200 }),
    );

    await expect(fetchJson("/api/items", { fetcher })).resolves.toEqual({
      page: [1],
      isDone: true,
      continueCursor: "",
    });
  });

  it("throws a useful request error for failed responses", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "No permission." }), { status: 403 }),
    );

    await expect(fetchJson("/api/items", { fetcher })).rejects.toMatchObject({
      name: "HttpRequestError",
      message: "No permission.",
      status: 403,
    } satisfies Partial<HttpRequestError>);
  });

  it("rejects with a timeout error when fetch does not settle", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn((_url: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      }),
    );

    const request = fetchJson("/api/slow", { timeoutMs: 50, fetcher: fetcher as typeof fetch });
    const assertion = expect(request).rejects.toBeInstanceOf(HttpTimeoutError);
    await vi.advanceTimersByTimeAsync(50);

    await assertion;
  });

  it("forwards caller abort signals to the request", async () => {
    const controller = new AbortController();
    const fetcher = vi.fn((_url: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      }),
    );

    const request = fetchJson("/api/cancel", {
      timeoutMs: 10_000,
      fetcher: fetcher as typeof fetch,
      signal: controller.signal,
    });
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
    expect(fetcher).toHaveBeenCalledWith("/api/cancel", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it("keeps previous HTTP data only inside the same organization scope", () => {
    const previousData = { page: ["old"] };
    const placeholder = placeholderForSameOrganization<typeof previousData>(
      "/api/v1/organizations/org_2/read/projects?search=a",
    );

    expect(placeholder(previousData, {
      queryKey: ["/api/v1/organizations/org_2/read/projects?search="],
    } as never)).toBe(previousData);
    expect(placeholder(previousData, {
      queryKey: ["/api/v1/organizations/org_1/read/projects?search="],
    } as never)).toBeUndefined();
  });
});
