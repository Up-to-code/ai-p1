import { describe, expect, it } from "vitest";
import {
  isWorkspaceSurface,
  workspaceSurfaceIdentity,
  type WorkspaceSurface,
} from "./workspace-surface";

describe("WorkspaceSurface", () => {
  it("accepts the supported single-route surface variants", () => {
    const surfaces: WorkspaceSurface[] = [
      { type: "overview" },
      { type: "inbox" },
      { type: "channel", channelId: "channel-1" },
      { type: "directMessage", channelId: "dm-1" },
      { type: "space", spaceId: "space-1", view: "board" },
      { type: "allTasks", view: "calendar" },
      { type: "myTasks", view: "list", filter: "today" },
      { type: "task", taskId: "task-1" },
      { type: "aiChat" },
    ];

    for (const surface of surfaces) expect(isWorkspaceSurface(surface)).toBe(true);
  });

  it("rejects unknown view names and incomplete record identities", () => {
    expect(isWorkspaceSurface({ type: "space", spaceId: "space-1", view: "gantt" })).toBe(false);
    expect(isWorkspaceSurface({ type: "allTasks", view: "unknown" })).toBe(false);
    expect(isWorkspaceSurface({ type: "channel", channelId: "" })).toBe(false);
  });

  it("uses record and view identity when selecting an internal surface", () => {
    expect(workspaceSurfaceIdentity({ type: "space", spaceId: "a", view: "list" })).toBe("space:a:list");
    expect(workspaceSurfaceIdentity({ type: "space", spaceId: "a", view: "board" })).toBe("space:a:board");
    expect(workspaceSurfaceIdentity({ type: "channel", channelId: "c1" })).toBe("channel:c1");
  });
});
