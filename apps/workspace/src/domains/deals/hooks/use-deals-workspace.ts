"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOptimisticInvalidation } from "@/domains/cache/hooks/use-optimistic-invalidation";
import { useToast } from "@/components/ui/toast";
import { useAuthSession } from "@/domains/auth";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import {
  createDealRequest,
  deleteDealRequest,
  updateDealRequest,
  useDealsQuery,
  useDealStatsQuery,
} from "../api/deals";
import type { Deal, DealFormValues, DealStage, DealPriority } from "../store/deals.types";
import { DEAL_PRIORITIES, EMPTY_DEAL_FORM } from "../config/deals.config";
import { dealStages, formFromDeal } from "../lib/deal-view-model";
import { useTranslations } from "next-intl";

const emptyForm = EMPTY_DEAL_FORM;

export function useDealsWorkspace() {
  const t = useTranslations("Deals");
  const common = useTranslations("Common");
  const session = useAuthSession();
  const queryClient = useQueryClient();
  const { invalidate } = useOptimisticInvalidation();
  const { toast } = useToast();
  const workspaceStatus = session.workspace.status;
  const organizationId = workspaceStatus === "ready" ? session.workspace.organizationId ?? undefined : undefined;
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<DealStage | "all">("all");
  const [view, setView] = useState<"pipeline" | "list">("pipeline");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [deleting, setDeleting] = useState<Deal | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const isFormDrawerOpen = isCreateOpen || Boolean(editing);
  const projectId = useCurrentProjectId();
  const queriedDeals = useDealsQuery(organizationId, { stage, search });
  const deals = useMemo(() => queriedDeals ?? [], [queriedDeals]);
  const stats = useDealStatsQuery(organizationId);

  const rawClientOptions = useClientOptionsQuery(organizationId, { enabled: Boolean(organizationId && isFormDrawerOpen) });
  const clientOptions = useMemo(() => rawClientOptions ?? [], [rawClientOptions]);
  const projectOptionsResult = useProjectOptionsQueryResult(
    organizationId && isFormDrawerOpen ? organizationId : undefined,
    { limit: 200 },
  );
  const projectOptions = useMemo(() => projectOptionsResult.data ?? [], [projectOptionsResult.data]);

  const dealStageLabels = useMemo(
    () => Object.fromEntries(dealStages.map((value) => [value, t(`stages.${value}`)])) as Record<DealStage, string>,
    [t],
  );
  const dealPriorityLabels = useMemo(
    () => Object.fromEntries(DEAL_PRIORITIES.map((value) => [value, t(`priorities.${value}`)])) as Record<DealPriority, string>,
    [t],
  );
  const dealClientOptions = useMemo(() => clientOptions.map((client) => ({ id: client.id, label: client.name })), [clientOptions]);
  const dealProjectOptions = useMemo(() => projectOptions.map((project) => ({ id: project.id, label: project.name })), [projectOptions]);

  async function invalidateAll() {
    await invalidate([
      { type: "list", resource: "deals" },
      { type: "stats", resource: "deals" },
    ]);
  }

  function openCreateDrawer() {
    setEditing(null);
    setIsCreateOpen(true);
  }

  function openEditDrawer(deal: Deal) {
    setIsCreateOpen(false);
    setEditing(deal);
  }

  function closeFormDrawer() {
    setIsCreateOpen(false);
    setEditing(null);
  }

  async function create(values: DealFormValues) {
    if (!organizationId) return;
    setBusyId("create");
    try {
      await createDealRequest(organizationId, values);
      setIsCreateOpen(false);
      toast({ title: t("actions.created"), type: "success" });
      await invalidateAll();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : t("actions.createFailed"),
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function update(values: DealFormValues) {
    if (!organizationId || !editing) return;
    setBusyId(editing.id);
    try {
      await updateDealRequest(organizationId, editing.id, values);
      setEditing(null);
      toast({ title: t("actions.saved"), type: "success" });
      await invalidateAll();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : t("actions.saveFailed"),
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  function confirmRemove(deal: Deal) {
    setDeleting(deal);
  }

  async function confirmDelete() {
    if (!organizationId || !deleting) return;
    setBusyId(deleting.id);
    try {
      await deleteDealRequest(organizationId, deleting.id);
      setDeleting(null);
      toast({ title: t("actions.deleted"), type: "success" });
      await invalidateAll();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : t("actions.deleteFailed"),
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  function cancelDelete() {
    setDeleting(null);
  }

  async function moveStage(deal: Deal, targetStage: DealStage) {
    if (!organizationId || deal.stage === targetStage) return;

    const values: DealFormValues = { ...formFromDeal(deal), stage: targetStage };
    if (targetStage === "won") values.status = "won";
    else if (targetStage === "lost") values.status = "lost";
    else if (values.status === "won" || values.status === "lost") values.status = "open";

    const previousEntries = queryClient.getQueriesData<Deal[]>({ queryKey: ["deals"] });

    setBusyId(deal.id);
    await queryClient.cancelQueries({ queryKey: ["deals"] });
    queryClient.setQueriesData<Deal[]>({ queryKey: ["deals"] }, (current) => {
      if (!current) return current;
      return current.map((row) =>
        row.id === deal.id ? { ...row, stage: targetStage, status: values.status } : row,
      );
    });

    try {
      await updateDealRequest(organizationId, deal.id, values);
      await invalidate({ type: "stats", resource: "deals" });
    } catch (error) {
      previousEntries.forEach(([key, data]) => {
        if (data !== undefined) queryClient.setQueryData(key, data);
      });
      toast({
        title: error instanceof Error ? error.message : t("actions.saveFailed"),
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  return {
    // State
    session,
    workspaceStatus,
    organizationId,
    deals,
    stats,
    search,
    stage,
    view,
    isCreateOpen,
    isFormDrawerOpen,
    editing,
    deleting,
    busyId,
    projectId,
    // Derived
    dealStageLabels,
    dealPriorityLabels,
    dealClientOptions,
    dealProjectOptions,
    // Actions
    setSearch,
    setStage,
    setView,
    openCreateDrawer,
    openEditDrawer,
    closeFormDrawer,
    create,
    update,
    confirmRemove,
    confirmDelete,
    cancelDelete,
    moveStage,
    invalidateAll,
  };
}
