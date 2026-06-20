"use client";

import { useEffect, useMemo, useState } from "react";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { listOrganizationMembers } from "@/domains/organization/api/clerk-organization-api";
import type { DocEditorMentionOption } from "@/components/shared/work-os-doc-editor";
import type { TaskRecord } from "../tasks.types";
import {
  type TaskDocumentContext,
  taskDocumentContext,
} from "../tasks.constants";

// ─── Link helpers ──────────────────────────────────────────────────────────────

function withAppPrefix(prefix: string, href: string) {
  return `${prefix}${href.startsWith("/") ? href : `/${href}`}`;
}

function clientHref(clientId: string, appPrefix = "") {
  return withAppPrefix(
    appPrefix,
    `/clients?clientId=${encodeURIComponent(clientId)}`,
  );
}

function projectHref(projectId: string, appPrefix = "") {
  return withAppPrefix(appPrefix, `/projects/${projectId}`);
}

export function taskHref(taskId: string, context?: TaskDocumentContext) {
  if (context?.scope === "project")
    return `/projects/${context.projectId}/tasks?taskId=${encodeURIComponent(taskId)}`;
  return `/tasks/${taskId}`;
}

// ─── Meeting helpers ───────────────────────────────────────────────────────────

export function meetingDateTimeFromTask(task: TaskRecord) {
  const date =
    task.dueDate || new Date().toISOString().slice(0, 10);
  return { date, time: "10:00", endTime: "10:30" };
}

// ─── Shared mention-options hook ───────────────────────────────────────────────

export function useTaskMentionOptions({
  organizationId,
  context,
  members,
  tasks,
  appPrefix = "",
}: {
  organizationId?: string;
  context?: TaskDocumentContext;
  members: WorkOsPickerOption[];
  tasks: TaskRecord[];
  appPrefix?: string;
}) {
  const clients = useClientOptionsQuery(organizationId, {
    enabled: Boolean(organizationId),
  });
  const projectsResult = useProjectOptionsQueryResult(organizationId, {
    limit: 200,
  });
  const projects = projectsResult.data;

  return useMemo<DocEditorMentionOption[]>(() => {
    const taskOptions = [...tasks]
      .sort((a, b) => {
        if (context?.scope !== "project") return 0;
        const aScoped = a.projectId === context.projectId ? 0 : 1;
        const bScoped = b.projectId === context.projectId ? 0 : 1;
        return aScoped - bScoped;
      })
      .slice(0, 40)
      .map((task) => ({
        id: task.id,
        label: task.title,
        helper:
          task.projectId &&
          context?.scope === "project" &&
          task.projectId !== context.projectId
            ? "Task · another project"
            : "Task",
        type: "task" as const,
        href: withAppPrefix(
          appPrefix,
          taskHref(
            task.id,
            taskDocumentContext(
              context?.organizationId || organizationId || "",
              context?.scope === "project" ? context.projectId : task.projectId,
              task.projectId,
            ),
          ),
        ),
      }));

    return [
      ...members.map((m) => ({
        id: m.id,
        label: m.label,
        helper: m.helper || "Member",
        type: "member" as const,
        href: withAppPrefix(
          appPrefix,
          `/team?memberId=${encodeURIComponent(m.id)}`,
        ),
      })),
      ...(clients ?? []).map((client) => ({
        id: client.id,
        label: client.name,
        helper: "Client",
        type: "client" as const,
        href: clientHref(client.id, appPrefix),
      })),
      ...(projects ?? []).map((project) => ({
        id: project.id,
        label: project.name,
        helper:
          context?.scope === "project" && project.id === context.projectId
            ? "Current project"
            : "Project",
        type: "project" as const,
        href: projectHref(project.id, appPrefix),
      })),
      ...taskOptions,
    ];
  }, [appPrefix, clients, context, members, organizationId, projects, tasks]);
}

// ─── Shared member-options hook ───────────────────────────────────────────────

export function useMemberOptions(
  organizationId?: string,
  currentUser?: { id: string; name: string; email: string },
) {
  const [members, setMembers] = useState<WorkOsPickerOption[]>([]);
  useEffect(() => {
    if (!organizationId) return;
    let active = true;
    listOrganizationMembers(organizationId)
      .then((list) => {
        if (!active) return;
        const mapped = list.map((m) => ({
          id: m.userId,
          label: m.user?.name || m.user?.email || m.userId,
          helper: m.user?.email || m.role,
        }));
        if (currentUser?.id && !mapped.some((m) => m.id === currentUser.id)) {
          mapped.unshift({
            id: currentUser.id,
            label: `${currentUser.name || currentUser.email || "Me"} (me)`,
            helper: currentUser.email || "You",
          });
        }
        setMembers(mapped);
      })
      .catch(() => {
        if (active) setMembers([]);
      });
    return () => {
      active = false;
    };
  }, [currentUser?.email, currentUser?.id, currentUser?.name, organizationId]);
  return members;
}
