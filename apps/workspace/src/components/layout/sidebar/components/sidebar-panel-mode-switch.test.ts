import { describe, expect, it } from "vitest";
import { getSecondaryPanelModeHref } from "./sidebar-panel-mode";

describe("secondary panel mode navigation", () => {
  it("preserves the active AI thread when opening AI mode", () => {
    const params = new URLSearchParams("threadId=thread-1&state=session-state");

    expect(getSecondaryPanelModeHref("ai", params)).toBe(
      "/ai?threadId=thread-1&state=session-state",
    );
  });

  it("clears AI state when returning to Workspace mode", () => {
    const params = new URLSearchParams("threadId=thread-1&state=session-state");

    expect(getSecondaryPanelModeHref("workspace", params)).toBe("/ws");
  });
});
