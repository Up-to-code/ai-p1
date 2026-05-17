import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowRight, CheckCircle2, Clock3, ListChecks, ShieldAlert } from "lucide-react";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { lifecycleStatuses, nextStepFor, statusCopy, syncLabel, syncTone } from "@/lib/dashboard-lifecycle";
import { getToken } from "@/lib/auth-server";
import { partnerAppsRepository, type PartnerAppSummary } from "@/server/partnerApps";

export default async function StatusPage() {
  const token = await getToken();
  if (!token) redirect("/signin?returnTo=/dashboard/status");

  let apps: PartnerAppSummary[] = [];
  try {
    apps = await partnerAppsRepository.list(token);
  } catch {
    apps = [];
  }

  const appsByStatus = lifecycleStatuses.map((status) => ({
    status,
    copy: statusCopy(status),
    apps: apps.filter((app) => app.status === status),
  }));
  const attentionCount = apps.filter((app) => app.status === "pending_review" || app.status === "rejected" || app.status === "suspended").length;
  const activeCount = apps.filter((app) => app.status === "active").length;
  const failedSyncCount = apps.filter((app) => app.workspaceSyncStatus === "failed").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Status</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Lifecycle list</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review readiness, production authorization, and runtime sync in one compact queue.
          </p>
        </div>
        <Link
          href="/dashboard/apps"
          className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-[6px] border border-border bg-card px-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
        >
          Open app register
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: "Total apps", value: apps.length, icon: ListChecks, tone: "text-primary" },
          { label: "Needs attention", value: attentionCount, icon: ShieldAlert, tone: attentionCount > 0 ? "text-destructive" : "text-muted-foreground" },
          { label: "Active", value: activeCount, icon: CheckCircle2, tone: "text-emerald-500" },
          { label: "Sync failed", value: failedSyncCount, icon: Activity, tone: failedSyncCount > 0 ? "text-destructive" : "text-muted-foreground" },
        ].map((item) => (
          <div key={item.label} className="command-panel flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</p>
              <p className="mt-1 font-mono text-2xl font-bold text-foreground">{item.value}</p>
            </div>
            <item.icon className={`h-5 w-5 ${item.tone}`} />
          </div>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="command-panel min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-bold uppercase text-foreground">Review queue</h2>
              <p className="mt-1 text-xs text-muted-foreground">Grouped list mode for every lifecycle state.</p>
            </div>
            <span className="rounded-[6px] border border-border bg-muted px-2.5 py-1 font-mono text-xs font-bold text-muted-foreground">
              {apps.length} records
            </span>
          </div>
          <div className="divide-y divide-border">
            {appsByStatus.map(({ status, copy, apps: matches }) => {
              return (
                <div key={status} className="grid gap-4 p-4 lg:grid-cols-[220px_minmax(0,1fr)_120px] lg:items-start">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={status} />
                      <span className="font-mono text-xs font-bold text-primary">{matches.length}</span>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-foreground">{copy.label}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.description}</p>
                  </div>

                  <div className="min-w-0">
                    {matches.length === 0 ? (
                      <div className="rounded-[6px] border border-dashed border-border bg-muted/50 px-3 py-3 text-sm text-muted-foreground">
                        {copy.empty}
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {matches.slice(0, 4).map((app) => (
                          <Link
                            key={app.id}
                            href={`/dashboard/apps/${app.id}`}
                            className="grid gap-3 rounded-[6px] border border-border bg-muted/70 px-3 py-3 transition-colors hover:bg-accent sm:grid-cols-[minmax(0,1fr)_190px_28px] sm:items-center"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-foreground">{app.name}</p>
                              <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{app.clientId}</p>
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold ${syncTone(app)}`}>{syncLabel(app)}</p>
                              <p className="mt-1 truncate text-xs text-muted-foreground">{nextStepFor(app)}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        ))}
                        {matches.length > 4 ? (
                          <Link href="/dashboard/apps" className="text-xs font-bold text-primary hover:underline">
                            {matches.length - 4} more in {copy.label.toLowerCase()}
                          </Link>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="flex lg:justify-end">
                    <Link
                      href="/dashboard/apps"
                      className="inline-flex h-8 items-center justify-center gap-2 rounded-[6px] border border-border bg-card px-3 text-xs font-bold text-foreground transition-colors hover:bg-muted"
                    >
                      Apps
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="command-panel p-5">
            <p className="text-xs font-bold uppercase text-primary">Board health</p>
            <h2 className="mt-2 text-xl font-bold text-foreground">Keep review lanes small.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Drafts should be moving toward review, rejected apps should have a clear fix owner, and suspended apps should stay visible.
            </p>
            <div className="mt-5 space-y-2">
              {appsByStatus.map(({ status, copy, apps: matches }) => (
                <div key={status} className="flex items-center justify-between rounded-[6px] border border-border bg-muted px-3 py-2">
                  <span className="text-sm font-semibold text-foreground">{copy.label}</span>
                  <span className="font-mono text-sm font-bold text-primary">{matches.length}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="command-panel p-5">
            <div className="flex items-center gap-2 text-primary">
              <Clock3 className="h-4 w-4" />
              <p className="text-xs font-bold uppercase">Next action</p>
            </div>
            <div className="mt-4 space-y-3">
              {apps.length === 0 ? (
                <p className="rounded-[6px] border border-dashed border-border bg-muted/50 p-3 text-sm leading-6 text-muted-foreground">
                  Create an app to start the OAuth lifecycle.
                </p>
              ) : (
                apps.slice(0, 3).map((app) => (
                  <Link key={app.id} href={`/dashboard/apps/${app.id}`} className="block rounded-[6px] border border-border bg-muted p-3 transition-colors hover:bg-accent">
                    <p className="truncate text-sm font-bold text-foreground">{app.name}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{nextStepFor(app)}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
