"use client";

import { useCallback, useEffect, useState } from "react";
import {
  organizationApiPath,
  requestOrganizationAction,
} from "@/domains/organization/api/organization-request";
import type { PartnerCatalogFilter } from "./store/integrations.view-model";
import type { PartnerCatalogApp, PartnerConnection } from "./store/integrations.types";
import { MOCK_MAC_APPS, createMockConnection, createICloudConnection } from "./mock-data";

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
    if (connectionId === "conn-mac-icloud") {
      saveLocalConnection(organizationId, createICloudConnection(organizationId));
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
    const matchedApp = MOCK_MAC_APPS.find((a) => a.id === input.partnersAppId);
    if (matchedApp) {
      saveLocalConnection(organizationId, createMockConnection(organizationId, matchedApp));
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
      const conn = createICloudConnection(organizationId);
      conn.status = "revoked";
      conn.effectiveStatus = "revoked";
      saveLocalConnection(organizationId, conn);
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
        if (active) setApps([...MOCK_MAC_APPS, ...items]);
      })
      .catch(() => {
        if (active) setApps([...MOCK_MAC_APPS]);
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

        const iCloudRevoked = localItems.some(
          (c) => c.partnersAppId === "mac-icloud-sync" && c.status === "revoked",
        );
        const iCloudLocal = localItems.find(
          (c) => c.partnersAppId === "mac-icloud-sync" && c.status !== "revoked",
        );

        const mockConnectedList: PartnerConnection[] = [];
        if (!iCloudRevoked) {
          mockConnectedList.push(iCloudLocal || createICloudConnection(organizationId));
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
          mockConnectedList.push(iCloudLocal || createICloudConnection(organizationId));
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
