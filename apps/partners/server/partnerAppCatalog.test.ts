import { describe, expect, it } from "vitest";
import {
  toAdminPartnerAppRecord,
  toPartnerAppSummary,
  toPublishedPartnerApp,
  type PartnerAppCatalogRow,
} from "./partnerAppCatalog";

function row(overrides: Partial<PartnerAppCatalogRow> = {}): PartnerAppCatalogRow {
  return {
    id: "partners_app_123",
    clientId: "partners_client_123",
    name: "Launch Desk",
    publisherName: "Qentrah Labs",
    description: "Launch Desk syncs launch tasks and client records into Qentrah Workspace.",
    appCategory: "operations",
    integrationMode: "workspace",
    supportEmail: "support@partner.example.com",
    homepageUrl: "https://partner.example.com",
    iconUrl: null,
    logoUrl: "https://partner.example.com/logo.png",
    webhookUrl: "https://partner.example.com/api/qentrah/webhooks",
    privacyPolicyUrl: "https://partner.example.com/privacy",
    termsOfServiceUrl: "https://partner.example.com/terms",
    clientType: "confidential",
    status: "active",
    workspacePartnerAppId: "workspace_partner_app_123",
    workspaceOauthClientId: "oauth_client_123",
    workspaceSyncStatus: "synced",
    workspaceSyncError: null,
    redirectUris: ["https://partner.example.com/oauth/callback"],
    allowedScopes: ["client:read", "organization:read"],
    authorizationExpiresAfterDays: 14,
    reviewNotes: null,
    submittedAt: new Date("2026-05-16T10:00:00.000Z"),
    reviewedAt: new Date("2026-05-16T11:00:00.000Z"),
    createdAt: new Date("2026-05-16T09:00:00.000Z"),
    updatedAt: new Date("2026-05-16T12:00:00.000Z"),
    ...overrides,
  };
}

describe("Partner app catalog projections", () => {
  it("projects portal summaries with icon fallback and lifecycle timestamps", () => {
    expect(toPartnerAppSummary(row())).toMatchObject({
      id: "partners_app_123",
      clientId: "partners_client_123",
      iconUrl: "https://partner.example.com/logo.png",
      logoUrl: "https://partner.example.com/logo.png",
      description: "Launch Desk syncs launch tasks and client records into Qentrah Workspace.",
      appCategory: "operations",
      integrationMode: "workspace",
      supportEmail: "support@partner.example.com",
      webhookUrl: "https://partner.example.com/api/qentrah/webhooks",
      clientType: "confidential",
      status: "active",
      workspaceSyncStatus: "synced",
      authorizationExpiresAfterDays: 14,
      submittedAt: Date.parse("2026-05-16T10:00:00.000Z"),
      reviewedAt: Date.parse("2026-05-16T11:00:00.000Z"),
      createdAt: Date.parse("2026-05-16T09:00:00.000Z"),
      updatedAt: Date.parse("2026-05-16T12:00:00.000Z"),
    });
  });

  it("projects Admin Review records with admin status names and normalized scopes", () => {
    expect(toAdminPartnerAppRecord(row({
      status: "pending_review",
      description: null,
      allowedScopes: ["organization:read", "client:read", "client:read"],
    }))).toMatchObject({
      id: "partners_app_123",
      status: "pending",
      description: "Qentrah Labs partner app submitted from Partners.",
      allowedScopes: ["client:read", "organization:read"],
      workspaceSyncStatus: "synced",
    });
  });

  it("projects published catalog records as active published apps", () => {
    expect(toPublishedPartnerApp(row({
      description: "A launch workflow app.",
      status: "active",
    }))).toEqual({
      id: "partners_app_123",
      clientId: "partners_client_123",
      name: "Launch Desk",
      publisherName: "Qentrah Labs",
      description: "A launch workflow app.",
      homepageUrl: "https://partner.example.com",
      iconUrl: null,
      logoUrl: "https://partner.example.com/logo.png",
      clientType: "confidential",
      redirectUris: ["https://partner.example.com/oauth/callback"],
      allowedScopes: ["client:read", "organization:read"],
      status: "active",
      updatedAt: Date.parse("2026-05-16T12:00:00.000Z"),
    });
  });
});
