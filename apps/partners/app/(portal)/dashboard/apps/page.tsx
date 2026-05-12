import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Boxes } from "lucide-react";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { getToken } from "@/lib/auth-server";
import { partnerAppsRepository } from "@/server/partnerApps";

export default async function AppsPage() {
  const token = await getToken();
  if (!token) redirect("/signin?returnTo=/dashboard/apps");

  let apps: any[] = [];
  try {
    apps = await partnerAppsRepository.list(token);
  } catch {
    apps = [];
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Apps</h2>
          <p className="mt-1 text-sm text-muted-foreground">OAuth clients registered for Anan organization access.</p>
        </div>
        <Link href="/dashboard/apps/new" className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Create app
        </Link>
      </div>

      {apps.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-border bg-card/40 text-center">
          <Boxes className="h-8 w-8 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">Create your first app</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">Start with redirect URIs and a minimal scope set, then submit the app for review.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {apps.map((app: any) => (
            <div key={app.id} className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{app.name}</h3>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{app.clientId}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{app.publisherName}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {app.allowedScopes.slice(0, 4).map((scope: string) => (
                  <span key={scope} className="rounded-md bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground">
                    {scope}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <Link href={`/dashboard/apps/${app.id}`} className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  View details
                </Link>
                <Link href={`/dashboard/apps/${app.id}/settings`} className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Settings
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
