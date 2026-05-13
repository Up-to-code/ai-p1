import { create } from 'zustand';

export type WorkspaceMode = 'ws' | 'ai';

interface WorkspaceState {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  mode: 'ws',
  setMode: (mode) => set({ mode }),
}));

export function parseWorkspaceMode(value: string | null): WorkspaceMode {
  return value === "ai" ? "ai" : "ws";
}

export function workspaceModeHref(mode: WorkspaceMode, threadId?: string) {
  const params = new URLSearchParams({ mode });
  if (mode === "ai" && threadId) params.set("threadId", threadId);
  return `/dashboard?${params.toString()}`;
}
