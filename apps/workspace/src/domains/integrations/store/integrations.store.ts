import { create } from "zustand";

interface IntegrationsState {
  activeTab: "overview" | "catalog" | "connected" | "webhooks";
  setActiveTab: (tab: IntegrationsState["activeTab"]) => void;
}

export const useIntegrationsStore = create<IntegrationsState>((set) => ({
  activeTab: "overview",
  setActiveTab: (activeTab) => set({ activeTab }),
}));
