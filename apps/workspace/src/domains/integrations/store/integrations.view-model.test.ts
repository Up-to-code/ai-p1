import { describe, expect, it } from "vitest";
import {
  activePartnerConnectionCount,
  buildPartnerCatalogCards,
  buildPartnerConnectionCard,
  filterPartnerCatalogCards,
  findPartnerIntegrationDetail,
  partnerConnectionExpiryLabel,
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
        connectHref: "/web-apps/partners_app_1",
        connectState: "manage",
        scopeCount: 2,
      },
    ]);
  });

  it("marks unavailable app cards when no partner OAuth start URL exists", () => {
    const appWithoutStartUrl: PartnerCatalogApp = {
      id: "partners_app_2",
      partnersClientId: "partners_client_2",
      name: "No Start App",
      publisherName: "Partner Co",
      description: "Missing start URL",
      allowedScopes: ["client:read"],
      redirectUris: ["https://partner.example.com/callback"],
      status: "approved",
      updatedAt: 1,
    };
    expect(buildPartnerCatalogCards([appWithoutStartUrl], [])).toMatchObject([
      {
        connectHref: null,
        connectState: "unavailable",
      },
    ]);
  });

  it("filters catalog cards by query and connection state", () => {
    const cards = buildPartnerCatalogCards([
      app,
      { ...app, id: "partners_app_2", name: "Assets Portal", allowedScopes: ["asset:read"] },
    ], [connection]);

    expect(filterPartnerCatalogCards(cards, "assets", "all").map((card) => card.app.id)).toEqual(["partners_app_2"]);
    expect(filterPartnerCatalogCards(cards, "", "connected").map((card) => card.app.id)).toEqual(["partners_app_1"]);
    expect(filterPartnerCatalogCards(cards, "", "available").map((card) => card.app.id)).toEqual(["partners_app_2"]);
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

  it("formats connection expiry labels with existing fallback behavior", () => {
    expect(partnerConnectionExpiryLabel(undefined, "No expiry")).toBe("No expiry");
    expect(partnerConnectionExpiryLabel(Date.parse("2026-05-28T12:00:00.000Z"), "No expiry")).toContain("2026");
  });
});
