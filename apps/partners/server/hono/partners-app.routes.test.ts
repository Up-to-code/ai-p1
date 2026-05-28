import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCurrentPartnerSubject = vi.fn();
const getCurrentPartnerSession = vi.fn();
const adminList = vi.fn();
const adminGet = vi.fn();
const listPublished = vi.fn();
const getPublished = vi.fn();
const verifyAuthorization = vi.fn();
const mcpList = vi.fn();
const validateAccess = vi.fn();
const readResource = vi.fn();
const writeResource = vi.fn();
const recordRequestLog = vi.fn();
const createAuthorizationCode = vi.fn();
const exchangeAuthorizationCode = vi.fn();
const rotateRefreshToken = vi.fn();

vi.mock("@/lib/auth-server", () => ({
  requireCurrentPartnerSubject,
  getCurrentPartnerSession,
}));

vi.mock("@/server/adminPartnerApps", () => ({
  adminPartnerAppsRepository: {
    list: adminList,
    get: adminGet,
    review: vi.fn(),
  },
}));

vi.mock("@/server/platformApi", () => ({
  platformPartnerAppsRepository: {
    listPublished,
    getPublished,
    verifyAuthorization,
  },
}));

vi.mock("@/server/mcp/connections", () => ({
  partnerMcpConnectionsRepository: {
    list: mcpList,
    create: vi.fn(),
    update: vi.fn(),
    revoke: vi.fn(),
    rotate: vi.fn(),
  },
}));

vi.mock("@/server/sandbox/store", () => ({
  sandboxStore: {
    validateAccess,
    readResource,
    writeResource,
    recordRequestLog,
    createAuthorizationCode,
    exchangeAuthorizationCode,
    rotateRefreshToken,
  },
}));

function route(path: string, init?: RequestInit) {
  return new Request(`http://partners.test${path}`, init);
}

async function json(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("Partners Hono route matrix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PARTNERS_ADMIN_SERVICE_TOKEN = "admin-token";
    process.env.PARTNERS_PLATFORM_SERVICE_TOKEN = "platform-token";
    adminList.mockResolvedValue({ apps: [], nextCursor: null });
    adminGet.mockResolvedValue(null);
    listPublished.mockResolvedValue({ apps: [], nextCursor: null });
    getPublished.mockResolvedValue(null);
    verifyAuthorization.mockResolvedValue({ ok: true });
    mcpList.mockResolvedValue([]);
    recordRequestLog.mockResolvedValue({ ok: true });
  });

  it("returns JSON for unknown routes", async () => {
    const { partnersHonoApp } = await import("./partners-app");
    const response = await partnersHonoApp.request(route("/api/nope"));

    expect(response.status).toBe(404);
    await expect(json(response)).resolves.toEqual({ error: "Not Found" });
  });

  it("protects Partners admin APIs with the admin service token and parses list filters", async () => {
    const { partnersHonoApp } = await import("./partners-app");

    const rejected = await partnersHonoApp.request(route("/api/admin/partner-apps"));
    expect(rejected.status).toBe(400);
    await expect(json(rejected)).resolves.toMatchObject({
      error: "Invalid Partners admin service token.",
    });

    const accepted = await partnersHonoApp.request(route("/api/admin/partner-apps?limit=2&search=crm", {
      headers: { authorization: "Bearer admin-token" },
    }));

    expect(accepted.status).toBe(200);
    expect(adminList).toHaveBeenCalledWith({ limit: 2, cursor: undefined, search: "crm" });
    await expect(json(accepted)).resolves.toEqual({ apps: [], nextCursor: null });
  });

  it("protects platform catalog APIs with the platform service token and supports header auth", async () => {
    const { partnersHonoApp } = await import("./partners-app");

    const rejected = await partnersHonoApp.request(route("/api/platform/published-apps"));
    expect(rejected.status).toBe(400);
    await expect(json(rejected)).resolves.toMatchObject({
      error: "Invalid Partners platform service token.",
    });

    const accepted = await partnersHonoApp.request(route("/api/platform/published-apps?limit=3&updatedSince=42", {
      headers: { "x-qentrah-platform-token": "platform-token" },
    }));

    expect(accepted.status).toBe(200);
    expect(listPublished).toHaveBeenCalledWith({ limit: 3, cursor: undefined, updatedSince: 42 });
  });

  it("requires a signed-in partner subject for partner-owned MCP connection APIs", async () => {
    const { partnersHonoApp } = await import("./partners-app");
    requireCurrentPartnerSubject.mockRejectedValueOnce(new Error("Sign in required."));

    const rejected = await partnersHonoApp.request(route("/api/v1/mcp-connections"));
    expect(rejected.status).toBe(400);
    await expect(json(rejected)).resolves.toMatchObject({
      error: "Sign in required.",
    });

    requireCurrentPartnerSubject.mockResolvedValueOnce("partner_user_1");
    const accepted = await partnersHonoApp.request(route("/api/v1/mcp-connections"));
    expect(accepted.status).toBe(200);
    expect(mcpList).toHaveBeenCalledWith("partner_user_1");
  });

  it("rejects bearer tokens in query strings and accepts scoped sandbox bearer access", async () => {
    const { partnersHonoApp } = await import("./partners-app");

    const queryToken = await partnersHonoApp.request(route("/api/v1/partner/organizations/org_1/clients?access_token=raw"));
    expect(queryToken.status).toBe(400);
    await expect(json(queryToken)).resolves.toEqual({
      error: "Bearer tokens must use the Authorization header.",
    });

    validateAccess.mockResolvedValueOnce({
      ok: true,
      partnerAuthSubject: "partner_user_1",
      partnerAppId: "app_1",
      organizationId: "org_1",
      clientId: "client_1",
      scopes: ["client:read"],
    });
    readResource.mockResolvedValueOnce([{ id: "client_resource_1" }]);

    const accepted = await partnersHonoApp.request(route("/api/v1/partner/organizations/org_1/clients?limit=5", {
      headers: { authorization: "Bearer sandbox-access-token" },
    }));

    expect(accepted.status).toBe(200);
    expect(readResource).toHaveBeenCalledWith({
      partnerAppId: "app_1",
      organizationId: "org_1",
      resource: "client",
      resourceId: undefined,
      limit: 5,
    });
    await expect(json(accepted)).resolves.toEqual({ data: [{ id: "client_resource_1" }] });
  });

  it("exercises sandbox OAuth authorization, invalid grants, and PKCE token exchange", async () => {
    const { partnersHonoApp } = await import("./partners-app");

    getCurrentPartnerSession.mockResolvedValueOnce(null);
    const anonymous = await partnersHonoApp.request(route("/sandbox/oauth/authorize"));
    expect(anonymous.status).toBe(401);
    await expect(json(anonymous)).resolves.toMatchObject({ error: "login_required" });

    getCurrentPartnerSession.mockResolvedValueOnce({ user: { id: "partner_user_1" } });
    createAuthorizationCode.mockResolvedValueOnce({
      code: "sandbox_code_1",
      redirectUri: "https://partner.example.com/callback",
      organizationId: "sandbox_org_1",
    });
    const redirect = await partnersHonoApp.request(route(
      "/sandbox/oauth/authorize?response_type=code&client_id=partners_client_1&redirect_uri=https%3A%2F%2Fpartner.example.com%2Fcallback&scope=client%3Aread&state=state_1&code_challenge=challenge_1&code_challenge_method=S256",
    ));
    expect(redirect.status).toBe(302);
    expect(redirect.headers.get("location")).toBe("https://partner.example.com/callback?code=sandbox_code_1&organization_id=sandbox_org_1&state=state_1");

    const unsupported = await partnersHonoApp.request(route("/sandbox/oauth/token", {
      method: "POST",
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    }));
    expect(unsupported.status).toBe(400);
    await expect(json(unsupported)).resolves.toMatchObject({ error: "unsupported_grant_type" });

    exchangeAuthorizationCode.mockResolvedValueOnce({
      organizationId: "sandbox_org_1",
      scopes: ["client:read"],
      expiresIn: 3600,
    });
    const exchanged = await partnersHonoApp.request(route("/sandbox/oauth/token", {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: "sandbox_code_1",
        client_id: "partners_client_1",
        redirect_uri: "https://partner.example.com/callback",
        code_verifier: "verifier_1",
      }),
    }));
    const payload = await json(exchanged);
    expect(exchanged.status).toBe(200);
    expect(payload).toMatchObject({
      token_type: "Bearer",
      expires_in: 3600,
      scope: "client:read",
      organization_id: "sandbox_org_1",
      mode: "sandbox",
    });
    expect(String(payload.access_token)).toMatch(/^sandbox_access_/u);
    expect(String(payload.refresh_token)).toMatch(/^sandbox_refresh_/u);
  });
});
