import { describe, expect, it } from "vitest";
import { debugFor } from "./make-url";

describe("debugFor", () => {
  it("extracts organizationId from the queryKey when present", () => {
    const metadata = debugFor(
      [
        "clients-index",
        "org_3Ej6gMQilSFFN39ZwA5377ZB431",
        "/api/v1/organizations/org_3Ej6gMQilSFFN39ZwA5377ZB431/read/clients/index?limit=50",
      ],
      "/api/v1/organizations/org_3Ej6gMQilSFFN39ZwA5377ZB431/read/clients/index?limit=50",
    );

    expect(metadata.organizationId).toBe("org_3Ej6gMQilSFFN39ZwA5377ZB431");
    expect(metadata.path).toBe("/api/v1/organizations/org_3Ej6gMQilSFFN39ZwA5377ZB431/read/clients/index");
  });

  it("extracts organizationId from the URL when the key has no org id", () => {
    const metadata = debugFor(
      ["/api/v1/organizations/org_ABC123/read/projects"],
      "/api/v1/organizations/org_ABC123/read/projects",
    );

    expect(metadata.organizationId).toBe("org_ABC123");
  });

  it("uses the workspace context when provided", () => {
    const metadata = debugFor(
      ["projects", "org_AAA"],
      "/api/v1/organizations/org_AAA/read/projects",
      {
        organizationId: "org_AAA",
        workspaceStatus: "ready",
        isConvexAuthPending: false,
        isConvexAuthenticated: true,
      },
    );

    expect(metadata.organizationId).toBe("org_AAA");
    expect(metadata.workspaceStatus).toBe("ready");
    expect(metadata.isConvexAuthPending).toBe(false);
    expect(metadata.isConvexAuthenticated).toBe(true);
  });

  it("falls back to null when neither key nor url contain an org id", () => {
    const metadata = debugFor(
      ["misc", "key"],
      "/api/v1/something/else",
    );

    expect(metadata.organizationId).toBeNull();
  });
});
