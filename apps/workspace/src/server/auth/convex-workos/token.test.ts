import { describe, expect, it, vi } from "vitest";
import { resolveConvexAuthToken } from "./token";

vi.mock("@workos-inc/authkit-nextjs", () => ({
  withAuth: vi.fn(async () => ({ accessToken: "workos-session-token" })),
}));

describe("WorkOS Convex token bridge", () => {
  it("uses bearer tokens before session cookies", async () => {
    const headers = new Headers({
      authorization: "Bearer bearer-token",
      cookie: "qentrah_workos_access=session-cookie-token",
      "content-length": "10",
      "transfer-encoding": "chunked",
    });

    await expect(resolveConvexAuthToken(headers)).resolves.toBe("bearer-token");

    expect(headers.get("content-length")).toBeNull();
    expect(headers.get("transfer-encoding")).toBeNull();
    expect(headers.get("accept-encoding")).toBe("identity");
  });

  it("uses the transitional WorkOS access cookie when no bearer token exists", async () => {
    const headers = new Headers({ cookie: "qentrah_workos_access=session-cookie-token" });

    await expect(resolveConvexAuthToken(headers)).resolves.toBe("session-cookie-token");
  });

  it("falls back to the WorkOS AuthKit session", async () => {
    const headers = new Headers();

    await expect(resolveConvexAuthToken(headers)).resolves.toBe("workos-session-token");
  });
});
