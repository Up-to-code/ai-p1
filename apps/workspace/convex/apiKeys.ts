import { ApiKeys } from "convex-api-keys";
import { components } from "./_generated/api";

export const apiKeys = new ApiKeys<{
  namespace: `organization:${string}`;
  requireName: true;
  metadata: { kind: "mcpConnection"; organizationId: string };
  permissions: Record<string, string[]>;
}>(components.apiKeys, {
  keyDefaults: {
    prefix: "anan_mcp_",
    keyLengthBytes: 32,
    ttlMs: null,
    idleTimeoutMs: 30 * 24 * 60 * 60 * 1000,
  },
  logLevel: "warn",
});
