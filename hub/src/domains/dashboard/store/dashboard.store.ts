import { create } from 'zustand';

interface WorkspaceState {
  mode: 'ws' | 'ai';
  setMode: (mode: 'ws' | 'ai') => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  mode: 'ai', // Defaulting to AI as per user's pro-first preference
  setMode: (mode) => set({ mode }),
}));
