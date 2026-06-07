import { describe, expect, it, vi } from "vitest";
import { WorkspaceApiError, loadQentrahClients } from "./workspace-api";
import { buildQentrahAuthorizeUrl } from "./oauth-url";
import { localDemoRegistration } from "./local-demo-registration";
import { createCodeChallenge, createCodeVerifier, createPkcePair } from "./pkce";
import { exchangeAuthorizationCode, refreshAccessToken } from "./token-exchange";

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("partner OAuth examples", () => {
  it("builds an organization authorization URL with PKCE and canonical scopes", () => {
    const url = new URL(buildQentrahAuthorizeUrl({
      workspaceBaseUrl: "http://localhost:3000/",
      clientId: "partners_client_123",
      redirectUri: "https://pdf.example.com/api/auth/qentrah/callback",
      scopes: ["organization:read", "client:read", "asset:read"],
      state: "state-123",
      codeChallenge: "challenge-123",
      organizationId: "org_123",
    }));

    expect(url.origin).toBe("http://localhost:3000");
    expect(url.pathname).toBe("/oauth/authorize");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("partners_client_123");
    expect(url.searchParams.get("scope")).toBe("organization:read client:read asset:read");
    expect(url.searchParams.get("resource")).toBe("http://localhost:3000/api/v1/partner");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("organization_id")).toBe("org_123");
  });

  it("builds the current local Qentrah OAuth Demo authorization URL", () => {
    const url = new URL(buildQentrahAuthorizeUrl({
      workspaceBaseUrl: "http://localhost:3000",
      clientId: localDemoRegistration.clientId,
      redirectUri: localDemoRegistration.redirectUri,
      scopes: [...localDemoRegistration.scopes],
      state: "local-state",
      codeChallenge: "local-challenge",
    }));

    expect(url.pathname).toBe("/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe("partners_client_4p2f001r194s5z6e15473f582m331f4z4s0f");
    expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:3004/api/auth/qentrah/callback");
    expect(url.searchParams.get("resource")).toBe("http://localhost:3000/api/v1/partner");
    expect(url.searchParams.get("scope")).toBe([
      "calendar:read",
      "client:create",
      "client:read",
      "client:update",
      "media:read",
      "organization:read",
      "project:read",
      "asset:read",
      "task:read",
    ].join(" "));
  });

  it("creates a valid PKCE verifier and S256 challenge", async () => {
    const verifier = createCodeVerifier();
    const challenge = await createCodeChallenge(verifier);

    expect(verifier).toHaveLength(64);
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/u);
    expect(challenge).not.toBe(verifier);
  });

  it("creates the documented PKCE pair for backend authorize routes", async () => {
    const pkce = await createPkcePair();

    expect(pkce.verifier).toHaveLength(64);
    expect(pkce.challenge).toMatch(/^[A-Za-z0-9_-]+$/u);
    expect(pkce.challenge).not.toBe(pkce.verifier);
  });

  it("exchanges an authorization code from the backend", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      access_token: "access-token",
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: "refresh-token",
      scope: "organization:read client:read",
    }));

    const tokens = await exchangeAuthorizationCode({
      workspaceBaseUrl: "localhost:3000",
      clientId: "partners_client_123",
      code: "code-123",
      redirectUri: "https://pdf.example.com/api/auth/qentrah/callback",
      codeVerifier: "verifier-123",
      fetcher,
    });

    expect(tokens.access_token).toBe("access-token");
    const [, init] = fetcher.mock.calls[0];
    expect(String(fetcher.mock.calls[0][0])).toBe("https://localhost:3000/oauth/token");
    expect(String(init?.body)).toContain("grant_type=authorization_code");
    expect(String(init?.body)).toContain("code_verifier=verifier-123");
    expect(String(init?.body)).toContain("resource=https%3A%2F%2Flocalhost%3A3000%2Fapi%2Fv1%2Fpartner");
  });

  it("refreshes access tokens without exposing them to the browser", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      access_token: "new-access-token",
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: "new-refresh-token",
    }));

    const tokens = await refreshAccessToken({
      workspaceBaseUrl: "http://localhost:3000",
      clientId: "partners_client_123",
      refreshToken: "refresh-token",
      fetcher,
    });

    expect(tokens.access_token).toBe("new-access-token");
    expect(String(fetcher.mock.calls[0][1]?.body)).toContain("grant_type=refresh_token");
  });

  it("loads clients from Workspace Hono APIs using the bearer token", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ clients: [{ id: "client_1" }] }));

    const payload = await loadQentrahClients({
      workspaceBaseUrl: "http://localhost:3000",
      organizationId: "org_123",
      accessToken: "access-token",
      fetcher,
    });

    expect(payload).toEqual({ clients: [{ id: "client_1" }] });
    expect(fetcher.mock.calls[0][0]).toBe("http://localhost:3000/api/v1/partner/organizations/org_123/clients");
    expect(fetcher.mock.calls[0][1]?.headers).toEqual({ authorization: "Bearer access-token" });
  });

  it("surfaces expired organization authorization errors", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: "connection_expired",
      message: "Reconnect this organization.",
    }, 401));

    await expect(loadQentrahClients({
      workspaceBaseUrl: "http://localhost:3000",
      organizationId: "org_123",
      accessToken: "expired-token",
      fetcher,
    })).rejects.toMatchObject(new WorkspaceApiError("Reconnect this organization.", "connection_expired", 401));
  });
});
