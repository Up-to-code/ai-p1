import { describe, expect, it } from "vitest";
import { normalizeQueryDebugDetails } from "./query-debug";

describe("normalizeQueryDebugDetails", () => {
  it("returns safe, deterministic query diagnostics", () => {
    expect(
      normalizeQueryDebugDetails(
        {
          resourceType: "client",
          resourceId: "client_123",
          organizationId: "org_123",
          workspaceStatus: "ready",
          isConvexAuthPending: false,
          isConvexAuthenticated: true,
        },
        { timedOut: true },
      ),
    ).toEqual([
      { label: "resource", value: "client" },
      { label: "resourceId", value: "client_123" },
      { label: "organizationId", value: "org_123" },
      { label: "workspaceStatus", value: "ready" },
      { label: "convexAuthPending", value: "false" },
      { label: "convexAuthenticated", value: "true" },
      { label: "timedOut", value: "true" },
    ]);
  });

  it("marks absent ids as missing instead of leaking unrelated state", () => {
    const details = normalizeQueryDebugDetails({
      resourceType: "asset",
      resourceId: undefined,
      organizationId: null,
      workspaceStatus: "convexAuthLoading",
    });

    expect(details).toContainEqual({ label: "resourceId", value: "missing" });
    expect(details).toContainEqual({ label: "organizationId", value: "missing" });
    expect(details).toContainEqual({ label: "workspaceStatus", value: "convexAuthLoading" });
  });
});
