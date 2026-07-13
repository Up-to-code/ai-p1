import { brandDomainUrl } from "@qentrah/brand-identity";

import { readAuthEnv, type AuthRuntimeEnv } from "./env.js";

export type ResolvedAuthTopology = {
  marketingOrigin: string;
  workspaceOrigin: string;
  authIssuer: string;
  jwksUrl: string;
  mcpResourceUrl: string;
  mcpProtectedResourceMetadataUrl: string;
};

const LOCAL_MARKETING_ORIGIN = "http://localhost:3005";
const LOCAL_WORKSPACE_ORIGIN = "http://localhost:3000";

function normalizePublicOrigin(name: string, value: string, production: boolean): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid URL configured for \`${name}\``);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`\`${name}\` must use HTTP or HTTPS`);
  }
  if (url.username || url.password || url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) {
    throw new Error(`\`${name}\` must be an origin without credentials, a path, query, or fragment`);
  }
  if (production && url.protocol !== "https:") {
    throw new Error(`\`${name}\` must use HTTPS in production`);
  }
  if (production && isLoopbackHostname(url.hostname)) {
    throw new Error(`\`${name}\` cannot use a loopback host in production`);
  }

  return url.origin;
}

function isLoopbackHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/gu, "");
  return normalized === "localhost"
    || normalized === "::1"
    || normalized === "0.0.0.0"
    || normalized.startsWith("127.");
}

/**
 * Resolves the public authentication topology from one environment seam.
 * Derived URLs intentionally cannot drift from the Workspace origin.
 */
export function resolveAuthTopology(env: AuthRuntimeEnv = process.env): ResolvedAuthTopology {
  const production = env.NODE_ENV === "production";
  const marketingOrigin = normalizePublicOrigin(
    "QENTRAH_MARKETING_URL",
    readAuthEnv("QENTRAH_MARKETING_URL", env)
      ?? (production ? brandDomainUrl("root") : LOCAL_MARKETING_ORIGIN),
    production,
  );
  const workspaceOrigin = normalizePublicOrigin(
    "QENTRAH_WORKSPACE_URL",
    readAuthEnv("QENTRAH_WORKSPACE_URL", env)
      ?? readAuthEnv("NEXT_PUBLIC_APP_URL", env)
      ?? (production ? brandDomainUrl("workspace") : LOCAL_WORKSPACE_ORIGIN),
    production,
  );
  const authIssuer = `${workspaceOrigin}/api/auth`;

  return {
    marketingOrigin,
    workspaceOrigin,
    authIssuer,
    jwksUrl: `${authIssuer}/jwks`,
    mcpResourceUrl: `${workspaceOrigin}/api/mcp`,
    mcpProtectedResourceMetadataUrl: `${workspaceOrigin}/.well-known/oauth-protected-resource/api/mcp`,
  };
}
