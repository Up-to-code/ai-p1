import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, FileCheck, KeyRound, ShieldCheck, TerminalSquare, Workflow } from "lucide-react";
import { codeToHtml } from "shiki";
import { brandLabel, brandRoutePath } from "@qentrah/brand-identity";

const brand = brandLabel("en");
const oauthCallbackPath = brandRoutePath("oauthCallback");

const heroCode = `const qentrah = createPartnerConsole({
  clientId: "partners_client_...",
  redirectUri: "https://app.example.com${oauthCallbackPath}",
  scopes: ["organization:read", "client:read"],
  reviewMode: "production",
});

await qentrah.authorizeWorkspace();`;

const feed = [
  ["draft.created", "Add callback, scopes, and app URL"],
  ["review.pending", "Security team checks least-privilege access"],
  ["runtime.synced", "OAuth client projected into Workspace"],
];

const rail = ["Public PKCE or confidential clients", "Scoped organization APIs", "Server-side token handling", "Review notes and lifecycle"];

export default async function LandingPage() {
  const highlightedHeroCode = await codeToHtml(heroCode, {
    lang: "typescript",
    theme: "github-dark-default",
    transformers: [
      {
        pre(node) {
          node.properties.style = "";
          node.properties.class = "m-0 min-w-max bg-transparent p-5 text-xs leading-6";
        },
        code(node) {
          node.properties.class = "font-mono";
        },
      },
    ],
  });

  return (
    <main>
      <section className="border-b border-border px-5 py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[244px_minmax(0,1fr)_300px]">
          <aside className="hidden border-r border-border pr-5 lg:block">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Partner OS</p>
            <div className="mt-5 space-y-2 text-[13px] font-semibold text-muted-foreground">
              {["My Feed", "OAuth Apps", "Review Queue", "Runtime Sync", "Settings"].map((item, index) => (
                <div key={item} className={index === 0 ? "rounded-[6px] bg-primary/12 px-3 py-2 text-primary" : "px-3 py-2"}>
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="command-strip flex items-center gap-2 px-3 py-2">
              <TerminalSquare className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs text-muted-foreground">/partners/create-reviewed-app</span>
            </div>
            <div className="mt-5">
              <p className="text-xs font-bold uppercase text-primary">Qentrah Partners</p>
              <h1 className="mt-3 max-w-4xl text-balance text-[42px] font-bold leading-[1.02] text-foreground md:text-[68px]">
                Build reviewed apps for {brand} workspaces.
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] font-medium leading-7 text-muted-foreground">
                Register OAuth clients, request scoped organization access, and move from local test to reviewed production launch inside one dark command deck.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/signup" className="inline-flex h-11 items-center justify-center rounded-[6px] bg-primary px-5 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90">
                  Create developer account
                </Link>
                <Link href="/docs/oauth-flow" className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] border border-border bg-card px-5 text-[13px] font-bold text-foreground transition-colors hover:bg-muted">
                  OAuth guide
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            <div className="code-zone-shadow mt-8 overflow-hidden border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground">authorize-with-qentrah.ts</span>
                <span className="rounded-[6px] border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary">review safe</span>
              </div>
              <div className="overflow-auto [&_pre]:bg-transparent [&_pre]:font-mono [&_pre]:text-xs" dangerouslySetInnerHTML={{ __html: highlightedHeroCode }} />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="command-panel p-4">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Command feed</h2>
              </div>
              <div className="mt-4 space-y-3">
                {feed.map(([event, detail]) => (
                  <div key={event} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                    <p className="font-mono text-xs text-primary">{event}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="command-panel p-4">
              <h2 className="text-sm font-bold text-foreground">Launch checklist</h2>
              <div className="mt-4 space-y-2">
                {rail.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            [KeyRound, "Create the OAuth client", "Add callback URLs, client type, and the partner app surface."],
            [ShieldCheck, "Choose small scopes", "Request only the organization data the workflow needs."],
            [FileCheck, "Submit for review", "Track notes, lifecycle, and runtime sync until launch."],
          ].map(([Icon, title, description]) => {
            const Component = Icon as typeof KeyRound;
            return (
              <article key={String(title)} className="command-panel p-5">
                <Component className="h-5 w-5 text-primary" />
                <h2 className="mt-6 text-lg font-bold text-foreground">{title as string}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description as string}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border px-5 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase text-primary">Review-ready by design</p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">Setup, permissions, and code live in one operating surface.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Developers see exactly what Qentrah needs for review: callback URLs, client type, exact scopes, and backend token handling.
            </p>
          </div>
          <div className="command-panel divide-y divide-border">
            {[
              ["Redirect URI", "HTTPS callback or localhost for development"],
              ["Scopes", "Start read-only, add write access only when necessary"],
              ["Token storage", "Exchange and refresh tokens on your backend"],
              ["Runtime sync", "Approved apps are projected into Workspace authorization"],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-2 p-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                <p className="text-sm font-bold text-foreground">{label}</p>
                <p className="text-sm leading-6 text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-5 py-14 text-center">
        <h2 className="text-3xl font-bold text-foreground">Start with one callback and three scopes.</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
          Create the draft, test locally, then submit when your authorization flow is ready for review.
        </p>
        <Link href="/signup" className="mt-7 inline-flex h-11 items-center justify-center rounded-[6px] bg-primary px-5 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90">
          Create your first app
        </Link>
      </section>
    </main>
  );
}
