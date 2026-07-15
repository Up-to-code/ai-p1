import { describe, expect, it } from "vitest";
import { eventMatchesAttentionView } from "./inbox";

describe("Inbox attention views", () => {
  it("keeps legacy and primary active events in Primary", () => {
    expect(
      eventMatchesAttentionView(
        { kind: "mentioned", lane: undefined, disposition: undefined },
        "primary",
      ),
    ).toBe(true);
    expect(
      eventMatchesAttentionView(
        { kind: "task_assigned", lane: "primary", disposition: "active" },
        "primary",
      ),
    ).toBe(true);
  });

  it("keeps Other, Later, and Cleared mutually exclusive", () => {
    expect(
      eventMatchesAttentionView(
        { kind: "mentioned", lane: "other", disposition: "active" },
        "other",
      ),
    ).toBe(true);
    expect(
      eventMatchesAttentionView(
        { kind: "mentioned", lane: "primary", disposition: "later" },
        "later",
      ),
    ).toBe(true);
    expect(
      eventMatchesAttentionView(
        { kind: "mentioned", lane: "primary", disposition: "cleared" },
        "cleared",
      ),
    ).toBe(true);
  });

  it("keeps thread replies out of the general attention lanes", () => {
    for (const view of ["primary", "other", "later", "cleared"] as const) {
      expect(
        eventMatchesAttentionView(
          { kind: "thread_reply", lane: "other", disposition: "active" },
          view,
        ),
      ).toBe(false);
    }
  });
});
