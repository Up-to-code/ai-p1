import type { PartnerCatalogApp, PartnerConnection, PartnerConnectionStatus } from "./integrations.types";

export type IntegrationStatusTone = "success" | "warning" | "danger" | "neutral";

export type PartnerCatalogCardModel = {
  app: PartnerCatalogApp;
  connection?: PartnerConnection;
  effectiveStatus: PartnerConnectionStatus | "available";
  statusTone: IntegrationStatusTone;
  visitHref: string | null;
  scopeCount: number;
};

export type PartnerConnectionCardModel = {
  connection: PartnerConnection & { partnerApp: PartnerCatalogApp };
  effectiveStatus: PartnerConnectionStatus;
  statusTone: IntegrationStatusTone;
  canPauseOrResume: boolean;
  pauseOrResumeAction: "pause" | "resume";
  canRevoke: boolean;
};

export function effectivePartnerConnectionStatus(connection: PartnerConnection): PartnerConnectionStatus {
  return connection.effectiveStatus ?? connection.status;
}

export function integrationStatusTone(status?: PartnerConnectionStatus | "available"): IntegrationStatusTone {
  if (status === "active") return "success";
  if (status === "expired" || status === "paused") return "warning";
  if (status === "revoked") return "danger";
  return "neutral";
}

export function buildPartnerCatalogCards(
  apps: PartnerCatalogApp[],
  connections: PartnerConnection[],
): PartnerCatalogCardModel[] {
  const connectionByAppId = new Map(connections.map((connection) => [connection.partnersAppId, connection]));
  return apps.map((app) => {
    const connection = connectionByAppId.get(app.id);
    const effectiveStatus = connection ? effectivePartnerConnectionStatus(connection) : "available";
    return {
      app,
      connection,
      effectiveStatus,
      statusTone: integrationStatusTone(effectiveStatus),
      visitHref: app.homepageUrl || null,
      scopeCount: app.allowedScopes.length,
    };
  });
}

export function buildPartnerConnectionCard(connection: PartnerConnection): PartnerConnectionCardModel | null {
  if (!connection.partnerApp) return null;
  const connected = connection as PartnerConnection & { partnerApp: PartnerCatalogApp };
  const effectiveStatus = effectivePartnerConnectionStatus(connection);
  return {
    connection: connected,
    effectiveStatus,
    statusTone: integrationStatusTone(effectiveStatus),
    canPauseOrResume: connection.status !== "revoked" && effectiveStatus !== "expired",
    pauseOrResumeAction: connection.status === "active" ? "pause" : "resume",
    canRevoke: connection.status !== "revoked",
  };
}

export function activePartnerConnectionCount(connections: PartnerConnection[]) {
  return connections.filter((connection) => effectivePartnerConnectionStatus(connection) === "active").length;
}

export function findPartnerIntegrationDetail(
  id: string,
  apps: PartnerCatalogApp[],
  connections: PartnerConnection[],
) {
  return {
    app: apps.find((item) => item.id === id),
    connection: connections.find((item) => item.partnersAppId === id),
  };
}
