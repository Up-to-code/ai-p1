import { create } from "zustand";
import type { ApiKey, OrganizationProfile, TeamMember } from "./organization.types";

interface OrganizationState {
  organization: OrganizationProfile;
  team: TeamMember[];
  apiKeys: ApiKey[];
  apps: { id: string; name: string; type: string; status: string; date: string }[];
  createMember: (input: Pick<TeamMember, "name" | "email" | "role">) => TeamMember;
  updateMember: (id: string, input: Partial<TeamMember>) => void;
  deleteMember: (id: string) => void;
  createApiKey: (name: string, scopes: string[]) => ApiKey;
  deleteApiKey: (id: string) => void;
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organization: {
    name: "Acme Corporation",
    legalName: "Acme Real Estate Development LLC",
    type: "Developer",
    email: "admin@acme.com",
    phone: "+966 11 000 0000",
    website: "www.acme.sa",
    address: "King Fahd Road, Riyadh, KSA",
  },
  team: [
    { id: "tm-1", name: "Ahmed Mansour", email: "ahmed@acme.com", role: "Owner", status: "Active" },
    { id: "tm-2", name: "Sara Al-Rashid", email: "sara@acme.com", role: "Admin", status: "Active" },
    { id: "tm-3", name: "Khalid Nasser", email: "khalid@acme.com", role: "Manager", status: "Active" },
  ],
  apiKeys: [
    { id: "key-1", name: "Production Index Key", token: "pk_live_********************", created: "Apr 20, 2026", scopes: ["Read", "Sync"] },
    { id: "key-2", name: "Staging Test Token", token: "pk_test_********************", created: "May 01, 2026", scopes: ["Read", "Write"] },
  ],
  apps: [
    { id: "app-1", name: "REGA Sync Engine", type: "Official", status: "Authorized", date: "Jan 12, 2026" },
    { id: "app-2", name: "Institutional CRM", type: "Internal", status: "Authorized", date: "Mar 04, 2026" },
  ],
  createMember: (input) => {
    const next: TeamMember = { ...input, id: `tm-${get().team.length + 1}`, status: "Invited" };
    set((state) => ({ team: [next, ...state.team] }));
    return next;
  },
  updateMember: (id, input) => set((state) => ({
    team: state.team.map((member) => (member.id === id ? { ...member, ...input } : member)),
  })),
  deleteMember: (id) => set((state) => ({ team: state.team.filter((member) => member.id !== id) })),
  createApiKey: (name, scopes) => {
    const next: ApiKey = {
      id: `key-${get().apiKeys.length + 1}`,
      name,
      token: name.toLowerCase().includes("test") ? "pk_test_********************" : "pk_live_********************",
      created: "Today",
      scopes,
    };
    set((state) => ({ apiKeys: [next, ...state.apiKeys] }));
    return next;
  },
  deleteApiKey: (id) => set((state) => ({ apiKeys: state.apiKeys.filter((key) => key.id !== id) })),
}));
