import { SafeWritePanel } from "@/components/SafeWritePanel";
import { demoBrandConfig, publicDemoConfig, requestedScopes } from "@/lib/config";
import { loadQentrahClients, loadQentrahMe, loadQentrahProperties } from "@/lib/workspace-api";
import { readTokenSession } from "@/lib/session";

function JsonPanel({ title, data }: { title: string; data: unknown }) {
  return (
    <section className="panel" style={{ padding: 18, minWidth: 0 }}>
      <p className="micro">{title}</p>
      <pre style={{ overflow: "auto", fontSize: 12, lineHeight: 1.6, marginBottom: 0 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}

export default async function DashboardPage() {
  const session = await readTokenSession();
  const publicConfig = publicDemoConfig();
  const expiresAt = session ? new Date(session.obtained_at + session.expires_in * 1000) : null;
  const canLoadWorkspaceData = Boolean(session?.organizationId);
  const data = canLoadWorkspaceData && session
    ? await Promise.allSettled([
      loadQentrahMe(session),
      loadQentrahClients(session),
      loadQentrahProperties(session),
    ])
    : null;

  return (
    <main className="shell">
      <div className="container">
        <header style={{ borderBottom: "1px solid var(--line)", paddingBottom: 24, marginBottom: 24 }}>
          <p className="micro">{demoBrandConfig.appName} partner example</p>
          <div className="grid two" style={{ alignItems: "end" }}>
            <div>
              <h1 style={{ margin: "10px 0 0", fontSize: 38, letterSpacing: "-0.05em" }}>
                Workspace OAuth demo
              </h1>
              <p style={{ color: "var(--muted)", maxWidth: 680, lineHeight: 1.7 }}>
                A deployable partner app that authorizes a workspace organization, stores tokens server-side, reads workspace data, and demonstrates safe client writes.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <a className="button" href={demoBrandConfig.oauthStartPath}>Authorize with {demoBrandConfig.brandName}</a>
              {session ? (
                <form action={demoBrandConfig.oauthLogoutPath} method="post">
                  <button className="button danger" type="submit">Clear demo session</button>
                </form>
              ) : null}
            </div>
          </div>
        </header>

        <section className="grid three" style={{ marginBottom: 18 }}>
          <div className="panel" style={{ padding: 16 }}>
            <p className="micro">Connection</p>
            <h2 style={{ margin: "8px 0 0" }}>{session ? "Connected" : "Not connected"}</h2>
            <p style={{ color: "var(--muted)" }}>
              {session?.organizationId ?? (session ? "Reconnect to attach an organization to this OAuth session." : "Authorize a workspace to load organization data.")}
            </p>
          </div>
          <div className="panel" style={{ padding: 16 }}>
            <p className="micro">Token expiry</p>
            <h2 style={{ margin: "8px 0 0" }}>{expiresAt ? expiresAt.toLocaleString() : "No token"}</h2>
            <p style={{ color: "var(--muted)" }}>Organization authorization lifetime is 14 days in Workspace.</p>
          </div>
          <div className="panel" style={{ padding: 16 }}>
            <p className="micro">Workspace</p>
            <h2 style={{ margin: "8px 0 0", wordBreak: "break-word" }}>{publicConfig.workspaceBaseUrl}</h2>
            <p style={{ color: "var(--muted)" }}>All workspace data is loaded through Workspace Hono APIs.</p>
          </div>
        </section>

        <section className="panel" style={{ padding: 18, marginBottom: 18 }}>
          <p className="micro">Requested scopes</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {requestedScopes.map((scope) => <span className="badge" key={scope}>{scope}</span>)}
          </div>
        </section>

        {!session ? (
          <section className="panel" style={{ padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>Start the organization authorization flow</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              Click the CTA to visit Workspace, choose the workspace, consent to the scopes, and return to this demo app.
            </p>
            <a className="button" href={demoBrandConfig.oauthStartPath}>Authorize with {demoBrandConfig.brandName}</a>
          </section>
        ) : !canLoadWorkspaceData ? (
          <section className="panel" style={{ padding: 24 }}>
            <p className="micro">Reconnect required</p>
            <h2 style={{ marginTop: 8 }}>Organization authorization is missing</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              This browser has an older demo token cookie that does not include Workspace&apos;s organization id. Clear the demo session, then authorize again so the callback stores the organization-level authorization.
            </p>
            <form action={demoBrandConfig.oauthLogoutPath} method="post">
              <button className="button" type="submit">Clear session and reconnect</button>
            </form>
          </section>
        ) : (
          <div className="grid" style={{ gap: 18 }}>
            <SafeWritePanel />
            <div className="grid three">
              <JsonPanel title="Organization" data={data?.[0].status === "fulfilled" ? data[0].value : data?.[0]} />
              <JsonPanel title="Clients" data={data?.[1].status === "fulfilled" ? data[1].value : data?.[1]} />
              <JsonPanel title="Properties" data={data?.[2].status === "fulfilled" ? data[2].value : data?.[2]} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
