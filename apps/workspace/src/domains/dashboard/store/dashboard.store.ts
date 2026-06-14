import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkspaceMode = 'ws' | 'ai';

interface WorkspaceState {
  mode: WorkspaceMode;
  activeAiThreadId?: string;
  activeProjectId?: string | null;
  setActiveAiThreadId: (threadId?: string) => void;
  setActiveProjectId: (projectId: string | null) => void;
  setMode: (mode: WorkspaceMode) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      mode: 'ws',
      activeAiThreadId: undefined,
      activeProjectId: null,
      setActiveAiThreadId: (threadId) => set({ activeAiThreadId: threadId }),
      setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({ activeProjectId: state.activeProjectId }),
    }
  )
);

export function parseWorkspaceMode(value: string | null): WorkspaceMode {
  return value === "ai" ? "ai" : "ws";
}

export function workspaceModeHref(mode: WorkspaceMode, threadId?: string) {
  const params = new URLSearchParams({ mode });
  if (mode === "ai" && threadId) params.set("threadId", threadId);
  return `/dashboard?${params.toString()}`;
}
