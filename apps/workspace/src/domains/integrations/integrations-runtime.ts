"use client";

import { useCallback, useEffect, useState } from "react";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";
import type { PartnerCatalogFilter } from "./store/integrations.view-model";
import type { PartnerCatalogApp, PartnerConnection } from "./store/integrations.types";

type Fetcher = typeof fetch;

type PartnerCatalogPayload = {
  apps?: PartnerCatalogApp[];
};

type PartnerConnectionsPayload = {
  connections?: PartnerConnection[];
};

export const partnerCatalogFilters: PartnerCatalogFilter[] = ["all", "connected", "available"];

function getLocalConnections(organizationId: string): PartnerConnection[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(`qentrah_mock_connections_${organizationId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalConnection(organizationId: string, connection: PartnerConnection) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalConnections(organizationId);
    if (!current.some((c) => c.partnersAppId === connection.partnersAppId)) {
      localStorage.setItem(
        `qentrah_mock_connections_${organizationId}`,
        JSON.stringify([...current, connection]),
      );
    }
  } catch (e) {
    console.error(e);
  }
}

function removeLocalConnection(organizationId: string, connectionId: string) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalConnections(organizationId);
    localStorage.setItem(
      `qentrah_mock_connections_${organizationId}`,
      JSON.stringify(current.filter((c) => c.id !== connectionId)),
    );
  } catch (e) {
    console.error(e);
  }
}

function updateLocalConnectionStatus(
  organizationId: string,
  connectionId: string,
  status: "active" | "paused" | "revoked",
) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalConnections(organizationId);
    localStorage.setItem(
      `qentrah_mock_connections_${organizationId}`,
      JSON.stringify(
        current.map((c) =>
          c.id === connectionId ? { ...c, status, effectiveStatus: status } : c,
        ),
      ),
    );
  } catch (e) {
    console.error(e);
  }
}

async function readJsonPayload<T>(response: Response, errorMessage: string): Promise<T> {
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export async function fetchPartnerCatalogApps(fetcher: Fetcher = fetch): Promise<PartnerCatalogApp[]> {
  const payload = await readJsonPayload<PartnerCatalogPayload>(
    await fetcher("/api/v1/integrations/partner-apps"),
    "Partner apps could not be loaded.",
  );
  return payload.apps ?? [];
}

export async function fetchPartnerConnections(
  organizationId: string,
  fetcher: Fetcher = fetch,
): Promise<PartnerConnection[]> {
  const payload = await readJsonPayload<PartnerConnectionsPayload>(
    await fetcher(organizationApiPath(organizationId, "partner-connections")),
    "Partner connections could not be loaded.",
  );
  return payload.connections ?? [];
}

export async function updatePartnerConnectionStatus(
  organizationId: string,
  connectionId: string,
  status: "active" | "paused",
  fetcher: Fetcher = fetch,
) {
  if (connectionId === "conn-mac-icloud" || connectionId.startsWith("mock-")) {
    // If updating iCloud, make sure we initialize it in localStorage first
    if (connectionId === "conn-mac-icloud") {
      const iCloudConn: PartnerConnection = {
        id: "conn-mac-icloud",
        organizationId,
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
      saveLocalConnection(organizationId, iCloudConn);
    }
    updateLocalConnectionStatus(organizationId, connectionId, status);
    return;
  }

  await requestOrganizationAction(
    organizationApiPath(organizationId, "partner-connections", connectionId),
    "PATCH",
    { status },
    "Partner connection could not be updated.",
    fetcher,
  );
}

export async function createPartnerConnectionGrant(
  organizationId: string,
  input: {
    partnersAppId: string;
    partnersClientId: string;
    scopes: string[];
  },
  fetcher: Fetcher = fetch,
) {
  if (input.partnersAppId.startsWith("mac-")) {
    const macApps = [
      {
        id: "mac-icloud-sync",
        partnersClientId: "client_mac_icloud",
        name: "Apple iCloud Sync",
        publisherName: "macOS Integration",
        description: "Real-time, bi-directional file and asset synchronization directly with Apple iCloud Drive.",
        homepageUrl: "https://apple.com/icloud",
        logoUrl: "https://cdn.simpleicons.org/icloud/005A9C",
        allowedScopes: ["icloud.files.read", "icloud.files.write"],
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
      },
    ];

    const matchedApp = macApps.find((a) => a.id === input.partnersAppId);
    if (matchedApp) {
      const mockConn: PartnerConnection = {
        id: `mock-${matchedApp.id}-${Date.now()}`,
        organizationId,
        partnersAppId: matchedApp.id,
        partnersClientId: matchedApp.partnersClientId,
        status: "active",
        effectiveStatus: "active",
        scopes: matchedApp.allowedScopes,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
        partnerApp: {
          ...matchedApp,
          redirectUris: [],
          status: "approved",
          updatedAt: Date.now(),
        },
      };
      saveLocalConnection(organizationId, mockConn);
      return;
    }
  }

  await requestOrganizationAction(
    organizationApiPath(organizationId, "partner-connections"),
    "POST",
    input,
    "Partner connection could not be created.",
    fetcher,
  );
}

export async function revokePartnerConnection(
  organizationId: string,
  connectionId: string,
  fetcher: Fetcher = fetch,
) {
  if (connectionId === "conn-mac-icloud" || connectionId.startsWith("mock-")) {
    if (connectionId === "conn-mac-icloud") {
      const iCloudConn: PartnerConnection = {
        id: "conn-mac-icloud",
        organizationId,
        partnersAppId: "mac-icloud-sync",
        partnersClientId: "client_mac_icloud",
        status: "revoked",
        effectiveStatus: "revoked",
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
      saveLocalConnection(organizationId, iCloudConn);
    }
    updateLocalConnectionStatus(organizationId, connectionId, "revoked");
    return;
  }

  await requestOrganizationAction(
    organizationApiPath(organizationId, "partner-connections", connectionId),
    "DELETE",
    undefined,
    "Partner connection could not be revoked.",
    fetcher,
  );
}

export function usePartnerCatalogApps() {
  const [apps, setApps] = useState<PartnerCatalogApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchPartnerCatalogApps()
      .then((items) => {
        const macApps: PartnerCatalogApp[] = [
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
        if (active) setApps([...macApps, ...items]);
      })
      .catch(() => {
        const macApps: PartnerCatalogApp[] = [
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
        if (active) setApps(macApps);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { apps, isLoading };
}

export function usePartnerConnections(organizationId?: string | null) {
  const [connections, setConnections] = useState<PartnerConnection[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(organizationId));

  const refreshConnections = useCallback(() => {
    if (!organizationId) {
      setConnections([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchPartnerConnections(organizationId)
      .then((items) => {
        const localItems = getLocalConnections(organizationId);

        // check if iCloud is revoked or paused in local storage
        const iCloudRevoked = localItems.some(
          (c) => c.partnersAppId === "mac-icloud-sync" && c.status === "revoked",
        );
        const iCloudLocal = localItems.find(
          (c) => c.partnersAppId === "mac-icloud-sync" && c.status !== "revoked",
        );

        const mockConnectedList: PartnerConnection[] = [];
        if (!iCloudRevoked) {
          const iCloudConn: PartnerConnection = iCloudLocal || {
            id: "conn-mac-icloud",
            organizationId,
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
          mockConnectedList.push(iCloudConn);
        }

        const otherLocal = localItems.filter(
          (c) => c.partnersAppId !== "mac-icloud-sync" && c.status !== "revoked",
        );

        setConnections([...mockConnectedList, ...otherLocal, ...items]);
      })
      .catch(() => {
        const localItems = getLocalConnections(organizationId);

        const iCloudRevoked = localItems.some(
          (c) => c.partnersAppId === "mac-icloud-sync" && c.status === "revoked",
        );
        const iCloudLocal = localItems.find(
          (c) => c.partnersAppId === "mac-icloud-sync" && c.status !== "revoked",
        );

        const mockConnectedList: PartnerConnection[] = [];
        if (!iCloudRevoked) {
          const iCloudConn: PartnerConnection = iCloudLocal || {
            id: "conn-mac-icloud",
            organizationId,
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
          mockConnectedList.push(iCloudConn);
        }

        const otherLocal = localItems.filter(
          (c) => c.partnersAppId !== "mac-icloud-sync" && c.status !== "revoked",
        );

        setConnections([...mockConnectedList, ...otherLocal]);
      })
      .finally(() => setIsLoading(false));
  }, [organizationId]);

  useEffect(() => {
    refreshConnections();
  }, [refreshConnections]);

  return { connections, isLoading, refreshConnections };
}
