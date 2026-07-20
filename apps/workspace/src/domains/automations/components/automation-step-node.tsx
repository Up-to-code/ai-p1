"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Bot, CalendarClock, FileText, ListChecks, MessageCircle, Play, Sheet, UserRound, Webhook, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AutomationNodeData } from "../types";

type AutomationCanvasNode = Node<AutomationNodeData, "automationStep">;

export function AutomationStepNode({ data, selected }: NodeProps<AutomationCanvasNode>) {
  const Icon = data.type === "webhook"
    ? Webhook
    : data.type === "schedule"
      ? CalendarClock
    : data.type === "google_sheets"
      ? Sheet
    : data.type === "agent"
      ? Bot
    : data.type === "whatsapp_message"
      ? MessageCircle
    : data.kind === "trigger"
      ? Play
      : data.type.includes("document")
        ? FileText
        : data.type.includes("client")
          ? UserRound
          : data.type.includes("task")
            ? ListChecks
            : Workflow;
  const summary = data.type === "webhook"
    ? "POST from Zapier or another app"
    : data.type === "schedule"
      ? `Every ${data.config.intervalMinutes || "…"} minutes`
    : data.type === "google_sheets"
      ? data.config.range || "Choose a spreadsheet range"
    : data.type === "agent"
      ? data.config.agentId ? "Published custom agent" : "Select a published agent"
    : data.type === "whatsapp_message"
      ? data.config.to || "Choose a WhatsApp recipient"
    : data.type === "manual"
      ? "Run from Qentrah"
      : data.type === "update_task"
        ? `Set status to ${data.config.status || "…"}`
        : data.type === "create_task"
          ? `Create “${data.config.title || "task"}”`
          : data.type === "create_document"
            ? `Create “${data.config.title || "document"}”`
            : data.type === "update_client"
              ? `Set client to ${data.config.status || "…"}`
              : "Configure this step";
  return (
    <div
      className={cn(
        "w-56 rounded-xl border bg-card p-3 text-card-foreground shadow-sm transition",
        selected ? "border-primary ring-2 ring-primary/10" : "border-border",
      )}
    >
      {data.kind === "action" && <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !border-card !bg-primary" />}
      <div className="mb-2.5 flex items-center gap-2.5">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", data.kind === "trigger" ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary")}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{data.kind}</p>
          <p className="truncate text-[13px] font-semibold">{data.label}</p>
        </div>
      </div>
      <p className="truncate rounded-md bg-muted px-2.5 py-1.5 text-[11px] text-muted-foreground">
        {summary}
      </p>
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-2 !border-card !bg-primary" />
    </div>
  );
}
