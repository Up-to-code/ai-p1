import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function routeSource(path: string) {
  return readFileSync(resolve(workspaceRoot, path), "utf8");
}

describe("mobile WorkOS auth routes", () => {
  it("starts Apple and Google OAuth directly through WorkOS PKCE", () => {
    const source = routeSource("src/server/auth/workos/mobile-oauth.ts");
    const startRoute = routeSource("src/app/api/auth/workos/mobile/start/route.ts");

    expect(source).toContain("getAuthorizationUrlWithPKCE");
    expect(source).toContain("AppleOAuth");
    expect(source).toContain("GoogleOAuth");
    expect(source).toContain("provider,");
    expect(source).toContain("provider === \"authkit\"");
    expect(source).toContain("redirectUri,");
    expect(startRoute).toContain("url: auth.url");
    expect(startRoute).toContain("state: auth.state");
    expect(startRoute).toContain("codeVerifier: auth.codeVerifier");
  });

  it("forwards OAuth email verification challenges into the mobile code flow", () => {
    const source = routeSource("src/app/api/auth/workos/mobile/complete/route.ts");

    expect(source).toContain("mobileEmailVerificationChallenge");
    expect(source).toContain("emailVerification");
    expect(source).toContain("NextResponse.json");
    expect(source).toContain("status: 409");
  });

  it("exchanges mobile PKCE callbacks through JSON instead of server memory", () => {
    const source = routeSource("src/server/auth/workos/mobile-oauth.ts");
    const completeRoute = routeSource("src/app/api/auth/workos/mobile/complete/route.ts");

    expect(source).toContain("completeMobileOAuth");
    expect(source).toContain("authenticateWithCode");
    expect(source).not.toContain("new Map");
    expect(completeRoute).toContain("codeVerifier");
    expect(completeRoute).toContain("mobileEmailVerificationChallenge");
  });

  it("keeps password auth on JSON errors instead of hosted fallback urls", () => {
    const login = routeSource("src/app/api/auth/workos/mobile/password/login/route.ts");
    const register = routeSource("src/app/api/auth/workos/mobile/password/register/route.ts");

    expect(`${login}\n${register}`).not.toContain("fallbackUrl");
    expect(`${login}\n${register}`).not.toContain("mobileHostedAuthFallback");
    expect(`${login}\n${register}`).toContain("mobileAuthErrorMessage");
  });

  it("keeps mobile OAuth on JSON start and complete routes without hosted redirect fallbacks", () => {
    const startRoute = routeSource("src/app/api/auth/workos/mobile/start/route.ts");
    const completeRoute = routeSource("src/app/api/auth/workos/mobile/complete/route.ts");
    const loginRoutePath = resolve(workspaceRoot, "src/app/api/auth/workos/mobile/login/route.ts");
    const callbackRoutePath = resolve(workspaceRoot, "src/app/api/auth/workos/mobile/callback/route.ts");

    expect(existsSync(loginRoutePath)).toBe(false);
    expect(existsSync(callbackRoutePath)).toBe(false);
    expect(startRoute).not.toContain("NextResponse.redirect");
    expect(completeRoute).not.toContain("NextResponse.redirect");
  });
});
