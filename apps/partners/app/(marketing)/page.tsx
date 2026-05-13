import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, FileCheck, KeyRound, ShieldCheck, UsersRound, Workflow } from "lucide-react";
import { codeToHtml } from "shiki";

const heroCode = `type PartnerAuthorization = {
  clientId: string;
  redirectUri: string;
  scopes: string[];
};

const authorization: PartnerAuthorization = {
  clientId: "partners_client_...",
  redirectUri: "https://app.example.com/api/auth/anan/callback",
  scopes: ["organization:read", "client:read", "property:read"],
};

const url = new URL("/oauth/authorize", ANAN_WORKSPACE_API_URL);
url.searchParams.set("client_id", authorization.clientId);
url.searchParams.set("response_type", "code");
url.searchParams.set("redirect_uri", authorization.redirectUri);
url.searchParams.set("scope", authorization.scopes.join(" "));
url.searchParams.set("code_challenge", pkce.challenge);
url.searchParams.set("code_challenge_method", "S256");`;

const flow = [
  { title: "Create the OAuth client", description: "Add a partner URL, callback URL, and client type.", icon: KeyRound },
  { title: "Choose small scopes", description: "Request only the organization data your product needs.", icon: ShieldCheck },
  { title: "Submit for review", description: "Anan reviews production readiness before the app goes live.", icon: FileCheck },
];

const partnerValue = [
  {
    title: "Reach operating teams",
    description: "Put your product in front of real estate teams already managing clients, properties, media, tasks, and follow-up inside Anan.",
    icon: UsersRound,
  },
  {
    title: "Earn trust before launch",
    description: "Every production app passes through scoped review, so admins understand exactly what your integration can access.",
    icon: ShieldCheck,
  },
  {
    title: "Build around real workflows",
    description: "Connect to organization data through Workspace APIs instead of inventing a separate sync path for every customer.",
    icon: Workflow,
  },
];

const productUseCases = [
  "Generate signed PDFs from Anan client and property records.",
  "Sync qualified leads into a broker follow-up workflow.",
  "Enrich property media, documents, or listing operations.",
  "Run partner automations after an organization grants consent.",
];

export default async function LandingPage() {
  const highlightedHeroCode = await codeToHtml(heroCode, {
    lang: "typescript",
    theme: "github-dark-default",
    transformers: [
      {
        pre(node) {
          node.properties.style = "";
          node.properties.class = "m-0 min-w-max bg-transparent p-5 text-xs leading-6 md:p-6";
        },
        code(node) {
          node.properties.class = "font-mono";
        },
      },
    ],
  });

  return (
    <main className="bg-background">
      <section className="relative overflow-hidden border-b border-border px-4 py-12 sm:px-6 lg:py-16">
        <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,#fff_0%,rgba(255,255,255,0)_100%)] dark:hidden" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(360px,0.72fr)_minmax(0,1.28fr)] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary dark:bg-card">
              <Code2 className="size-3.5" />
              Anan Partner Platform
            </div>
            <h1 className="max-w-3xl text-balance text-[44px] font-bold leading-[1.02] text-foreground md:text-[64px]">
              Build reviewed apps for Anan workspaces.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base font-medium leading-7 text-muted-foreground">
              Register OAuth clients, request scoped organization access, and ship partner integrations through one developer console.
            </p>
            <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-muted-foreground">
              The story is simple: your product keeps its own experience, Anan handles organization trust, and Workspace becomes the reviewed bridge between them.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-[7px] bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-[#6b90e6]">
                Create developer account
              </Link>
              <Link href="/docs/oauth-flow" className="inline-flex h-12 items-center justify-center gap-2 rounded-[7px] border border-border bg-white px-6 text-sm font-bold text-foreground transition-colors hover:bg-muted dark:bg-card">
                OAuth guide
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[15px] border border-[#132238] bg-[#071A34] text-white shadow-[0_32px_100px_rgba(7,26,52,0.18)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#ff5f57]" />
                <span className="size-3 rounded-full bg-[#ffbd2e]" />
                <span className="size-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-xs font-semibold text-[#B1BCC7]">authorize-with-anan.ts</span>
            </div>
            <div
              className="max-h-[520px] overflow-auto [&_pre]:bg-transparent [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-6"
              dangerouslySetInnerHTML={{ __html: highlightedHeroCode }}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white px-4 py-16 dark:bg-card sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-bold uppercase text-primary">Partner value</p>
            <h2 className="mt-3 text-4xl font-bold text-foreground">A clean path into real estate work, not just another API key.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Partners get a reviewed way to become part of an organization’s daily operating system while users stay in control of data access.
            </p>
          </div>
          <div className="mb-12 grid gap-4 md:grid-cols-3">
            {partnerValue.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-[15px] border border-border bg-background p-5 dark:bg-background">
                  <Icon className="size-5 text-primary" />
                  <h2 className="mt-6 text-lg font-bold text-foreground">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </article>
              );
            })}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {flow.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-[15px] border border-border bg-background p-5 dark:bg-background">
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">0{index + 1}</span>
                  </div>
                  <h2 className="mt-8 text-lg font-bold text-foreground">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase text-primary">Review-ready by design</p>
            <h2 className="mt-3 text-4xl font-bold text-foreground">The portal keeps setup, permissions, and code in one clean path.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Developers see what Anan needs for review: callback URLs, client type, exact scopes, and server-side authorization code.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Each app starts as a draft, becomes a reviewed integration, then appears as a trusted authorization option for workspace admins.
            </p>
            <div className="mt-6 grid gap-3 text-sm font-semibold text-foreground sm:grid-cols-2">
              {["Public PKCE or confidential clients", "Scoped organization APIs", "Review status lifecycle", "Server-side token handling"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[15px] border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <p className="text-xs font-bold uppercase text-primary">Review checklist</p>
            </div>
            <div className="divide-y divide-border">
              {[
                ["Redirect URI", "HTTPS callback or localhost for development"],
                ["Scopes", "Start read-only, add write only when necessary"],
                ["Token storage", "Exchange and refresh tokens on your backend"],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-2 p-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <p className="text-sm font-bold text-foreground">{label}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white px-4 py-16 dark:bg-card sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase text-primary">What partners can ship</p>
            <h2 className="mt-3 text-4xl font-bold text-foreground">Products that sit next to the work, not outside it.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The best partner apps remove manual copying, reporting gaps, and disconnected follow-up between Anan and specialist tools.
            </p>
          </div>
          <div className="overflow-hidden rounded-[15px] border border-border bg-background">
            {productUseCases.map((item, index) => (
              <div key={item} className="grid gap-3 border-b border-border p-5 last:border-b-0 sm:grid-cols-[48px_minmax(0,1fr)]">
                <div className="flex size-10 items-center justify-center rounded-[7px] border border-border bg-white text-sm font-bold text-primary dark:bg-card">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{item}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Built through reviewed scopes, organization consent, and server-side Workspace API access.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white px-4 py-16 text-center dark:bg-card sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-bold text-foreground">Start with one callback and three scopes.</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Create the draft, test locally, then submit when your authorization flow is ready for review.
          </p>
          <Link href="/signup" className="mt-8 inline-flex h-12 items-center justify-center rounded-[7px] bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-[#6b90e6]">
            Create your first app
          </Link>
        </div>
      </section>
    </main>
  );
}
