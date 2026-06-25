import { describe, expect, it } from "vitest";
import { shareMcpDefaultPreset, shareMcpPresetIds } from "./mcp-presets.config";

describe("share mcp presets config", () => {
  it("exposes stable preset ids", () => {
    expect(shareMcpPresetIds).toEqual(["client", "calendar", "full"]);
    expect(shareMcpPresetIds).toContain(shareMcpDefaultPreset);
  });
});
