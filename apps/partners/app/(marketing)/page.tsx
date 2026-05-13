import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Code2, FileCheck, KeyRound, Layers3, LockKeyhole, ShieldCheck, Workflow } from "lucide-react";

const quickLinks = [
  { href: "/docs/quickstart", label: "Quickstart" },
  { href: "/docs/oauth-flow", label: "OAuth flow" },
  { href: "/docs/api-usage", label: "API usage" },
];

const flow = [
  { title: "Register", description: "Create a partner app with callback URLs and a small scope set.", icon: KeyRound },
  { title: "Review", description: "Submit the app so Anan can approve production access.", icon: FileCheck },
  { title: "Authorize", description: "Send workspace admins through organization-level OAuth consent.", icon: ShieldCheck },
  { title: "Build", description: "Call scoped Hub APIs from your backend after authorization.", icon: Code2 },
];

const capabilities = [
  {
    title: "OAuth clients",
    description: "Public PKCE and confidential server clients use the same clear setup path.",
    icon: KeyRound,
  },
  {
    title: "Scoped resources",
    description: "Request only the organization data your workflow needs.",
    icon: Layers3,
  },
  {
    title: "Review lifecycle",
    description: "Track draft, pending, active, rejected, and suspended states.",
    icon: Workflow,
  },
  {
    title: "Server-first security",
    description: "Keep token exchange, refresh, and storage outside the browser.",
    icon: LockKeyhole,
  },
];

export default function LandingPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border bg-background px-4 py-16 sm:px-6 lg:py-24">
        <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,#ffffff_0%,rgba(255,255,255,0)_100%)] dark:hidden" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary dark:bg-card">
              <ShieldCheck className="size-3.5" />
              Partner program for Anan organizations
            </div>
            <h1 className="text-balance text-[52px] font-bold leading-[1.02] text-foreground md:text-[72px]">
              Build apps that plug into real estate operations.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg font-medium leading-8 text-muted-foreground">
              Anan Partners gives developers a reviewed path to OAuth clients, scoped workspace APIs, and production-ready organization authorization.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-[7px] bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-[#6b90e6]">
                Create developer account
              </Link>
              <Link href="/docs" className="inline-flex h-12 items-center justify-center gap-2 rounded-[7px] border border-border bg-white px-6 text-sm font-bold text-foreground transition-colors hover:bg-muted dark:bg-card">
                Read docs
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {quickLinks.map((item) => (
                <Link key={item.href} href={item.href} className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground dark:bg-card">
                  <BookOpen className="size-3" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-border bg-white p-3 shadow-[0_32px_100px_rgba(7,26,52,0.12)] dark:bg-card">
            <div className="rounded-[15px] bg-[#071A34] p-5 text-white">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase text-[#B1BCC7]">Authorization request</p>
                  <p className="mt-1 text-sm font-semibold">PDF Creator</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-[#B1BCC7]">Public PKCE</span>
              </div>
              <pre className="overflow-x-auto text-xs leading-6 text-slate-200">{`GET /oauth/authorize
  client_id=partners_client_...
  redirect_uri=https://app.example.com/callback
  scope=organization:read client:read property:read
  code_challenge=<pkce>
  code_challenge_method=S256`}</pre>
            </div>
            <div className="grid gap-3 p-3 sm:grid-cols-3">
              {["Draft saved", "Review ready", "Scopes visible"].map((item) => (
                <div key={item} className="rounded-[7px] border border-border bg-background p-3">
                  <CheckCircle2 className="size-4 text-primary" />
                  <p className="mt-2 text-xs font-bold text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white px-4 py-20 dark:bg-card sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase text-primary">How it works</p>
            <h2 className="mt-3 text-4xl font-bold text-foreground">A reviewed path from idea to production access.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The portal is organized around the actual partner journey: registration, Anan review, organization consent, and scoped API usage.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {flow.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-[15px] border border-border bg-background p-5 dark:bg-background">
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">0{index + 1}</span>
                  </div>
                  <h3 className="mt-8 text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase text-primary">Platform components</p>
            <h2 className="mt-3 text-4xl font-bold text-foreground">Everything needed to ship a trusted integration.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The portal keeps developer setup, permissions, review, and documentation close together so each step explains the next one.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-[15px] border border-border bg-card p-6">
                  <Icon className="size-6 text-primary" />
                  <h3 className="mt-5 text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#071A34] px-4 py-20 text-white sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase text-[#B1BCC7]">Backend first</p>
            <h2 className="mt-3 text-4xl font-bold">Keep secrets and tokens on your server.</h2>
            <p className="mt-4 text-sm leading-6 text-[#B1BCC7]">
              Browser apps start OAuth with PKCE. Your backend handles token exchange, refresh, and Hub API calls after organization consent.
            </p>
          </div>
          <pre className="overflow-x-auto rounded-[15px] border border-white/10 bg-white/[0.04] p-5 text-xs leading-6 text-slate-200">{`const response = await fetch(
  \`\${ANAN_HUB_URL}/api/v1/partner/organizations/\${orgId}/clients\`,
  {
    headers: {
      Authorization: \`Bearer \${accessToken}\`,
    },
  }
);`}</pre>
        </div>
      </section>

      <section className="bg-white px-4 py-20 text-center dark:bg-card sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-foreground">Start with one small scope set.</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Create a draft app, test OAuth locally, then submit when your redirect URI and data usage are ready for review.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-[7px] bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-[#6b90e6]">
              Create developer account
            </Link>
            <Link href="/docs/register-an-app" className="inline-flex h-12 items-center justify-center rounded-[7px] border border-border px-6 text-sm font-bold text-foreground transition-colors hover:bg-muted">
              Register an app
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
