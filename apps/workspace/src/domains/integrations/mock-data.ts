import type { PartnerCatalogApp, PartnerConnection } from "./store/integrations.types";

export const MOCK_MAC_APPS: PartnerCatalogApp[] = [
  {
    id: "mac-icloud-sync",
    partnersClientId: "client_mac_icloud",
    name: "Apple iCloud Sync",
    publisherName: "macOS Integration",
    description: "Real-time, bi-directional file and asset synchronization directly with Apple iCloud Drive.",
    homepageUrl: "https://apple.com/icloud",
    logoUrl: "https://cdn.simpleicons.org/icloud/005A9C",
    allowedScopes: ["icloud.files.read", "icloud.files.write"],
    redirectUris: [],
    status: "approved",
    updatedAt: Date.now(),
  },
  {
    id: "mac-calendar-sync",
    partnersClientId: "client_mac_calendar",
    name: "iCloud Calendar Sync",
    publisherName: "macOS Integration",
    description: "Sync client meetings, operational reviews, and appointment calendars with Apple Calendar.",
    homepageUrl: "https://apple.com/calendar",
    logoUrl: "https://cdn.simpleicons.org/apple/000000",
    allowedScopes: ["calendar.events.read", "calendar.events.write"],
    redirectUris: [],
    status: "approved",
    updatedAt: Date.now(),
  },
  {
    id: "mac-contacts-gateway",
    partnersClientId: "client_mac_contacts",
    name: "Mac Contacts Gateway",
    publisherName: "macOS Integration",
    description: "Secure, real-time sync of customer leads, CRM client profiles, and phone numbers with Apple Contacts.",
    homepageUrl: "https://apple.com",
    logoUrl: "https://cdn.simpleicons.org/apple/555555",
    allowedScopes: ["contacts.read", "contacts.write"],
    redirectUris: [],
    status: "approved",
    updatedAt: Date.now(),
  },
  {
    id: "mac-spotlight-indexer",
    partnersClientId: "client_mac_spotlight",
    name: "macOS Spotlight Indexer",
    publisherName: "macOS Integration",
    description: "Enable instant spotlight indexing for your assets, projects, and clients on macOS devices.",
    homepageUrl: "https://apple.com",
    logoUrl: "https://cdn.simpleicons.org/apple/999999",
    allowedScopes: ["spotlight.index.write"],
    redirectUris: [],
    status: "approved",
    updatedAt: Date.now(),
  },
];

export const MOCK_ICLOUD_CONNECTION: Omit<PartnerConnection, "organizationId"> = {
  id: "conn-mac-icloud",
  partnersAppId: "mac-icloud-sync",
  partnersClientId: "client_mac_icloud",
  status: "active",
  effectiveStatus: "active",
  scopes: ["icloud.files.read", "icloud.files.write"],
  expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  updatedAt: Date.now(),
  partnerApp: {
    id: "mac-icloud-sync",
    partnersClientId: "client_mac_icloud",
    name: "Apple iCloud Sync",
    publisherName: "macOS Integration",
    description: "Real-time, bi-directional file and asset synchronization directly with Apple iCloud Drive.",
    homepageUrl: "https://apple.com/icloud",
    logoUrl: "https://cdn.simpleicons.org/icloud/005A9C",
    allowedScopes: ["icloud.files.read", "icloud.files.write"],
    redirectUris: [],
    status: "approved",
    updatedAt: Date.now(),
  },
};

export function createMockConnection(
  organizationId: string,
  app: PartnerCatalogApp,
): PartnerConnection {
  return {
    id: `mock-${app.id}-${Date.now()}`,
    organizationId,
    partnersAppId: app.id,
    partnersClientId: app.partnersClientId,
    status: "active",
    effectiveStatus: "active",
    scopes: app.allowedScopes,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    partnerApp: {
      ...app,
      redirectUris: [],
      status: "approved",
      updatedAt: Date.now(),
    },
  };
}

export function createICloudConnection(organizationId: string): PartnerConnection {
  return {
    ...MOCK_ICLOUD_CONNECTION,
    id: "conn-mac-icloud",
    organizationId,
  };
}
