import { describe, expect, it } from "vitest";
import {
  getWorkspaceCapabilitiesForAudience,
  getWorkspaceZoneKeysForAudience,
  isBusinessWorkspaceAudience,
  WORKSPACE_BUSINESS_ZONE_KEYS,
} from "./zones";

describe("@qentrah/workspace-logic zones", () => {
  it("keeps neutral audiences on base zones", () => {
    expect(getWorkspaceZoneKeysForAudience("none")).toEqual(["overview", "settings"]);
    expect(getWorkspaceCapabilitiesForAudience("none").canManageProjects).toBe(false);
  });

  it("enables Work OS zones for workspace audiences", () => {
    expect(getWorkspaceZoneKeysForAudience("workspace")).toContain("opportunities");
    expect(getWorkspaceCapabilitiesForAudience("workspace").canManageAutomations).toBe(true);
    expect(WORKSPACE_BUSINESS_ZONE_KEYS).toContain("tasks");
    expect(isBusinessWorkspaceAudience("workspace")).toBe(true);
  });
});
