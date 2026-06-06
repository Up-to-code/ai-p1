import type { PublishedPartnerApp } from "@qentrah/partner-workspace-sync";
import { normalizeRedirectUris, normalizeScopes } from "@/server/partnerAppPolicies";

export type PartnerAppStatus = "draft" | "pending_review" | "active" | "rejected" | "suspended";
export type PartnerAppClientType = "public" | "confidential";
type PartnerWorkspaceSyncStatus = "not_synced" | "pending" | "synced" | "failed";
type PartnerAppCategory = "brokerage" | "developer" | "crm" | "marketing" | "operations" | "other";
type PartnerIntegrationMode = "integrate" | "debug" | "sandbox" | "workspace" | "production";

export type PartnerAppSummary = {
  id: string;
  clientId: string;
  name: string;
  publisherName: string;
  description: string;
  appCategory: PartnerAppCategory;
  integrationMode: PartnerIntegrationMode;
  supportEmail?: string | null;
  homepageUrl?: string | null;
  iconUrl?: string | null;
  logoUrl?: string | null;
  webhookUrl?: string | null;
  privacyPolicyUrl?: string | null;
  termsOfServiceUrl?: string | null;
  clientType: PartnerAppClientType;
  status: PartnerAppStatus;
  workspacePartnerAppId?: string | null;
  workspaceOauthClientId?: string | null;
  workspaceSyncStatus?: PartnerWorkspaceSyncStatus | null;
  workspaceSyncError?: string | null;
  redirectUris: string[];
  allowedScopes: string[];
  authorizationExpiresAfterDays: number;
  reviewNotes?: string | null;
  submittedAt?: number | null;
  reviewedAt?: number | null;
  createdAt: number;
  updatedAt: number;
};

export type AdminPartnerAppRecord = Omit<PublishedPartnerApp, "status"> & {
  status: "pending" | "approved" | "rejected" | "suspended";
  workspaceSyncStatus?: PartnerWorkspaceSyncStatus | null;
  workspaceSyncError?: string | null;
  reviewNotes?: string | null;
  submittedAt?: number | null;
  reviewedAt?: number | null;
  createdAt: number;
};

export type PartnerAppCatalogRow = {
  id: string;
  clientId: string;
  name: string;
  publisherName: string;
  description?: string | null;
  appCategory?: string | null;
  integrationMode?: string | null;
  supportEmail?: string | null;
  homepageUrl?: string | null;
  iconUrl?: string | null;
  logoUrl?: string | null;
  webhookUrl?: string | null;
  privacyPolicyUrl?: string | null;
  termsOfServiceUrl?: string | null;
  clientType: string;
  status: string;
  workspacePartnerAppId?: string | null;
  workspaceOauthClientId?: string | null;
  workspaceSyncStatus?: string | null;
  workspaceSyncError?: string | null;
  redirectUris: string[];
  allowedScopes: string[];
  authorizationExpiresAfterDays?: number;
  reviewNotes?: string | null;
  submittedAt?: Date | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toMillis(value: Date | null | undefined) {
  return value ? value.getTime() : null;
}

function clientType(value: string): PartnerAppClientType {
  return value === "confidential" ? "confidential" : "public";
}

function appCategory(value: string | null | undefined): PartnerAppCategory {
  if (value === "brokerage" || value === "developer" || value === "crm" || value === "marketing" || value === "operations" || value === "other") return value;
  return "operations";
}

function integrationMode(value: string | null | undefined): PartnerIntegrationMode {
  if (value === "integrate" || value === "debug" || value === "sandbox" || value === "workspace" || value === "production") return value;
  return "sandbox";
}

function adminStatus(status: string): AdminPartnerAppRecord["status"] {
  if (status === "active") return "approved";
  if (status === "pending_review") return "pending";
  if (status === "suspended") return "suspended";
  if (status === "rejected") return "rejected";
  return "pending";
}

export function toPartnerAppSummary(app: PartnerAppCatalogRow): PartnerAppSummary {
  return {
    id: app.id,
    clientId: app.clientId,
    name: app.name,
    publisherName: app.publisherName,
    description: app.description || `${app.publisherName} partner app managed in Qentrah Partners.`,
    appCategory: appCategory(app.appCategory),
    integrationMode: integrationMode(app.integrationMode),
    supportEmail: app.supportEmail,
    homepageUrl: app.homepageUrl,
    iconUrl: app.iconUrl ?? app.logoUrl,
    logoUrl: app.logoUrl,
    webhookUrl: app.webhookUrl,
    privacyPolicyUrl: app.privacyPolicyUrl,
    termsOfServiceUrl: app.termsOfServiceUrl,
    clientType: clientType(app.clientType),
    status: app.status as PartnerAppStatus,
    workspacePartnerAppId: app.workspacePartnerAppId,
    workspaceOauthClientId: app.workspaceOauthClientId,
    workspaceSyncStatus: app.workspaceSyncStatus as PartnerWorkspaceSyncStatus | null | undefined,
    workspaceSyncError: app.workspaceSyncError,
    redirectUris: app.redirectUris,
    allowedScopes: app.allowedScopes,
    authorizationExpiresAfterDays: app.authorizationExpiresAfterDays ?? 0,
    reviewNotes: app.reviewNotes,
    submittedAt: toMillis(app.submittedAt),
    reviewedAt: toMillis(app.reviewedAt),
    createdAt: app.createdAt.getTime(),
    updatedAt: app.updatedAt.getTime(),
  };
}

export function toAdminPartnerAppRecord(app: PartnerAppCatalogRow): AdminPartnerAppRecord {
  return {
    id: app.id,
    clientId: app.clientId,
    name: app.name,
    publisherName: app.publisherName,
    description: app.description || `${app.publisherName} partner app submitted from Partners.`,
    homepageUrl: app.homepageUrl,
    iconUrl: app.iconUrl,
    logoUrl: app.logoUrl,
    clientType: clientType(app.clientType),
    redirectUris: normalizeRedirectUris(app.redirectUris),
    allowedScopes: normalizeScopes(app.allowedScopes),
    status: adminStatus(app.status),
    workspaceSyncStatus: app.workspaceSyncStatus as PartnerWorkspaceSyncStatus | null | undefined,
    workspaceSyncError: app.workspaceSyncError,
    reviewNotes: app.reviewNotes,
    submittedAt: toMillis(app.submittedAt),
    reviewedAt: toMillis(app.reviewedAt),
    createdAt: app.createdAt.getTime(),
    updatedAt: app.updatedAt.getTime(),
  };
}

export function toPublishedPartnerApp(app: PartnerAppCatalogRow): PublishedPartnerApp {
  return {
    id: app.id,
    clientId: app.clientId,
    name: app.name,
    publisherName: app.publisherName,
    description: app.description || `${app.publisherName} partner app.`,
    homepageUrl: app.homepageUrl,
    iconUrl: app.iconUrl,
    logoUrl: app.logoUrl,
    clientType: clientType(app.clientType),
    redirectUris: normalizeRedirectUris(app.redirectUris),
    allowedScopes: normalizeScopes(app.allowedScopes),
    status: "active",
    updatedAt: app.updatedAt.getTime(),
  };
}
