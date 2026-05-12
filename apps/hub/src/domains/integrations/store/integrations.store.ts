import { create } from "zustand";
import type { Integration, IntegrationStatus } from "./integrations.types";

interface IntegrationsState {
  integrations: Integration[];
  activeTab: "catalog" | "connected" | "webhooks";
  setActiveTab: (tab: IntegrationsState["activeTab"]) => void;
  updateIntegration: (id: string, status: IntegrationStatus) => void;
  connectIntegration: (id: string) => void;
  disconnectIntegration: (id: string) => void;
}

export const useIntegrationsStore = create<IntegrationsState>((set) => ({
  integrations: [
    {
      id: "aqar",
      name: "Aqar Marketplace",
      category: "Marketplace",
      description: "Approved inventory feed with outbound event publishing.",
      status: "synced",
      volume: "1.2K events",
      iconName: "store",
    },
    {
      id: "crm",
      name: "Institutional CRM",
      category: "CRM",
      description: "Inbound webhook receiver for property and project draft claims.",
      status: "approved",
      volume: "342 events",
      iconName: "database",
    },
    {
      id: "partner",
      name: "Partner API",
      category: "Partner API",
      description: "Bidirectional partner access for approved organization-scoped APIs.",
      status: "pending",
      volume: "N/A",
      iconName: "arrows",
    },
    {
      id: "web",
      name: "Website Embed",
      category: "Website",
      description: "Read-only approved inventory feed for owned websites and portals.",
      status: "draft",
      volume: "No traffic",
      iconName: "globe",
    },
    {
      id: "mobile",
      name: "Mobile App Feed",
      category: "Mobile App",
      description: "Scoped mobile application access with redacted public payloads.",
      status: "blocked",
      volume: "Paused",
      iconName: "mobile",
    },
    {
      id: "oauth",
      name: "Developer OAuth",
      category: "Developer App",
      description: "OAuth client registration for redirect URIs, scopes, and webhooks.",
      status: "draft",
      volume: "No production",
      iconName: "code",
    },
  ],
  activeTab: "catalog",
  setActiveTab: (activeTab) => set({ activeTab }),
  updateIntegration: (id, status) => set((state) => ({
    integrations: state.integrations.map((integration) => (integration.id === id ? { ...integration, status } : integration)),
  })),
  connectIntegration: (id) => set((state) => ({
    integrations: state.integrations.map((integration) => (integration.id === id ? { ...integration, status: "approved", volume: "Ready" } : integration)),
  })),
  disconnectIntegration: (id) => set((state) => ({
    integrations: state.integrations.map((integration) => (integration.id === id ? { ...integration, status: "draft", volume: "Paused" } : integration)),
  })),
}));
