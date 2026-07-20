export type WorkspaceTaskView = "list" | "board" | "table" | "calendar" | "timeline";
export type SpaceWorkspaceView =
  | "channel"
  | "overview"
  | "list"
  | "board"
  | "table"
  | "calendar"
  | "docs"
  | "dashboard"
  | "whiteboard"
  | "form";

export type WorkspaceSurface =
  | { type: "overview" }
  | { type: "inbox" }
  | { type: "replies" }
  | { type: "assigned" }
  | { type: "allChannels" }
  | { type: "channel"; channelId: string }
  | { type: "directMessage"; channelId: string }
  | { type: "allSpaces" }
  | { type: "space"; spaceId: string; view: SpaceWorkspaceView }
  | { type: "allTasks"; view: WorkspaceTaskView }
  | { type: "myTasks"; view: WorkspaceTaskView; filter: "my" | "today" | "overdue" }
  | { type: "task"; taskId: string }
  | { type: "aiChat"; threadId?: string };

export const defaultWorkspaceSurface: WorkspaceSurface = { type: "overview" };
const taskViews = new Set<WorkspaceTaskView>([
  "list",
  "board",
  "table",
  "calendar",
  "timeline",
]);
const spaceViews = new Set<SpaceWorkspaceView>([
  "channel",
  "overview",
  "list",
  "board",
  "table",
  "calendar",
  "docs",
  "dashboard",
  "whiteboard",
  "form",
]);

export function workspaceSurfaceIdentity(surface: WorkspaceSurface): string {
  switch (surface.type) {
    case "channel":
    case "directMessage":
      return `${surface.type}:${surface.channelId}`;
    case "space":
      return `space:${surface.spaceId}:${surface.view}`;
    case "allTasks":
      return `allTasks:${surface.view}`;
    case "myTasks":
      return `myTasks:${surface.filter}:${surface.view}`;
    case "task":
      return `task:${surface.taskId}`;
    case "aiChat":
      return `aiChat:${surface.threadId ?? "new"}`;
    default:
      return surface.type;
  }
}

export function isWorkspaceSurface(value: unknown): value is WorkspaceSurface {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<WorkspaceSurface>;
  if (typeof candidate.type !== "string") return false;
  switch (candidate.type) {
    case "overview":
    case "inbox":
    case "replies":
    case "assigned":
    case "allChannels":
    case "allSpaces":
      return true;
    case "channel":
    case "directMessage":
      return typeof candidate.channelId === "string" && candidate.channelId.length > 0;
    case "space":
      return (
        typeof candidate.spaceId === "string" &&
        candidate.spaceId.length > 0 &&
        typeof candidate.view === "string" &&
        spaceViews.has(candidate.view as SpaceWorkspaceView)
      );
    case "allTasks":
      return (
        typeof candidate.view === "string" &&
        taskViews.has(candidate.view as WorkspaceTaskView)
      );
    case "myTasks":
      return (
        typeof candidate.view === "string" &&
        taskViews.has(candidate.view as WorkspaceTaskView) &&
        (candidate.filter === "my" ||
          candidate.filter === "today" ||
          candidate.filter === "overdue")
      );
    case "task":
      return typeof candidate.taskId === "string" && candidate.taskId.length > 0;
    case "aiChat":
      return candidate.threadId === undefined || typeof candidate.threadId === "string";
    default:
      return false;
  }
}
