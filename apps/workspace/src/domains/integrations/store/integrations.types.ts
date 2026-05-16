export type IntegrationStatus = "synced" | "approved" | "pending" | "draft" | "blocked";

export interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  status: IntegrationStatus;
  volume: string;
  iconName: "store" | "database" | "arrows" | "globe" | "mobile" | "code";
}

export interface PartnerCatalogApp {
  id: string;
  partnersClientId: string;
  name: string;
  publisherName?: string;
  description: string;
  homepageUrl?: string;
  logoUrl?: string;
  allowedScopes: string[];
  redirectUris: string[];
  status: "approved";
  updatedAt: number;
}

export type PartnerConnectionStatus = "active" | "paused" | "revoked" | "expired";

export interface PartnerConnection {
  id: string;
  organizationId: string;
  partnersAppId: string;
  partnersClientId: string;
  status: "active" | "paused" | "revoked";
  effectiveStatus?: PartnerConnectionStatus;
  scopes: string[];
  expiresAt?: number;
  updatedAt: number;
  partnerApp: PartnerCatalogApp | null;
}
