export type NavLevel = "workspace" | "space" | "project";

export interface NavState {
  workspaceId: string | null;
  spaceId: string | null;
  spaceSlug: string | null;
  projectId: string | null;
  level: NavLevel;
}

export interface NavActions {
  setSpace: (slug: string | null) => void;
  setProject: (id: string | null) => void;
  clearContext: () => void;
}
