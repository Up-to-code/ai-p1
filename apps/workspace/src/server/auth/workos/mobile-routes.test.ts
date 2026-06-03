import { describe, expect, it, vi } from "vitest";

const workos = {
  userManagement: {
    authenticateWithCode: vi.fn(),
    getAuthorizationUrlWithPKCE: vi.fn(),
  },
};

vi.mock("@/packages/config", () => ({
  workosRuntimeConfig: {
    apiBaseUrl: "https://api.workos.com",
    clientId: "client_test",
    cookiePassword: "x".repeat(32),
    mobileCallbackUrl: "qentrah://auth-callback",
  },
}));

vi.mock("@/server/auth/workos", () => ({
  assertWorkOSConfigured: vi.fn(),
  getWorkOSClient: () => workos,
}));

import { workosMobileAuthRouter } from "./mobile-routes";

describe("mobile WorkOS Hono routes", () => {
  it("returns a Qentrah authorize URL for iOS auth-session prompts", async () => {
    workos.userManagement.getAuthorizationUrlWithPKCE.mockResolvedValue({
      url: "https://api.workos.com/user_management/authorize?provider=AppleOAuth&state=state_1",
      state: "state_1",
      codeVerifier: "verifier_1",
    });

    const response = await workosMobileAuthRouter.request(
      "https://app.qentrah.com/start?provider=apple&return_to=exp%3A%2F%2F192.168.1.167%3A8081%2F--%2Fauth-callback",
    );
    const payload = await response.json() as {
      codeVerifier?: string;
      ok?: boolean;
      state?: string;
      url?: string;
    };
    const authorizeUrl = new URL(payload.url ?? "");

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.state).toBe("state_1");
    expect(payload.codeVerifier).toBe("verifier_1");
    expect(authorizeUrl.origin).toBe("https://app.qentrah.com");
    expect(authorizeUrl.pathname).toBe("/api/auth/workos/mobile/authorize");
    expect(authorizeUrl.searchParams.get("to")).toBe(
      "https://api.workos.com/user_management/authorize?provider=AppleOAuth&state=state_1",
    );
    expect(workos.userManagement.getAuthorizationUrlWithPKCE).toHaveBeenCalledWith(expect.objectContaining({
      redirectUri: "qentrah://auth-callback",
    }));
  });

  it("redirects only to WorkOS authorization URLs", async () => {
    const valid = await workosMobileAuthRouter.request(
      "https://app.qentrah.com/authorize?to=https%3A%2F%2Fapi.workos.com%2Fuser_management%2Fauthorize%3Fprovider%3DGoogleOAuth",
    );
    const invalid = await workosMobileAuthRouter.request(
      "https://app.qentrah.com/authorize?to=https%3A%2F%2Fevil.example%2Fuser_management%2Fauthorize",
    );

    expect(valid.status).toBe(302);
    expect(valid.headers.get("location")).toBe(
      "https://api.workos.com/user_management/authorize?provider=GoogleOAuth",
    );
    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toEqual({
      ok: false,
      error: "Qentrah sign-in could not start.",
    });
  });
});
