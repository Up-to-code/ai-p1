import type { Id } from "@convex/_generated/dataModel";

export type AutomationNodeKind = "trigger" | "action";
export type AutomationNodeType =
  | "manual"
  | "webhook"
  | "update_task"
  | "create_task"
  | "create_document"
  | "update_client";

export type AutomationNodeData = {
  kind: AutomationNodeKind;
  type: AutomationNodeType;
  label: string;
  config: Record<string, string>;
};

export type AutomationRecord = {
  _id: Id<"automations">;
  name: string;
  description?: string;
  enabled: boolean;
  webhookToken: string;
  nodes: Array<AutomationNodeData & { id: string; x: number; y: number }>;
  edges: Array<{ id: string; source: string; target: string }>;
  viewport?: { x: number; y: number; zoom: number };
  contentRevision?: number;
  layoutUpdatedAt?: number;
  lastRunAt?: number;
  runCount: number;
  updatedAt: number;
};

export type AutomationPersistenceStatus = "saved" | "unsaved" | "saving" | "error";
