import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { codeToHtml } from "shiki";
import { brandRoutePath } from "@qentrah/brand-identity";

const oauthCallbackPath = brandRoutePath("oauthCallback");

const heroCode = `import { createQentrahPartnerAuthHandlers } from "@qentrah/auth-sdk/partner/next";

export const handlers = createQentrahPartnerAuthHandlers({
  clientId: process.env.QENTRAH_CLIENT_ID,
  clientSecret: process.env.QENTRAH_CLIENT_SECRET,
  workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_API_URL,
  appBaseUrl: process.env.PARTNER_APP_URL,
  redirectUri: \`\${process.env.PARTNER_APP_URL}${oauthCallbackPath}\`,
  scopes: ["client:read", "property:read", "task:create"],
  tokenStore
});

export const GET = handlers.start;`;

const platformPillars = [
  {
    eyebrow: "01 / Consent Lifecycle",
    title: "Server-first OAuth with PKCE",
    description: "Start authorization from your backend, send the admin through Workspace consent, and keep authorization codes, refresh tokens, and client secrets out of browser JavaScript.",
    bullets: ["Backend start route", "Workspace consent", "Server-side token store"],
    code: `import { createQentrahPartnerAuthHandlers } from "@qentrah/auth-sdk/partner/next";

export const handlers = createQentrahPartnerAuthHandlers({
  clientId: process.env.QENTRAH_CLIENT_ID,
  workspaceBaseUrl: process.env.QENTRAH_WORKSPACE_API_URL,
  scopes: ["client:read", "property:read"],
  tokenStore,
});`,
  },
  {
    eyebrow: "02 / Workspace APIs",
    title: "Scoped resource reads and writes",
    description: "Call Workspace partner APIs from trusted backend code after consent. Qentrah validates organization, client, audience, expiry, revocation, and resource scopes on every request.",
    bullets: ["Bearer tokens only", "Organization-scoped routes", "Resource/action checks"],
    code: `import { createQentrahServiceAppClient } from "@qentrah/auth-sdk/partner/service-app";

const qentrah = createQentrahServiceAppClient({ tokenStore });

const clients = await qentrah.read({
  organizationId,
  resource: "client",
  input: { status: "active" },
});`,
  },
  {
    eyebrow: "03 / System AI",
    title: "Qentrah system AI operator",
    description: "Use the Partners MCP link to let your internal agent inspect app status, update drafts, read sandbox evidence, and submit review requests inside the same permission model as the portal.",
    bullets: ["Partners MCP link", "Tool-scoped access", "Sandbox evidence"],
    code: `{
  "mcpServers": {
    "qentrah-partners": {
      "url": "https://partners.qentrah.com/api/mcp/partner/PUBLIC_ID/SECRET"
    }
  }
}`,
  },
  {
    eyebrow: "04 / Event Outbox",
    title: "Verified webhook handlers",
    description: "Receive Qentrah events through a raw-body verified webhook route. Payload signatures are checked before JSON parsing so partner apps can safely react to client and property changes.",
    bullets: ["Raw-body verification", "Signed delivery headers", "Backend event handling"],
    code: `import { createQentrahWebhookHandler } from "@qentrah/auth-sdk/partner/webhooks";

export const POST = createQentrahWebhookHandler({
  secret: process.env.QENTRAH_WEBHOOK_SECRET,
  async onEvent(event) {
    await syncWorkspaceEvent(event);
  },
});`,
  },
  {
    eyebrow: "05 / Catalog Review",
    title: "Draft, sandbox, submit",
    description: "Register redirect URIs, request the smallest useful scope set, test against sandbox organizations, then submit the app for review from the partner dashboard.",
    bullets: ["Redirect URI checks", "Sandbox API explorer", "Review-state tracking"],
    code: `POST /api/v1/partner/organizations/<sandbox_org>/clients
Authorization: Bearer <sandbox_access_token>
Content-Type: application/json

{ "name": "Riyadh buyer", "status": "active" }`,
  },
];

function codeTransformers() {
  return [
    {
      pre(node: { properties: Record<string, unknown> }) {
        node.properties.style = "";
        node.properties.class = "m-0 min-w-max bg-transparent p-5 text-[11px] leading-relaxed";
      },
      code(node: { properties: Record<string, unknown> }) {
        node.properties.class = "font-mono";
      },
    },
  ];
}

export default async function LandingPage() {
  const [highlightedHeroCodeLight, highlightedHeroCodeDark] = await Promise.all([
    codeToHtml(heroCode, {
      lang: "typescript",
      theme: "github-light",
      transformers: codeTransformers(),
    }),
    codeToHtml(heroCode, {
      lang: "typescript",
      theme: "github-dark-default",
      transformers: codeTransformers(),
    }),
  ]);
  
  const highlightedIntegrationExamples = await Promise.all(
    platformPillars.map(async ({ code }) => {
      const [light, dark] = await Promise.all([
        codeToHtml(code, {
          lang: "typescript",
          theme: "github-light",
          transformers: codeTransformers(),
        }),
        codeToHtml(code, {
          lang: "typescript",
          theme: "github-dark-default",
          transformers: codeTransformers(),
        }),
      ]);
      return { dark, light };
    }),
  );

  const formattedExamples = platformPillars.map((item, index) => ({
    eyebrow: item.eyebrow,
    title: item.title,
    description: item.description,
    bullets: item.bullets,
    code: item.code,
    highlightedCode: highlightedIntegrationExamples[index],
  }));

  return (
    <main className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden selection:bg-primary/20 selection:text-primary-foreground dark:selection:text-white">
      <section className="relative border-b border-zinc-200/70 px-5 py-16 dark:border-zinc-900/70 sm:px-6 md:py-20 lg:py-24 hero-grid-bg">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(90%_50%_at_12%_0%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent_62%)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(460px,1.1fr)] lg:gap-14">
          <div className="space-y-7">
            <div className="max-w-3xl space-y-5">
              <p className="text-[11px] font-black uppercase text-primary">Qentrah Partners</p>
              <h1 className="text-balance text-5xl font-black leading-[0.98] tracking-tight text-zinc-950 dark:text-zinc-50 md:text-6xl xl:text-7xl">
                Integrate with the source of record.
              </h1>
              <p className="max-w-2xl text-base font-medium leading-7 text-zinc-600 dark:text-zinc-400 md:text-lg">
                Build partner apps that authorize through Workspace, call organization-scoped APIs, and expose tools to the system AI.
              </p>
            </div>

            <div className="flex max-w-md flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold !text-white transition-colors hover:bg-primary/90 sm:w-auto"
              >
                Create app
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-300 bg-background px-6 text-sm font-bold text-foreground transition-colors hover:bg-muted dark:border-zinc-800 sm:w-auto"
              >
                Read the docs
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_70%_20%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_58%)]" />
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(14,23,38,0.10)] dark:border-zinc-800 dark:bg-[#07090c]/95 dark:shadow-none">
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-5 py-3 text-[10px] font-black uppercase text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/35 dark:text-zinc-500">
                <span>oauth-start.ts</span>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] text-primary">Auth SDK</span>
              </div>

              <div className="overflow-auto p-6 font-mono text-[11px] leading-relaxed">
                <div
                  aria-label="Light mode TypeScript OAuth example"
                  className="block overflow-auto dark:hidden [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightedHeroCodeLight }}
                />
                <div
                  aria-label="Dark mode TypeScript OAuth example"
                  className="hidden overflow-auto dark:block [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightedHeroCodeDark }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="partner-overview" className="relative border-b border-zinc-200/70 bg-white px-5 py-20 dark:border-zinc-900/70 dark:bg-zinc-950 sm:px-6 md:py-28">
        <div className="mx-auto max-w-7xl space-y-28 md:space-y-36">
          <div className="max-w-3xl space-y-4">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase text-primary">
              Core Capabilities
            </span>
            <h2 id="partner-overview" className="text-4xl md:text-5xl font-extrabold leading-tight text-zinc-900 dark:text-white tracking-tight">
              Platform specifications. Built for engineers.
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-xl font-medium leading-relaxed">
              Explore the five concrete integration surfaces used by the portal, docs, SDK examples, sandbox, and MCP operator.
            </p>
          </div>

          <div className="space-y-28 md:space-y-40">
            {formattedExamples.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div 
                  key={item.title} 
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center`}
                >
                  <div className={`space-y-6 lg:col-span-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                    <span className="text-xs font-black uppercase tracking-widest text-primary">
                      {item.eyebrow}
                    </span>
                    <h3 className="text-3xl font-extrabold leading-tight text-zinc-900 dark:text-white tracking-tight font-sans">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {item.bullets.map((bullet) => (
                        <div
                          key={bullet}
                          className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 px-3 py-1.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-300"
                        >
                          <span className="size-1 rounded-full bg-primary" />
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`lg:col-span-7 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                    <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#07090c]/90 text-[11px] font-mono leading-relaxed">
                      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 px-4 py-2.5 text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black">
                        <span>{item.eyebrow.toLowerCase().replace(" ", "").split("/")[1]?.trim() || "sdk-helper"}.ts</span>
                        <span>TypeScript SDK</span>
                      </div>
                      
                      <div className="p-5 overflow-auto max-h-[220px] scrollbar-thin">
                        <div 
                          dangerouslySetInnerHTML={{ __html: item.highlightedCode.light }} 
                          className="block dark:hidden [&_pre]:bg-transparent [&_pre]:p-0 [&_pre]:m-0 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-relaxed"
                        />
                        <div 
                          dangerouslySetInnerHTML={{ __html: item.highlightedCode.dark }} 
                          className="hidden dark:block [&_pre]:bg-transparent [&_pre]:p-0 [&_pre]:m-0 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-zinc-50 px-5 py-24 text-center dark:bg-[#07090c] sm:px-6 md:py-32">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-[radial-gradient(ellipse_120%_60%_at_50%_100%,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_60%)]" />
        
        <div className="mx-auto max-w-4xl space-y-8 relative z-10">
          <div className="mx-auto size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
            <Bot className="size-6" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold leading-none text-zinc-900 dark:text-white tracking-tight">
            Build the integration. Let system AI operate it.
          </h2>
          
          <p className="mx-auto max-w-xl text-lg text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
            Register a partner app, wire the real SDK routes, test sandbox resource APIs, then create a Partners MCP link for your internal operator.
          </p>
          
          <div className="pt-4 flex justify-center">
            <Link
              href="/signup"
              className="inline-flex h-14 items-center justify-center rounded-full bg-zinc-950 dark:bg-zinc-50 px-10 text-sm font-extrabold transition-all duration-300 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] !text-zinc-50 dark:!text-zinc-950"
            >
              Create Developer App
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
