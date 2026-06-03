"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import {
  demoSections,
  findDemoSection,
  missingScopes,
  sanitizeCredentialPayload,
  sectionCanRun,
  summarizePayload,
  type DemoOperationResult,
  type DemoSectionDataState,
  type DemoSectionId,
} from "@/lib/demo-sections";
import { demoBrandConfig } from "@/lib/config";
import {
  buildQentrahPartnerResourceSearchParams,
  createQentrahPartnerConsoleService,
  qentrahPartnerFilterPlaceholder,
  qentrahPartnerRenderRows,
  qentrahPartnerResponseMessage,
} from "@qentrah/auth-sdk/partner/harness";

type RuntimeSnapshot = {
  connected: boolean;
  organizationId?: string;
  expiresAt?: string;
  workspaceBaseUrl: string;
  partnerAppUrl: string;
  resourceAudience: string;
  requestedScopes: string[];
  grantedScopes: string[];
};

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { text };
  }
}

function isAuthorizationExpiredPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return false;
  const error = "error" in payload ? String(payload.error) : "";
  return error === "token_expired" || error === "missing_bearer";
}

function reconnectMessage(payload: unknown) {
  if (payload && typeof payload === "object" && "message" in payload && payload.message) {
    return String(payload.message);
  }
  return "Authorize again to load Workspace data.";
}

export function ResourceConsole({ runtime }: { runtime: RuntimeSnapshot }) {
  const router = useRouter();
  const [activeSectionId, setActiveSectionId] = useState<DemoSectionId>("overview");
  const [limit, setLimit] = useState(25);
  const [cursor, setCursor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [indexStart, setIndexStart] = useState("");
  const [indexEnd, setIndexEnd] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mediaResourceType, setMediaResourceType] = useState("client");
  const [mediaResourceId, setMediaResourceId] = useState("");
  const [states, setStates] = useState<Partial<Record<DemoSectionId, DemoSectionDataState>>>({});
  const [results, setResults] = useState<Partial<Record<DemoSectionId, DemoOperationResult>>>({});
  const [isPending, startTransition] = useTransition();
  const activeSection = findDemoSection(activeSectionId);
  const grantedScopes = runtime.grantedScopes.length ? runtime.grantedScopes : runtime.requestedScopes;
  const consoleService = useMemo(
    () => createQentrahPartnerConsoleService({
      workspaceBaseUrl: runtime.workspaceBaseUrl,
      partnerAppUrl: runtime.partnerAppUrl,
      redirectUri: `${runtime.partnerAppUrl}${demoBrandConfig.authCallbackPath}`,
      requestedScopes: runtime.requestedScopes,
      grantedScopes,
    }),
    [grantedScopes, runtime.partnerAppUrl, runtime.requestedScopes, runtime.workspaceBaseUrl],
  );
  const activeMissingScopes = consoleService.missingScopes(activeSection.id);
  const activeState = states[activeSection.id];
  const latestResults = Object.values(results).filter(Boolean) as DemoOperationResult[];

  const needsReauthorization = useMemo(
    () => runtime.connected && consoleService.needsReauthorization(),
    [consoleService, runtime.connected],
  );

  function captureResult(sectionId: DemoSectionId, operation: DemoOperationResult["operation"], method: string, path: string, status: number, response: unknown, requestSummary: string) {
    const result = consoleService.result({ sectionId, operation, method, path, status, response, requestSummary }) as DemoOperationResult;
    setResults((current) => ({ ...current, [sectionId]: result }));
    return result;
  }

  function loadSection(sectionId = activeSection.id) {
    const section = findDemoSection(sectionId);
    if (!section.endpoint || !sectionCanRun(section, grantedScopes)) return;
    startTransition(async () => {
      setStates((current) => ({ ...current, [section.id]: { data: current[section.id]?.data, loadedAt: Date.now(), limit, status: "loading" } }));
      const params = buildQentrahPartnerResourceSearchParams(section.id, {
        limit: section.paginated ? limit : undefined,
        cursor,
        search: searchQuery,
        type: typeFilter,
        indexStart,
        indexEnd,
        startDate,
        endDate,
        resourceType: mediaResourceType,
        resourceId: mediaResourceId,
      });
      const path = `${section.endpoint}${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(path);
      const payload = await readJson(response);
      if (!response.ok && isAuthorizationExpiredPayload(payload)) {
        setResults((current) => {
          const next = { ...current };
          delete next[section.id];
          return next;
        });
        setStates((current) => ({
          ...current,
          [section.id]: {
            data: undefined,
            loadedAt: Date.now(),
            limit,
            status: "error",
            error: reconnectMessage(payload),
          },
        }));
        router.refresh();
        return;
      }
      captureResult(section.id, "read", "GET", path, response.status, payload, `limit=${limit}`);
      setStates((current) => ({
        ...current,
        [section.id]: {
          data: response.ok ? payload : undefined,
          loadedAt: Date.now(),
          limit,
          status: response.ok ? "loaded" : "error",
          error: response.ok ? undefined : qentrahPartnerResponseMessage(payload),
        },
      }));
    });
  }

  async function submitClientOperation(formData: FormData, operation: "create" | "update" | "delete") {
    const clientId = String(formData.get("clientId") ?? "").trim();
    const body = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      generation: String(formData.get("generation") ?? "").trim(),
      source: "qentrah-partner-demo",
    };
    const path = operation === "create" ? "/api/qentrah/clients" : `/api/qentrah/clients/${encodeURIComponent(clientId)}`;
    const init: RequestInit = operation === "delete"
      ? { method: "DELETE" }
      : {
          method: operation === "create" ? "POST" : "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        };
    startTransition(async () => {
      const response = await fetch(path, init);
      const payload = await readJson(response);
      if (!response.ok && isAuthorizationExpiredPayload(payload)) {
        setResults((current) => {
          const next = { ...current };
          delete next.clients;
          return next;
        });
        setStates((current) => ({
          ...current,
          clients: {
            data: undefined,
            loadedAt: Date.now(),
            limit,
            status: "error",
            error: reconnectMessage(payload),
          },
        }));
        router.refresh();
        return;
      }
      captureResult("clients", operation, init.method ?? "GET", path, response.status, payload, operation === "delete" ? `clientId=${clientId}` : summarizePayload(body));
      if (response.ok) loadSection("clients");
    });
  }

  async function submitWebhookOperation(formData: FormData, operation: "create" | "update" | "delete") {
    const clientId = String(formData.get("clientId") ?? "").trim() || `client_${operation}_${Date.now()}`;
    const eventType = `client.${operation === "create" ? "created" : operation === "update" ? "updated" : "deleted"}`;
    const data = {
      id: clientId,
      name: String(formData.get("name") ?? "").trim() || undefined,
      email: String(formData.get("email") ?? "").trim() || undefined,
      source: "qentrah-partner-demo",
    };
    const body = {
      eventType,
      eventId: String(formData.get("eventId") ?? "").trim() || `evt_${operation}_${Date.now()}`,
      idempotencyKey: String(formData.get("idempotencyKey") ?? "").trim() || undefined,
      data,
    };
    startTransition(async () => {
      const response = await fetch("/api/qentrah/webhooks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await readJson(response);
      if (!response.ok && isAuthorizationExpiredPayload(payload)) {
        setResults((current) => {
          const next = { ...current };
          delete next.webhooks;
          return next;
        });
        setStates((current) => ({
          ...current,
          webhooks: {
            data: undefined,
            loadedAt: Date.now(),
            limit,
            status: "error",
            error: reconnectMessage(payload),
          },
        }));
        router.refresh();
        return;
      }
      captureResult("webhooks", operation, "POST", "/api/qentrah/webhooks", response.status, payload, summarizePayload(body));
    });
  }

  return (
    <main className="resource-console">
      <aside className="console-sidebar" aria-label="Demo sections">
        <a className="brand-lockup" href="/">
          <span className="brand-mark">Q</span>
          <span>
            <strong>{demoBrandConfig.appName}</strong>
            <small>{runtime.connected ? "Workspace connected" : "Authorization pending"}</small>
          </span>
        </a>
        <nav className="console-nav">
          {demoSections.map((section) => {
            const Icon = section.icon;
            const active = section.id === activeSection.id;
            const blocked = !sectionCanRun(section, grantedScopes);
            return (
              <button key={section.id} className={`nav-item${active ? " active" : ""}`} type="button" onClick={() => setActiveSectionId(section.id)}>
                <Icon size={16} />
                <span>{section.label}</span>
                {blocked ? <em>{missingScopes(section.requiredScopes, grantedScopes).length}</em> : null}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="console-main">
        <header className="console-header">
          <select className="mobile-section-select" value={activeSection.id} onChange={(event) => setActiveSectionId(event.target.value as DemoSectionId)}>
            {demoSections.map((section) => <option key={section.id} value={section.id}>{section.label}</option>)}
          </select>
          <div>
            <p className="micro">{activeSection.label}</p>
            <h1>{activeSection.description}</h1>
          </div>
          <div className="topbar-actions">
            <a className="button secondary" href="/">Landing page</a>
            <a className="button" href={demoBrandConfig.authStartPath}>
              Authorize
              <ArrowRight size={16} />
            </a>
          </div>
        </header>

        {needsReauthorization ? (
          <div className="notice">
            This session may not include the new <strong>client:delete</strong> scope. Clear the session and authorize again before delete testing.
          </div>
        ) : null}

        {activeMissingScopes.length ? (
          <div className="notice danger">
            Missing required scope{activeMissingScopes.length === 1 ? "" : "s"}: {activeMissingScopes.join(", ")}
          </div>
        ) : null}

        {activeSection.id === "overview" ? (
          <Overview runtime={runtime} latestResults={latestResults} />
        ) : null}
        {activeSection.id === "flow" ? (
          <Flow runtime={runtime} />
        ) : null}
        {activeSection.id === "credentials" ? (
          <Credentials runtime={runtime} />
        ) : null}
        {["organization", "clients", "properties", "projects", "tasks", "calendar", "media", "webhooks"].includes(activeSection.id) ? (
          <ResourceSection
            sectionId={activeSection.id}
            state={activeState}
            limit={limit}
            setLimit={setLimit}
            cursor={cursor}
            setCursor={setCursor}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            indexStart={indexStart}
            setIndexStart={setIndexStart}
            indexEnd={indexEnd}
            setIndexEnd={setIndexEnd}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            mediaResourceType={mediaResourceType}
            setMediaResourceType={setMediaResourceType}
            mediaResourceId={mediaResourceId}
            setMediaResourceId={setMediaResourceId}
            isPending={isPending}
            isConnected={runtime.connected}
            canRun={!activeMissingScopes.length && runtime.connected}
            onLoad={() => loadSection()}
            onClientOperation={submitClientOperation}
            onWebhookOperation={submitWebhookOperation}
            result={results[activeSection.id]}
          />
        ) : null}
        {activeSection.id === "results" ? (
          <Results results={latestResults} />
        ) : null}
      </section>
    </main>
  );
}

function Overview({ runtime, latestResults }: { runtime: RuntimeSnapshot; latestResults: DemoOperationResult[] }) {
  return (
    <div className="console-grid three">
      <Metric title="Connection" value={runtime.connected ? "Connected" : "Not connected"} detail={runtime.organizationId ?? "Authorize a workspace."} />
      <Metric title="Key expiry" value={runtime.expiresAt ?? "No expiry"} detail="WorkOS partner keys are stored server-side only." />
      <Metric title="Recent tests" value={String(latestResults.length)} detail="Captured in this browser session." />
    </div>
  );
}

function Flow({ runtime }: { runtime: RuntimeSnapshot }) {
  const lifecycle = {
    phases: [
      ["Workspace grant", "A workspace member approves this partner app and its requested permission scopes."],
      ["WorkOS key issue", "Workspace creates a scoped WorkOS partner API key and binds it to the organization grant."],
      ["Server-side use", "This demo stores the key in an encrypted cookie and calls Workspace partner APIs from the server."],
    ],
    endpoints: {
      workspace: new URL("/en/integrations", runtime.workspaceBaseUrl).toString(),
      callback: `${runtime.partnerAppUrl}${demoBrandConfig.authCallbackPath}`,
      resource: new URL("/api/v1/partner", runtime.workspaceBaseUrl).toString(),
    },
  };
  return (
    <div className="panel-section">
      <div className="flow-track">
        {lifecycle.phases.map(([title, text], index) => (
          <article className="flow-card" key={title}>
            <div className="flow-card-top">
              <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
              <CheckCircle2 size={18} />
            </div>
            <strong>{title}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="auth-endpoints">
        <Endpoint label="Workspace grant" value={lifecycle.endpoints.workspace} />
        <Endpoint label="Callback" value={lifecycle.endpoints.callback} />
        <Endpoint label="Resource" value={lifecycle.endpoints.resource} />
      </div>
    </div>
  );
}

function Credentials({ runtime }: { runtime: RuntimeSnapshot }) {
  const rows = [
    ["Connected", runtime.connected ? "Yes" : "No"],
    ["Organization", runtime.organizationId ?? "Not connected"],
    ["Key expiry", runtime.expiresAt ?? "No expiry"],
    ["Workspace", runtime.workspaceBaseUrl],
    ["Resource audience", runtime.resourceAudience],
  ];
  return (
    <div className="panel-section">
      <div className="console-grid two">
        {rows.map(([label, value]) => <Metric key={label} title={label} value={value} detail="Sanitized runtime value" />)}
      </div>
      <ScopeList title="Requested scopes" scopes={runtime.requestedScopes} />
      <ScopeList title="Granted scopes" scopes={runtime.grantedScopes.length ? runtime.grantedScopes : ["Not available from current token response"]} />
      <form action={demoBrandConfig.authLogoutPath} method="post">
        <button className="button danger" type="submit">Clear session and reauthorize</button>
      </form>
    </div>
  );
}

function ResourceSection({
  sectionId,
  state,
  limit,
  setLimit,
  cursor,
  setCursor,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  indexStart,
  setIndexStart,
  indexEnd,
  setIndexEnd,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  mediaResourceType,
  setMediaResourceType,
  mediaResourceId,
  setMediaResourceId,
  isPending,
  isConnected,
  canRun,
  onLoad,
  onClientOperation,
  onWebhookOperation,
  result,
}: {
  sectionId: DemoSectionId;
  state?: DemoSectionDataState;
  limit: number;
  setLimit: (value: number) => void;
  cursor: string;
  setCursor: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  indexStart: string;
  setIndexStart: (value: string) => void;
  indexEnd: string;
  setIndexEnd: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  mediaResourceType: string;
  setMediaResourceType: (value: string) => void;
  mediaResourceId: string;
  setMediaResourceId: (value: string) => void;
  isPending: boolean;
  isConnected: boolean;
  canRun: boolean;
  onLoad: () => void;
  onClientOperation: (formData: FormData, operation: "create" | "update" | "delete") => void;
  onWebhookOperation: (formData: FormData, operation: "create" | "update" | "delete") => void;
  result?: DemoOperationResult;
}) {
  const section = findDemoSection(sectionId);
  const needsReconnect = !isConnected || (state?.status === "error" && /authorize|token|bearer|session/i.test(state.error ?? ""));
  const reconnectCopy = isConnected
    ? state?.error ?? "Authorize again to load Workspace data."
    : "Authorize a Workspace before loading this section.";
  const rows = qentrahPartnerRenderRows({
    data: state?.data,
    section,
    indexStart,
    indexEnd,
  });
  return (
    <div className="panel-section">
      <div className="resource-toolbar">
        {section.paginated ? (
          <>
            <label className="field inline-field">
              <span>Page size</span>
              <select value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
                {[10, 25, 50, 100].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="field inline-field wide-field">
              <span>Search</span>
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="name, email, title" />
            </label>
            <label className="field inline-field">
              <span>{["properties", "projects"].includes(section.id) ? "Status" : "Type"}</span>
              <input value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} placeholder={qentrahPartnerFilterPlaceholder(section.id)} />
            </label>
            <label className="field inline-field compact-field">
              <span>Index from</span>
              <input min="1" type="number" value={indexStart} onChange={(event) => setIndexStart(event.target.value)} placeholder="24" />
            </label>
            <label className="field inline-field compact-field">
              <span>Index to</span>
              <input min="1" type="number" value={indexEnd} onChange={(event) => setIndexEnd(event.target.value)} placeholder="27" />
            </label>
            <label className="field inline-field">
              <span>Start date</span>
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </label>
            <label className="field inline-field">
              <span>End date</span>
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </label>
            <label className="field inline-field wide-field">
              <span>Cursor</span>
              <input value={cursor} onChange={(event) => setCursor(event.target.value)} placeholder="optional backend cursor" />
            </label>
          </>
        ) : null}
        {section.id === "media" ? (
          <>
            <label className="field inline-field">
              <span>Resource type</span>
              <select value={mediaResourceType} onChange={(event) => setMediaResourceType(event.target.value)}>
                {["client", "property", "project", "task", "calendarEvent"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="field inline-field">
              <span>Resource id</span>
              <input value={mediaResourceId} onChange={(event) => setMediaResourceId(event.target.value)} placeholder="resource id" />
            </label>
          </>
        ) : null}
        {section.operations.includes("read") ? (
          <button className="button" disabled={!canRun || isPending || (section.id === "media" && !mediaResourceId.trim())} type="button" onClick={onLoad}>
            <RotateCcw size={16} />
            {!isConnected ? "Authorize to load" : state?.status === "loaded" ? "Reload" : "Load"}
          </button>
        ) : null}
        {state?.status === "loaded" ? <span className="loaded-count">{rows.length} loaded</span> : null}
      </div>

      {section.id === "clients" ? <ClientForms busy={isPending} canRun={canRun} onClientOperation={onClientOperation} /> : null}
      {section.id === "webhooks" ? <WebhookForms busy={isPending} canRun={canRun} onWebhookOperation={onWebhookOperation} /> : null}

      {needsReconnect ? (
        <div className="reconnect-panel">
          <div>
            <strong>Authorization required</strong>
            <p>{reconnectCopy}</p>
          </div>
          <a className="button" href={demoBrandConfig.authStartPath}>
            Authorize
            <ArrowRight size={16} />
          </a>
        </div>
      ) : null}

      <div className="resource-list">
        {rows.length ? rows.map((row) => (
          <article className="resource-row" key={row.key}>
            <strong>{row.title}</strong>
            <div className="resource-fields">
              {row.fields.map(({ key, value }) => (
                <span key={key}>{key}: {value}</span>
              ))}
            </div>
          </article>
        )) : !needsReconnect ? (
          <p className="empty-state">{state?.error ?? section.emptyState}</p>
        ) : null}
      </div>

      {result && !needsReconnect ? <ResultCard result={result} /> : null}
      {state?.data !== undefined ? <JsonDetails title="Response JSON" data={state.data} /> : null}
    </div>
  );
}

function ClientForms({
  busy,
  canRun,
  onClientOperation,
}: {
  busy: boolean;
  canRun: boolean;
  onClientOperation: (formData: FormData, operation: "create" | "update" | "delete") => void;
}) {
  return (
    <div className="client-actions">
      <form action={(formData) => onClientOperation(formData, "create")} className="panel mini-form">
        <strong>Create client</strong>
        <input name="name" placeholder="Demo Buyer" required />
        <input name="email" type="email" placeholder="buyer@example.com" />
        <input name="generation" placeholder="Generation, e.g. Gen Z" />
        <button className="button" disabled={busy || !canRun} type="submit">Create</button>
      </form>
      <form action={(formData) => onClientOperation(formData, "update")} className="panel mini-form">
        <strong>Update client</strong>
        <input name="clientId" placeholder="client id" required />
        <input name="name" placeholder="Updated Demo Buyer" required />
        <input name="generation" placeholder="Updated generation" />
        <button className="button secondary" disabled={busy || !canRun} type="submit">Update</button>
      </form>
      <form action={(formData) => onClientOperation(formData, "delete")} className="panel mini-form">
        <strong>Delete client</strong>
        <input name="clientId" placeholder="client id" required />
        <button className="button danger" disabled={busy || !canRun} type="submit">
          <Trash2 size={15} />
          Delete
        </button>
      </form>
    </div>
  );
}

function WebhookForms({
  busy,
  canRun,
  onWebhookOperation,
}: {
  busy: boolean;
  canRun: boolean;
  onWebhookOperation: (formData: FormData, operation: "create" | "update" | "delete") => void;
}) {
  return (
    <div className="client-actions">
      {(["create", "update", "delete"] as const).map((operation) => (
        <form action={(formData) => onWebhookOperation(formData, operation)} className="panel mini-form" key={operation}>
          <strong>{operation === "create" ? "Client created" : operation === "update" ? "Client updated" : "Client deleted"} webhook</strong>
          <input name="clientId" placeholder="client id" required={operation !== "create"} />
          {operation !== "delete" ? <input name="name" placeholder="Client name" /> : null}
          {operation !== "delete" ? <input name="email" type="email" placeholder="client@example.com" /> : null}
          <input name="eventId" placeholder="event id, optional" />
          <input name="idempotencyKey" placeholder="idempotency key, optional" />
          <button className={operation === "delete" ? "button danger" : "button"} disabled={busy || !canRun} type="submit">
            Send
          </button>
        </form>
      ))}
    </div>
  );
}

function Results({ results }: { results: DemoOperationResult[] }) {
  return (
    <div className="panel-section">
      {results.length ? results.map((result) => <ResultCard key={`${result.sectionId}-${result.timestamp}`} result={result} />) : (
        <p className="empty-state">No test results yet.</p>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: DemoOperationResult }) {
  return (
    <article className={`result-card${result.ok ? "" : " failed"}`}>
      <div>
        <strong>{findDemoSection(result.sectionId).label} {result.operation}</strong>
        <p>{result.method} {result.path}</p>
      </div>
      <span>{result.status}</span>
      <p>Request: {result.requestSummary}</p>
      <p>Response: {result.responseSummary}</p>
      {result.error ? <p className="error-text">{result.error}</p> : null}
      <small>{new Date(result.timestamp).toLocaleString()}</small>
    </article>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <article className="panel metric">
      <p className="micro">{title}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function ScopeList({ title, scopes }: { title: string; scopes: string[] }) {
  return (
    <section className="scope-panel">
      <p className="micro">{title}</p>
      <div>{scopes.map((scope) => <span className="badge" key={scope}>{scope}</span>)}</div>
    </section>
  );
}

function Endpoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="endpoint-box">
      <span>{label}</span>
      <code>{value}</code>
    </div>
  );
}

function JsonDetails({ title, data }: { title: string; data: unknown }) {
  return (
    <details className="json-details">
      <summary>{title}</summary>
      <pre>{JSON.stringify(sanitizeCredentialPayload(data), null, 2)}</pre>
    </details>
  );
}
