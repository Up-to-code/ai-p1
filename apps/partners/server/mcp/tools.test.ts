import { beforeEach, describe, expect, it, vi } from "vitest";
import { callPartnerMcpTool, partnerMcpToolDefinitions } from "./tools";
import type { PartnerMcpPermission } from "./permissions";

vi.mock("@/server/partnerApps", () => ({
  partnerAppsRepository: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    submitForReview: vi.fn(),
  },
}));

vi.mock("@/server/sandbox", () => ({
  sandboxRepository: {
    get: vi.fn(),
  },
}));

const allPermissions: PartnerMcpPermission[] = [
  { resource: "partner_apps", actions: ["read", "create", "update", "delete", "submit"] },
  { resource: "sandbox", actions: ["read"] },
  { resource: "guidance", actions: ["read"] },
];

describe("Partner MCP tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists partner apps with next-step guidance", async () => {
    const { partnerAppsRepository } = await import("@/server/partnerApps");
    vi.mocked(partnerAppsRepository.list).mockResolvedValue([
      {
        id: "app_1",
        clientId: "client_1",
        name: "Demo",
        publisherName: "Qentrah",
        clientType: "public",
        status: "draft",
        redirectUris: ["https://example.com/callback"],
        allowedScopes: ["organization:read"],
        authorizationExpiresAfterDays: 30,
        createdAt: 1,
        updatedAt: 1,
      },
    ]);

    const result = await callPartnerMcpTool({ authSubject: "user_1", permissions: allPermissions }, "partner_apps_list", {});

    expect(partnerAppsRepository.list).toHaveBeenCalledWith("user_1");
    expect(result.content[0]?.text).toContain("Finish redirect URIs");
  });

  it("does not return OAuth client secrets when creating confidential apps", async () => {
    const { partnerAppsRepository } = await import("@/server/partnerApps");
    vi.mocked(partnerAppsRepository.create).mockResolvedValue({
      appId: "app_1",
      clientId: "client_1",
      clientSecret: "secret_should_not_return",
    });

    const result = await callPartnerMcpTool({ authSubject: "user_1", permissions: allPermissions }, "partner_apps_create", {
      name: "Demo",
      publisherName: "Qentrah",
      homepageUrl: "https://example.com",
      clientType: "confidential",
      redirectUris: ["https://example.com/callback"],
      allowedScopes: ["organization:read"],
    });

    expect(result.content[0]?.text).toContain("OAuth client secrets are not revealed");
    expect(result.content[0]?.text).not.toContain("secret_should_not_return");
  });

  it("blocks writes when the MCP link lacks write permission", async () => {
    await expect(callPartnerMcpTool(
      { authSubject: "user_1", permissions: [{ resource: "partner_apps", actions: ["read"] }] },
      "partner_apps_delete",
      { appId: "app_1" },
    )).rejects.toThrow("cannot delete");
  });

  it("returns the full authorization lifecycle map without secrets", async () => {
    const result = await callPartnerMcpTool(
      { authSubject: "user_1", permissions: allPermissions },
      "partner_authorization_flow",
      {},
    );
    const text = result.content[0]?.text ?? "";

    expect(text).toContain("/docs/authorization-lifecycle");
    expect(text).toContain("Workspace resource APIs verify every call");
    expect(text).toContain("partner_sandbox_status");
    expect(text).not.toMatch(/mcp_secret|clientSecret|secret_should_not_return/i);
  });

  it("requires guidance permission for authorization lifecycle guidance", async () => {
    await expect(callPartnerMcpTool(
      { authSubject: "user_1", permissions: [{ resource: "partner_apps", actions: ["read"] }] },
      "partner_authorization_flow",
      {},
    )).rejects.toThrow("cannot read authorization flow guidance");
  });

  it("summarizes sandbox logs as lifecycle evidence", async () => {
    const { sandboxRepository } = await import("@/server/sandbox");
    vi.mocked(sandboxRepository.get).mockResolvedValue({
      organization: {
        id: "sandbox_1",
        organizationId: "sandbox_org_1",
        name: "Sandbox Org",
        createdAt: 1,
        updatedAt: 1,
      },
      scopes: ["client:read", "client:create"],
      logs: [
        {
          id: "log_1",
          method: "POST",
          path: "/api/v1/partner/organizations/sandbox_org_1/clients",
          status: 200,
          latencyMs: 18,
          scopes: ["client:create"],
          input: { name: "Sandbox Buyer", access_token: "must-not-summarize" },
          response: { data: { id: "client_1", name: "Sandbox Buyer" } },
          error: undefined,
          createdAt: 123,
        },
      ],
    });

    const result = await callPartnerMcpTool(
      { authSubject: "user_1", permissions: allPermissions },
      "partner_sandbox_status",
      { appId: "app_1" },
    );
    const payload = JSON.parse(result.content[0]?.text ?? "{}");

    expect(sandboxRepository.get).toHaveBeenCalledWith("user_1", "app_1");
    expect(payload.sandbox.organization.organizationId).toBe("sandbox_org_1");
    expect(payload.logs.count).toBe(1);
    expect(payload.logs.recent[0]).toMatchObject({
      method: "POST",
      status: 200,
      latencyMs: 18,
      inputSummary: "name",
      responseSummary: "data",
    });
    expect(JSON.stringify(payload)).not.toContain("must-not-summarize");
    expect(payload.sandbox.logs[0].input.access_token).toBe("[redacted]");
  });

  it("keeps tool definitions free of local MCP secrets", () => {
    expect(JSON.stringify(partnerMcpToolDefinitions)).not.toMatch(/mcp_secret|client_secret|clientSecret/i);
  });
});
