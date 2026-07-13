"use client";

import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { emailOTPClient, lastLoginMethodClient, organizationClient } from "better-auth/client/plugins";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";

export const authClient = createAuthClient({
  plugins: [
    convexClient(),
    emailOTPClient(),
    organizationClient(),
    lastLoginMethodClient({ domain: ".qentrah.com" }),
    oauthProviderClient(),
  ],
});

export const {
  useSession,
  useActiveOrganization,
  useListOrganizations,
  signIn,
  signUp,
  signOut,
} = authClient;
