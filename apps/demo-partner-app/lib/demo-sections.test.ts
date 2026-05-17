import { describe, expect, it } from "vitest";
import {
  demoSectionIds,
  demoSections,
  missingScopes,
  sanitizeCredentialPayload,
  sectionCanRun,
} from "./demo-sections";

describe("demo section registry", () => {
  it("registers every sidebar section", () => {
    expect(demoSectionIds).toEqual([
      "overview",
      "flow",
      "credentials",
      "organization",
      "clients",
      "properties",
      "projects",
      "tasks",
      "calendar",
      "media",
      "webhooks",
      "results",
    ]);
  });

  it("marks client delete unavailable without client:delete", () => {
    const clients = demoSections.find((section) => section.id === "clients");
    expect(clients?.operations).toEqual(["read", "create", "update", "delete"]);
    expect(sectionCanRun(clients!, ["client:read", "client:create", "client:update"])).toBe(false);
    expect(missingScopes(clients!.requiredScopes, ["client:read", "client:create", "client:update"])).toEqual(["client:delete"]);
  });

  it("redacts credential-looking values", () => {
    expect(sanitizeCredentialPayload({
      access_token: "raw-access",
      nested: { authorization: "Bearer abc123", name: "Demo" },
      text: "mcp_secret_supersecret",
    })).toEqual({
      access_token: "[redacted]",
      nested: { authorization: "[redacted]", name: "Demo" },
      text: "[redacted]",
    });
  });
});
