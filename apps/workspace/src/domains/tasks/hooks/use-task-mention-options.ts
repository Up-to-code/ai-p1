"use client";

import { useEffect, useMemo, useState } from "react";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { listOrganizationMembers } from "@/domains/organization/api/members";
import type { DocEditorMentionOption } from "@/components/shared/work-os-doc-editor";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import type { TaskRecord } from "../tasks.types";
import { type TaskDocumentContext, taskDocumentContext } from "../tasks.constants";
import {
  clientTaskHref,
  memberTaskHref,
  projectTaskHref,
  taskHref,
  withAppPrefix,
} from "../lib/task-links";

/** Builds doc-editor mention options from workspace records. */
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
  const clients = useClientOptionsQuery(organizationId, { enabled: Boolean(organizationId) });
  const projectsResult = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const projects = projectsResult.data;

  return useMemo<DocEditorMentionOption[]>(() => {
    const taskOptions = [...tasks]
      .sort((left, right) => {
        if (context?.scope !== "project") return 0;
        const leftScoped = left.projectId === context.projectId ? 0 : 1;
        const rightScoped = right.projectId === context.projectId ? 0 : 1;
        return leftScoped - rightScoped;
      })
      .slice(0, 40)
      .map((task) => ({
        id: task.id,
        label: task.title,
        helper:
          task.projectId && context?.scope === "project" && task.projectId !== context.projectId
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
      ...members.map((member) => ({
        id: member.id,
        label: member.label,
        helper: member.helper || "Member",
        type: "member" as const,
        href: memberTaskHref(member.id, appPrefix),
      })),
      ...(clients ?? []).map((client) => ({
        id: client.id,
        label: client.name,
        helper: "Client",
        type: "client" as const,
        href: clientTaskHref(client.id, appPrefix),
      })),
      ...(projects ?? []).map((project) => ({
        id: project.id,
        label: project.name,
        helper:
          context?.scope === "project" && project.id === context.projectId ? "Current project" : "Project",
        type: "project" as const,
        href: projectTaskHref(project.id, appPrefix),
      })),
      ...taskOptions,
    ];
  }, [appPrefix, clients, context, members, organizationId, projects, tasks]);
}

/** Loads organization members for task assignee pickers. */
export function useMemberOptions(
  organizationId?: string,
  currentUser?: { id: string; name: string; email: string },
) {
  const currentUserOption = useMemo<WorkOsPickerOption | null>(() => {
    if (!currentUser?.id) return null;
    return {
      id: currentUser.id,
      label: "Me",
      helper: [currentUser.name, currentUser.email, "You"].filter(Boolean).join(" · "),
    };
  }, [currentUser?.email, currentUser?.id, currentUser?.name]);

  const [members, setMembers] = useState<WorkOsPickerOption[]>(() =>
    currentUserOption ? [currentUserOption] : [],
  );

  useEffect(() => {
    if (!organizationId) {
      setMembers(currentUserOption ? [currentUserOption] : []);
      return;
    }

    let active = true;
    setMembers(currentUserOption ? [currentUserOption] : []);

    listOrganizationMembers(organizationId)
      .then((list) => {
        if (!active) return;

        const seen = new Set<string>();
        const mapped: WorkOsPickerOption[] = [];

        for (const member of list) {
          const id = member.userId || member.user?.id || member.id;
          if (!id || seen.has(id)) continue;
          seen.add(id);
          const isCurrentUser = currentUser?.id === id;
          mapped.push({
            id,
            label: isCurrentUser ? "Me" : member.user?.name || member.user?.email || id,
            helper: [member.user?.email, member.role, isCurrentUser ? "You" : null].filter(Boolean).join(" · "),
          });
        }

        if (currentUserOption && !seen.has(currentUserOption.id)) {
          mapped.unshift(currentUserOption);
        } else {
          mapped.sort((left, right) => {
            if (left.id === currentUser?.id) return -1;
            if (right.id === currentUser?.id) return 1;
            return left.label.localeCompare(right.label);
          });
        }

        setMembers(mapped);
      })
      .catch(() => {
        if (active) setMembers(currentUserOption ? [currentUserOption] : []);
      });

    return () => {
      active = false;
    };
  }, [currentUser?.id, currentUserOption, organizationId]);

  return members;
}
