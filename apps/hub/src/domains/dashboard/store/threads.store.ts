import { create } from 'zustand';

interface Thread {
  id: string;
  title: string;
  date: string;
  excerpt?: string;
}

interface ThreadsState {
  threads: Thread[];
  activeThreadId: string | null;
  isHistoryOpen: boolean;
  
  // Actions
  setHistoryOpen: (open: boolean) => void;
  setActiveThread: (id: string) => void;
  addThread: (thread: Thread) => void;
}

export const useThreadsStore = create<ThreadsState>((set) => ({
  threads: [
    { id: "1", title: "Riyadh Heights claim analysis", date: "2m ago" },
    { id: "2", title: "Broker commission audit", date: "1h ago" },
    { id: "3", title: "Unit pricing strategy 2026", date: "3h ago" },
    { id: "4", title: "Drafting purchase agreement", date: "5h ago" },
    { id: "5", title: "Marketing campaign overview", date: "1d ago" },
  ],
  activeThreadId: null,
  isHistoryOpen: false,

  setHistoryOpen: (open) => set({ isHistoryOpen: open }),
  setActiveThread: (id) => set({ activeThreadId: id }),
  addThread: (thread) => set((state) => ({ 
    threads: [thread, ...state.threads] 
  })),
}));
