import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function source(path: string) {
  return readFileSync(resolve(workspaceRoot, path), "utf8");
}

describe("web WorkOS auth routes", () => {
  it("uses the main app callback route instead of stale API callback routes", () => {
    const signIn = source("src/app/sign-in/route.ts");
    const signUp = source("src/app/sign-up/route.ts");
    const callback = source("src/app/callback/route.ts");
    const workosConfig = source("src/packages/config/workos.ts");

    expect(existsSync(resolve(workspaceRoot, "src/app/api/auth/workos/login/route.ts"))).toBe(false);
    expect(existsSync(resolve(workspaceRoot, "src/app/api/auth/workos/callback/route.ts"))).toBe(false);
    expect(signIn).toContain("NEXT_PUBLIC_WORKOS_REDIRECT_URI");
    expect(signIn).toContain("`${url.origin}/callback`");
    expect(signUp).toContain("`${url.origin}/callback`");
    expect(callback).toContain("handleAuth({");
    expect(callback).toContain("returnPathname: postLoginPathname()");
    expect(callback).toContain("ensureWorkOSProjectedSession");
    expect(workosConfig).toContain("`${fallbackSiteUrl}/callback`");
    expect(workosConfig).not.toContain("/api/auth/workos/callback");
  });
});
