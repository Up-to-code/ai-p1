"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast";
import { deleteAgentThreadRequest } from "@/domains/agents";
import { agentThreadUrl } from "@/domains/agents/conversation-runtime";
import type { AgentThread } from "../lib/types";

type UseSidebarThreadsOptions = {
  organizationId: string | null;
  threads: AgentThread[];
  activeThreadId?: string;
};

/** Thread list filtering, history dialog state, and delete handling. */
export function useSidebarThreads({
  organizationId,
  threads,
  activeThreadId,
}: UseSidebarThreadsOptions) {
  const tThreads = useTranslations("Sidebar.threads");
  const { toast } = useToast();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AgentThread | null>(null);
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return threads;
    return threads.filter((thread) => thread.title.toLowerCase().includes(query));
  }, [search, threads]);

  async function confirmDelete() {
    if (!organizationId || !pendingDelete || deletingThreadId) return;

    const thread = pendingDelete;
    setDeletingThreadId(thread.id);

    try {
      await deleteAgentThreadRequest(organizationId, thread.id);
      setPendingDelete(null);
      setHistoryOpen(false);
      toast({ title: tThreads("deleted"), type: "success" });

      if (activeThreadId === thread.id) {
        window.history.replaceState(
          null,
          "",
          agentThreadUrl(window.location.pathname, window.location.search),
        );
      }
    } catch (error) {
      toast({
        title: tThreads("deleteFailed"),
        description: error instanceof Error ? error.message : undefined,
        type: "error",
      });
    } finally {
      setDeletingThreadId(null);
    }
  }

  return {
    historyOpen,
    setHistoryOpen,
    search,
    setSearch,
    pendingDelete,
    setPendingDelete,
    deletingThreadId,
    filteredThreads,
    confirmDelete,
  };
}
