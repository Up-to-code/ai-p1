import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, Boxes, Clock3, KeyRound, PlusCircle, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/brand/StatusBadge";
import {
  clientTypeLabel,
  lifecycleCounts,
  nextStepFor,
  statusCopy,
  syncLabel,
  syncTone,
} from "@/lib/dashboard-lifecycle";
import { getToken } from "@/lib/auth-server";
import { partnerAppsRepository, type PartnerAppSummary } from "@/server/partnerApps";

export default async function DashboardPage() {
  const token = await getToken();
  if (!token) redirect("/signin?returnTo=/dashboard");

  let apps: PartnerAppSummary[] = [];
  let authError: string | null = null;

  try {
    apps = await partnerAppsRepository.list(token);
  } catch (error: any) {
    if (error.message?.includes("Tenant organization required") || error.data?.message?.includes("Tenant organization required")) {
      authError = "You must create or join a programmer organization to build partner apps.";
    } else {
      authError = "An error occurred while loading your apps.";
      console.error("Dashboard fetch error:", error);
    }
  }

  const counts = lifecycleCounts(apps);
  const reviewCount = apps.filter((app) => app.status === "pending_review").length;
  const syncedCount = apps.filter((app) => app.workspaceSyncStatus === "synced").length;

  return (
    <div className="space-y-8">
      <section className="rounded-[16px] border border-border bg-background p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-primary">Overview</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">OAuth lifecycle console</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Track app readiness, review state, and runtime sync before partners reach Qentrah workspaces.
            </p>
          </div>
          <Link
            href="/dashboard/apps/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            Create app
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[12px] border border-border bg-muted/45 p-4">
            <KeyRound className="h-4 w-4 text-primary" />
            <p className="mt-3 text-2xl font-bold text-foreground">{apps.length}</p>
            <p className="text-xs font-semibold text-muted-foreground">registered apps</p>
          </div>
          <div className="rounded-[12px] border border-border bg-muted/45 p-4">
            <Clock3 className="h-4 w-4 text-amber-600" />
            <p className="mt-3 text-2xl font-bold text-foreground">{reviewCount}</p>
            <p className="text-xs font-semibold text-muted-foreground">pending review</p>
          </div>
          <div className="rounded-[12px] border border-border bg-muted/45 p-4">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <p className="mt-3 text-2xl font-bold text-foreground">{syncedCount}</p>
            <p className="text-xs font-semibold text-muted-foreground">runtime synced</p>
          </div>
        </div>
      </section>

      {authError ? (
        <section className="rounded-[16px] border border-destructive/25 bg-destructive/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-destructive/25 bg-muted text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Programmer organization required</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{authError}</p>
            </div>
          </div>
        </section>
      ) : apps.length === 0 ? (
        <section className="command-panel rounded-[16px] p-8">
          <div className="flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-border bg-muted text-muted-foreground">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Create the first reviewed app</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Start with redirect URIs, a minimal scope set, and the partner URL. The dashboard will track review and runtime sync once the app exists.
              </p>
              <Link
                href="/dashboard/apps/new"
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <PlusCircle className="h-4 w-4" />
                Register app
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[16px] border border-border bg-background">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold text-foreground">App workflow</h2>
              <p className="text-sm text-muted-foreground">Open an app to continue setup or review.</p>
            </div>
            <div className="divide-y divide-border">
              {apps.map((app) => (
                <Link key={app.id} href={`/dashboard/apps/${app.id}`} className="group block p-5 transition-colors hover:bg-muted/50">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-bold text-foreground">{app.name}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{app.publisherName}</p>
                      <p className="mt-3 break-all font-mono text-xs text-muted-foreground">{app.clientId ?? "client_id pending"}</p>
                    </div>
                    <div className="flex flex-col gap-3 xl:w-[360px]">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-foreground">{clientTypeLabel(app)}</span>
                        <span className={`rounded-full border border-border bg-muted px-2.5 py-1 ${syncTone(app)}`}>{syncLabel(app)}</span>
                        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground">{app.allowedScopes.length} scopes</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">{nextStepFor(app)}</p>
                        <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <aside className="rounded-[16px] border border-border bg-background p-5">
            <h2 className="text-lg font-bold text-foreground">Lifecycle</h2>
            <div className="mt-4 space-y-3">
              {counts.map(({ status, count }) => {
                const copy = statusCopy(status);
                return (
                  <div key={status} className="flex items-center justify-between gap-3 rounded-[10px] bg-muted/45 px-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">{copy.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{copy.description}</p>
                    </div>
                    <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-background px-2 text-sm font-bold text-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}
