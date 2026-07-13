import { describe, expect, it } from "vitest";
import { resolveTaskWorkspaceState } from "./task-workspace-state";

describe("resolveTaskWorkspaceState", () => {
  it("does not hide authentication state behind query loading", () => {
    expect(resolveTaskWorkspaceState({ workspaceStatus: "noOrganization", queryLoading: true, sourceCount: 0, visibleCount: 0, hasActiveFilter: false, hasMore: false })).toEqual({ status: "noOrganization" });
  });

  it("distinguishes loading, true empty, and filtered empty", () => {
    expect(resolveTaskWorkspaceState({ workspaceStatus: "ready", queryLoading: true, sourceCount: 0, visibleCount: 0, hasActiveFilter: false, hasMore: false }).status).toBe("loading");
    expect(resolveTaskWorkspaceState({ workspaceStatus: "ready", queryLoading: false, sourceCount: 0, visibleCount: 0, hasActiveFilter: false, hasMore: false }).status).toBe("empty");
    expect(resolveTaskWorkspaceState({ workspaceStatus: "ready", queryLoading: false, sourceCount: 3, visibleCount: 0, hasActiveFilter: true, hasMore: false }).status).toBe("filteredEmpty");
  });

  it("preserves query failures", () => {
    expect(resolveTaskWorkspaceState({ workspaceStatus: "ready", queryLoading: false, queryError: "failed", sourceCount: 0, visibleCount: 0, hasActiveFilter: false, hasMore: false })).toEqual({ status: "error", message: "failed" });
  });

  it("does not claim true-empty while a filtered cursor remains", () => {
    expect(resolveTaskWorkspaceState({ workspaceStatus: "ready", queryLoading: false, sourceCount: 0, visibleCount: 0, hasActiveFilter: false, hasMore: true }).status).toBe("ready");
  });
});
