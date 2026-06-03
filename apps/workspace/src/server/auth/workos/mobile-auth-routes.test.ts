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
    const mobileRouter = routeSource("src/server/auth/workos/mobile-routes.ts");
    const startRoute = routeSource("src/app/api/auth/workos/mobile/start/route.ts");
    const appSource = routeSource("src/server/app/app.ts");

    expect(source).toContain("getAuthorizationUrlWithPKCE");
    expect(source).toContain("AppleOAuth");
    expect(source).toContain("GoogleOAuth");
    expect(source).toContain("provider,");
    expect(source).toContain("provider === \"authkit\"");
    expect(source).toContain("redirectUri,");
    expect(mobileRouter).toContain('workosMobileAuthRouter.get("/start"');
    expect(mobileRouter).toContain("url: auth.url");
    expect(mobileRouter).toContain("state: auth.state");
    expect(mobileRouter).toContain("codeVerifier: auth.codeVerifier");
    expect(appSource).toContain("app.route(\"/auth/workos/mobile\", workosMobileAuthRouter)");
    expect(startRoute).toContain("handle(app)");
  });

  it("forwards OAuth email verification challenges into the mobile code flow", () => {
    const source = routeSource("src/server/auth/workos/mobile-routes.ts");

    expect(source).toContain("mobileEmailVerificationChallenge");
    expect(source).toContain("emailVerification");
    expect(source).toContain("c.json");
    expect(source).toContain("409");
  });

  it("exchanges mobile PKCE callbacks through JSON instead of server memory", () => {
    const source = routeSource("src/server/auth/workos/mobile-oauth.ts");
    const mobileRouter = routeSource("src/server/auth/workos/mobile-routes.ts");
    const completeRoute = routeSource("src/app/api/auth/workos/mobile/complete/route.ts");

    expect(source).toContain("completeMobileOAuth");
    expect(source).toContain("authenticateWithCode");
    expect(source).not.toContain("new Map");
    expect(mobileRouter).toContain("codeVerifier");
    expect(mobileRouter).toContain("mobileEmailVerificationChallenge");
    expect(completeRoute).toContain("handle(app)");
  });

  it("keeps password auth on JSON errors instead of hosted fallback urls", () => {
    const mobileRouter = routeSource("src/server/auth/workos/mobile-routes.ts");

    expect(mobileRouter).not.toContain("fallbackUrl");
    expect(mobileRouter).not.toContain("mobileHostedAuthFallback");
    expect(mobileRouter).toContain("mobileAuthErrorMessage");
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
