import { describe, expect, it } from "vitest";
import {
  buildCurrentModeHref,
  getSecondaryPanelModeForHref,
  getSecondaryPanelModeHref,
} from "./sidebar-panel-mode";

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

  it("restores the complete remembered workspace URL", () => {
    const params = new URLSearchParams("threadId=thread-1");

    expect(
      getSecondaryPanelModeHref(
        "workspace",
        params,
        "/tasks?filter=my&project=project-1",
      ),
    ).toBe("/tasks?filter=my&project=project-1");
  });

  it("restores the complete remembered AI URL", () => {
    expect(
      getSecondaryPanelModeHref(
        "ai",
        new URLSearchParams(),
        "/ai?threadId=thread-2&state=session-state",
      ),
    ).toBe("/ai?threadId=thread-2&state=session-state");
  });

  it("does not restore a URL from the wrong mode", () => {
    expect(
      getSecondaryPanelModeHref(
        "workspace",
        new URLSearchParams(),
        "/ai?threadId=thread-2",
      ),
    ).toBe("/ws");
  });

  it("builds and classifies full mode URLs", () => {
    expect(
      buildCurrentModeHref(
        "/tasks",
        new URLSearchParams("filter=assigned&project=project-1"),
      ),
    ).toBe("/tasks?filter=assigned&project=project-1");
    expect(getSecondaryPanelModeForHref("/ai?threadId=thread-1")).toBe("ai");
    expect(getSecondaryPanelModeForHref("/calendar?view=week")).toBe(
      "workspace",
    );
  });
});
