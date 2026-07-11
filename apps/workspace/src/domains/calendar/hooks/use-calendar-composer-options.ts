"use client";

import { useMemo } from "react";
import { useDocsQuery } from "@/domains/docs/api/docs";
import { useAuthSession } from "@/domains/auth";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useMemberOptions } from "@/domains/tasks/components/task-hooks";

export type CalendarRelationOption = { value: string; label: string; description?: string };

export function useCalendarComposerOptions(organizationId?: string) {
  const session = useAuthSession();
  const taskQuery = useTasksQuery(organizationId);
  const docQuery = useDocsQuery(organizationId);
  const projectQuery = useProjectOptionsQueryResult(organizationId);
  const memberQuery = useMemberOptions(organizationId, session.user);

  return useMemo(() => ({
    taskOptions: (taskQuery.data ?? []).map((task) => ({
      value: task.id,
      label: task.title,
      description: task.status,
    })),
    documentOptions: (docQuery.data ?? []).map((document) => ({
      value: document.id,
      label: document.title,
      description: document.visibility,
    })),
    projectOptions: (projectQuery.data ?? []).map((project) => ({
      value: project.id,
      label: project.name,
    })),
    memberOptions: memberQuery.data.map((member) => ({
      value: member.id,
      label: member.label,
      description: member.helper,
    })),
    isLoading: taskQuery.isLoading || docQuery.isLoading || projectQuery.queryStatus === "loading" || memberQuery.isLoading,
  }), [docQuery.data, docQuery.isLoading, memberQuery.data, memberQuery.isLoading, projectQuery.data, projectQuery.queryStatus, taskQuery.data, taskQuery.isLoading]);
}
