import { components } from "./_generated/api";
import { createClient } from "@convex-dev/better-auth";

export const betterAuthClient = createClient(components.betterAuth);

export const { getAuthUser, safeGetAuthUser, clientApi } = betterAuthClient;
