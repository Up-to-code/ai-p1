import { create } from "zustand";

interface IntegrationsState {
  activeTab: "catalog" | "connected" | "webhooks";
  setActiveTab: (tab: IntegrationsState["activeTab"]) => void;
}

export const useIntegrationsStore = create<IntegrationsState>((set) => ({
  activeTab: "catalog",
  setActiveTab: (activeTab) => set({ activeTab }),
}));
