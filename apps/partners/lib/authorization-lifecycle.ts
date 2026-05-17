export type AuthorizationLifecycleLayer =
  | "partner_frontend"
  | "partner_backend"
  | "workspace_oauth"
  | "workspace_resource"
  | "shared_packages"
  | "sandbox"
  | "mcp";

export type AuthorizationLifecyclePhase = {
  id: string;
  layer: AuthorizationLifecycleLayer;
  title: string;
  summary: string;
  evidence: string[];
};

export type AuthorizationLifecycleFile = {
  phase: string;
  purpose: string;
  path: string;
};

export const authorizationLifecycleDocsPath = "/docs/authorization-lifecycle";

export const authorizationLifecyclePhases: AuthorizationLifecyclePhase[] = [
  {
    id: "frontend-start",
    layer: "partner_frontend",
    title: "Partner frontend starts authorization",
    summary: "The browser only opens the partner backend start route. It never constructs token requests or stores OAuth secrets.",
    evidence: ["Authorize CTA", "SDK browser helper", "partner redirect target"],
  },
  {
    id: "backend-pkce",
    layer: "partner_backend",
    title: "Partner backend creates state and PKCE",
    summary: "The backend creates the OAuth state, PKCE verifier, S256 challenge, resource audience, scopes, and redirect URI before sending the admin to Workspace.",
    evidence: ["state", "PKCE S256", "resource audience", "redirect URI"],
  },
  {
    id: "workspace-consent",
    layer: "workspace_oauth",
    title: "Workspace authorizes organization consent",
    summary: "Workspace validates the partner app, lets an organization admin choose an organization, and records consent for the requested scopes.",
    evidence: ["organization selection", "consent screen", "reviewed partner app"],
  },
  {
    id: "token-exchange",
    layer: "workspace_oauth",
    title: "Workspace exchanges code plus verifier",
    summary: "The token route accepts authorization code grant requests, verifies PKCE, and returns short-lived bearer credentials to the partner backend only.",
    evidence: ["authorization code", "code verifier", "server-side token response"],
  },
  {
    id: "server-token-store",
    layer: "partner_backend",
    title: "Partner app stores tokens server-side",
    summary: "The partner app stores tokens against the authorized Workspace organization and uses them only from trusted backend routes.",
    evidence: ["organization_id", "token store", "refresh flow"],
  },
  {
    id: "resource-access",
    layer: "workspace_resource",
    title: "Workspace resource APIs verify every call",
    summary: "Resource routes reject query tokens, require bearer headers, verify issuer, audience, organization, client, expiration, revocation state, and scopes.",
    evidence: ["Authorization header", "audience", "organization_id", "scopes"],
  },
  {
    id: "shared-packages",
    layer: "shared_packages",
    title: "Shared packages keep the flow canonical",
    summary: "@qentrah/auth-sdk builds the partner flow, @qentrah/authorization powers browser authorization UX, and @qentrah/partner-auth-core normalizes resource claims.",
    evidence: ["authorize URL builder", "state validation", "canonical claims"],
  },
  {
    id: "sandbox-loop",
    layer: "sandbox",
    title: "Sandbox mirrors the lifecycle locally",
    summary: "The Partners sandbox provides OAuth authorize/token endpoints, scoped resource CRUD, and request logs without creating Workspace registrations or production data.",
    evidence: ["sandbox OAuth", "resource CRUD", "request logs"],
  },
  {
    id: "mcp-operator",
    layer: "mcp",
    title: "MCP exposes lifecycle context to agents",
    summary: "The Partners MCP server lists apps, manages drafts with permissions, reads sandbox status and logs, and returns this lifecycle map without exposing secrets.",
    evidence: ["tools/list", "partner_authorization_flow", "partner_sandbox_status"],
  },
];

export const authorizationLifecycleFiles: AuthorizationLifecycleFile[] = [
  {
    phase: "Partner frontend",
    purpose: "Demo dashboard, requested scopes, OAuth 2.1 flow panel, and start authorization CTA.",
    path: "apps/demo-partner-app/app/dashboard/page.tsx",
  },
  {
    phase: "Partner backend",
    purpose: "Demo OAuth start route that creates state, PKCE, scopes, resource audience, and redirects to Workspace.",
    path: "apps/demo-partner-app/app/api/auth/qentrah/start/route.ts",
  },
  {
    phase: "Partner backend",
    purpose: "Demo OAuth callback route that validates state, exchanges the code, and persists the organization connection.",
    path: "apps/demo-partner-app/app/api/auth/qentrah/callback/route.ts",
  },
  {
    phase: "Partner backend",
    purpose: "Demo OAuth helpers for configuration, PKCE, session, and Workspace API calls.",
    path: "apps/demo-partner-app/lib/oauth.ts",
  },
  {
    phase: "Partner backend",
    purpose: "Demo server-side organization session and token storage helpers.",
    path: "apps/demo-partner-app/lib/session.ts",
  },
  {
    phase: "Partner backend",
    purpose: "Demo Workspace resource API client that sends server-side bearer tokens.",
    path: "apps/demo-partner-app/lib/workspace-api.ts",
  },
  {
    phase: "Partners UI",
    purpose: "App detail tabs for configuration, OAuth, scopes, Flow, sandbox, API explorer, logs, and code.",
    path: "apps/partners/components/portal/AppDetailsTabs.tsx",
  },
  {
    phase: "Partners docs",
    purpose: "Developer-facing lifecycle guide with sequence diagrams, responsibility map, file inventory, and tests.",
    path: "apps/partners/content/docs/authorization-lifecycle.mdx",
  },
  {
    phase: "Workspace OAuth",
    purpose: "Public authorize endpoint that enters the Workspace OAuth lifecycle.",
    path: "apps/workspace/src/app/oauth/authorize/route.ts",
  },
  {
    phase: "Workspace OAuth",
    purpose: "Token endpoint that exchanges authorization codes and validates PKCE.",
    path: "apps/workspace/src/app/oauth/token/route.ts",
  },
  {
    phase: "Workspace OAuth",
    purpose: "Consent UI for organization authorization and requested scopes.",
    path: "apps/workspace/src/app/oauth/consent/consent-client.tsx",
  },
  {
    phase: "Workspace resource server",
    purpose: "Partner resource access guard for bearer token, audience, organization, client, scopes, expiration, and revocation checks.",
    path: "apps/workspace/src/server/domains/partnerApps/services/access-token.ts",
  },
  {
    phase: "Shared package",
    purpose: "@qentrah/auth-sdk partner authorize URL, PKCE, state, token exchange, refresh, and callback helpers.",
    path: "packages/auth-sdk/src/partner/core.ts",
  },
  {
    phase: "Shared package",
    purpose: "@qentrah/authorization browser popup and redirect authorization client.",
    path: "packages/authorization/src/client.ts",
  },
  {
    phase: "Shared package",
    purpose: "@qentrah/partner-auth-core canonical claim parsing and legacy claim rejection.",
    path: "packages/partner-auth-core/src/index.ts",
  },
  {
    phase: "Sandbox OAuth",
    purpose: "Sandbox authorize and token endpoints with login, PKCE S256, one-time codes, refresh, and sandbox tokens.",
    path: "apps/partners/server/sandbox/oauth.ts",
  },
  {
    phase: "Sandbox API",
    purpose: "Sandbox partner resource CRUD routes that validate scoped access and record request logs.",
    path: "apps/partners/server/sandbox/api.ts",
  },
  {
    phase: "Sandbox storage",
    purpose: "Sandbox organizations, OAuth codes, tokens, seeded resources, validation, writes, and request logs.",
    path: "apps/partners/server/sandbox/store.ts",
  },
  {
    phase: "MCP",
    purpose: "JSON-RPC initialize, tools/list, tools/call, authentication, usage logging, and error handling.",
    path: "apps/partners/server/mcp/transport.ts",
  },
  {
    phase: "MCP",
    purpose: "Partner MCP tool definitions and handlers, including authorization lifecycle and sandbox status.",
    path: "apps/partners/server/mcp/tools.ts",
  },
];

export function authorizationLifecycleOverview() {
  return {
    docsPath: authorizationLifecycleDocsPath,
    summary: "OAuth 2.1 authorization code plus PKCE across partner frontend, partner backend, Workspace OAuth, resource APIs, shared packages, sandbox, and MCP.",
    phases: authorizationLifecyclePhases,
    files: authorizationLifecycleFiles,
    sandbox: {
      description: "Sandbox mirrors authorize, token, scoped resource CRUD, and logs without touching production Workspace data.",
      logEvidence: ["method", "path", "status", "latencyMs", "scopes", "createdAt", "input", "response", "error"],
    },
    mcp: {
      tool: "partner_authorization_flow",
      sandboxEvidenceTool: "partner_sandbox_status",
      secretPolicy: "MCP URLs and secrets are supplied through local environment variables and never returned by lifecycle tools.",
    },
  };
}
