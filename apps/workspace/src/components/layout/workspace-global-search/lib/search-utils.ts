import { Building2, ListTodo, Paperclip, UserRound } from "lucide-react";
import type { HydratedSearchResult } from "@qentrah/domain-contracts";
import type { Client } from "@/domains/clients/store/clients.types";
import type { Project } from "@/domains/projects/store/projects.types";
import type { GlobalSearchNavigationAction, GlobalSearchResult } from "../config/search-navigation.config";

export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

export function matchesNavigationAction(action: GlobalSearchNavigationAction, query: string) {
  if (!query) return true;
  return normalizeSearchText(action.label).includes(query) || normalizeSearchText(action.id).includes(query);
}

export function toProjectSearchResult(project: Project): GlobalSearchResult {
  return {
    id: `project:${project.id}`,
    type: "project",
    title: project.name,
    description: [project.reference, project.status].filter(Boolean).join(" · "),
    href: `/projects/${project.id}`,
    icon: Building2,
  };
}

export function toClientSearchResult(client: Client): GlobalSearchResult {
  return {
    id: `client:${client.id}`,
    type: "client",
    title: client.name,
    description: [client.contact || client.phone, client.assetInterest, client.pipelineStage]
      .filter(Boolean)
      .join(" · "),
    href: `/clients/${client.id}`,
    icon: UserRound,
  };
}

export function toAuthorizedSearchResult(result: HydratedSearchResult): GlobalSearchResult | null {
  if (result.resourceType !== "project" && result.resourceType !== "task" && result.resourceType !== "attachment") return null;
  return {
    id: `${result.resourceType}:${result.resourceId}`,
    type: result.resourceType === "attachment" ? "document" : result.resourceType,
    title: result.title,
    description: result.subtitle ?? "",
    href: result.route,
    icon: result.resourceType === "task" ? ListTodo : result.resourceType === "attachment" ? Paperclip : Building2,
  };
}
