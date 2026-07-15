import type { AutomationNodeData } from "./types";

export type AutomationGroup = "Tasks" | "Documents" | "Clients" | "Integrations" | "Lifecycle";
export type AutomationIconName = "play" | "webhook" | "task" | "document" | "client";

export type AutomationComponentDefinition = {
  id: AutomationNodeData["type"];
  group: AutomationGroup;
  kind: AutomationNodeData["kind"];
  label: string;
  description: string;
  icon: AutomationIconName;
  defaultConfig: Record<string, string>;
};

export const automationComponents: AutomationComponentDefinition[] = [
  { id: "manual", group: "Integrations", kind: "trigger", label: "Run manually", description: "Start from the Qentrah editor.", icon: "play", defaultConfig: {} },
  { id: "webhook", group: "Integrations", kind: "trigger", label: "Incoming webhook", description: "Start from Zapier, Make, or another app.", icon: "webhook", defaultConfig: {} },
  { id: "domain_event", group: "Lifecycle", kind: "trigger", label: "Domain event", description: "Start from an authorized CRM, delivery, resource, or finance transition.", icon: "play", defaultConfig: { eventType: "engagement.activated" } },
  { id: "update_task", group: "Tasks", kind: "action", label: "Update task", description: "Change a task status using a fixed ID or trigger payload.", icon: "task", defaultConfig: { status: "in_progress" } },
  { id: "create_task", group: "Tasks", kind: "action", label: "Create task", description: "Create a new task with a title, status, and priority.", icon: "task", defaultConfig: { title: "Follow up", status: "todo", priority: "normal" } },
  { id: "create_document", group: "Documents", kind: "action", label: "Create document", description: "Create a workspace document from an incoming workflow.", icon: "document", defaultConfig: { title: "New document" } },
  { id: "update_client", group: "Clients", kind: "action", label: "Update client", description: "Change a client status from a fixed ID or payload.", icon: "client", defaultConfig: { status: "active" } },
];

export type AutomationTemplate = {
  id: string;
  group: AutomationGroup;
  name: string;
  description: string;
  icon: AutomationIconName;
  trigger: "manual" | "webhook";
  action: "update_task" | "create_task" | "create_document" | "update_client";
};

export const automationTemplates: AutomationTemplate[] = [
  { id: "task-status-webhook", group: "Tasks", name: "Update task from Zapier", description: "Receive a task ID and move it to a chosen status.", icon: "task", trigger: "webhook", action: "update_task" },
  { id: "task-follow-up", group: "Tasks", name: "Create a follow-up task", description: "Create a standard follow-up task whenever the webhook runs.", icon: "task", trigger: "webhook", action: "create_task" },
  { id: "document-intake", group: "Documents", name: "Create an intake document", description: "Turn a webhook event into a new workspace document.", icon: "document", trigger: "webhook", action: "create_document" },
  { id: "client-stage", group: "Clients", name: "Update client from Zapier", description: "Receive a client ID and update its lifecycle status.", icon: "client", trigger: "webhook", action: "update_client" },
  { id: "blank-manual", group: "Integrations", name: "Blank manual workflow", description: "Start with a manual trigger and choose your own actions.", icon: "play", trigger: "manual", action: "update_task" },
];

export function componentById(id: AutomationNodeData["type"]) {
  return automationComponents.find((component) => component.id === id);
}
