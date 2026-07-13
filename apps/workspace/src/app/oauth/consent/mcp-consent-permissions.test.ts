import { describe, expect, it } from "vitest";
import {
  defaultMcpConsentPermissions,
  mcpConsentActions,
} from "./mcp-consent-permissions";

describe("MCP consent permissions", () => {
  it("derives truthful actions from the MCP tool catalog", () => {
    expect(mcpConsentActions("organization")).toEqual(["read"]);
    expect(mcpConsentActions("space")).toEqual([
      "read",
      "create",
      "update",
      "delete",
    ]);
    expect(mcpConsentActions("project")).toEqual([
      "read",
      "create",
      "update",
      "delete",
    ]);
    expect(mcpConsentActions("media")).toEqual(["read", "create"]);
  });

  it("defaults writable grants to every supported action", () => {
    const permissions = defaultMcpConsentPermissions(true);
    expect(
      permissions.find(({ resource }) => resource === "organization")?.actions,
    ).toEqual(["read"]);
    expect(
      permissions.find(({ resource }) => resource === "space")?.actions,
    ).toEqual(["read", "create", "update", "delete"]);
  });
});
