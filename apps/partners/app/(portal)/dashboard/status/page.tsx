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
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase text-primary">Status</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Review overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track every app from draft through production approval.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statuses.map((status) => {
          const matches = apps.filter((app: any) => app.status === status);
          return (
            <div key={status} className="rounded-[15px] border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground capitalize">{getStatusLabel(status)}</span>
                <StatusBadge status={status} />
              </div>
              <p className="text-3xl font-bold text-foreground">{matches.length}</p>
              <div className="mt-4 space-y-2">
                {matches.slice(0, 4).map((app: any) => (
                  <Link key={app.id} href={`/dashboard/apps/${app.id}`} className="block rounded-[7px] border border-border bg-background p-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
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
