import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  convexQuery: vi.fn(),
  resolveWorkOSSessionFromHeaders: vi.fn(),
  workosAccessTokenFromHeaders: vi.fn(),
  workosSealedSessionFromHeaders: vi.fn(),
}));

vi.mock("@convex/_generated/api", () => ({
  api: { workosAuth: { listUserOrganizations: "workosAuth.listUserOrganizations" } },
}));

vi.mock("@/server/convex/http-client", () => ({
  convexCalls: { query: mocks.convexQuery },
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

describe("GET /api/auth/workos/organizations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.workosAccessTokenFromHeaders.mockReturnValue("");
    mocks.workosSealedSessionFromHeaders.mockReturnValue("sealed_session");
    mocks.resolveWorkOSSessionFromHeaders.mockResolvedValue({
      userId: "user_workos",
      workosUserId: "user_workos",
      organizationId: "org_local",
      workosOrganizationId: "org_workos",
      roles: ["admin"],
      permissions: ["workspace:read"],
    });
    mocks.convexQuery.mockResolvedValue([
      {
        organizationId: "org_local",
        workosOrganizationId: "org_workos",
        name: "Ahmed",
        role: "admin",
        roles: ["admin"],
      },
    ]);
  });

  it("lists organizations for a mobile sealed WorkOS session", async () => {
    const response = await GET(new Request("https://app.qentrah.com/api/auth/workos/organizations", {
      headers: { authorization: "WorkOS-Session sealed_session" },
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.convexQuery).toHaveBeenCalledWith("workosAuth.listUserOrganizations", {
      workosUserId: "user_workos",
    });
    expect(payload).toEqual({
      ok: true,
      activeWorkosOrganizationId: "org_workos",
      organizations: [
        {
          organizationId: "org_local",
          workosOrganizationId: "org_workos",
          name: "Ahmed",
          role: "admin",
          roles: ["admin"],
        },
      ],
    });
  });
});
