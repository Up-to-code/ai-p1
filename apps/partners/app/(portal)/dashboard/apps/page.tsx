import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Boxes, Plus } from "lucide-react";
import { StatusBadge } from "@/components/brand/StatusBadge";
import {
  clientTypeLabel,
  nextStepFor,
  syncLabel,
  syncTone,
} from "@/lib/dashboard-lifecycle";
import { getToken } from "@/lib/auth-server";
import { partnerAppsRepository, type PartnerAppSummary } from "@/server/partnerApps";

export default async function AppsPage() {
  const token = await getToken();
  if (!token) redirect("/signin?returnTo=/dashboard/apps");

  let apps: PartnerAppSummary[] = [];
  try {
    apps = await partnerAppsRepository.list(token);
  } catch {
    apps = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Applications</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">OAuth clients</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review configuration, credentials, sync state, and launch readiness for every partner app.
          </p>
        </div>
        <Link href="/dashboard/apps/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Create app
        </Link>
      </div>

      {apps.length === 0 ? (
        <section className="command-panel p-8">
          <div className="flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] border border-border bg-muted text-muted-foreground">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Create your first app</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Start with redirect URIs and a minimal scope set, then submit the app for review when its OAuth flow is ready.
              </p>
              <Link href="/dashboard/apps/new" className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Register app
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {apps.map((app) => (
            <Link key={app.id} href={`/dashboard/apps/${app.id}`} className="command-panel block p-5 transition-colors hover:border-primary/45 hover:bg-muted/40">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-foreground">{app.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{app.publisherName}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <p className="mt-4 break-all font-mono text-xs text-muted-foreground">{app.clientId ?? "client_id pending"}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-[999px] border border-border bg-muted px-2.5 py-1 text-foreground">{clientTypeLabel(app)}</span>
                <span className={`rounded-[999px] border border-border bg-muted px-2.5 py-1 ${syncTone(app)}`}>{syncLabel(app)}</span>
                <span className="rounded-[999px] border border-border bg-muted px-2.5 py-1 text-muted-foreground">{app.allowedScopes.length} scopes</span>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">{nextStepFor(app)}</p>
                <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
