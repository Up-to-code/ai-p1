import { create } from 'zustand';

export type WorkspaceMode = 'ws' | 'ai';

interface WorkspaceState {
  mode: WorkspaceMode;
  activeAiThreadId?: string;
  setActiveAiThreadId: (threadId?: string) => void;
  setMode: (mode: WorkspaceMode) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  mode: 'ws',
  activeAiThreadId: undefined,
  setActiveAiThreadId: (threadId) => set({ activeAiThreadId: threadId }),
  setMode: (mode) => set({ mode }),
}));

export function parseWorkspaceMode(value: string | null): WorkspaceMode {
  return value === "ai" ? "ai" : "ws";
}

export function workspaceModeHref(mode: WorkspaceMode, threadId?: string) {
  if (mode === "ai") {
    return threadId ? `/ai?threadId=${threadId}` : `/ai`;
  }
  return `/ws`;
}
