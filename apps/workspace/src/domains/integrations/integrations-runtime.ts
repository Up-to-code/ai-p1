"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceMutation, organizationApiPath } from "@/domains/resources/workspace-resource-request";
import { requestOrganizationAction } from "@/domains/organization/api/organization-request";
import { logger } from "@/lib/logger";
import type { PartnerCatalogFilter } from "./store/integrations.view-model";
import type { PartnerCatalogApp, PartnerConnection } from "./store/integrations.types";
import { MOCK_MAC_APPS, createMockConnection, createICloudConnection } from "./mock-data";
import { getItem, setItem, removeItem } from "@/domains/storage";

type Fetcher = typeof fetch;

type PartnerCatalogPayload = {
  apps?: PartnerCatalogApp[];
};

type PartnerConnectionsPayload = {
  connections?: PartnerConnection[];
};

export const partnerCatalogFilters: PartnerCatalogFilter[] = ["all", "connected", "available"];

async function getLocalConnections(organizationId: string): Promise<PartnerConnection[]> {
  if (typeof window === "undefined") return [];
  try {
    const entry = await getItem("cache", `mock_connections_${organizationId}`);
    return entry ? (entry.value as unknown as PartnerConnection[]) : [];
  } catch {
    return [];
  }
}

async function saveLocalConnection(organizationId: string, connection: PartnerConnection) {
  if (typeof window === "undefined") return;
  try {
    const current = await getLocalConnections(organizationId);
    if (!current.some((c) => c.partnersAppId === connection.partnersAppId)) {
      await setItem("cache", `mock_connections_${organizationId}`, [...current, connection] as unknown as Record<string, unknown>);
    }
  } catch (e) {
    logger.error("integrations.save_connection_failed", { error: e });
  }
}

async function removeLocalConnection(organizationId: string, connectionId: string) {
  if (typeof window === "undefined") return;
  try {
    const current = await getLocalConnections(organizationId);
    await setItem("cache", `mock_connections_${organizationId}`, current.filter((c) => c.id !== connectionId) as unknown as Record<string, unknown>);
  } catch (e) {
    logger.error("integrations.remove_connection_failed", { error: e });
  }
}

async function updateLocalConnectionStatus(
  organizationId: string,
  connectionId: string,
  status: "active" | "paused" | "revoked",
) {
  if (typeof window === "undefined") return;
  try {
    const current = await getLocalConnections(organizationId);
    await setItem("cache", `mock_connections_${organizationId}`, current.map((c) =>
      c.id === connectionId ? { ...c, status, effectiveStatus: status } : c,
    ) as unknown as Record<string, unknown>);
  } catch (e) {
    logger.error("integrations.update_connection_failed", { error: e });
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
      await saveLocalConnection(organizationId, createICloudConnection(organizationId));
    }
    await updateLocalConnectionStatus(organizationId, connectionId, status);
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
      await saveLocalConnection(organizationId, createMockConnection(organizationId, matchedApp));
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
      await saveLocalConnection(organizationId, conn);
    }
    await updateLocalConnectionStatus(organizationId, connectionId, "revoked");
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

async function mergeConnections(
  organizationId: string,
  apiConnections?: PartnerConnection[],
): Promise<PartnerConnection[]> {
  const localItems = await getLocalConnections(organizationId);

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

  if (apiConnections) {
    return [...mockConnectedList, ...otherLocal, ...apiConnections];
  }
  return [...mockConnectedList, ...otherLocal];
}

export function usePartnerCatalogApps() {
  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["partner-catalog-apps"],
    queryFn: async () => {
      try {
        const items = await fetchPartnerCatalogApps();
        return [...MOCK_MAC_APPS, ...items];
      } catch {
        return [...MOCK_MAC_APPS];
      }
    },
  });

  return { apps, isLoading };
}

export function usePartnerConnections(organizationId?: string | null) {
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["partner-connections", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        const items = await fetchPartnerConnections(organizationId);
        return await mergeConnections(organizationId, items);
      } catch {
        return await mergeConnections(organizationId);
      }
    },
    enabled: Boolean(organizationId),
  });

  const refreshConnections = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["partner-connections", organizationId] });
  }, [queryClient, organizationId]);

  return { connections, isLoading, refreshConnections };
}
