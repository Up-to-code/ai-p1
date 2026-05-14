import { describe, expect, it, vi } from "vitest";
import { requestedScopes } from "./config";
import { organizationIdFromAccessToken } from "./jwt";
import { buildAuthorizeUrl, exchangeAuthorizationCode } from "./oauth";
import { createCodeChallenge, createCodeVerifier } from "./pkce";

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function fakeJwt(payload: unknown) {
  return [
    Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url"),
    Buffer.from(JSON.stringify(payload)).toString("base64url"),
    "signature",
  ].join(".");
}

describe("Qentrah OAuth helpers", () => {
  it("builds the PKCE authorization URL with requested scopes", () => {
    const url = new URL(buildAuthorizeUrl({
      workspaceBaseUrl: "http://localhost:3000",
      clientId: "partners_client_123",
      redirectUri: "https://demo.vercel.app/api/auth/anan/callback",
      state: "state-123",
      codeChallenge: "challenge-123",
    }));

    expect(url.pathname).toBe("/oauth/authorize");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("partners_client_123");
    expect(url.searchParams.get("scope")).toBe(requestedScopes.join(" "));
    expect(url.searchParams.get("resource")).toBe("http://localhost:3000/api/v1/partner");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  });

  it("creates PKCE verifier and challenge values", async () => {
    const verifier = createCodeVerifier();
    const challenge = await createCodeChallenge(verifier);

    expect(verifier).toHaveLength(64);
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/u);
    expect(challenge).not.toBe(verifier);
  });

  it("exchanges an authorization code with the expected form body", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      access_token: "access",
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: "refresh",
      organization_id: "org_123",
    }));

    const tokens = await exchangeAuthorizationCode({
      workspaceBaseUrl: "http://localhost:3000",
      clientId: "partners_client_123",
      clientSecret: "secret",
      redirectUri: "https://demo.vercel.app/api/auth/anan/callback",
      code: "code-123",
      codeVerifier: "verifier-123",
      fetcher,
    });

    expect(tokens.access_token).toBe("access");
    expect(tokens.organization_id).toBe("org_123");
    expect(tokens.obtained_at).toEqual(expect.any(Number));
    expect(String(fetcher.mock.calls[0][0])).toBe("http://localhost:3000/oauth/token");
    expect(String(fetcher.mock.calls[0][1]?.body)).toContain("grant_type=authorization_code");
    expect(String(fetcher.mock.calls[0][1]?.body)).toContain("code_verifier=verifier-123");
    expect(String(fetcher.mock.calls[0][1]?.body)).toContain("resource=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fv1%2Fpartner");
    expect(String(fetcher.mock.calls[0][1]?.body)).toContain("client_secret=secret");
  });

  it("extracts organization id from access token claims", () => {
    expect(organizationIdFromAccessToken(fakeJwt({ organizationId: "org_123" }))).toBe("org_123");
    expect(organizationIdFromAccessToken(fakeJwt({ org_id: "org_456" }))).toBe("org_456");
  });
});
