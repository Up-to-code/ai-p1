import { describe, expect, it } from "vitest";
import {
  activePartnerConnectionCount,
  buildPartnerCatalogCards,
  buildPartnerConnectionCard,
  findPartnerIntegrationDetail,
} from "./integrations.view-model";
import type { PartnerCatalogApp, PartnerConnection } from "./integrations.types";

const app: PartnerCatalogApp = {
  id: "partners_app_1",
  partnersClientId: "partners_client_1",
  name: "Partner CRM",
  publisherName: "Partner Co",
  description: "CRM integration",
  homepageUrl: "https://partner.example.com",
  logoUrl: undefined,
  allowedScopes: ["client:read", "client:update"],
  redirectUris: ["https://partner.example.com/callback"],
  status: "approved",
  updatedAt: 1,
};

const connection: PartnerConnection = {
  id: "connection_1",
  organizationId: "org_1",
  partnersAppId: "partners_app_1",
  partnersClientId: "partners_client_1",
  status: "active",
  scopes: ["client:read"],
  expiresAt: 2,
  updatedAt: 3,
  partnerApp: app,
};

describe("integrations view model", () => {
  it("merges catalog apps with organization grants", () => {
    expect(buildPartnerCatalogCards([app], [connection])).toMatchObject([
      {
        app,
        connection,
        effectiveStatus: "active",
        statusTone: "success",
        visitHref: "https://partner.example.com",
        scopeCount: 2,
      },
    ]);
  });

  it("derives connection actions from effective status", () => {
    expect(buildPartnerConnectionCard(connection)).toMatchObject({
      effectiveStatus: "active",
      canPauseOrResume: true,
      pauseOrResumeAction: "pause",
      canRevoke: true,
    });

    expect(buildPartnerConnectionCard({
      ...connection,
      effectiveStatus: "expired",
    })).toMatchObject({
      effectiveStatus: "expired",
      statusTone: "warning",
      canPauseOrResume: false,
    });
  });

  it("finds detail app and active counts without rendering the screen", () => {
    expect(activePartnerConnectionCount([connection, { ...connection, id: "connection_2", status: "paused" }])).toBe(1);
    expect(findPartnerIntegrationDetail("partners_app_1", [app], [connection])).toEqual({ app, connection });
  });
});
