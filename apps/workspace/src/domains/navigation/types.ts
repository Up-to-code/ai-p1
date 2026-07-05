export type NavLevel = "workspace" | "space" | "project";

export interface NavState {
  orgId: string | null;
  spaceId: string | null;
  spaceSlug: string | null;
  projectId: string | null;
  level: NavLevel;
  activeSpace: { id: string; name: string; slug: string; } | null;
}

export interface NavActions {
  setSpace: (slug: string | null) => void;
  setProject: (id: string | null) => void;
  clearContext: () => void;
}
