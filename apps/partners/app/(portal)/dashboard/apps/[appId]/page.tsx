import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Send, Settings } from "lucide-react";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { AppDetailsTabs } from "@/components/portal/AppDetailsTabs";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth-server";
import { canEditPartnerApp } from "@/lib/navigation";
import { ensureSandboxAction, submitPartnerAppForReviewAction, syncPartnerAppToWorkspaceAction } from "@/app/(portal)/dashboard/actions";
import { partnerAppsRepository } from "@/server/partnerApps";
import { sandboxRepository } from "@/server/sandbox";

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
            {app.status === "pending_review" ? (
              <form action={syncPartnerAppToWorkspaceAction}>
                <input type="hidden" name="appId" value={app.id} />
                <Button type="submit" variant="outline" className="h-9 gap-2">
                  <Send className="h-4 w-4" /> Sync to admin
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </div>

      {app.workspaceSyncStatus === "failed" && app.workspaceSyncError ? (
        <div className="mb-6 rounded-[15px] border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-foreground">Workspace sync failed: {app.workspaceSyncError}</p>
        </div>
      ) : null}

      {app.reviewNotes ? (
        <div className="mb-6 rounded-[15px] border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-sm font-medium text-foreground">{app.reviewNotes}</p>
        </div>
      ) : null}

      <AppDetailsTabs app={app} sandbox={sandbox} ensureSandboxAction={ensureSandboxAction} />
    </div>
  );
}
