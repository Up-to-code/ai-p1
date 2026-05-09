import { create } from "zustand";

interface OrganizationState {
  selectedOrganizationId: string;
  setSelectedOrganizationId: (organizationId: string) => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  selectedOrganizationId: "org_demo_acme",
  setSelectedOrganizationId: (selectedOrganizationId) => set({ selectedOrganizationId }),
}));
