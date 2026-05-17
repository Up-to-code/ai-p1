"use client";

import {
  Bug,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  KeyRound,
  ListChecks,
  LayoutList,
  ServerCog,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import {
  authorizationLifecycleDocsPath,
  authorizationLifecycleFiles,
  authorizationLifecyclePhases,
} from "@/lib/authorization-lifecycle";
import { cn } from "@/lib/utils";
import type { SandboxActionState } from "@/app/(portal)/dashboard/actions";
import type { PartnerAppSummary } from "@/server/partnerApps";
import type { SandboxInfo } from "@/server/sandbox";

type TabId = "configuration" | "review" | "oauth" | "scopes" | "flow" | "sandbox" | "api" | "logs" | "code";
type LanguageId = "typescript" | "javascript" | "curl";
type SandboxLog = {
  createdAt: number;
  error?: string | null;
  id?: string;
  input?: unknown;
  latencyMs: number | null;
  method: string;
  path: string;
  response?: unknown;
  scopes?: string[];
  status: number;
};
type ReviewItem = {
  detail: string;
  label: string;
  owner: string;
  ready: boolean;
};

const tabs: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: "configuration", label: "Configuration", icon: LayoutList },
  { id: "review", label: "Review", icon: CheckCircle2 },
  { id: "oauth", label: "OAuth", icon: KeyRound },
  { id: "scopes", label: "Scopes", icon: ShieldCheck },
  { id: "flow", label: "Flow", icon: Workflow },
  { id: "sandbox", label: "Sandbox", icon: Bug },
  { id: "api", label: "API explorer", icon: ServerCog },
  { id: "logs", label: "Logs", icon: Database },
  { id: "code", label: "Code", icon: Code2 },
];

const languages: Array<{ id: LanguageId; label: string }> = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "curl", label: "cURL" },
];

function codeFor(app: PartnerAppSummary, language: LanguageId) {
  const redirectUri = app.redirectUris[0] ?? "https://partner.example.com/api/auth/qentrah/callback";
  const scopes = JSON.stringify(app.allowedScopes, null, 2);

  if (language === "typescript") {
    return `// Browser entry
import { mountQentrahAuthorizeButton } from "@qentrah/auth-sdk/partner/browser";

mountQentrahAuthorizeButton({
  buttonId: "qentrah-authorize",
  startUrl: "/api/qentrah/oauth/start",
  label: "Authorize with Qentrah",
  disabledLabel: "Opening Qentrah...",
});

// app/api/qentrah/oauth/config.ts
import { createQentrahPartnerAuthHandlers } from "@qentrah/auth-sdk/partner/next";
import { createQentrahWebhookHandler } from "@qentrah/auth-sdk/partner/webhooks";
import { createQentrahServiceAppClient } from "@qentrah/auth-sdk/partner/service-app";

export const runtime = "nodejs";

export const qentrahAuth = createQentrahPartnerAuthHandlers({
  workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_API_URL!,
  clientId: "${app.clientId}",
  clientSecret: process.env.QENTRAH_CLIENT_SECRET,
  redirectUri: "${redirectUri}",
  scopes: ${scopes},
  sessionStore,
  tokenStore,
});

export const qentrahWebhook = createQentrahWebhookHandler({
  signingSecret: process.env.QENTRAH_WEBHOOK_SECRET!,
  handlers: {
    "client.created": async (event) => {
      console.log("Client created", event.data);
    },
  },
});

const serviceApp = createQentrahServiceAppClient({
  workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_API_URL!,
  accessToken: "read-from-your-token-store",
});`;
  }

  if (language === "javascript") {
    return `<button id="qentrah-authorize">Authorize with Qentrah</button>
<script src="https://cdn.jsdelivr.net/npm/@qentrah/auth-sdk@0.1.5/dist/qentrah-auth.js"></script>
<script>
  window.QentrahAuth.mountAuthorizeButton({
    buttonId: "qentrah-authorize",
    startUrl: "/api/qentrah/oauth/start",
    disabledLabel: "Opening Qentrah..."
  });
</script>

// app/api/qentrah/oauth/start/route.js
// app/api/qentrah/oauth/callback/route.js
import { createQentrahPartnerAuthHandlers } from "@qentrah/auth-sdk/partner/next";

export const runtime = "nodejs";
const handlers = createQentrahPartnerAuthHandlers({
  workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_API_URL,
  clientId: "${app.clientId}",
  clientSecret: process.env.QENTRAH_CLIENT_SECRET,
  redirectUri: "${redirectUri}",
  scopes: ${JSON.stringify(app.allowedScopes)},
  sessionStore,
  tokenStore
});`;
  }

  return `# The browser helper can be loaded without npm:
curl -L "https://cdn.jsdelivr.net/npm/@qentrah/auth-sdk@0.1.5/dist/qentrah-auth.js" -o public/vendor/qentrah/qentrah-auth.js

# Backend calls still use saved server-side tokens:
curl -X POST "https://app.qentrah.com/api/v1/partner/organizations/<organization-id>/resources/client/create" \\
  -H "Authorization: Bearer <access-token>" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: client-create-001" \\
  -d '{"input":{"name":"New client","contact":"New client"}}'`;
}

function codeTitle(language: LanguageId) {
  if (language === "typescript") return "authorize-with-qentrah.ts";
  if (language === "javascript") return "authorize-with-qentrah.js";
  return "authorize-with-qentrah.sh";
}

function sandboxAuthorizeUrl(app: PartnerAppSummary) {
  const redirectUri = app.redirectUris[0] ?? "https://partner.example.com/api/auth/qentrah/callback";
  const scopes = [
    "organization:read",
    "client:read",
    "client:create",
    "client:update",
    "client:delete",
    "property:read",
    "property:create",
    "property:update",
    "property:delete",
    "project:read",
    "project:create",
    "project:update",
    "project:delete",
    "task:read",
    "task:create",
    "task:update",
    "task:delete",
    "calendar:read",
    "calendar:create",
    "calendar:update",
    "calendar:delete",
    "media:read",
    "media:create",
    "media:update",
    "media:delete",
  ].join(" ");
  return `/sandbox/oauth/authorize?client_id=${encodeURIComponent(app.clientId)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&code_challenge=<pkce-s256-challenge>&code_challenge_method=S256&state=<state>`;
}

export function AppDetailsTabs({
  app,
  sandbox,
  ensureSandboxAction,
}: {
  app: PartnerAppSummary;
  sandbox: SandboxInfo | null;
  ensureSandboxAction: (previousState: SandboxActionState, formData: FormData) => Promise<SandboxActionState>;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("configuration");
  const [language, setLanguage] = useState<LanguageId>("typescript");
  const selectedCode = useMemo(() => codeFor(app, language), [app, language]);
  const reviewItems = [
    {
      label: "Callback URL",
      ready: app.redirectUris.length > 0,
      detail: app.redirectUris[0] ?? "Add a redirect URI before review.",
      owner: "Backend route",
    },
    {
      label: "Scope set",
      ready: app.allowedScopes.length > 0,
      detail: `${app.allowedScopes.length} requested scope${app.allowedScopes.length === 1 ? "" : "s"}`,
      owner: "Admin consent",
    },
    {
      label: "Partner URL",
      ready: Boolean(app.homepageUrl),
      detail: app.homepageUrl ?? "Add the product URL users will visit.",
      owner: "Review profile",
    },
  ];
  const readyCount = reviewItems.filter((item) => item.ready).length;

  return (
    <section className="command-panel">
      <div className="flex gap-1 overflow-x-auto border-b border-border p-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-[6px] px-3 text-sm font-semibold transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-5 md:p-6">
        {activeTab === "configuration" ? (
          <div className="max-w-4xl">
            <SectionHeader eyebrow="Configuration" title="App profile and runtime shape" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoBlock label="App name" value={app.name} />
              <InfoBlock label="Publisher" value={app.publisherName} />
              <InfoBlock label="Partner URL" value={app.homepageUrl ?? "Not set"} />
              <InfoBlock label="Icon URL" value={app.iconUrl ?? app.logoUrl ?? "Not set"} />
              <InfoBlock label="Client type" value={app.clientType === "public" ? "Public PKCE" : "Confidential"} />
              <InfoBlock label="Authorization lifetime" value={`${app.authorizationExpiresAfterDays} days`} />
            </div>
          </div>
        ) : null}

        {activeTab === "review" ? (
          <div className="max-w-3xl">
            <SectionHeader eyebrow="Review" title={readyCount === reviewItems.length ? "Ready for review handoff" : "Finish setup before review"} />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {readyCount}/{reviewItems.length} review gates are ready.
            </p>
            <div className="mt-5 space-y-3">
              {reviewItems.map((item) => (
                <ReadinessRow key={item.label} item={item} />
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "oauth" ? (
          <div className="max-w-4xl">
            <SectionHeader eyebrow="OAuth" title="Authorization identifiers and redirect route" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoBlock label="Client ID" value={app.clientId} />
              <InfoBlock label="Primary redirect URI" value={app.redirectUris[0] ?? "Not set"} />
              <InfoBlock label="OAuth runtime" value={app.workspaceSyncStatus ?? "not_synced"} />
              <InfoBlock label="Runtime app ID" value={app.workspacePartnerAppId ?? app.id} />
              <InfoBlock label="OAuth runtime client ID" value={app.workspaceOauthClientId ?? "Not synced"} wide />
            </div>
          </div>
        ) : null}

        {activeTab === "scopes" ? (
          <div className="max-w-4xl">
            <SectionHeader eyebrow="Scopes" title="Requested access surface" />
            <ScopeMatrix scopes={app.allowedScopes} />
          </div>
        ) : null}

        {activeTab === "flow" ? (
          <FlowTab />
        ) : null}

        {activeTab === "sandbox" ? (
          <SandboxSetupTab app={app} sandbox={sandbox} ensureSandboxAction={ensureSandboxAction} />
        ) : null}

        {activeTab === "api" ? (
          <ApiExplorerTab sandbox={sandbox} />
        ) : null}

        {activeTab === "logs" ? (
          <SandboxLogsTab sandbox={sandbox} />
        ) : null}

        {activeTab === "code" ? (
          <div className="max-w-5xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionHeader eyebrow="Code" title="Implementation starter" />
              </div>
              <div className="flex rounded-[6px] border border-border bg-muted p-1">
                {languages.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLanguage(item.id)}
                    className={cn(
                      "rounded-[4px] px-3 py-1.5 text-xs font-bold transition-colors",
                      language === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <CodeEditor title={codeTitle(language)} code={selectedCode} className="mt-5" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-primary">{eyebrow}</p>
      <h3 className="mt-1 text-lg font-bold text-foreground">{title}</h3>
    </div>
  );
}

function ReadinessRow({ item }: { item: ReviewItem }) {
  return (
    <div className="grid gap-3 rounded-[6px] border border-border bg-muted p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-[999px] border",
          item.ready ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" : "border-primary/30 bg-primary/10 text-primary",
        )}
      >
        {item.ready ? <CheckCircle2 className="size-4" /> : <ListChecks className="size-4" />}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-foreground">{item.label}</p>
          <span className="rounded-[999px] border border-border bg-card px-2 py-0.5 text-[11px] font-bold text-muted-foreground">{item.owner}</span>
        </div>
        <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">{item.detail}</p>
      </div>
      <span className={cn("text-xs font-bold uppercase", item.ready ? "text-emerald-400" : "text-primary")}>{item.ready ? "Ready" : "Open"}</span>
    </div>
  );
}

function ScopeMatrix({ scopes }: { scopes: string[] }) {
  const grouped = scopes.reduce<Record<string, string[]>>((groups, scope) => {
    const [resource = "other", action = "access"] = scope.split(":");
    groups[resource] = [...(groups[resource] ?? []), action];
    return groups;
  }, {});
  const entries = Object.entries(grouped);

  return (
    <div className="mt-4">
      {entries.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {entries.map(([resource, actions]) => (
            <div key={resource} className="rounded-[6px] border border-border bg-muted p-3">
              <div className="flex items-center gap-2">
                <ServerCog className="size-4 text-primary" />
                <p className="text-sm font-bold capitalize text-foreground">{resource}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {actions.map((action) => (
                  <span key={`${resource}-${action}`} className="rounded-[999px] border border-border bg-card px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                    {action}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-[6px] border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">No scopes requested yet.</p>
      )}
    </div>
  );
}

function FlowTab() {
  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <SectionHeader eyebrow="Flow" title="OAuth 2.1 authorization lifecycle" />
        <a
          href={authorizationLifecycleDocsPath}
          className="inline-flex h-9 w-fit items-center gap-2 rounded-[6px] border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Lifecycle docs
          <ExternalLink className="size-4" />
        </a>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        One map for the partner frontend, partner backend, Workspace OAuth, resource server, shared packages, sandbox, and MCP tools.
      </p>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <ol className="command-strip divide-y divide-border overflow-hidden">
          {authorizationLifecyclePhases.map((phase, index) => (
            <li key={phase.id} className="grid gap-3 p-4 sm:grid-cols-[3rem_minmax(0,1fr)]">
              <span className="flex size-9 items-center justify-center rounded-[999px] border border-primary/30 bg-primary/10 font-mono text-xs font-bold text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{phase.title}</p>
                  <span className="rounded-[999px] border border-border bg-card px-2 py-0.5 text-[11px] font-bold uppercase text-muted-foreground">
                    {phase.layer.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{phase.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {phase.evidence.map((item) => (
                    <span key={`${phase.id}-${item}`} className="rounded-[999px] border border-border bg-card px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <aside className="command-strip self-start p-4">
          <p className="text-xs font-bold uppercase text-primary">Runtime evidence</p>
          <div className="mt-4 space-y-3">
            <InfoBlock label="OAuth profile" value="Authorization code + PKCE S256" />
            <InfoBlock label="Token location" value="Partner backend only" />
            <InfoBlock label="Sandbox evidence" value="OAuth, CRUD, request logs" />
            <InfoBlock label="MCP evidence" value="partner_authorization_flow" />
          </div>
        </aside>
      </div>

      <div className="mt-5 command-panel overflow-hidden">
        <div className="border-b border-border p-4">
          <p className="text-sm font-bold text-foreground">Direct implementation files</p>
          <p className="mt-1 text-sm text-muted-foreground">The docs page carries the full inventory; this tab keeps the primary path visible in the app.</p>
        </div>
        <div className="divide-y divide-border">
          {authorizationLifecycleFiles.slice(0, 10).map((file) => (
            <div key={file.path} className="grid gap-2 p-4 text-sm lg:grid-cols-[11rem_minmax(0,1fr)]">
              <span className="font-bold text-foreground">{file.phase}</span>
              <div className="min-w-0">
                <p className="leading-6 text-muted-foreground">{file.purpose}</p>
                <p className="mt-1 break-all font-mono text-xs text-primary">{file.path}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SandboxSetupTab({
  app,
  sandbox,
  ensureSandboxAction,
}: {
  app: PartnerAppSummary;
  sandbox: SandboxInfo | null;
  ensureSandboxAction: (previousState: SandboxActionState, formData: FormData) => Promise<SandboxActionState>;
}) {
  const [sandboxState, createSandboxAction, createSandboxPending] = useActionState(ensureSandboxAction, { ok: false });
  const organizationId = sandbox?.organization?.organizationId;

  return (
    <div className="max-w-4xl">
      <SectionHeader eyebrow="Sandbox" title="Sandbox configuration" />
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        Sandbox calls stay inside the Partners backend. They do not create Workspace registrations, workspace connections, or production data.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InfoBlock label="Sandbox status" value={organizationId ? "Created" : "Not created"} />
        <InfoBlock label="App review mode" value={app.status === "active" ? "Active" : "Draft sandbox"} />
        <InfoBlock label="Sandbox organization" value={organizationId ?? "Create sandbox to generate one"} />
        <InfoBlock label="Sandbox base URL" value="/api/v1/partner" />
      </div>
      {!organizationId ? (
        <form action={createSandboxAction} className="mt-5">
          <input type="hidden" name="appId" value={app.id} />
          <button
            className="inline-flex h-10 items-center rounded-[6px] bg-primary px-4 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            disabled={createSandboxPending}
            type="submit"
          >
            {createSandboxPending ? "Creating..." : "Create sandbox"}
          </button>
          {sandboxState.message ? (
            <p className={cn("mt-3 text-sm", sandboxState.ok ? "text-emerald-400" : "text-red-400")}>{sandboxState.message}</p>
          ) : null}
        </form>
      ) : null}
      <CodeEditor
        title="sandbox-oauth.txt"
        compact
        className="mt-5"
        code={`GET ${sandboxAuthorizeUrl(app)}

POST /sandbox/oauth/token
grant_type=authorization_code
client_id=${app.clientId}
redirect_uri=${app.redirectUris[0] ?? "https://partner.example.com/api/auth/qentrah/callback"}
code=<code>
code_verifier=<pkce-verifier>`}
      />
    </div>
  );
}

function ApiExplorerTab({ sandbox }: { sandbox: SandboxInfo | null }) {
  const [resource, setResource] = useState("clients");
  const [method, setMethod] = useState("GET");
  const [resourceId, setResourceId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [body, setBody] = useState('{\n  "name": "Sandbox Buyer"\n}');
  const [response, setResponse] = useState<string>("Run a sandbox request to see the response.");
  const organizationId = sandbox?.organization?.organizationId;
  const basePath = organizationId ? `/api/v1/partner/organizations/${organizationId}` : "/api/v1/partner/organizations/<sandbox_org>";
  const path = resource === "me"
    ? `${basePath}/me`
    : `${basePath}/${resource}${resourceId.trim() ? `/${resourceId.trim()}` : ""}`;

  async function runRequest() {
    try {
      const init: RequestInit = {
        method,
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
      };
      if (!["GET", "DELETE"].includes(method)) init.body = body;
      const result = await fetch(path, init);
      const text = await result.text();
      setResponse(`${result.status} ${result.statusText}\n${text}`);
    } catch (error) {
      setResponse(error instanceof Error ? error.message : "Sandbox request failed.");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="command-strip p-5">
        <SectionHeader eyebrow="API explorer" title="Run one sandbox request" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-bold text-foreground">
            Method
            <select value={method} onChange={(event) => setMethod(event.target.value)} className="h-10 rounded-[6px] border border-input bg-card px-3 text-sm">
              {["GET", "POST", "PATCH", "DELETE"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-bold text-foreground">
            Resource
            <select value={resource} onChange={(event) => setResource(event.target.value)} className="h-10 rounded-[6px] border border-input bg-card px-3 text-sm">
              {["me", "clients", "properties", "projects", "tasks", "calendar", "media"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <label className="mt-3 grid gap-1 text-xs font-bold text-foreground">
          Resource ID
          <input value={resourceId} onChange={(event) => setResourceId(event.target.value)} placeholder="Only for read/update/delete by id" className="h-10 rounded-[6px] border border-input bg-card px-3 text-sm" />
        </label>
        <label className="mt-3 grid gap-1 text-xs font-bold text-foreground">
          Access token
          <input value={accessToken} onChange={(event) => setAccessToken(event.target.value)} placeholder="sandbox_access_..." className="h-10 rounded-[6px] border border-input bg-card px-3 text-sm" />
        </label>
        <label className="mt-3 grid gap-1 text-xs font-bold text-foreground">
          JSON body
          <textarea value={body} onChange={(event) => setBody(event.target.value)} className="min-h-28 rounded-[6px] border border-input bg-card p-3 font-mono text-xs" />
        </label>
        <p className="mt-3 break-all rounded-[6px] border border-border bg-card p-3 font-mono text-xs text-muted-foreground">{path}</p>
        <button type="button" onClick={runRequest} disabled={!organizationId || !accessToken.trim()} className="mt-4 inline-flex h-10 items-center rounded-[6px] bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50">
          Run request
        </button>
      </div>

      <CodeEditor title="response.json" code={response} compact />
    </div>
  );
}

function SandboxLogsTab({ sandbox }: { sandbox: SandboxInfo | null }) {
  const recentLogs = ((sandbox?.logs ?? []) as SandboxLog[]).slice(0, 12);

  return (
    <div className="max-w-5xl">
      <SectionHeader eyebrow="Logs" title="Recent sandbox requests" />
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        Each row shows the sandbox request shape, access scopes, result, and compact request/response evidence for debugging the full authorization cycle.
      </p>
      <div className="mt-5 command-panel overflow-hidden">
        <div className="max-h-[520px] overflow-auto divide-y divide-border">
          {recentLogs.length ? recentLogs.map((log) => (
            <div key={log.id ?? `${log.createdAt}-${log.path}`} className="grid gap-3 p-4 text-xs">
              <div className="flex flex-wrap items-center gap-2 font-bold text-foreground">
                <span className="rounded-[6px] border border-border bg-muted px-2 py-1 font-mono">{log.method}</span>
                <span className={cn("rounded-[999px] px-2 py-0.5", log.status < 400 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>{log.status}</span>
                <span className="text-muted-foreground">{log.latencyMs ?? 0}ms</span>
                <span className="text-muted-foreground">{formatLogTime(log.createdAt)}</span>
              </div>
              <p className="break-all font-mono text-muted-foreground">{log.path}</p>
              {log.scopes?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {log.scopes.slice(0, 10).map((scope) => (
                    <span key={`${log.id ?? log.createdAt}-${scope}`} className="rounded-[999px] border border-border bg-card px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                      {scope}
                    </span>
                  ))}
                  {log.scopes.length > 10 ? (
                    <span className="rounded-[999px] border border-border bg-card px-2 py-0.5 text-[11px] font-bold text-muted-foreground">+{log.scopes.length - 10}</span>
                  ) : null}
                </div>
              ) : null}
              <div className="grid gap-2 md:grid-cols-2">
                <LogPayloadDetails label="Request input" value={log.input} />
                <LogPayloadDetails label="Response summary" value={log.response} />
              </div>
              {log.error ? <p className="rounded-[6px] border border-red-500/25 bg-red-500/10 p-3 text-red-300">{log.error}</p> : null}
            </div>
          )) : (
            <div className="p-5">
              <p className="text-sm font-semibold text-foreground">No sandbox requests yet.</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Create a sandbox, complete the sandbox OAuth flow, then run a request from API explorer. Logs will show method, path, status, latency, scopes, request input, response summary, and errors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LogPayloadDetails({ label, value }: { label: string; value: unknown }) {
  const summary = summarizePayload(value);
  const pretty = prettyPayload(value);

  return (
    <details className="rounded-[6px] border border-border bg-muted p-3">
      <summary className="cursor-pointer list-none text-[11px] font-bold uppercase text-muted-foreground">
        {label}: <span className="normal-case text-foreground">{summary}</span>
      </summary>
      <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-[6px] border border-border bg-card p-3 font-mono text-[11px] leading-5 text-muted-foreground">
        {pretty}
      </pre>
    </details>
  );
}

function summarizePayload(value: unknown) {
  const safeValue = redactPayload(value);
  if (safeValue === undefined || safeValue === null) return "empty";
  if (Array.isArray(safeValue)) return `${safeValue.length} item${safeValue.length === 1 ? "" : "s"}`;
  if (typeof safeValue === "object") {
    const keys = Object.keys(safeValue as Record<string, unknown>).filter((key) => !/secret|token|authorization|password/i.test(key));
    return keys.length ? keys.slice(0, 4).join(", ") : "object";
  }
  const text = String(safeValue);
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

function prettyPayload(value: unknown) {
  const safeValue = redactPayload(value);
  if (safeValue === undefined || safeValue === null) return "No JSON body captured.";
  try {
    const text = JSON.stringify(safeValue, null, 2);
    return text.length > 1600 ? `${text.slice(0, 1600)}\n... truncated` : text;
  } catch {
    return String(safeValue);
  }
}

function redactPayload(value: unknown): unknown {
  if (value === undefined || value === null) return value;
  if (typeof value === "string") {
    return value
      .replace(/mcp_secret_[A-Za-z0-9._-]+/g, "[redacted]")
      .replace(/sandbox_(access|refresh)_[A-Za-z0-9._-]+/g, "[redacted]")
      .replace(/partners_secret_[A-Za-z0-9._-]+/g, "[redacted]");
  }
  if (Array.isArray(value)) return value.map(redactPayload);
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      /secret|token|authorization|password/i.test(key) ? "[redacted]" : redactPayload(entry),
    ]));
  }
  return value;
}

function formatLogTime(value: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function CodeEditor({
  title,
  code,
  compact,
  className,
}: {
  title: string;
  code: string;
  compact?: boolean;
  className?: string;
}) {
  const lines = code.trim().split("\n");

  return (
    <div className={cn("code-zone-shadow min-w-0 self-start overflow-hidden border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#ffbd2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs font-semibold text-[#B1BCC7]">{title}</span>
      </div>
      <div className={cn("overflow-auto p-5 font-mono text-xs leading-6", compact ? "max-h-[360px]" : "")}>
        {lines.map((line, index) => (
          <div key={`${index}-${line}`} className="grid min-w-max grid-cols-[2.5rem_minmax(0,1fr)] gap-4">
            <span className="select-none text-right text-[#62748F]">{index + 1}</span>
            <code className="whitespace-pre text-slate-200" dangerouslySetInnerHTML={{ __html: highlightCodeLine(line) }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function highlightCodeLine(line: string) {
  const escaped = line
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  return escaped
    .replace(/("[^"]*")/g, '<span class="text-[#A5D6FF]">$1</span>')
    .replace(/\b(type|const|return|new|process|Response)\b/g, '<span class="text-[#FF7B72]">$1</span>')
    .replace(/\b(string|string\[\]|URL|QentrahOAuthConfig)\b/g, '<span class="text-[#D2A8FF]">$1</span>')
    .replace(/\b(searchParams|set|join|redirect)\b/g, '<span class="text-[#79C0FF]">$1</span>')
    .replace(/(&lt;[^&]*&gt;)/g, '<span class="text-[#7EE787]">$1</span>');
}

function InfoBlock({
  label,
  value,
  wide,
}: {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn("rounded-[6px] border border-border bg-muted p-4", wide ? "lg:col-span-2" : "")}>
      <p className="text-[11px] font-bold uppercase text-muted-foreground">{label}</p>
      <div className="mt-2 break-words text-sm font-semibold leading-6 text-foreground">{value}</div>
    </div>
  );
}
