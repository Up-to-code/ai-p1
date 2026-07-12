"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Bot, Copy, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { useAuthSession } from "@/domains/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const endpoint = process.env.NEXT_PUBLIC_MCP_RESOURCE_URL ?? "https://mcp.qentrah.com/mcp";

function scopeLabel(scope: { type: string; spaceIds?: unknown[]; projectIds?: unknown[] }) {
  if (scope.type === "space") return `${scope.spaceIds?.length ?? 0} spaces`;
  if (scope.type === "project") return `${scope.projectIds?.length ?? 0} projects`;
  return "Entire organization";
}

export function PersonalMcpScreen() {
  const session = useAuthSession();
  const { toast } = useToast();
  const organizationId = session.organization.id ?? "";
  const grants = useQuery(api.mcp.oauthGrants.listMine, organizationId ? { organizationId } : "skip");
  const revoke = useMutation(api.mcp.oauthGrants.revoke);

  async function copyEndpoint() {
    await navigator.clipboard.writeText(endpoint);
    toast({ title: "Secure MCP URL copied", description: "Your agent will open Qentrah OAuth approval when it connects.", type: "success" });
  }

  async function revokeGrant(grantId: string) {
    try {
      await revoke({ grantId: grantId as Id<"mcpOAuthGrants"> });
      toast({ title: "Agent access revoked", description: "The grant is blocked immediately.", type: "success" });
    } catch (error) {
      toast({ title: "Could not revoke access", description: error instanceof Error ? error.message : "Try again.", type: "error" });
    }
  }

  return (
    <main className="h-[calc(100dvh-4rem)] min-h-0 overflow-y-auto bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6 pb-10">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Personal</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">OAuth MCP connections</h1>
          </div>
          <Button onClick={() => void copyEndpoint()} className="rounded-lg">
            <Copy className="me-2 h-4 w-4" />Copy secure URL
          </Button>
        </header>

        <section className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm text-foreground">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">No secrets in URLs</p>
              <p className="mt-1 text-muted-foreground">Connect your agent to <code className="rounded bg-background px-1.5 py-0.5">{endpoint}</code>. Qentrah will ask you to choose the organization, scope, permissions, and expiry.</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3"><h2 className="font-semibold">Approved agents</h2></div>
          {grants === undefined ? (
            <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading connections</div>
          ) : grants.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">No OAuth agents have been approved yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {grants.map((grant) => (
                <article key={grant.id} className="flex flex-col justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted"><Bot className="h-4 w-4" /></span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{grant.clientName}</p>
                      <p className="text-xs text-muted-foreground">{scopeLabel(grant.scope)} · {grant.permissions.reduce((total, permission) => total + permission.actions.length, 0)} permissions · expires {new Date(grant.expiresAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {grant.status === "active" ? (
                    <Button variant="outline" size="sm" onClick={() => void revokeGrant(grant.id)}><Trash2 className="me-2 h-3.5 w-3.5" />Revoke</Button>
                  ) : <span className="text-xs font-medium text-muted-foreground">Revoked</span>}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
