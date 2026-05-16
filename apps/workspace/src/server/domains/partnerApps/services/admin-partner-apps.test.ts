import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  adminServiceTokenFromEnv,
  assertAdminServiceToken,
  syncOAuthClientRuntime,
  upsertOAuthRuntimeProjection,
} from "./admin-partner-apps";
import { convexCalls } from "@/server/convex/http-client";

vi.mock("@/server/convex/http-client", () => ({
  convexCalls: {
    action: vi.fn(),
    mutation: vi.fn(),
    query: vi.fn(),
  },
}));

const convexActionMock = vi.mocked(convexCalls.action);

describe("Workspace partner app service tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WORKSPACE_ADMIN_SERVICE_TOKEN = "workspace-secret";
  });

  it("uses only the Workspace admin token for inbound admin API access", () => {
    expect(adminServiceTokenFromEnv({
      WORKSPACE_ADMIN_SERVICE_TOKEN: " workspace-secret ",
    })).toBe("workspace-secret");
  });

  it("does not accept the legacy platform token as an admin fallback", () => {
    const headers = new Headers({ authorization: "Bearer platform-secret" });

    expect(() => assertAdminServiceToken(headers, {
      WORKSPACE_ADMIN_SERVICE_TOKEN: undefined,
    })).toThrow("Invalid Workspace admin service token.");
  });

  it("accepts bearer and explicit header admin tokens", () => {
    expect(() => assertAdminServiceToken(
      new Headers({ authorization: "Bearer workspace-secret" }),
      { WORKSPACE_ADMIN_SERVICE_TOKEN: "workspace-secret" },
    )).not.toThrow();

    expect(() => assertAdminServiceToken(
      new Headers({ "x-workspace-admin-service-token": "workspace-secret" }),
      { WORKSPACE_ADMIN_SERVICE_TOKEN: "workspace-secret" },
    )).not.toThrow();
  });

  it("rejects same-prefix or length-mismatched admin token attempts", () => {
    expect(() => assertAdminServiceToken(
      new Headers({ authorization: "Bearer workspace-secret-extra" }),
      { WORKSPACE_ADMIN_SERVICE_TOKEN: "workspace-secret" },
    )).toThrow("Invalid Workspace admin service token.");

    expect(() => assertAdminServiceToken(
      new Headers({ authorization: "Bearer workspace-secreu" }),
      { WORKSPACE_ADMIN_SERVICE_TOKEN: "workspace-secret" },
    )).toThrow("Invalid Workspace admin service token.");
  });

  it("upserts the Better Auth OAuth client after Partners runtime sync", async () => {
    convexActionMock.mockResolvedValueOnce({ clientId: "partners_client_demo", created: true });

    await expect(syncOAuthClientRuntime({
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_demo",
      name: "Qentrah OAuth Demo",
      publisherName: "Qentrah",
      description: "Demo",
      homepageUrl: "http://localhost:3004",
      redirectUris: ["http://localhost:3004/api/auth/qentrah/callback"],
      allowedScopes: ["organization:read", "client:read"],
      clientType: "public",
      status: "approved",
    })).resolves.toMatchObject({
      partnersAppId: "partners_app_1",
      clientId: "partners_client_demo",
      status: "approved",
    });

    expect(convexActionMock).toHaveBeenCalledWith(expect.anything(), {
      input: expect.objectContaining({
        workspacePartnerAppId: "partners_app_1",
        clientId: "partners_client_demo",
        status: "approved",
        redirectUris: ["http://localhost:3004/api/auth/qentrah/callback"],
      }),
    });
  });

  it("maps partner app records to OAuth client sync input", async () => {
    convexActionMock.mockResolvedValueOnce({ clientId: "client_1", created: false });

    await upsertOAuthRuntimeProjection({
      partnersAppId: "partners_app_1",
      partnersClientId: "client_1",
      name: "PDF Creator",
      publisherName: "PDF Co",
      description: "Demo",
      redirectUris: ["http://localhost:3004/api/auth/qentrah/callback"],
      allowedScopes: ["client:update"],
      clientType: "public",
      status: "approved",
    });

    expect(convexActionMock).toHaveBeenCalledWith(expect.anything(), {
      input: expect.objectContaining({
        clientId: "client_1",
        clientType: "public",
        allowedScopes: ["client:update"],
      }),
    });
  });
});
