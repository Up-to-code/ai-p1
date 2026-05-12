import { describe, expect, it, vi } from "vitest";
import { resolveConvexAuthToken } from "./token";

describe("Better Auth Convex token bridge", () => {
  it("asks Better Auth for a token even when a cached JWT cookie is present", async () => {
    const headers = new Headers({
      cookie: "better-auth.convex_jwt=stale-token",
      "content-length": "10",
      "transfer-encoding": "chunked",
    });
    const getToken = vi.fn(async () => ({ isFresh: true, token: "fresh-token" }));

    await expect(resolveConvexAuthToken(headers, getToken)).resolves.toBe("fresh-token");

    expect(getToken).toHaveBeenCalledWith(
      expect.any(String),
      headers,
      expect.objectContaining({ forceRefresh: true }),
    );
    expect(headers.get("content-length")).toBeNull();
    expect(headers.get("transfer-encoding")).toBeNull();
    expect(headers.get("accept-encoding")).toBe("identity");
  });

  it("can force-refresh the token instead of accepting the cached JWT path", async () => {
    const headers = new Headers({ cookie: "better-auth.convex_jwt=stale-token" });
    const getToken = vi.fn(async () => ({ isFresh: true, token: "fresh-token" }));

    await resolveConvexAuthToken(headers, getToken, { forceRefresh: true });

    expect(getToken).toHaveBeenCalledWith(
      expect.any(String),
      headers,
      expect.objectContaining({ forceRefresh: true }),
    );
  });
});
