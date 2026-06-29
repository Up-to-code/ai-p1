import type { PartnerCatalogApp, PartnerConnection } from "./store/integrations.types";

export const MOCK_MAC_APPS: PartnerCatalogApp[] = [
  {
    id: "mac-icloud",
    partnersClientId: "client-icloud",
    name: "iCloud Contacts & Calendar",
    publisherName: "Apple Inc.",
    description: "Sync your Apple iCloud contacts, calendars, and reminders directly with Qentrah.",
    logoUrl: "/images/icloud-logo.png",
    allowedScopes: ["calendar.read", "calendar.write", "contacts.read"],
    redirectUris: ["http://localhost:3000/oauth/callback"],
    status: "approved",
    updatedAt: Date.now(),
  }
];

export function createMockConnection(organizationId: string, app: PartnerCatalogApp): PartnerConnection {
  return {
    id: `mock-conn-${app.id}`,
    organizationId,
    partnersAppId: app.id,
    partnersClientId: app.partnersClientId,
    status: "active",
    effectiveStatus: "active",
    scopes: app.allowedScopes,
    updatedAt: Date.now(),
    partnerApp: app,
  };
}

export function createICloudConnection(organizationId: string): PartnerConnection {
  return {
    id: "conn-mac-icloud",
    organizationId,
    partnersAppId: "mac-icloud",
    partnersClientId: "client-icloud",
    status: "active",
    effectiveStatus: "active",
    scopes: ["calendar.read", "calendar.write"],
    updatedAt: Date.now(),
    partnerApp: MOCK_MAC_APPS[0],
  };
}
