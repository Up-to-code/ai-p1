import Link from "next/link";
import { ArrowRight, BadgeCheck, Bot, CheckCircle2, FileCheck, KeyRound, Send, ShieldCheck, Workflow } from "lucide-react";
import { codeToHtml } from "shiki";
import { brandLabel, brandRoutePath } from "@qentrah/brand-identity";

const brand = brandLabel("en");
const oauthCallbackPath = brandRoutePath("oauthCallback");

const heroCode = `const qentrah = createPartnerConsole({
  clientId: "partners_client_...",
  redirectUri: "https://app.example.com${oauthCallbackPath}",
  scopes: ["organization:read", "client:read"],
});

await qentrah.authorizeWorkspace();
const clients = await qentrah.clients.list();`;

const partnerSteps = [
  ["Draft", "Add your app URL, callback, and requested scopes."],
  ["Review", "Qentrah checks consent, token handling, and least-privilege access."],
  ["Launch", "Approved apps become available for workspace authorization."],
];

const integrationExamples = [
  {
    icon: ShieldCheck,
    eyebrow: "Permissions",
    title: "Ask for only what the workflow needs.",
    description: "Keep consent clean with small, readable scopes. Organization owners see the exact access request before approving your app.",
    bullets: ["Start read-only", "Explain each scope", "Add write access later"],
    code: `const access = await qentrah.permissions.request({
  organizationId,
  scopes: ["organization:read", "client:read"],
  reason: "Show CRM contacts inside your dashboard",
});`,
  },
  {
    icon: Workflow,
    eyebrow: "Webhooks",
    title: "Listen for workspace changes without polling.",
    description: "Subscribe to the events your product uses. Store the signing secret on your backend and verify every inbound payload.",
    bullets: ["Client updates", "Project changes", "Signed payloads"],
    code: `await qentrah.webhooks.create({
  url: "https://app.example.com/qentrah/webhook",
  events: ["client.updated", "project.created"],
});`,
  },
  {
    icon: Bot,
    eyebrow: "MCP",
    title: "Ready for AI agents and operator workflows.",
    description: "Expose approved tools through MCP so AI assistants can work with Qentrah data using the same reviewed permissions as your app.",
    bullets: ["Agent-ready tools", "Reviewed permissions", "Workspace context"],
    code: `await qentrah.mcp.connect({
  organizationId,
  tools: ["clients.search", "tasks.create"],
  mode: "reviewed",
});`,
  },
  {
    icon: KeyRound,
    eyebrow: "Clean data",
    title: "Read normalized workspace records.",
    description: "Use reviewed access to read clients, projects, tasks, and calendar data in a predictable shape that is safe to display.",
    bullets: ["Stable resource IDs", "Scoped organization data", "Server-side token use"],
    code: `const clients = await qentrah.clients.list({
  organizationId,
  fields: ["name", "phone", "owner", "stage"],
});`,
  },
  {
    icon: Send,
    eyebrow: "Review",
    title: "Submit the same app when it is ready.",
    description: "When local testing works, send the draft to review with notes that explain your product, data use, and webhook lifecycle.",
    bullets: ["Review notes", "Callback checks", "Runtime sync"],
    code: `await qentrah.apps.submitForReview({
  appId,
  notes: "CRM sync for approved sales teams.",
});`,
  },
];

function codeTransformers() {
  return [
    {
      pre(node: { properties: Record<string, unknown> }) {
        node.properties.style = "";
        node.properties.class = "m-0 min-w-max bg-transparent p-5 text-xs leading-6";
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
    integrationExamples.map(async ({ code }) => {
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

  return (
    <main className="overflow-hidden">
      <section className="hero-grid-bg relative border-b border-border px-5 py-14 lg:py-20">
        <div className="absolute inset-x-0 top-0 -z-10 h-[540px] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_12%,transparent),transparent)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(480px,1.05fr)]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold text-primary">
              <BadgeCheck className="size-4" />
              Reviewed partner access
            </div>
            <h1 className="mt-6 max-w-4xl text-balance text-[44px] font-bold leading-[0.98] text-foreground md:text-[76px]">
              Build partner apps for {brand} workspaces.
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] font-medium leading-8 text-muted-foreground">
              Register OAuth clients, request scoped organization access, and give customers a clear, reviewed path to connect your product.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" style={{ color: "#ffffff" }} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0e1726] px-6 text-sm font-bold transition-colors hover:bg-[#1c2a3d] dark:bg-[#0e1726] dark:hover:bg-[#1c2a3d]">
                Become a partner
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/docs/oauth-flow" className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-bold text-foreground transition-colors hover:bg-muted">
                Read OAuth guide
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="code-zone-shadow overflow-hidden rounded-[14px] border border-[#d0d7de] bg-[#ffffff] dark:border-[#30363d] dark:bg-[#0d1117]">
              <div className="flex items-center justify-between border-b border-[#d0d7de] bg-[#f6f8fa] px-4 py-3 dark:border-[#30363d] dark:bg-[#161b22]">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
                    <span className="size-3 rounded-full bg-[#ff5f56]" />
                    <span className="size-3 rounded-full bg-[#ffbd2e]" />
                    <span className="size-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="truncate text-xs font-bold text-[#57606a] dark:text-[#8b949e]">qentrah-partner-demo</span>
                </div>
                <span className="rounded-[6px] border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary dark:border-[#1f6feb]/50 dark:bg-[#1f6feb]/15 dark:text-[#58a6ff]">
                  live preview
                </span>
              </div>
              <div className="flex border-b border-[#d0d7de] bg-[#ffffff] dark:border-[#30363d] dark:bg-[#0d1117]">
                <div className="border-r border-[#d0d7de] bg-[#f6f8fa] px-4 py-2 font-mono text-xs font-semibold text-[#24292f] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#c9d1d9]">
                  authorize-with-qentrah.ts
                </div>
                <div className="hidden px-4 py-2 font-mono text-xs text-[#57606a] dark:text-[#8b949e] sm:block">oauth-callback.ts</div>
              </div>
              <div className="grid grid-cols-[44px_minmax(0,1fr)] bg-[#ffffff] dark:bg-[#0d1117]">
                <div className="select-none border-r border-[#d0d7de] bg-[#f6f8fa] py-5 text-right font-mono text-xs leading-6 text-[#8c959f] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#6e7681]">
                  {Array.from({ length: 9 }, (_, index) => (
                    <div key={index} className="pr-3">{index + 1}</div>
                  ))}
                </div>
                <div aria-label="Light mode TypeScript OAuth example" className="overflow-auto bg-[#ffffff] text-[#24292f] dark:hidden [&_pre]:bg-transparent [&_pre]:font-mono [&_pre]:text-xs" dangerouslySetInnerHTML={{ __html: highlightedHeroCodeLight }} />
                <div aria-label="Dark mode TypeScript OAuth example" className="hidden overflow-auto bg-[#0d1117] text-[#c9d1d9] dark:block [&_pre]:bg-transparent [&_pre]:font-mono [&_pre]:text-xs" dangerouslySetInnerHTML={{ __html: highlightedHeroCodeDark }} />
              </div>
              <div className="flex items-center justify-between border-t border-[#d0d7de] bg-[#f6f8fa] px-4 py-2 text-[11px] font-semibold text-[#57606a] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e]">
                <span>TypeScript</span>
                <span>reviewed OAuth flow</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {partnerSteps.map(([label, text]) => (
                <div key={label} className="rounded-[10px] border border-border bg-card p-4">
                  <p className="text-sm font-bold text-foreground">{label}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="partner-overview" className="px-5 py-14">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase text-primary">Integration examples</p>
            <h2 id="partner-overview" className="mt-3 text-3xl font-bold leading-tight text-foreground md:text-4xl">Five building blocks for a reviewed partner app.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              Each section pairs plain text with a small code example, so developers can see how permissions, webhooks, MCP, clean data, and review fit together.
            </p>
          </div>

          <div className="space-y-6">
            {integrationExamples.map(({ icon: Icon, eyebrow, title, description, bullets, code }, index) => {
              const reverse = index % 2 === 1;
              const highlightedCode = highlightedIntegrationExamples[index];
              return (
                <article key={title} className="grid items-stretch gap-4 lg:grid-cols-2">
                  <div className={`rounded-[14px] border border-border bg-card p-6 md:p-7 ${reverse ? "lg:order-2" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                        <Icon aria-hidden="true" className="size-5" />
                      </div>
                      <div className="flex min-w-0 items-center gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase text-primary">{eyebrow}</p>
                          <p className="text-xs font-semibold text-muted-foreground">Example {index + 1}</p>
                        </div>
                      </div>
                    </div>
                    <h3 className="mt-6 text-2xl font-bold leading-tight text-foreground">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
                    <div className="mt-5 grid gap-2 sm:grid-cols-3">
                      {bullets.map((item) => (
                        <div key={item} className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-bold text-foreground">
                          <CheckCircle2 aria-hidden="true" className="size-3.5 shrink-0 text-primary" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`code-zone-shadow overflow-hidden rounded-[14px] border border-[#d0d7de] bg-[#ffffff] dark:border-[#30363d] dark:bg-[#0d1117] ${reverse ? "lg:order-1" : ""}`}>
                    <div className="flex items-center justify-between border-b border-[#d0d7de] bg-[#f6f8fa] px-4 py-3 dark:border-[#30363d] dark:bg-[#161b22]">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
                          <span className="size-3 rounded-full bg-[#ff5f56]" />
                          <span className="size-3 rounded-full bg-[#ffbd2e]" />
                          <span className="size-3 rounded-full bg-[#27c93f]" />
                        </div>
                        <span className="truncate font-mono text-xs font-semibold text-[#57606a] dark:text-[#8b949e]">{eyebrow.toLowerCase()}.ts</span>
                      </div>
                      <span className="rounded-[6px] border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary dark:border-[#1f6feb]/50 dark:bg-[#1f6feb]/15 dark:text-[#58a6ff]">syntax</span>
                    </div>
                    <div className="flex border-b border-[#d0d7de] bg-[#ffffff] dark:border-[#30363d] dark:bg-[#0d1117]">
                      <div className="border-r border-[#d0d7de] bg-[#f6f8fa] px-4 py-2 font-mono text-xs font-semibold text-[#24292f] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#c9d1d9]">
                        {eyebrow.toLowerCase()}.ts
                      </div>
                      <div className="hidden px-4 py-2 font-mono text-xs text-[#57606a] dark:text-[#8b949e] sm:block">review-notes.md</div>
                    </div>
                    <div className="grid grid-cols-[44px_minmax(0,1fr)] bg-[#ffffff] dark:bg-[#0d1117]">
                      <div className="select-none border-r border-[#d0d7de] bg-[#f6f8fa] py-5 text-right font-mono text-xs leading-6 text-[#8c959f] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#6e7681]">
                        {code.split("\n").map((_, lineIndex) => (
                          <div key={lineIndex} className="pr-3">{lineIndex + 1}</div>
                        ))}
                      </div>
                      <div className="overflow-auto bg-[#ffffff] text-[#24292f] dark:hidden [&_pre]:bg-transparent [&_pre]:font-mono [&_pre]:text-xs" dangerouslySetInnerHTML={{ __html: highlightedCode?.light ?? "" }} />
                      <div className="hidden overflow-auto bg-[#0d1117] text-[#c9d1d9] dark:block [&_pre]:bg-transparent [&_pre]:font-mono [&_pre]:text-xs" dangerouslySetInnerHTML={{ __html: highlightedCode?.dark ?? "" }} />
                    </div>
                    <div className="flex items-center justify-between border-t border-[#d0d7de] bg-[#f6f8fa] px-4 py-2 text-[11px] font-semibold text-[#57606a] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e]">
                      <span>TypeScript</span>
                      <span>{eyebrow.toLowerCase()} example</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-5 py-14 text-center">
        <FileCheck aria-hidden="true" className="mx-auto size-6 text-primary" />
        <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold leading-tight text-foreground">Start with one callback and a reviewed scope request.</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
          Create the draft, test locally, then submit when your authorization flow is ready for review.
        </p>
        <Link href="/signup" className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">
          Create partner account
        </Link>
      </section>
    </main>
  );
}
