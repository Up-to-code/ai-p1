"use client";

import {
  Braces,
  Bug,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  KeyRound,
  LayoutList,
  LockKeyhole,
  Route,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { cn } from "@/lib/utils";
import type { SandboxActionState } from "@/app/(portal)/dashboard/actions";
import type { PartnerAppSummary } from "@/server/partnerApps";
import type { SandboxInfo } from "@/server/sandbox";

type TabId = "overview" | "authorization" | "sandbox" | "code";
type LanguageId = "typescript" | "javascript" | "curl";
type SandboxLog = {
  createdAt: number;
  error?: string | null;
  latencyMs: number;
  method: string;
  path: string;
  status: number;
};

const tabs: Array<{ id: TabId; label: string; icon: typeof LayoutList }> = [
  { id: "overview", label: "Overview", icon: LayoutList },
  { id: "authorization", label: "Authorization", icon: KeyRound },
  { id: "sandbox", label: "Sandbox", icon: Bug },
  { id: "code", label: "Code", icon: Code2 },
];

const languages: Array<{ id: LanguageId; label: string }> = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "curl", label: "cURL" },
];

const architecture = [
  {
    title: "Partner product",
    description: "Starts consent from your own app with a PKCE challenge.",
    icon: Braces,
  },
  {
    title: "Qentrah authorization",
    description: "Workspace admins review scopes and approve access.",
    icon: KeyRound,
  },
  {
    title: "Workspace API access",
    description: "Your backend calls reviewed organization APIs.",
    icon: Database,
  },
];

function oauthAuthorizeUrl(app: PartnerAppSummary) {
  const redirectUri = app.redirectUris[0] ?? "https://partner.example.com/api/auth/anan/callback";
  return `GET /oauth/authorize
  ?client_id=${app.clientId}
  &response_type=code
  &redirect_uri=${encodeURIComponent(redirectUri)}
  &scope=${encodeURIComponent(app.allowedScopes.join(" "))}
  &code_challenge=<pkce-challenge>
  &code_challenge_method=S256`;
}

function codeFor(app: PartnerAppSummary, language: LanguageId) {
  const redirectUri = app.redirectUris[0] ?? "https://partner.example.com/api/auth/anan/callback";
  const scopes = app.allowedScopes.join(" ");

  if (language === "typescript") {
    return `type QentrahOAuthConfig = {
  clientId: string;
  redirectUri: string;
  scopes: string[];
};

const config: QentrahOAuthConfig = {
  clientId: "${app.clientId}",
  redirectUri: "${redirectUri}",
  scopes: ${JSON.stringify(app.allowedScopes, null, 2)},
};

const authorizeUrl = new URL("/oauth/authorize", process.env.QENTRAH_WORKSPACE_API_URL);
authorizeUrl.searchParams.set("client_id", config.clientId);
authorizeUrl.searchParams.set("response_type", "code");
authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
authorizeUrl.searchParams.set("scope", config.scopes.join(" "));
authorizeUrl.searchParams.set("code_challenge", pkce.challenge);
authorizeUrl.searchParams.set("code_challenge_method", "S256");`;
  }

  if (language === "javascript") {
    return `const authorizeUrl = new URL("/oauth/authorize", process.env.QENTRAH_WORKSPACE_API_URL);

authorizeUrl.searchParams.set("client_id", "${app.clientId}");
authorizeUrl.searchParams.set("response_type", "code");
authorizeUrl.searchParams.set("redirect_uri", "${redirectUri}");
authorizeUrl.searchParams.set("scope", "${scopes}");
authorizeUrl.searchParams.set("code_challenge", pkce.challenge);
authorizeUrl.searchParams.set("code_challenge_method", "S256");

return Response.redirect(authorizeUrl);`;
  }

  return `curl "https://workspace.qentrah.example/oauth/authorize?client_id=${app.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&code_challenge=<pkce-challenge>&code_challenge_method=S256"`;
}

function codeTitle(language: LanguageId) {
  if (language === "typescript") return "authorize-with-qentrah.ts";
  if (language === "javascript") return "authorize-with-qentrah.js";
  return "authorize-with-qentrah.sh";
}

function sandboxAuthorizeUrl(app: PartnerAppSummary) {
  const redirectUri = app.redirectUris[0] ?? "https://partner.example.com/api/auth/anan/callback";
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
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [language, setLanguage] = useState<LanguageId>("typescript");
  const selectedCode = useMemo(() => codeFor(app, language), [app, language]);
  const reviewItems = [
    {
      label: "Callback URL",
      ready: app.redirectUris.length > 0,
      detail: app.redirectUris[0] ?? "Add a redirect URI before review.",
    },
    {
      label: "Scope set",
      ready: app.allowedScopes.length > 0,
      detail: `${app.allowedScopes.length} requested scope${app.allowedScopes.length === 1 ? "" : "s"}`,
    },
    {
      label: "Partner URL",
      ready: Boolean(app.homepageUrl),
      detail: app.homepageUrl ?? "Add the product URL users will visit.",
    },
  ];

  return (
    <section className="rounded-[15px] border border-border bg-card">
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
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-[7px] px-3 text-sm font-semibold transition-colors",
                active ? "bg-[#071A34] text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-5 md:p-6">
        {activeTab === "overview" ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="min-w-0 space-y-5">
              <div className="rounded-[15px] border border-border bg-background p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-primary">Project readiness</p>
                    <h2 className="mt-2 text-2xl font-bold text-foreground">Review the integration shape before submission.</h2>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  This app will appear to workspace admins as a reviewed partner integration. Keep the setup narrow, explain the data use, and move token handling to your backend.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <InfoBlock label="Client type" value={app.clientType === "public" ? "Public PKCE" : "Confidential"} />
                  <InfoBlock label="Lifetime" value={`${app.authorizationExpiresAfterDays} days`} />
                  <InfoBlock label="Workspace sync" value={app.workspaceSyncStatus ?? "not_synced"} />
                </div>
              </div>

              <div className="rounded-[15px] border border-border bg-card">
                <div className="border-b border-border px-5 py-4">
                  <p className="text-xs font-bold uppercase text-primary">Review checklist</p>
                </div>
                <div className="divide-y divide-border">
                  {reviewItems.map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-5">
                      <span
                        className={cn(
                          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
                          item.ready ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-amber-200 bg-amber-50 text-amber-700",
                        )}
                      >
                        <CheckCircle2 className="size-3.5" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.label}</p>
                        <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-w-0 space-y-5">
              <CodeEditor title="project-bootstrap.ts" code={codeFor(app, "typescript")} compact />
              <div className="grid gap-3 sm:grid-cols-2">
                <ComponentCard
                  icon={KeyRound}
                  title="Authorization button"
                  description="Use the same call to action wherever users connect a Qentrah organization."
                  value="Authorize with Qentrah"
                />
                <ComponentCard
                  icon={ShieldCheck}
                  title="Scoped consent"
                  description="Workspace admins approve this exact scope list before your app can call Workspace APIs."
                  value={`${app.allowedScopes.length} scopes`}
                />
                <ComponentCard
                  icon={Route}
                  title="Callback route"
                  description="Receive the authorization code, verify state, then exchange tokens on the server."
                  value={app.redirectUris[0] ? "Callback configured" : "Needs callback"}
                />
                <ComponentCard
                  icon={LockKeyhole}
                  title="Token vault"
                  description="Keep refresh tokens out of the browser and rotate access from your backend."
                  value="Server-side only"
                />
              </div>
              <div className="rounded-[15px] border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase text-primary">Integration architecture</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  {architecture.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-[11px] border border-border bg-card p-4">
                        <Icon className="size-5 text-primary" />
                        <p className="mt-4 text-sm font-bold text-foreground">{item.title}</p>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "authorization" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <div>
              <h2 className="text-xl font-bold text-foreground">Authorization values</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use these values in your app’s Qentrah authorization button and callback handler.
              </p>
              <div className="mt-5 space-y-3">
                <InfoBlock label="Client ID" value={app.clientId} />
                <InfoBlock label="Primary redirect URI" value={app.redirectUris[0] ?? "Not set"} />
                <InfoBlock label="Scopes" value={app.allowedScopes.join(", ")} />
              </div>
              <a
                href="/docs/oauth-flow"
                className="mt-5 inline-flex items-center gap-2 rounded-[7px] border border-border px-3 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"
              >
                Read OAuth flow
                <ExternalLink className="size-4" />
              </a>
            </div>
            <CodeEditor title="GET /oauth/authorize" code={oauthAuthorizeUrl(app)} compact />
          </div>
        ) : null}

        {activeTab === "sandbox" ? (
          <SandboxPanel app={app} sandbox={sandbox} ensureSandboxAction={ensureSandboxAction} />
        ) : null}

        {activeTab === "code" ? (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Implementation starter</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Pick the closest shape for your backend. Keep token exchange and refresh on your server.
                </p>
              </div>
              <div className="flex rounded-[7px] border border-border bg-background p-1">
                {languages.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLanguage(item.id)}
                    className={cn(
                      "rounded-[4px] px-3 py-1.5 text-xs font-bold transition-colors",
                      language === item.id ? "bg-white text-foreground shadow-sm dark:bg-card" : "text-muted-foreground hover:text-foreground",
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

function ComponentCard({
  icon: Icon,
  title,
  description,
  value,
}: {
  icon: typeof Workflow;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="rounded-[15px] border border-border bg-background p-4">
      <Icon className="size-5 text-primary" />
      <p className="mt-4 text-sm font-bold text-foreground">{title}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
      <p className="mt-4 rounded-[7px] border border-border bg-white px-3 py-2 text-xs font-bold text-foreground dark:bg-card">{value}</p>
    </div>
  );
}

function SandboxPanel({
  app,
  sandbox,
  ensureSandboxAction,
}: {
  app: PartnerAppSummary;
  sandbox: SandboxInfo | null;
  ensureSandboxAction: (previousState: SandboxActionState, formData: FormData) => Promise<SandboxActionState>;
}) {
  const [resource, setResource] = useState("clients");
  const [method, setMethod] = useState("GET");
  const [resourceId, setResourceId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [body, setBody] = useState('{\n  "name": "Sandbox Buyer"\n}');
  const [response, setResponse] = useState<string>("Run a sandbox request to see the response.");
  const [sandboxState, createSandboxAction, createSandboxPending] = useActionState(ensureSandboxAction, { ok: false });
  const organizationId = sandbox?.organization?.organizationId;
  const recentLogs = ((sandbox?.logs ?? []) as SandboxLog[]).slice(0, 12);
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
      <div className="space-y-5">
        <div className="rounded-[15px] border border-border bg-background p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-primary">Sandbox mode</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">Test full CRUD in Partners before approval.</h2>
            </div>
            <StatusBadge status={app.status === "active" ? "active" : "draft"} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Sandbox calls stay inside the Partners backend. They do not create Workspace registrations, workspace connections, or production data.
          </p>
          {organizationId ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoBlock label="Sandbox organization" value={organizationId} />
              <InfoBlock label="Sandbox base URL" value="/api/v1/partner" />
            </div>
          ) : (
            <form action={createSandboxAction} className="mt-5">
              <input type="hidden" name="appId" value={app.id} />
              <button
                className="inline-flex h-10 items-center rounded-[7px] bg-primary px-4 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                disabled={createSandboxPending}
                type="submit"
              >
                {createSandboxPending ? "Creating..." : "Create sandbox"}
              </button>
              {sandboxState.message ? (
                <p className={cn("mt-3 text-sm", sandboxState.ok ? "text-emerald-600" : "text-red-600")}>{sandboxState.message}</p>
              ) : null}
            </form>
          )}
        </div>

        <CodeEditor
          title="sandbox-oauth.txt"
          compact
          code={`GET ${sandboxAuthorizeUrl(app)}

POST /sandbox/oauth/token
grant_type=authorization_code
client_id=${app.clientId}
redirect_uri=${app.redirectUris[0] ?? "https://partner.example.com/api/auth/anan/callback"}
code=<code>
code_verifier=<pkce-verifier>`}
        />

        <div className="rounded-[15px] border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <p className="text-xs font-bold uppercase text-primary">Recent debug logs</p>
          </div>
          <div className="max-h-[420px] overflow-auto divide-y divide-border">
            {recentLogs.length ? recentLogs.map((log) => (
              <div key={`${log.createdAt}-${log.path}`} className="grid gap-2 p-4 text-xs">
                <div className="flex flex-wrap items-center gap-2 font-bold text-foreground">
                  <span>{log.method}</span>
                  <span className={cn("rounded-full px-2 py-0.5", log.status < 400 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{log.status}</span>
                  <span className="text-muted-foreground">{log.latencyMs}ms</span>
                </div>
                <p className="break-all font-mono text-muted-foreground">{log.path}</p>
                {log.error ? <p className="text-red-700">{log.error}</p> : null}
              </div>
            )) : (
              <p className="p-5 text-sm text-muted-foreground">No sandbox requests yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-[15px] border border-border bg-background p-5">
          <p className="text-xs font-bold uppercase text-primary">API explorer</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-bold text-foreground">
              Method
              <select value={method} onChange={(event) => setMethod(event.target.value)} className="h-10 rounded-[7px] border border-border bg-white px-3 text-sm dark:bg-card">
                {["GET", "POST", "PATCH", "DELETE"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-foreground">
              Resource
              <select value={resource} onChange={(event) => setResource(event.target.value)} className="h-10 rounded-[7px] border border-border bg-white px-3 text-sm dark:bg-card">
                {["me", "clients", "properties", "projects", "tasks", "calendar", "media"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <label className="mt-3 grid gap-1 text-xs font-bold text-foreground">
            Resource ID
            <input value={resourceId} onChange={(event) => setResourceId(event.target.value)} placeholder="Only for read/update/delete by id" className="h-10 rounded-[7px] border border-border bg-white px-3 text-sm dark:bg-card" />
          </label>
          <label className="mt-3 grid gap-1 text-xs font-bold text-foreground">
            Access token
            <input value={accessToken} onChange={(event) => setAccessToken(event.target.value)} placeholder="sandbox_access_..." className="h-10 rounded-[7px] border border-border bg-white px-3 text-sm dark:bg-card" />
          </label>
          <label className="mt-3 grid gap-1 text-xs font-bold text-foreground">
            JSON body
            <textarea value={body} onChange={(event) => setBody(event.target.value)} className="min-h-28 rounded-[7px] border border-border bg-white p-3 font-mono text-xs dark:bg-card" />
          </label>
          <p className="mt-3 break-all rounded-[7px] border border-border bg-white p-3 font-mono text-xs text-muted-foreground dark:bg-card">{path}</p>
          <button type="button" onClick={runRequest} disabled={!organizationId || !accessToken.trim()} className="mt-4 inline-flex h-10 items-center rounded-[7px] bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50">
            Run request
          </button>
        </div>

        <CodeEditor title="response.json" code={response} compact />

        <div className="rounded-[15px] border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase text-primary">Production switch</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            After approval, change only the base URL to your Workspace API URL. Real workspace data still requires workspace admin consent.
          </p>
          <div className="mt-4 grid gap-3">
            <InfoBlock label="Sandbox base" value="/api/v1/partner" />
            <InfoBlock label="Production base" value="https://workspace.qentrah.example/api/v1/partner" />
          </div>
        </div>
      </div>
    </div>
  );
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
    <div className={cn("min-w-0 self-start overflow-hidden rounded-[15px] border border-[#132238] bg-[#071A34]", className)}>
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
    <div className={cn("rounded-[7px] border border-border bg-background p-4", wide ? "lg:col-span-2" : "")}>
      <p className="text-[11px] font-bold uppercase text-muted-foreground">{label}</p>
      <div className="mt-2 break-words text-sm font-semibold leading-6 text-foreground">{value}</div>
    </div>
  );
}
