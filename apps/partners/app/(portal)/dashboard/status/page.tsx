import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { getToken } from "@/lib/auth-server";
import { getStatusLabel } from "@/lib/navigation";
import { partnerAppsRepository, type PartnerAppStatus } from "@/server/partnerApps";

const statuses: PartnerAppStatus[] = ["draft", "pending_review", "active", "rejected", "suspended"];

export default async function StatusPage() {
  const token = await getToken();
  if (!token) redirect("/signin?returnTo=/dashboard/status");

  let apps: any[] = [];
  try {
    apps = await partnerAppsRepository.list(token);
  } catch {
    apps = [];
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Status Overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">Track every app from draft through production approval.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statuses.map((status) => {
          const matches = apps.filter((app: any) => app.status === status);
          return (
            <div key={status} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground capitalize">{getStatusLabel(status)}</span>
                <StatusBadge status={status} />
              </div>
              <p className="text-3xl font-bold text-foreground">{matches.length}</p>
              <div className="mt-4 space-y-2">
                {matches.slice(0, 4).map((app: any) => (
                  <Link key={app.id} href={`/dashboard/apps/${app.id}`} className="block rounded-md bg-muted/50 p-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    {app.name}
                  </Link>
                ))}
                {matches.length === 0 ? <p className="text-sm text-muted-foreground">No apps in this state.</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
