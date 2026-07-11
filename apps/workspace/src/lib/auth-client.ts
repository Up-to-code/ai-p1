"use client";

import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [
    convexClient(),
    emailOTPClient(),
    organizationClient(),
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
