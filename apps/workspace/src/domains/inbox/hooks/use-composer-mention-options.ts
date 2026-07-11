"use client";

import { useEffect, useMemo, useState } from "react";
import { listOrganizationMembers } from "@/domains/organization/api";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useDocsQuery } from "@/domains/docs/api/docs";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import { useOpportunitiesQuery } from "@/domains/opportunities/api/opportunities";

export function useComposerMentionOptions(organizationId?: string) {
  const [people, setPeople] = useState<Array<{ id: string; label: string; helper?: string }>>([]);

  useEffect(() => {
    if (!organizationId) {
      setPeople([]);
      return;
    }
    let active = true;
    listOrganizationMembers(organizationId).then((members) => {
      if (!active) return;
      setPeople(members.map((member) => ({
        id: member.userId,
        label: member.user?.name || member.user?.email || member.userId,
        helper: member.user?.email,
      })));
    }).catch(() => {
      if (active) setPeople([]);
    });
    return () => { active = false; };
  }, [organizationId]);

  const tasks = useTasksQuery(organizationId ?? "", { status: "all" }).data ?? [];
  const docs = useDocsQuery(organizationId ?? "").data ?? [];
  const projects = useProjectsIndexQuery(organizationId ?? "")?.results ?? [];
  const clients = useClientsIndexQuery(organizationId ?? "")?.results ?? [];
  const dealsResult = useOpportunitiesQuery(organizationId ?? "");
  const deals = Array.isArray(dealsResult) ? dealsResult : [];

  return useMemo(() => [
    { id: "ai-draw", label: "qentrah", helper: "Ask the AI assistant", type: "ai" },
    ...people.map((item) => ({ ...item, type: "user" })),
    ...tasks.map((item) => ({ id: item.id, label: item.title, helper: item.status, type: "task" })),
    ...docs.map((item) => ({ id: item.id, label: item.title, helper: "Document", type: "document" })),
    ...projects.map((item) => ({ id: item.id, label: item.name, helper: item.status, type: "project" })),
    ...clients.map((item) => ({ id: item.id, label: item.name, helper: item.pipelineStage, type: "client" })),
    ...deals.map((item) => ({ id: item.id, label: item.title, helper: item.stage, type: "deal" })),
  ], [clients, deals, docs, people, projects, tasks]);
}
