import { ArrowRight, Building2, CheckCircle2, KeyRound, ShieldCheck, Workflow } from "lucide-react";
import { demoBrandConfig, publicDemoConfig, requestedScopes } from "@/lib/config";
import { readTokenSession } from "@/lib/session";

const steps = [
  {
    icon: KeyRound,
    title: "Open Workspace",
    text: "The user clicks Authorize and reviews this partner app inside Qentrah Workspace.",
  },
  {
    icon: Building2,
    title: "Approve organization",
    text: "Workspace confirms which organization will grant access and stores the local grant.",
  },
  {
    icon: ShieldCheck,
    title: "Issue WorkOS key",
    text: "Workspace issues a scoped WorkOS partner API key for server-side resource access.",
  },
];

export default async function HomePage() {
  const session = await readTokenSession();
  const publicConfig = publicDemoConfig();

  return (
    <main className="app-shell">
      <nav className="topbar">
        <a className="brand-lockup" href="/">
          <span className="brand-mark">Q</span>
          <span>
            <strong>{demoBrandConfig.appName}</strong>
            <small>WorkOS partner key sample</small>
          </span>
        </a>
        <div className="topbar-actions">
          {session ? <a className="button secondary" href="/dashboard">Open dashboard</a> : null}
          <a className="button" href={demoBrandConfig.authStartPath}>
            Authorize with {demoBrandConfig.brandName}
            <ArrowRight size={16} />
          </a>
        </div>
      </nav>

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="micro">Live partner authorization</p>
          <h1>Connect this demo app to your Qentrah workspace.</h1>
          <p className="lede">
            This is the normal partner app experience: inspect the service, click authorize, approve the requested access in Qentrah, then return here with a live WorkOS-backed organization connection.
          </p>
          <div className="hero-actions">
            <a className="button big" href={demoBrandConfig.authStartPath}>
              Authorize with {demoBrandConfig.brandName}
              <ArrowRight size={18} />
            </a>
            <a className="button secondary big" href="/dashboard">View demo dashboard</a>
          </div>
          <div className="trust-row" aria-label="WorkOS partner key safeguards">
            <span><CheckCircle2 size={15} /> WorkOS API key validation</span>
            <span><CheckCircle2 size={15} /> Convex grant enforcement</span>
            <span><CheckCircle2 size={15} /> Scoped organization access</span>
          </div>
        </div>

        <aside className="connection-card" aria-label="Authorization flow">
          <div className="card-head">
            <Workflow size={18} />
            <span>Authorization flow</span>
          </div>
          <div className="flow-list">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div className="flow-step" key={step.title}>
                  <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                  <Icon size={18} />
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="endpoint-box">
            <span>Workspace</span>
            <code>{publicConfig.workspaceBaseUrl}</code>
          </div>
        </aside>
      </section>

      <section className="scope-band">
        <div>
          <p className="micro">Requested service access</p>
          <h2>The consent screen will ask for these scopes.</h2>
        </div>
        <div className="scope-grid">
          {requestedScopes.map((scope) => <span className="badge" key={scope}>{scope}</span>)}
        </div>
      </section>
    </main>
  );
}
