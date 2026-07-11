"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useAuthSession } from "@/domains/auth";
import { createDocRequest } from "@/domains/docs/api/docs";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useTaskMutations } from "@/domains/tasks/hooks/use-task-mutations";
import { useRouter } from "@/i18n/routing";
import { logger } from "@/lib/logger";
import type { QuickDocumentInput, QuickTaskInput } from "@/components/shared/create-resource-dialog";
import { buildWorkspaceTaskGroups, localDateKey } from "../lib/workspace-command-center";

/** Coordinates workspace-home data and quick-create side effects. */
export function useWorkspaceCommandCenter() {
  const session = useAuthSession();
  const router = useRouter();
  const { toast } = useToast();
  const organizationId = session.workspace.organizationId ?? "";
  const tasksResult = useTasksQuery(session.workspace.isReady ? organizationId : undefined);
  const { createTask, createTaskMutation } = useTaskMutations(organizationId);
  const [createOpen, setCreateOpen] = useState(false);
  const [documentPending, setDocumentPending] = useState(false);
  const now = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => localDateKey(now), [now]);
  const groups = useMemo(
    () => buildWorkspaceTaskGroups(tasksResult.data ?? [], session.user.id, todayKey),
    [session.user.id, tasksResult.data, todayKey],
  );

  async function createTaskFromQuickCreate(input: QuickTaskInput) {
    if (!organizationId) return;
    await createTask({ ...input, status: "todo" });
  }

  async function createDocumentFromQuickCreate(input: QuickDocumentInput) {
    if (!organizationId) return;

    setDocumentPending(true);
    try {
      const result = await createDocRequest(organizationId, {
        title: input.title,
        content: input.content,
        folderId: "",
        projectId: "",
        visibility: "team",
        tags: "",
      });
      router.push(`/docs/${result.doc.id}`);
    } catch (error) {
      logger.error("workspace.quick_document_create_failed", { organizationId, error });
      toast({ title: "Failed to create document", type: "error" });
      throw error;
    } finally {
      setDocumentPending(false);
    }
  }

  return {
    session,
    tasksResult,
    createOpen,
    setCreateOpen,
    documentPending,
    now,
    todayKey,
    groups,
    createTaskMutation,
    createTaskFromQuickCreate,
    createDocumentFromQuickCreate,
  };
}
