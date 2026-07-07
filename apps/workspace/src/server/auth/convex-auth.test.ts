import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchQuery } from "convex/nextjs";
import { fetchAuthQuery, runWithAuthHeaders } from "./convex-auth";

vi.mock("convex/nextjs", () => ({
  fetchAction: vi.fn(),
  fetchMutation: vi.fn(),
  fetchQuery: vi.fn(),
  preloadQuery: vi.fn(),
}));

// Stub the Better Auth token endpoint called inside Hono request context
vi.mock("@convex-dev/better-auth/utils", () => ({
  getToken: vi.fn(async () => ({ token: "convex-better-auth-token", isFresh: true })),
}));

// Stub auth-context for the Next.js (non-Hono) path
vi.mock("./auth-context", () => ({
  fetchAuthQuery: vi.fn(async () => "ok"),
  fetchAuthMutation: vi.fn(async () => "ok"),
  fetchAuthAction: vi.fn(async () => "ok"),
  getToken: vi.fn(async () => "convex-web-token"),
  isAuthenticated: vi.fn(async () => true),
}));

const queryRef = { _type: "query" };

describe("better auth server bridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchQuery).mockResolvedValue("ok" as never);
  });

  it("uses Hono request headers when fetching a Convex auth token", async () => {
    const { getToken } = await import("@convex-dev/better-auth/utils");

    await runWithAuthHeaders(
      new Headers({
        cookie: "better-auth.session_token=test-session",
        "x-qentrah-client": "mobile",
      }),
      () => fetchAuthQuery(queryRef as never, { organizationId: "org_1" } as never),
    );

    expect(getToken).toHaveBeenCalled();
    expect(fetchQuery).toHaveBeenCalledWith(
      queryRef,
      { organizationId: "org_1" },
      { token: "convex-better-auth-token" },
    );
  });

  it("uses auth-context helper outside Hono requests", async () => {
    const { fetchAuthQuery: ctxFetchAuthQuery } = await import("./auth-context");

    await fetchAuthQuery(queryRef as never, { organizationId: "org_1" } as never);

    expect(ctxFetchAuthQuery).toHaveBeenCalledWith(queryRef, { organizationId: "org_1" });
    expect(fetchQuery).not.toHaveBeenCalled();
  });
});
