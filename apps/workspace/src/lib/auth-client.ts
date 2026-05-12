import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
  organizationAccessControl,
  organizationRoles,
} from "@/packages/authz";

// The browser auth client mirrors server-side organization roles for UI checks only.
export const authClient = createAuthClient({
  plugins: [
    convexClient(),
    oauthProviderClient(),
    organizationClient({
      ac: organizationAccessControl,
      roles: organizationRoles,
      teams: { enabled: true },
      dynamicAccessControl: { enabled: true },
    }),
  ],
});
