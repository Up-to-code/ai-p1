import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Boxes } from "lucide-react";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { getToken } from "@/lib/auth-server";
import { partnerAppsRepository } from "@/server/partnerApps";
import type { PartnerAppSummary } from "@/server/partnerApps";

function nextStepFor(app: PartnerAppSummary) {
  if (app.status === "draft") return "Finish setup, then submit for review.";
  if (app.workspaceSyncStatus === "failed") return "OAuth runtime sync failed. Admin approval will retry it.";
  if (app.status === "pending_review") return "Submitted. Admin review happens in Partners.";
  if (app.status === "active") return "Approved and available for Workspace authorization.";
  if (app.status === "rejected") return "Review changes are required before resubmission.";
  if (app.status === "suspended") return "Suspended. Workspace authorization is blocked.";
  return "Review lifecycle state is updating.";
}

function syncLabel(app: PartnerAppSummary) {
  if (app.workspaceSyncStatus === "synced") return "OAuth runtime synced";
  if (app.workspaceSyncStatus === "failed") return "Runtime sync failed";
  if (app.workspaceSyncStatus === "pending") return "Runtime sync pending";
  return "Runtime not synced";
}

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
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-primary">Applications</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">OAuth clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">OAuth clients registered for Qentrah organization access.</p>
        </div>
        <Link href="/dashboard/apps/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#6b90e6]">
          <Plus className="h-4 w-4" /> Create app
        </Link>
      </div>

      {apps.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[15px] border border-border bg-card p-8 text-center">
          <Boxes className="h-8 w-8 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">Create your first app</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">Start with redirect URIs and a minimal scope set, then submit the app for review.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {apps.map((app: PartnerAppSummary) => (
            <div key={app.id} className="rounded-[15px] border border-border bg-card p-6 transition-colors hover:border-primary/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{app.name}</h3>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{app.clientId}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{app.publisherName}</p>
              <div className="mt-4 rounded-[7px] border border-border bg-background px-3 py-2">
                <p className="text-xs font-semibold text-foreground">{syncLabel(app)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{nextStepFor(app)}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {app.allowedScopes.slice(0, 4).map((scope: string) => (
                  <span key={scope} className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-xs text-muted-foreground">
                    {scope}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <Link href={`/dashboard/apps/${app.id}`} className="inline-flex h-9 items-center rounded-[7px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#6b90e6]">
                  View details
                </Link>
                <Link href={`/dashboard/apps/${app.id}/settings`} className="inline-flex h-9 items-center rounded-[7px] border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
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
