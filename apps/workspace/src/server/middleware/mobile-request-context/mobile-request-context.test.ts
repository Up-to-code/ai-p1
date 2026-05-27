import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import {
  getMobileRequestContext,
  mobileRequestContextMiddleware,
} from "./index";

describe("mobile request context middleware", () => {
  it("normalizes mobile request metadata and exposes the request id", async () => {
    const app = new Hono();
    app.use("*", mobileRequestContextMiddleware);
    app.get("/api/v1/organizations/:organizationId/agents/threads", (c) => {
      const context = getMobileRequestContext(c);
      return c.json({ context });
    });

    const response = await app.request("/api/v1/organizations/org_1/agents/threads", {
      headers: {
        "x-request-id": "req_1",
        "x-qentrah-client": "mobile",
        "x-qentrah-platform": "ios",
        "x-qentrah-app-version": "0.1.0",
        "x-qentrah-installation-id": "v1_install",
        "x-forwarded-for": "203.0.113.10, 10.0.0.1",
        "user-agent": "QentrahMobile/1",
      },
    });

    expect(response.headers.get("x-request-id")).toBe("req_1");
    await expect(response.json()).resolves.toEqual({
      context: {
        requestId: "req_1",
        client: "mobile",
        platform: "ios",
        appVersion: "0.1.0",
        installationIdHash: "v1_install",
        sourceIp: "203.0.113.10",
        userAgent: "QentrahMobile/1",
      },
    });
  });
});
