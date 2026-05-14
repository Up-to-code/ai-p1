import { brandProductName, brandRoutePath } from "@anan/brand-identity";

export const localDemoRegistration = {
  appName: brandProductName("demo", "en"),
  publisherName: "ZA",
  partnerAppUrl: "http://localhost:3004",
  clientId: "partners_client_4p2f001r194s5z6e15473f582m331f4z4s0f",
  redirectUri: `http://localhost:3004${brandRoutePath("oauthCallback")}`,
  scopes: [
    "calendar:read",
    "client:create",
    "client:read",
    "client:update",
    "media:read",
    "organization:read",
    "project:read",
    "property:read",
    "task:read",
    "offline_access",
  ],
} as const;
