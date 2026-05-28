import { describe, expect, it, vi } from "vitest";
import {
  organizationApiPath,
  readOrganizationJsonResponse,
  requestOrganizationAction,
} from "./organization-request";

describe("organization request module", () => {
  it("encodes organization-scoped route segments", () => {
    expect(organizationApiPath("org 1", "members", "user/email@example.com", "role")).toBe(
      "/api/v1/organizations/org%201/members/user%2Femail%40example.com/role",
    );
  });

  it("preserves JSON error fallback behavior", async () => {
    await expect(
      readOrganizationJsonResponse(new Response("not-json", { status: 500 }), "Fallback error."),
    ).rejects.toThrow("Fallback error.");

    await expect(
      readOrganizationJsonResponse(
        new Response(JSON.stringify({ error: "Server error." }), { status: 400 }),
        "Fallback error.",
      ),
    ).rejects.toThrow("Server error.");
  });

  it("sends JSON bodies only when a body is provided", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);

    await requestOrganizationAction("/api/v1/organizations/org_1/roles", "POST", { role: "sales" }, "Failed.");
    await requestOrganizationAction("/api/v1/organizations/org_1/roles", "GET", undefined, "Failed.");

    expect(fetcher).toHaveBeenNthCalledWith(1, "/api/v1/organizations/org_1/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "sales" }),
    });
    expect(fetcher).toHaveBeenNthCalledWith(2, "/api/v1/organizations/org_1/roles", {
      method: "GET",
      headers: undefined,
      body: undefined,
    });

    vi.unstubAllGlobals();
  });

  it("also supports static organization routes outside an organization id", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ inviteLink: { id: "link_1" } }), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);

    await requestOrganizationAction("/api/v1/organizations/invite-links/accept", "POST", { token: "invite_token" }, "Failed.");

    expect(fetcher).toHaveBeenCalledWith("/api/v1/organizations/invite-links/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "invite_token" }),
    });

    vi.unstubAllGlobals();
  });
});
