import { describe, expect, it } from "vitest";
import {
  getWorkspaceCapabilitiesForAudience,
  getWorkspaceZoneKeysForAudience,
  isBusinessWorkspaceAudience,
  WORKSPACE_BUSINESS_ZONE_KEYS,
} from "./zones";

describe("@anan/workspace-logic zones", () => {
  it("keeps neutral audiences on base zones", () => {
    expect(getWorkspaceZoneKeysForAudience("none")).toEqual(["overview", "settings"]);
    expect(getWorkspaceCapabilitiesForAudience("none").canManageProjects).toBe(false);
  });

  it("enables business zones for broker/developer audiences", () => {
    expect(getWorkspaceZoneKeysForAudience("broker")).toContain("crm");
    expect(getWorkspaceCapabilitiesForAudience("developer").canUseInbox).toBe(true);
    expect(WORKSPACE_BUSINESS_ZONE_KEYS).toContain("offers");
    expect(isBusinessWorkspaceAudience("broker")).toBe(true);
  });
});
