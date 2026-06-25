import { create } from "zustand";

interface AssistantPanelState {
  isOpen: boolean;
  threadId: string | null;
  pendingMessage: string | null;
  openPanel: (message?: string) => void;
  closePanel: () => void;
  togglePanel: () => void;
  setThreadId: (id: string) => void;
  newThread: () => void;
}

export const useAssistantPanel = create<AssistantPanelState>()((set, get) => ({
  isOpen: false,
  threadId: null,
  pendingMessage: null,
  openPanel: (message) =>
    set({ isOpen: true, pendingMessage: message ?? null }),
  closePanel: () => set({ isOpen: false }),
  togglePanel: () => set({ isOpen: !get().isOpen }),
  setThreadId: (id) => set({ threadId: id }),
  newThread: () => set({ threadId: null, pendingMessage: null }),
}));
