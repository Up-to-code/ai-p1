"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, KanbanSquare, List, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppDataTable, AppPrimaryButton, type AppDataTableColumn } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/domains/auth";
import { WorkspaceQueryState, StatusPill, EmptyWorkspace, DeleteRecordDialog } from "@/components/shared/crud-ui";
import { useToast } from "@/components/ui/toast";
import { Link } from "@/i18n/routing";
import { HeaderSelect } from "@/components/ui/header-select";
import { cn } from "@/lib/utils";
import { WorkOsRecordDrawer } from "@/domains/work-os/components/work-os-record-drawer";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { PageHeader } from "@/components/shared/page-header";
import {
  createOpportunityRequest,
  deleteOpportunityRequest,
  updateOpportunityRequest,
  useOpportunitiesQuery,
  useOpportunityStatsQuery,
} from "../api/opportunities";
import { EMPTY_OPPORTUNITY_FORM, OPPORTUNITY_PRIORITIES, OPPORTUNITY_STAGES } from "../config/opportunities.config";
import {
  formFromOpportunity,
  formatValue,
  matchesOpportunitySearch,
  opportunityValuesForStage,
  priorityTone,
  stageTone,
} from "../lib/opportunity-view-model";
import type { Opportunity, OpportunityFormValues, OpportunityPriority, OpportunityStage } from "../opportunities.types";
import { OpportunityBoard } from "./opportunity-board";
import { OpportunityForm } from "./opportunity-form";

export function OpportunitiesScreen() {
  const t = useTranslations("Opportunities");
  const common = useTranslations("Common");
  const session = useAuthSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const workspaceStatus = session.workspace.status;
  const organizationId = workspaceStatus === "ready" ? session.workspace.organizationId ?? undefined : undefined;
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<OpportunityStage | "all">("all");
  const [view, setView] = useState<"board" | "list">("board");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [deleting, setDeleting] = useState<Opportunity | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const isFormDrawerOpen = isCreateOpen || Boolean(editing);
  const projectId = useCurrentProjectId();
  const queriedOpportunities = useOpportunitiesQuery(organizationId, { stage, search, projectId });
  const opportunities = useMemo(() => queriedOpportunities ?? [], [queriedOpportunities]);
  void useOpportunityStatsQuery(organizationId);
  const rawClientOptions = useClientOptionsQuery(organizationId, { enabled: Boolean(organizationId && isFormDrawerOpen) });
  const clientOptions = useMemo(() => rawClientOptions ?? [], [rawClientOptions]);
  const projectOptionsResult = useProjectOptionsQueryResult(
    organizationId && isFormDrawerOpen ? organizationId : undefined,
    { limit: 200 },
  );
  const projectOptions = useMemo(() => projectOptionsResult.data ?? [], [projectOptionsResult.data]);
  const opportunityStageLabels = useMemo(
    () => Object.fromEntries(OPPORTUNITY_STAGES.map((value) => [value, t(`stages.${value}`)])) as Record<OpportunityStage, string>,
    [t],
  );
  const opportunityPriorityLabels = useMemo(
    () => Object.fromEntries(OPPORTUNITY_PRIORITIES.map((value) => [value, t(`priorities.${value}`)])) as Record<OpportunityPriority, string>,
    [t],
  );
  const clientOptionMap = useMemo(() => new Map(clientOptions.map((option) => [option.id, option])), [clientOptions]);
  const projectOptionMap = useMemo(() => new Map(projectOptions.map((option) => [option.id, option])), [projectOptions]);
  const opportunityClientOptions = useMemo(() => clientOptions.map((client) => ({ id: client.id, label: client.name })), [clientOptions]);
  const opportunityProjectOptions = useMemo(() => projectOptions.map((project) => ({ id: project.id, label: project.name })), [projectOptions]);

  const filteredOpportunities = useMemo(
    () => opportunities.filter((opportunity) => matchesOpportunitySearch(opportunity, search)),
    [opportunities, search],
  );

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    await queryClient.invalidateQueries({ queryKey: ["opportunities-stats"] });
  }

  function openCreateDrawer() {
    setEditing(null);
    setIsCreateOpen(true);
  }

  function openEditDrawer(opportunity: Opportunity) {
    setIsCreateOpen(false);
    setEditing(opportunity);
  }

  function closeFormDrawer() {
    setIsCreateOpen(false);
    setEditing(null);
  }

  async function create(values: OpportunityFormValues) {
    if (!organizationId) return;
    setBusyId("create");
    try {
      await createOpportunityRequest(organizationId, values);
      setIsCreateOpen(false);
      toast({ title: t("actions.created"), type: "success" });
      await refresh();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : t("actions.createFailed"),
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function update(values: OpportunityFormValues) {
    if (!organizationId || !editing) return;
    setBusyId(editing.id);
    try {
      await updateOpportunityRequest(organizationId, editing.id, values);
      setEditing(null);
      toast({ title: t("actions.saved"), type: "success" });
      await refresh();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : t("actions.saveFailed"),
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(opportunity: Opportunity) {
    if (!organizationId) return;
    setDeleting(opportunity);
  }

  async function confirmDelete() {
    if (!organizationId || !deleting) return;
    setBusyId(deleting.id);
    try {
      await deleteOpportunityRequest(organizationId, deleting.id);
      setDeleting(null);
      toast({ title: t("actions.deleted"), type: "success" });
      await refresh();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : t("actions.deleteFailed"),
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function moveStage(opportunity: Opportunity, targetStage: OpportunityStage) {
    if (!organizationId || opportunity.stage === targetStage) return;

    const values = opportunityValuesForStage(opportunity, targetStage);
    const previousEntries = queryClient.getQueriesData<Opportunity[]>({ queryKey: ["opportunities"] });

    setBusyId(opportunity.id);
    await queryClient.cancelQueries({ queryKey: ["opportunities"] });
    queryClient.setQueriesData<Opportunity[]>({ queryKey: ["opportunities"] }, (current) => {
      if (!current) return current;
      return current.map((row) =>
        row.id === opportunity.id ? { ...row, stage: targetStage, status: values.status } : row,
      );
    });

    try {
      await updateOpportunityRequest(organizationId, opportunity.id, values);
      await queryClient.invalidateQueries({ queryKey: ["opportunities-stats"] });
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

  const columns: AppDataTableColumn<Opportunity>[] = [
    { key: "title", header: t("table.opportunity"), render: (row) => <div className="min-w-0"><p className="truncate text-sm font-black text-foreground">{row.title}</p><p className="mt-1 truncate text-xs font-bold text-muted-foreground">{row.nextStep || row.source || t("table.noNextStep")}</p></div> },
    { key: "stage", header: t("table.stage"), render: (row) => <StatusPill label={opportunityStageLabels[row.stage]} tone={stageTone(row.stage)} /> },
    { key: "priority", header: t("table.priority"), render: (row) => <StatusPill label={opportunityPriorityLabels[row.priority]} tone={priorityTone(row.priority)} /> },
    { key: "context", header: t("table.context"), render: (row) => projectOptionMap.get(row.projectId ?? "")?.name ?? clientOptionMap.get(row.clientId ?? "")?.name ?? t("table.noContext") },
    { key: "value", header: t("table.value"), render: formatValue },
    { key: "closeDate", header: t("table.close"), render: (row) => row.closeDate || t("table.noDate") },
    { key: "actions", header: "", align: "end", render: (row) => <div className="flex justify-end gap-2"><Link href={`/opportunities/${row.id}`} className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-[10px] font-bold text-foreground hover:bg-muted/50 dark:border-white/10 dark:text-muted-foreground/30">{t("actions.open")}</Link><Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-[10px] font-bold" onClick={() => openEditDrawer(row)}>{common("edit")}</Button><Button type="button" variant="outline" disabled={busyId === row.id} className="h-8 rounded-lg px-2 text-red-600" onClick={() => remove(row)} aria-label={t("actions.deleteOpportunity")}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <PageHeader
        title={t("title")}
        actions={[
          {
            label: t("actions.new"),
            icon: Plus,
            variant: "primary",
            onClick: openCreateDrawer,
          },
        ]}
      />

      {/* Toolbar with filters and view toggle */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <HeaderSelect
            value={stage}
            onChange={(value) => setStage(value as OpportunityStage | "all")}
            options={[
              { value: "all", label: t("filters.allStages") },
              ...OPPORTUNITY_STAGES.map((item) => ({ value: item, label: opportunityStageLabels[item] })),
            ]}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-border bg-card px-3 transition-colors focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/20">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={common("search")}
              className="h-full w-32 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center rounded-lg bg-muted p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setView("board")}
              className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-all", view === "board" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              aria-label="Board view"
            >
              <KanbanSquare className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-all", view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto w-full max-w-full">
          {workspaceStatus !== "ready" ? (
            <WorkspaceQueryState status={workspaceStatus} variant="pipeline" />
          ) : (
            <>
              {filteredOpportunities.length === 0 ? (
                <EmptyWorkspace icon={BriefcaseBusiness} title={t("empty.title")} description={t("empty.description")} />
              ) : view === "board" ? (
                <OpportunityBoard
                  opportunities={filteredOpportunities}
                  labels={opportunityStageLabels}
                  priorityLabels={opportunityPriorityLabels}
                  onEdit={openEditDrawer}
                  onDelete={remove}
                  onMoveStage={moveStage}
                  movingId={busyId}
                />
              ) : (
                <AppDataTable columns={columns} data={filteredOpportunities} getRowKey={(row) => row.id} />
              )}
              <DeleteRecordDialog
                open={Boolean(deleting)}
                onOpenChange={(open) => { if (!open) setDeleting(null); }}
                title={t("actions.deleteTitle")}
                description={t("actions.deleteDesc", { title: deleting?.title ?? "..." })}
                isDeleting={Boolean(deleting && busyId === deleting.id)}
                onConfirm={confirmDelete}
              />
              <WorkOsRecordDrawer
                open={isFormDrawerOpen}
                eyebrow={t("eyebrow")}
                title={editing ? t("drawer.edit") : t("drawer.create")}
                description={t("drawer.description")}
                onOpenChange={(open) => {
                  if (!open) closeFormDrawer();
                  if (open && !editing) setIsCreateOpen(true);
                }}
              >
                {editing ? (
                  <OpportunityForm key={editing.id} initialValues={formFromOpportunity(editing)} isSubmitting={busyId === editing.id} submitLabel={t("actions.save")} clientOptions={opportunityClientOptions} projectOptions={opportunityProjectOptions} onCancel={closeFormDrawer} onSubmit={update} />
                ) : (
                  <OpportunityForm key="create" initialValues={{ ...EMPTY_OPPORTUNITY_FORM, projectId: projectId ?? "" }} isSubmitting={busyId === "create"} submitLabel={t("actions.create")} clientOptions={opportunityClientOptions} projectOptions={opportunityProjectOptions} onCancel={closeFormDrawer} onSubmit={create} />
                )}
              </WorkOsRecordDrawer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export { OpportunityDetailScreen } from "./opportunity-detail-screen";
