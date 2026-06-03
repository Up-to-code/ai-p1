import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticateWithSessionCookie: vi.fn(),
  convexQuery: vi.fn(),
}));

vi.mock("@/packages/config", () => ({
  workosRuntimeConfig: {
    clientId: "client_test",
    cookiePassword: "x".repeat(32),
    issuer: "https://api.workos.com",
  },
}));

vi.mock("./client", () => ({
  getWorkOSClient: () => ({
    userManagement: {
      authenticateWithSessionCookie: mocks.authenticateWithSessionCookie,
      getJwksUrl: () => "https://api.workos.com/jwks",
    },
  }),
}));

vi.mock("@/server/convex/http-client", () => ({
  convexCalls: {
    query: mocks.convexQuery,
  },
}));

import { resolveWorkOSSessionFromHeaders } from "./session";

describe("WorkOS session resolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authenticateWithSessionCookie.mockResolvedValue({
      authenticated: true,
      user: { id: "user_workos" },
      organizationId: "org_workos",
      role: "admin",
      roles: ["admin"],
      permissions: ["workspace:read"],
      sessionId: "session_1",
    });
    mocks.convexQuery.mockResolvedValue({
      userId: "user_local",
      workosUserId: "user_workos",
      organizationId: "org_local",
      workosOrganizationId: "org_workos",
      roles: ["member"],
      permissions: [],
    });
  });

  it("accepts a sealed mobile WorkOS session from the authorization header", async () => {
    await expect(resolveWorkOSSessionFromHeaders(new Headers({
      authorization: "WorkOS-Session sealed_session",
    }))).resolves.toEqual(expect.objectContaining({
      userId: "user_local",
      workosUserId: "user_workos",
      organizationId: "org_local",
      workosOrganizationId: "org_workos",
      role: "admin",
      roles: ["admin"],
      permissions: ["workspace:read"],
      sessionId: "session_1",
    }));

    expect(mocks.authenticateWithSessionCookie).toHaveBeenCalledWith({
      sessionData: "sealed_session",
      cookiePassword: "x".repeat(32),
    });
    expect(mocks.convexQuery).toHaveBeenCalledWith(expect.anything(), {
      workosUserId: "user_workos",
      workosOrganizationId: "org_workos",
    });
  });

  it("rejects invalid sealed mobile sessions", async () => {
    mocks.authenticateWithSessionCookie.mockResolvedValue({ authenticated: false, reason: "invalid_session_cookie" });

    await expect(resolveWorkOSSessionFromHeaders(new Headers({
      authorization: "WorkOS-Session expired",
    }))).rejects.toThrow("WorkOS mobile session is invalid.");
  });
});
