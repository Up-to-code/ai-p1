import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Send, Settings } from "lucide-react";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { AppDetailsTabs } from "@/components/portal/AppDetailsTabs";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth-server";
import { canEditPartnerApp } from "@/lib/navigation";
import { ensureSandboxAction, submitPartnerAppForReviewAction } from "@/app/(portal)/dashboard/actions";
import { partnerAppsRepository } from "@/server/partnerApps";
import { sandboxRepository } from "@/server/sandbox";
import type { PartnerAppSummary } from "@/server/partnerApps";

function lifecycleGuidance(app: PartnerAppSummary) {
  if (app.status === "draft") return "Draft apps are editable. Submit when redirect URIs, scopes, and partner URL are production-ready.";
  if (app.workspaceSyncStatus === "failed") return "The app is reviewed in Partners, but its Better Auth OAuth runtime projection failed. Admin approval will retry it.";
  if (app.status === "pending_review") return "Submission is waiting for Admin review in Partners.";
  if (app.status === "active") return "Approved apps can appear in Workspace Integrations and complete OAuth authorization.";
  if (app.status === "rejected") return "Update the requested fields, then resubmit for review.";
  if (app.status === "suspended") return "Workspace authorization is blocked until Admin changes the review status.";
  return "The app lifecycle is updating.";
}

function syncState(app: PartnerAppSummary) {
  if (app.workspaceSyncStatus === "synced") return "OAuth runtime synced";
  if (app.workspaceSyncStatus === "failed") return "OAuth runtime sync failed";
  if (app.workspaceSyncStatus === "pending") return "OAuth runtime sync pending";
  return "OAuth runtime not synced";
}

export default async function AppDetailsPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const token = await getToken();
  if (!token) redirect(`/signin?returnTo=${encodeURIComponent(`/dashboard/apps/${appId}`)}`);
  const app = await partnerAppsRepository.getById(token, appId);
  if (!app) notFound();
  const sandbox = await sandboxRepository.get(token, app.id).catch(() => null);

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to Apps
      </Link>

      <div className="mb-6 rounded-[15px] border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <StatusBadge status={app.status} />
            <h1 className="mt-4 text-3xl font-bold text-foreground">{app.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{app.publisherName}</p>
            <p className="mt-4 break-all font-mono text-xs text-muted-foreground">client_id: {app.clientId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEditPartnerApp(app.status) ? (
              <Link href={`/dashboard/apps/${app.id}/settings`} className="inline-flex h-9 items-center justify-center gap-2 rounded-[7px] border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            ) : null}
            {app.status === "draft" || app.status === "rejected" ? (
              <form action={submitPartnerAppForReviewAction}>
                <input type="hidden" name="appId" value={app.id} />
                <Button type="submit" className="h-9 gap-2">
                  <Send className="h-4 w-4" /> Submit for review
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </div>

      {app.workspaceSyncStatus === "failed" && app.workspaceSyncError ? (
        <div className="mb-6 rounded-[15px] border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-foreground">OAuth runtime sync failed: {app.workspaceSyncError}</p>
        </div>
      ) : null}

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-[15px] border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">Review state</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{app.status.replace("_", " ")}</p>
        </div>
        <div className="rounded-[15px] border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">OAuth runtime</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{syncState(app)}</p>
        </div>
        <div className="rounded-[15px] border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">Runtime app id</p>
          <p className="mt-2 break-all font-mono text-xs text-foreground">{app.workspacePartnerAppId ?? app.id}</p>
        </div>
      </div>

      <div className="mb-6 rounded-[15px] border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground">{lifecycleGuidance(app)}</p>
        {app.workspaceOauthClientId ? (
          <p className="mt-2 break-all font-mono text-xs text-muted-foreground">oauth_runtime_client_id: {app.workspaceOauthClientId}</p>
        ) : null}
      </div>

      {app.reviewNotes ? (
        <div className="mb-6 rounded-[15px] border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-sm font-medium text-foreground">{app.reviewNotes}</p>
        </div>
      ) : null}

      <AppDetailsTabs app={app} sandbox={sandbox} ensureSandboxAction={ensureSandboxAction} />
    </div>
  );
}
