import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

const partnersRoot = fileURLToPath(new URL("..", import.meta.url));

function read(relativePath: string) {
  return readFileSync(join(partnersRoot, relativePath), "utf8");
}

function makeNextRequest(path: string, body: Record<string, unknown>) {
  const url = `http://localhost:3002${path}`;
  return Object.assign(
    new Request(url, {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3002" },
      body: JSON.stringify(body),
    }),
    { nextUrl: new URL(url) },
  );
}

describe("Partners auth boundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.SITE_URL;
    delete process.env.NEXT_PUBLIC_PARTNERS_AUTH_URL;
    delete process.env.PARTNER_SIGNUP_BRIDGE_SECRET;
  });

  it("mounts Better Auth and tenant Convex components", () => {
    const generatedApi = read("convex/_generated/api.d.ts");
    const convexConfig = read("convex/convex.config.ts");

    expect(convexConfig).toContain("@convex-dev/better-auth/convex.config");
    expect(convexConfig).toContain("@djpanda/convex-tenants/convex.config.js");
    expect(generatedApi).toContain("components: {");
    expect(generatedApi).toContain("betterAuth:");
    expect(generatedApi).toContain("tenants:");
  });

  it("uses Partners Better Auth directly instead of the Anan auth bridge", () => {
    const authServer = read("lib/auth-server.ts");

    expect(authServer).toContain("@convex-dev/better-auth/nextjs");
    expect(authServer).toContain("convexBetterAuthNextJs");
    expect(authServer).not.toContain("createAnanAuthBridge");
    expect(authServer).not.toContain("@anan/auth/server");
  });

  it("keeps direct password signup behind the trusted Partners wrapper", () => {
    const auth = read("convex/betterAuth/auth.ts");

    expect(auth).toContain("x-anan-partner-signup-secret");
    expect(auth).toContain("Partner password signup requires the trusted signup flow.");
    expect(auth).not.toContain("x-anan-admin-signup-secret");
  });

  it("partner signin proxies to the Better Auth email signin endpoint and copies cookies", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "set-cookie": "better-auth.session_token=signin; Path=/; HttpOnly" },
      }),
    );
    const { POST } = await import("../app/api/partner-signin/route");

    const response = await POST(makeNextRequest("/api/partner-signin", {
      email: "ADA@EXAMPLE.COM",
      password: "StrongPassword123",
    }) as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(new URL("http://localhost:3002/api/auth/sign-in/email"), expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        email: "ada@example.com",
        password: "StrongPassword123",
        rememberMe: true,
      }),
    }));
    expect(response.headers.get("set-cookie")).toContain("better-auth.session_token=signin");
  });

  it("partner signup proxies through the trusted bridge and copies cookies", async () => {
    process.env.PARTNER_SIGNUP_BRIDGE_SECRET = "test-secret";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "set-cookie": "better-auth.session_token=signup; Path=/; HttpOnly" },
      }),
    );
    const { POST } = await import("../app/api/partner-signup/route");

    const response = await POST(makeNextRequest("/api/partner-signup", {
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "StrongPassword123",
      confirmPassword: "StrongPassword123",
      organizationName: "Analytical Engines",
      countryCode: "SA",
    }) as never);

    const [, init] = fetchMock.mock.calls[0]!;
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, redirectTo: "/dashboard" });
    expect(fetchMock).toHaveBeenCalledWith(new URL("http://localhost:3002/api/auth/sign-up/email"), expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        email: "ada@example.com",
        password: "StrongPassword123",
        name: "Ada Lovelace",
      }),
    }));
    expect(new Headers(init?.headers).get("x-anan-partner-signup-secret")).toBe("test-secret");
    expect(response.headers.get("set-cookie")).toContain("better-auth.session_token=signup");
  });
});
