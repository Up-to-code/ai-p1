import { brandRoutePath } from "@qentrah/brand-identity";

export const localDemoRegistration = {
  appName: "Qentrah Partner Key Demo",
  publisherName: "ZA",
  partnerAppUrl: "http://localhost:3004",
  clientId: "partners_client_MvdsQoheDgpiYjk5iA9tBGY-",
  redirectUri: `http://localhost:3004${brandRoutePath("oauthCallback")}`,
  scopes: [
    "calendar:read",
    "client:create",
    "client:delete",
    "client:read",
    "client:update",
    "media:read",
    "organization:read",
    "project:read",
    "property:read",
    "task:read",
  ],
} as const;
