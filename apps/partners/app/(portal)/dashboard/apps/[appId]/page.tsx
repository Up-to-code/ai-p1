import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Send, Settings } from "lucide-react";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth-server";
import { canEditPartnerApp } from "@/lib/navigation";
import { submitPartnerAppForReviewAction, syncPartnerAppToHubAction } from "@/app/(portal)/dashboard/actions";
import { partnerAppsRepository } from "@/server/partnerApps";

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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to Apps
      </Link>

      {/* App Header */}
      <div className="rounded-xl border border-border bg-card p-8 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <StatusBadge status={app.status} />
            <h1 className="mt-4 text-2xl font-bold text-foreground tracking-tight">{app.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{app.publisherName}</p>
            <p className="mt-4 break-all font-mono text-xs text-muted-foreground">client_id: {app.clientId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEditPartnerApp(app.status) ? (
              <Link href={`/dashboard/apps/${app.id}/settings`} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors">
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
              <form action={syncPartnerAppToHubAction}>
                <input type="hidden" name="appId" value={app.id} />
                <Button type="submit" variant="outline" className="h-9 gap-2">
                  <Send className="h-4 w-4" /> Sync to admin
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </div>

      {app.hubSyncStatus === "failed" && app.hubSyncError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 mb-6">
          <p className="text-sm font-medium text-foreground">Hub sync failed: {app.hubSyncError}</p>
        </div>
      ) : null}

      {app.reviewNotes ? (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-6">
          <p className="text-sm font-medium text-foreground">{app.reviewNotes}</p>
        </div>
      ) : null}

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Redirect URIs</h3>
          <div className="space-y-2">
            {app.redirectUris.map((uri) => (
              <p key={uri} className="break-all rounded-md bg-muted/50 p-3 font-mono text-xs text-foreground">{uri}</p>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Allowed Scopes</h3>
          <div className="flex flex-wrap gap-2">
            {app.allowedScopes.map((scope) => (
              <span key={scope} className="rounded-md bg-muted/50 px-2.5 py-1 font-mono text-xs text-muted-foreground">
                {scope}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* OAuth Quick Test */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">OAuth Quick Test</h3>
        <pre className="overflow-x-auto rounded-lg bg-[#0a0a0a] p-5 text-xs leading-6 text-slate-300 font-mono">{`GET /oauth/authorize
  ?client_id=${app.clientId}
  &response_type=code
  &redirect_uri=${encodeURIComponent(app.redirectUris[0] ?? "https://partner.example.com/oauth/callback")}
  &scope=${encodeURIComponent(app.allowedScopes.join(" "))}
  &code_challenge=<pkce-challenge>
  &code_challenge_method=S256`}</pre>
      </div>
    </div>
  );
}
