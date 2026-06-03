import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import {
  organizationRequestSafetyMiddleware,
  requestSafetyMiddleware,
  workspaceRequestSafetyPolicy,
} from "./request-safety";
import { getMobileRequestContext, type MobileRequestContext } from "@/server/middleware/mobile-request-context";

describe("workspace request safety module", () => {
  it("keeps app-boundary policy disabled by default", async () => {
    const app = new Hono();
    app.use("*", requestSafetyMiddleware);
    app.get("/health", (c) => c.json({ ok: true }));

    const response = await app.request("/health", {
      headers: { origin: "https://example.com" },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
    expect(workspaceRequestSafetyPolicy.origin.mode).toBe("disabled");
  });

  it("owns organization request context composition without changing the request id contract", async () => {
    const app = new Hono<{ Variables: { mobileRequestContext?: MobileRequestContext } }>();
    app.use("/:organizationId/*", organizationRequestSafetyMiddleware);
    app.get("/:organizationId/read/projects", (c) => c.json({
      context: getMobileRequestContext(c),
    }));

    const response = await app.request("/org_1/read/projects", {
      headers: {
        "x-request-id": "req_1",
        "x-qentrah-client": "mobile",
      },
    });

    expect(response.headers.get("x-request-id")).toBe("req_1");
    await expect(response.json()).resolves.toMatchObject({
      context: {
        requestId: "req_1",
        client: "mobile",
      },
    });
  });
});
