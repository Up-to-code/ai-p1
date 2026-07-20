"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useOrganizationContext } from "@/domains/auth/organization-context";
import { logger } from "@/lib/logger";

const runViews = ["active-runs", "failures", "history"];

export function AutomationOperations({ view }: { view: string }) {
  const locale = useLocale();
  const organization = useOrganizationContext();
  const organizationId = organization.id;
  const requestedStatus = view === "failures" ? ("failed" as const) : undefined;
  const queriedRuns = useQuery(
    api.automations.read.organizationRuns,
    organizationId && runViews.includes(view)
      ? { organizationId, status: requestedStatus }
      : "skip",
  );
  const runs =
    view === "active-runs"
      ? queriedRuns?.filter((run) =>
          ["queued", "running", "pending_approval"].includes(run.status),
        )
      : queriedRuns;
  const approvals = useQuery(
    api.automations.read.pendingApprovals,
    organizationId && view === "approvals" ? { organizationId } : "skip",
  );
  const workflows = useQuery(
    api.automations.read.list,
    organizationId && ["webhooks", "usage"].includes(view)
      ? { organizationId }
      : "skip",
  );
  const connections = useQuery(
    api.automationConnections.read.listMine,
    organizationId && view === "connections" ? { organizationId } : "skip",
  );
  const decide = useMutation(api.automations.execute.decideApproval);
  const cancel = useMutation(api.automations.runState.cancel);

  function decision(
    approvalId: Id<"automationApprovals">,
    value: "approve" | "reject",
  ) {
    if (!organizationId) return;
    void decide({
      organizationId,
      approvalId,
      decision: value,
    }).catch((error) => logger.error("automation.approval_failed", { error }));
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-background px-5 py-6">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
            Automation operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold capitalize">
            {view.replaceAll("-", " ")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Durable runs, approvals, provider connections, and audit history are
            scoped to you inside the active Organization.
          </p>
        </header>

        {runs && (
          <section className="mt-6 rounded-xl border bg-card p-4">
            {runs.length ? (
              <div className="divide-y">
                {runs.map((run) => (
                  <div key={run._id} className="flex items-center gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {run.status.replaceAll("_", " ")} · {run.source}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {run.message} ·{" "}
                        {new Date(run.startedAt).toLocaleString()}
                      </p>
                    </div>
                    {["queued", "running", "pending_approval"].includes(
                      run.status,
                    ) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (!organizationId) return;
                          void cancel({
                            organizationId,
                            runId: run._id,
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No runs match this view.
              </p>
            )}
          </section>
        )}

        {approvals && (
          <section className="mt-6 rounded-xl border bg-card p-4">
            {approvals.length ? (
              <div className="divide-y">
                {approvals.map((approval) => (
                  <div
                    key={approval.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {approval.actionType.replaceAll("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested{" "}
                        {new Date(approval.requestedAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => decision(approval.id, "reject")}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => decision(approval.id, "approve")}
                    >
                      Approve
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No sensitive actions are waiting for approval.
              </p>
            )}
          </section>
        )}

        {view === "webhooks" && workflows && (
          <section className="mt-6 rounded-xl border bg-card p-4">
            <div className="divide-y">
              {workflows
                .filter((flow) =>
                  flow.nodes.some((node) => node.type === "webhook"),
                )
                .map((flow) => (
                  <div key={flow._id} className="py-3">
                    <p className="text-sm font-medium">{flow.name}</p>
                    <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                      {process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/automation-webhook/
                      {flow.webhookToken}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Send a stable <code>Idempotency-Key</code> header when
                      retrying a delivery.
                    </p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {view === "connections" && connections && (
          <section className="mt-6 rounded-xl border bg-card p-4">
            {connections.length ? (
              <div className="divide-y">
                {connections.map((connection) => (
                  <div key={connection.id} className="py-3">
                    <p className="text-sm font-medium">{connection.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {connection.provider.replaceAll("_", " ")} ·{" "}
                      {connection.status}
                      {connection.lastUsedAt
                        ? ` · last used ${new Date(connection.lastUsedAt).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No automation connections yet.
              </p>
            )}
            <WorkspaceLink
              href={`/${locale}/automations`}
              className="mt-3 inline-block text-sm font-semibold text-primary"
            >
              Open a workflow to add or replace a connection
            </WorkspaceLink>
          </section>
        )}

        {view === "usage" && workflows && (
          <section className="mt-6 rounded-xl border bg-card p-4">
            <p className="text-3xl font-semibold">
              {workflows
                .reduce((sum, flow) => sum + flow.runCount, 0)
                .toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Successfully completed automation runs
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
