import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";
import { resolveConvexAuthTopology } from "./auth/topology";

const topology = resolveConvexAuthTopology();

export default {
  providers: [
    getAuthConfigProvider(),
    {
      domain: topology.authIssuer,
      applicationID: topology.mcpResourceUrl,
    },
  ],
} satisfies AuthConfig;
