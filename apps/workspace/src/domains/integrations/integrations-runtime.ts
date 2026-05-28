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
  const response = await fetcher(
    organizationApiPath(organizationId, "partner-connections", connectionId),
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  if (!response.ok) {
    throw new Error("Partner connection could not be updated.");
  }
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
  const response = await fetcher(
    organizationApiPath(organizationId, "partner-connections", connectionId),
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw new Error("Partner connection could not be revoked.");
  }
}

export function usePartnerCatalogApps() {
  const [apps, setApps] = useState<PartnerCatalogApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchPartnerCatalogApps()
      .then((items) => {
        if (active) setApps(items);
      })
      .catch(() => {
        if (active) setApps([]);
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
      .then((items) => setConnections(items))
      .catch(() => setConnections([]))
      .finally(() => setIsLoading(false));
  }, [organizationId]);

  useEffect(() => {
    refreshConnections();
  }, [refreshConnections]);

  return { connections, isLoading, refreshConnections };
}
