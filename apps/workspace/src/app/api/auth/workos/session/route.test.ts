import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  resolveWorkOSSessionFromHeaders: vi.fn(),
  workosAccessTokenFromHeaders: vi.fn(),
  workosSealedSessionFromHeaders: vi.fn(),
}));

vi.mock("@convex/_generated/api", () => ({
  api: { workosAuth: { resolveSession: "workosAuth.resolveSession" } },
}));

vi.mock("@/server/convex/http-client", () => ({
  convexCalls: { query: vi.fn() },
}));

vi.mock("@workos-inc/authkit-nextjs", () => ({
  withAuth: vi.fn(),
}));

vi.mock("@/server/auth/workos/session", () => ({
  resolveWorkOSSessionFromHeaders: mocks.resolveWorkOSSessionFromHeaders,
  workosAccessTokenFromHeaders: mocks.workosAccessTokenFromHeaders,
  workosSealedSessionFromHeaders: mocks.workosSealedSessionFromHeaders,
}));

import { GET } from "./route";

describe("GET /api/auth/workos/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.workosAccessTokenFromHeaders.mockReturnValue("");
    mocks.workosSealedSessionFromHeaders.mockReturnValue("sealed_session");
    mocks.resolveWorkOSSessionFromHeaders.mockResolvedValue({
      userId: "user_workos",
      workosUserId: "user_workos",
      userName: "Ahmed Mansour",
      userEmail: "ahmed@example.com",
      userImage: "https://workoscdn.example/avatar.png",
      organizationId: "org_local",
      workosOrganizationId: "org_workos",
      organizationName: "Ahmed",
      role: "admin",
      roles: ["admin"],
      permissions: ["workspace:read"],
    });
  });

  it("returns the real mobile WorkOS user profile from a sealed session", async () => {
    const response = await GET(new Request("https://app.qentrah.com/api/auth/workos/session", {
      headers: { authorization: "WorkOS-Session sealed_session" },
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      session: {
        user: {
          id: "user_workos",
          workosUserId: "user_workos",
          name: "Ahmed Mansour",
          email: "ahmed@example.com",
          image: "https://workoscdn.example/avatar.png",
        },
        organization: {
          id: "org_local",
          workosOrganizationId: "org_workos",
          name: "Ahmed",
          role: "admin",
          roles: ["admin"],
          permissions: ["workspace:read"],
        },
      },
    });
  });
});
