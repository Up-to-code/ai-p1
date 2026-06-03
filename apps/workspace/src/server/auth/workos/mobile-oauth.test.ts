import { beforeEach, describe, expect, it, vi } from "vitest";

const workos = {
  userManagement: {
    authenticateWithCode: vi.fn(),
    getAuthorizationUrlWithPKCE: vi.fn(),
  },
};

vi.mock("@/packages/config", () => ({
  workosRuntimeConfig: {
    clientId: "client_test",
    mobileCallbackUrl: "qentrah://auth-callback",
  },
}));

vi.mock("@/server/auth/workos", () => ({
  assertWorkOSConfigured: vi.fn(),
  getWorkOSClient: () => workos,
}));

import { completeMobileOAuth, safeMobileReturnTo, startMobileOAuth, workosMobileProvider } from "./mobile-oauth";
import { mobileOAuthErrorMessage } from "./mobile-password";

describe("mobile WorkOS OAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    workos.userManagement.getAuthorizationUrlWithPKCE.mockResolvedValue({
      url: "https://api.workos.com/user_management/authorize?provider=GoogleOAuth",
      state: "state_1",
      codeVerifier: "verifier_1",
    });
    workos.userManagement.authenticateWithCode.mockResolvedValue({
      accessToken: "access_1",
      refreshToken: "refresh_1",
    });
  });

  it("maps supported mobile providers to WorkOS OAuth providers", () => {
    expect(workosMobileProvider("apple")).toBe("AppleOAuth");
    expect(workosMobileProvider("google")).toBe("GoogleOAuth");
    expect(workosMobileProvider(null)).toBe("authkit");
  });

  it("starts direct mobile OAuth with the app callback and without social screen hints", async () => {
    await expect(startMobileOAuth({
      provider: "google",
      returnTo: "qentrah://auth-callback",
      screenHint: "sign-up",
    })).resolves.toEqual({
      url: "https://api.workos.com/user_management/authorize?provider=GoogleOAuth",
      state: "state_1",
      codeVerifier: "verifier_1",
    });

    expect(workos.userManagement.getAuthorizationUrlWithPKCE).toHaveBeenCalledWith({
      provider: "GoogleOAuth",
      clientId: "client_test",
      redirectUri: "qentrah://auth-callback",
      organizationId: undefined,
      loginHint: undefined,
    });
  });

  it("accepts the Expo Router callback form and legacy host-style callback", () => {
    expect(safeMobileReturnTo("qentrah:///auth-callback")).toBe("qentrah:///auth-callback");
    expect(safeMobileReturnTo("qentrah://auth-callback")).toBe("qentrah://auth-callback");
    expect(safeMobileReturnTo("https://app.qentrah.com/api/auth/workos/mobile/callback")).toBe("qentrah://auth-callback");
  });

  it("uses configured mobile callback fallback when returnTo is invalid", async () => {
    const { workosRuntimeConfig } = await import("@/packages/config");
    const originalCallback = workosRuntimeConfig.mobileCallbackUrl;
    try {
      workosRuntimeConfig.mobileCallbackUrl = "https://app.qentrah.com/api/auth/workos/mobile/callback";
      expect(safeMobileReturnTo("invalid-callback")).toBe(workosRuntimeConfig.mobileCallbackUrl);
    } finally {
      workosRuntimeConfig.mobileCallbackUrl = originalCallback;
    }
  });

  it("keeps screen hints only for AuthKit", async () => {
    await startMobileOAuth({
      provider: null,
      returnTo: "qentrah://auth-callback",
      screenHint: "sign-up",
    });

    expect(workos.userManagement.getAuthorizationUrlWithPKCE).toHaveBeenCalledWith(expect.objectContaining({
      provider: "authkit",
      screenHint: "sign-up",
    }));
  });

  it("exchanges the mobile code with the provided PKCE verifier", async () => {
    await expect(completeMobileOAuth({
      code: " code_1 ",
      codeVerifier: " verifier_1 ",
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
    })).resolves.toEqual({
      accessToken: "access_1",
      refreshToken: "refresh_1",
    });

    expect(workos.userManagement.authenticateWithCode).toHaveBeenCalledWith({
      clientId: "client_test",
      code: "code_1",
      codeVerifier: "verifier_1",
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
    });
  });

  it("keeps OAuth linked-account errors out of password copy", () => {
    expect(mobileOAuthErrorMessage(new Error("User not found.")))
      .toBe("No Qentrah account is linked to this social sign-in. Create an account first or sign in with email.");
    expect(mobileOAuthErrorMessage(new Error("The email or password does not match a Qentrah account.")))
      .toBe("No Qentrah account is linked to this social sign-in. Create an account first or sign in with email.");
    expect(mobileOAuthErrorMessage(new Error("WorkOS API key and client id are required.")))
      .toBe("Qentrah social sign-in is not ready in this build.");
  });
});
