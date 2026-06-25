"use client";

import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";

export function createWebAuthPlugins(): any[] {
  return [convexClient(), organizationClient(), emailOTPClient()];
}

export function createAdminAuthPlugins(): any[] {
  return [convexClient()];
}

export function createExternalAppAuthPlugins(): any[] {
  return [convexClient()];
}
