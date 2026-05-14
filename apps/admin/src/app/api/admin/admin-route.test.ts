import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createAdminHonoApp } from "@/lib/admin-hono";

const password = "admin-password";
const env = process.env;
env.ADMIN_AUTH_SECRET = "admin-route-secret-that-is-long-enough-123";
env.ADMIN_AUTH_EMAIL = "admin@qentrah.local";
env.ADMIN_AUTH_PASSWORD_SHA256 = createHash("sha256").update(password).digest("hex");
env.PLATFORM_ADMIN_EMAILS = "admin@qentrah.local";
env.WORKSPACE_ADMIN_SERVICE_TOKEN = "local-token";

describe("admin Hono facade", () => {
  const adminHonoApp = createAdminHonoApp();

  it("rejects unauthenticated domain reads", async () => {
    const response = await adminHonoApp.request("/api/admin/security");
    expect(response.status).toBe(401);
  });

  it("logs in and reads a domain list through the facade", async () => {
    const login = await adminHonoApp.request("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@qentrah.local", password }),
      headers: { "content-type": "application/json" },
    });
    expect(login.status).toBe(200);
    const cookie = login.headers.get("set-cookie") ?? "";
    const list = await adminHonoApp.request("/api/admin/security", {
      headers: { cookie },
    });
    expect(list.status).toBe(200);
    await expect(list.json()).resolves.toMatchObject({ domain: "security" });
  });

  it("validates action payloads before mutation", async () => {
    const login = await adminHonoApp.request("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@qentrah.local", password }),
      headers: { "content-type": "application/json" },
    });
    const response = await adminHonoApp.request("/api/admin/security/service-token/actions", {
      method: "POST",
      headers: { cookie: login.headers.get("set-cookie") ?? "", "content-type": "application/json" },
      body: JSON.stringify({ actionId: "suspend" }),
    });
    expect(response.status).toBe(400);
  });
});
