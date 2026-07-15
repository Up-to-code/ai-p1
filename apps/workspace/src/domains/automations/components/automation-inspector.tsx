"use client";

import type { Node } from "@xyflow/react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AutomationNodeData, AutomationRecord } from "../types";

type Props = {
  node: Node<AutomationNodeData> | null;
  workflow: AutomationRecord | null;
  onChange: (patch: Partial<AutomationNodeData>) => void;
};

export function AutomationInspector({ node, workflow, onChange }: Props) {
  if (!node) {
    return (
      <aside className="flex w-72 shrink-0 items-center justify-center border-l bg-card p-6 text-center text-xs text-muted-foreground">
        Select a trigger or action to configure it.
      </aside>
    );
  }

  const setConfig = (key: string, value: string) =>
    onChange({ config: { ...node.data.config, [key]: value } });
  const webhookUrl = `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "https://YOUR_DEPLOYMENT.convex.site"}/automation-webhook/${workflow?.webhookToken ?? "TOKEN"}`;

  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-l bg-card p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Configure {node.data.kind}</p>
      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="step-label">Step name</Label>
          <Input id="step-label" value={node.data.label} onChange={(event) => onChange({ label: event.target.value })} />
        </div>
        {node.data.kind === "trigger" && (
          <div className="space-y-1.5">
            <Label htmlFor="trigger-type">Trigger type</Label>
            <select
              id="trigger-type"
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={node.data.type}
              onChange={(event) => onChange({ type: event.target.value as "manual" | "webhook" | "domain_event", label: event.target.value === "webhook" ? "Incoming webhook" : event.target.value === "domain_event" ? "Domain event" : "Run manually" })}
            >
              <option value="manual">Manual</option>
              <option value="webhook">Webhook (Zapier)</option>
              <option value="domain_event">Domain event</option>
            </select>
          </div>
        )}
        {node.data.type === "domain_event" && (
          <div className="space-y-1.5">
            <Label htmlFor="event-type">Canonical event type</Label>
            <Input id="event-type" value={node.data.config.eventType ?? ""} onChange={(event) => setConfig("eventType", event.target.value)} placeholder="engagement.activated" />
            <p className="text-xs text-muted-foreground">Examples: proposal.accepted, engagement.activated, deliverable.approved, change_order.approved, invoice.posted, payment.recorded.</p>
          </div>
        )}
        {node.data.type === "webhook" && (
          <div className="space-y-1.5">
            <Label>Webhook URL</Label>
            <div className="rounded-lg border bg-muted p-2.5 font-mono text-[10px] break-all">{webhookUrl}</div>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(webhookUrl)}>
              <Copy className="h-3.5 w-3.5" /> Copy for Zapier
            </Button>
            <p className="text-xs text-muted-foreground">Send JSON such as <code>{`{"taskId":"..."}`}</code>.</p>
          </div>
        )}
        {node.data.type === "update_task" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="task-id">Task ID (optional for webhook)</Label>
              <Input id="task-id" value={node.data.config.taskId ?? ""} onChange={(event) => setConfig("taskId", event.target.value)} placeholder="Use payload taskId" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-status">New status</Label>
              <Input id="task-status" value={node.data.config.status ?? ""} onChange={(event) => setConfig("status", event.target.value)} placeholder="in_progress" />
            </div>
          </>
        )}
        {node.data.type === "create_task" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="new-task-title">Task title</Label>
              <Input id="new-task-title" value={node.data.config.title ?? ""} onChange={(event) => setConfig("title", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-task-status">Status</Label>
              <Input id="new-task-status" value={node.data.config.status ?? ""} onChange={(event) => setConfig("status", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-task-priority">Priority</Label>
              <select id="new-task-priority" className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={node.data.config.priority ?? "normal"} onChange={(event) => setConfig("priority", event.target.value)}>
                <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
          </>
        )}
        {node.data.type === "create_document" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="new-doc-title">Document title</Label>
              <Input id="new-doc-title" value={node.data.config.title ?? ""} onChange={(event) => setConfig("title", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-doc-content">Starting content</Label>
              <textarea id="new-doc-content" className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" value={node.data.config.content ?? ""} onChange={(event) => setConfig("content", event.target.value)} />
            </div>
          </>
        )}
        {node.data.type === "update_client" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="client-id">Client ID (optional for webhook)</Label>
              <Input id="client-id" value={node.data.config.clientId ?? ""} onChange={(event) => setConfig("clientId", event.target.value)} placeholder="Use payload clientId" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-status">New status</Label>
              <select id="client-status" className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={node.data.config.status ?? "active"} onChange={(event) => setConfig("status", event.target.value)}>
                <option value="new">New</option><option value="active">Active</option><option value="nurture">Nurture</option><option value="inactive">Inactive</option><option value="archived">Archived</option>
              </select>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
