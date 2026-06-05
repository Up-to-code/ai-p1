import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchQuery } from "convex/nextjs";
import { auth, getAuth } from "@clerk/nextjs/server";
import { fetchAuthQuery, runWithAuthHeaders } from "./clerk-convex";

vi.mock("convex/nextjs", () => ({
  fetchAction: vi.fn(),
  fetchMutation: vi.fn(),
  fetchQuery: vi.fn(),
  preloadQuery: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  getAuth: vi.fn(),
}));

const queryRef = { _type: "query" };

describe("clerk convex auth bridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchQuery).mockResolvedValue("ok" as never);
  });

  it("uses Hono request headers when fetching a Convex auth token", async () => {
    const getToken = vi.fn(async () => "convex-mobile-token");
    vi.mocked(getAuth).mockReturnValue({
      userId: "user_1",
      getToken,
    } as never);

    await runWithAuthHeaders(
      new Headers({
        authorization: "Bearer mobile-session",
        "x-qentrah-client": "mobile",
      }),
      () => fetchAuthQuery(queryRef as never, { organizationId: "org_1" } as never),
    );

    const request = vi.mocked(getAuth).mock.calls[0]?.[0] as Request;
    expect(request.headers.get("authorization")).toBe("Bearer mobile-session");
    expect(request.headers.get("x-qentrah-client")).toBe("mobile");
    expect(getToken).toHaveBeenCalledWith({ template: "convex" });
    expect(fetchQuery).toHaveBeenCalledWith(queryRef, { organizationId: "org_1" }, { token: "convex-mobile-token" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("falls back to the Next auth context outside Hono requests", async () => {
    const getToken = vi.fn(async () => "convex-web-token");
    vi.mocked(auth).mockResolvedValue({
      userId: "user_1",
      getToken,
    } as never);

    await fetchAuthQuery(queryRef as never, { organizationId: "org_1" } as never);

    expect(auth).toHaveBeenCalled();
    expect(getAuth).not.toHaveBeenCalled();
    expect(fetchQuery).toHaveBeenCalledWith(queryRef, { organizationId: "org_1" }, { token: "convex-web-token" });
  });
});
