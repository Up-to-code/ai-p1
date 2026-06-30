import { create } from "zustand";

export interface WorkspaceState {
  orgId: string | null;
  spaceId: string | null;
  spaceSlug: string | null;
  projectId: string | null;
}

export interface WorkspaceActions {
  setOrgId: (id: string | null) => void;
  setSpace: (slug: string | null, id: string | null) => void;
  setProjectId: (id: string | null) => void;
}

export type WorkspaceStore = WorkspaceState & WorkspaceActions;

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  orgId: null,
  spaceId: null,
  spaceSlug: null,
  projectId: null,

  setOrgId: (id) => set({ orgId: id }),
  setSpace: (slug, id) => set({ spaceSlug: slug, spaceId: id }),
  setProjectId: (id) => set({ projectId: id }),
}));
