import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Code2, Building2, KeyRound, Workflow, FileCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <main>
      {/* ──────────────── HERO ──────────────── */}
      <section className="relative pt-16 pb-24 px-6 bg-background overflow-hidden min-h-[80vh] flex items-center">
        {/* Subtle glow effects */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center z-10 relative">
          <div className="max-w-xl">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
              OAuth 2.1 + OIDC for Anan Organizations
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.08] text-foreground">
              Build partner apps for{" "}
              <span className="text-primary">real estate workflows</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground font-medium leading-relaxed">
              Register OAuth clients, request scoped access to organization data, test against a sandbox environment, and submit for production review — all from one developer portal.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground transition-transform hover:scale-105">
                Create developer account
              </Link>
              <Link href="/docs" className="inline-flex h-12 items-center justify-center rounded-md px-6 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Read the docs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Code Preview */}
          <div className="relative rounded-xl border border-border bg-[#0a0a0a] shadow-2xl overflow-hidden hidden lg:block">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-500">oauth-integration.ts</span>
            </div>
            <pre className="p-5 text-sm font-mono text-slate-300 leading-relaxed overflow-x-auto">
<span className="text-pink-400">import</span> {"{"} AnanAuth {"}"} <span className="text-pink-400">from</span> <span className="text-green-400">&quot;@anan/auth-sdk&quot;</span>;{"\n\n"}
<span className="text-slate-500">// Initialize with your app credentials</span>{"\n"}
<span className="text-pink-400">const</span> auth = <span className="text-pink-400">new</span> <span className="text-blue-400">AnanAuth</span>({"{"}{"\n"}
{"  "}clientId: process.env.<span className="text-yellow-300">ANAN_CLIENT_ID</span>,{"\n"}
{"  "}redirectUri: <span className="text-green-400">&quot;https://app.example.com/callback&quot;</span>,{"\n"}
{"  "}scopes: [<span className="text-green-400">&quot;client:read&quot;</span>, <span className="text-green-400">&quot;property:read&quot;</span>],{"\n"}
{"}"});{"\n\n"}
<span className="text-slate-500">// Start OAuth + PKCE flow</span>{"\n"}
<span className="text-pink-400">const</span> {"{"} accessToken {"}"} = <span className="text-pink-400">await</span> auth.<span className="text-blue-400">authorize</span>();{"\n\n"}
<span className="text-slate-500">// Call scoped organization APIs</span>{"\n"}
<span className="text-pink-400">const</span> properties = <span className="text-pink-400">await</span> auth.<span className="text-blue-400">api</span>(<span className="text-green-400">&quot;/properties&quot;</span>);
            </pre>
          </div>
        </div>
      </section>

      {/* ──────────────── HOW IT WORKS ──────────────── */}
      <section className="py-24 px-6 bg-muted/30 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-4">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            From registration to production in four steps
          </h2>
          <p className="text-lg text-muted-foreground mb-16 max-w-2xl">
            The portal handles the full lifecycle of your partner integration — credentials, workspace authorization, scope management, and review submission.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: KeyRound, title: "Register your app", desc: "Choose public (PKCE) or confidential client type. We generate your Client ID and secret." },
              { icon: Workflow, title: "Configure scopes", desc: "Request specific data access — clients, properties, or organization settings. Each scope is reviewed." },
              { icon: Code2, title: "Verify with the SDK", desc: "Use @anan/auth-sdk to run full OAuth flows against an explicitly authorized Anan workspace." },
              { icon: FileCheck, title: "Submit for review", desc: "When ready, submit your app for Anan's security and scope review. Approved apps go live." },
            ].map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step {i + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── FEATURES ──────────────── */}
      <section className="py-24 px-6 bg-background border-t border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-4">Platform capabilities</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-16">
            Everything you need to build secure integrations
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: ShieldCheck, title: "OAuth 2.1 with PKCE", desc: "Public browser apps use PKCE for zero-secret flows. Confidential server apps get rotatable client secrets. All tokens are short-lived and scoped." },
              { icon: Building2, title: "Organization-scoped access", desc: "API calls are checked against the organization that granted consent. Partners only access the data their users explicitly authorized." },
              { icon: Code2, title: "SDK & React hooks", desc: "@anan/auth-sdk provides PKCE helpers, token refresh, React hooks, and server-side verification out of the box." },
              { icon: FileCheck, title: "Review & lifecycle management", desc: "Track your app from draft to review to active. Rejected apps get actionable feedback." },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-xl bg-card border border-border p-8">
                  <Icon className="h-8 w-8 text-primary mb-5" />
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── CTA ──────────────── */}
      <section className="py-24 px-6 bg-muted/30 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Start building today
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Create your developer account, register your first OAuth app, and test against your sandbox organization — all free during development.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground transition-transform hover:scale-105">
              Create developer account
            </Link>
            <Link href="/docs" className="inline-flex h-12 items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Read the documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-sm font-bold tracking-tight text-foreground">anan<span className="text-primary">portal</span></span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/policies" className="hover:text-foreground transition-colors">Policies</Link>
            <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
            <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Anan Partners</p>
        </div>
      </footer>
    </main>
  );
}
