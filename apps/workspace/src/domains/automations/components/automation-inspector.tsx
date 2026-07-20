"use client";

import { useState } from "react";
import type { Node } from "@xyflow/react";
import { Bot, Copy, ExternalLink, PlugZap } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AutomationNodeData, AutomationRecord } from "../types";
import { AutomationConnectionDialog } from "./automation-connection-dialog";
import {
  type AutomationConnectionProvider,
  useAutomationBindings,
} from "../hooks/use-automation-bindings";

type Props = {
  organizationId?: string;
  node: Node<AutomationNodeData> | null;
  workflow: AutomationRecord | null;
  onChange: (patch: Partial<AutomationNodeData>) => void;
};

export function AutomationInspector({
  organizationId,
  node,
  workflow,
  onChange,
}: Props) {
  const locale = useLocale();
  const bindings = useAutomationBindings(organizationId);
  const [connectionProvider, setConnectionProvider] =
    useState<AutomationConnectionProvider | null>(null);

  if (!node) {
    return (
      <aside className="flex w-80 shrink-0 items-center justify-center border-l bg-card p-6 text-center text-xs text-muted-foreground">
        Select a trigger or action to configure it.
      </aside>
    );
  }

  const setConfig = (key: string, value: string) =>
    onChange({ config: { ...node.data.config, [key]: value } });
  const webhookUrl = `${
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
    "https://YOUR_DEPLOYMENT.convex.site"
  }/automation-webhook/${workflow?.webhookToken ?? "TOKEN"}`;
  const connectionType =
    node.data.type === "google_sheets"
      ? "google_sheets"
      : node.data.type === "whatsapp_message"
        ? "whatsapp"
        : null;
  const connections =
    bindings.connections?.filter(
      (connection) => connection.provider === connectionType,
    ) ?? [];

  return (
    <>
      <aside className="w-80 shrink-0 overflow-y-auto border-l bg-card p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Configure {node.data.kind}
        </p>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="step-label">Step name</Label>
            <Input
              id="step-label"
              value={node.data.label}
              onChange={(event) => onChange({ label: event.target.value })}
            />
          </div>

          {node.data.kind === "trigger" && (
            <div className="space-y-1.5">
              <Label htmlFor="trigger-type">Trigger type</Label>
              <select
                id="trigger-type"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={node.data.type}
                onChange={(event) => {
                  const type = event.target.value as AutomationNodeData["type"];
                  const labels: Partial<Record<AutomationNodeData["type"], string>> = {
                    webhook: "Incoming webhook",
                    domain_event: "Domain event",
                    schedule: "Schedule",
                    manual: "Run manually",
                  };
                  onChange({
                    type,
                    label: labels[type] ?? "Trigger",
                    config:
                      type === "schedule"
                        ? { intervalMinutes: "1440" }
                        : type === "domain_event"
                          ? { eventType: "engagement.activated" }
                          : {},
                  });
                }}
              >
                <option value="manual">Manual</option>
                <option value="schedule">Schedule</option>
                <option value="webhook">Webhook</option>
                <option value="domain_event">Domain event</option>
              </select>
            </div>
          )}

          {node.data.type === "schedule" && (
            <div className="space-y-1.5">
              <Label htmlFor="schedule-interval">Run every</Label>
              <select
                id="schedule-interval"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={node.data.config.intervalMinutes ?? "1440"}
                onChange={(event) =>
                  setConfig("intervalMinutes", event.target.value)
                }
              >
                <option value="15">15 minutes</option>
                <option value="60">Hour</option>
                <option value="360">6 hours</option>
                <option value="720">12 hours</option>
                <option value="1440">Day</option>
                <option value="10080">Week</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Commission the automation to begin durable background runs.
              </p>
            </div>
          )}

          {node.data.type === "domain_event" && (
            <div className="space-y-1.5">
              <Label htmlFor="event-type">Canonical event type</Label>
              <Input
                id="event-type"
                value={node.data.config.eventType ?? ""}
                onChange={(event) => setConfig("eventType", event.target.value)}
                placeholder="engagement.activated"
              />
              <p className="text-xs text-muted-foreground">
                Examples: proposal.accepted, engagement.activated,
                deliverable.approved, change_order.approved, invoice.posted,
                payment.recorded.
              </p>
            </div>
          )}

          {node.data.type === "webhook" && (
            <div className="space-y-1.5">
              <Label>Webhook URL</Label>
              <div className="break-all rounded-lg border bg-muted p-2.5 font-mono text-[10px]">
                {webhookUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(webhookUrl)}
              >
                <Copy className="size-3.5" /> Copy webhook
              </Button>
            </div>
          )}

          {connectionType && (
            <div className="space-y-1.5">
              <Label htmlFor={`${connectionType}-connection`}>
                {connectionType === "google_sheets"
                  ? "Google Sheets connection"
                  : "WhatsApp account"}
              </Label>
              <select
                id={`${connectionType}-connection`}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={node.data.config.connectionId ?? ""}
                onChange={(event) =>
                  setConfig("connectionId", event.target.value)
                }
              >
                <option value="">Select a connection</option>
                {connections.map((connection) => (
                  <option key={connection.id} value={connection.id}>
                    {connection.label}
                    {connection.accountLabel
                      ? ` · ${connection.accountLabel}`
                      : ""}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConnectionProvider(connectionType)}
              >
                <PlugZap className="size-3.5" />
                Manage connections
              </Button>
            </div>
          )}

          {node.data.type === "google_sheets" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="spreadsheet-id">Spreadsheet ID</Label>
                <Input
                  id="spreadsheet-id"
                  value={node.data.config.spreadsheetId ?? ""}
                  onChange={(event) =>
                    setConfig("spreadsheetId", event.target.value)
                  }
                  placeholder="From the Google Sheets URL"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="spreadsheet-range">Range</Label>
                <Input
                  id="spreadsheet-range"
                  value={node.data.config.range ?? ""}
                  onChange={(event) => setConfig("range", event.target.value)}
                  placeholder="Orders!A14:Z14"
                />
                <p className="text-xs text-muted-foreground">
                  Use <code>Orders!A14:Z14</code> to read the complete order on
                  row 14.
                </p>
              </div>
            </>
          )}

          {node.data.type === "agent" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="published-agent">Published agent</Label>
                <select
                  id="published-agent"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={node.data.config.agentId ?? ""}
                  onChange={(event) => setConfig("agentId", event.target.value)}
                >
                  <option value="">Select a published agent</option>
                  {bindings.publishedAgents?.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} · r{agent.revision}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/${locale}/ai/agents/new`} />}
                >
                  <Bot className="size-3.5" />
                  Create and publish agent
                  <ExternalLink className="size-3" />
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agent-prompt">Agent prompt</Label>
                <Textarea
                  id="agent-prompt"
                  className="min-h-36"
                  value={node.data.config.prompt ?? ""}
                  onChange={(event) => setConfig("prompt", event.target.value)}
                />
                <TemplateHelp />
              </div>
            </>
          )}

          {node.data.type === "whatsapp_message" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp-to">Recipient number</Label>
                <Input
                  id="whatsapp-to"
                  value={node.data.config.to ?? ""}
                  onChange={(event) => setConfig("to", event.target.value)}
                  placeholder="+201000000000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp-message">Message</Label>
                <Textarea
                  id="whatsapp-message"
                  className="min-h-28"
                  value={node.data.config.message ?? ""}
                  onChange={(event) => setConfig("message", event.target.value)}
                />
                <TemplateHelp />
              </div>
            </>
          )}

          {node.data.type === "update_task" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="task-id">Task ID (optional)</Label>
                <Input
                  id="task-id"
                  value={node.data.config.taskId ?? ""}
                  onChange={(event) => setConfig("taskId", event.target.value)}
                  placeholder="Use payload taskId"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-status">New status</Label>
                <Input
                  id="task-status"
                  value={node.data.config.status ?? ""}
                  onChange={(event) => setConfig("status", event.target.value)}
                  placeholder="in_progress"
                />
              </div>
            </>
          )}

          {node.data.type === "create_task" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="new-task-title">Task title</Label>
                <Input
                  id="new-task-title"
                  value={node.data.config.title ?? ""}
                  onChange={(event) => setConfig("title", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-task-priority">Priority</Label>
                <select
                  id="new-task-priority"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={node.data.config.priority ?? "normal"}
                  onChange={(event) =>
                    setConfig("priority", event.target.value)
                  }
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </>
          )}

          {node.data.type === "create_document" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="new-doc-title">Document title</Label>
                <Input
                  id="new-doc-title"
                  value={node.data.config.title ?? ""}
                  onChange={(event) => setConfig("title", event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-doc-content">Starting content</Label>
                <Textarea
                  id="new-doc-content"
                  className="min-h-24"
                  value={node.data.config.content ?? ""}
                  onChange={(event) => setConfig("content", event.target.value)}
                />
              </div>
            </>
          )}

          {node.data.type === "update_client" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="client-id">Client ID (optional)</Label>
                <Input
                  id="client-id"
                  value={node.data.config.clientId ?? ""}
                  onChange={(event) => setConfig("clientId", event.target.value)}
                  placeholder="Use payload clientId"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client-status">New status</Label>
                <select
                  id="client-status"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={node.data.config.status ?? "active"}
                  onChange={(event) => setConfig("status", event.target.value)}
                >
                  <option value="new">New</option>
                  <option value="active">Active</option>
                  <option value="nurture">Nurture</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </>
          )}
        </div>
      </aside>

      {connectionProvider && (
        <AutomationConnectionDialog
          organizationId={organizationId}
          provider={connectionProvider}
          open
          onOpenChange={(open) => {
            if (!open) setConnectionProvider(null);
          }}
          onSaved={(connectionId) => setConfig("connectionId", connectionId)}
        />
      )}
    </>
  );
}

function TemplateHelp() {
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      Insert prior output with <code>{"{{steps.google_sheets}}"}</code>,{" "}
      <code>{"{{steps.agent.text}}"}</code>, or <code>{"{{last}}"}</code>.
    </p>
  );
}
