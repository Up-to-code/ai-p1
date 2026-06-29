"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, BadgeDollarSign, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAccountContext } from "@/domains/auth";
import { AppDataTable, AppPageHeader, AppPageShell, AppSection, type AppDataTableColumn } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { WorkspaceQueryState, StatusPill, EmptyWorkspace, DetailNotFoundState, DeleteRecordDialog } from "@/components/shared/crud-ui";
import { Link, useRouter } from "@/i18n/routing";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useOptimisticInvalidation } from "@/domains/cache/hooks/use-optimistic-invalidation";
import { DealBoard } from "./deal-board";
import { DealForm } from "./deal-form";
import { DealsToolbar } from "./deals-toolbar";
import { useDealsWorkspace } from "../hooks/use-deals-workspace";
import { updateDealRequest, deleteDealRequest, useDealQuery } from "../api/deals";
import type { Deal, DealFormValues, DealPriority, DealStage } from "../store/deals.types";
import { DEAL_PRIORITIES, EMPTY_DEAL_FORM } from "../config/deals.config";
import { dealStages, stageTone, priorityTone, formatValue, formFromDeal, matchesDealSearch } from "../lib/deal-view-model";
import { WorkOsRecordDrawer } from "@/domains/work-os/components/work-os-record-drawer";

const emptyForm = EMPTY_DEAL_FORM;

export function DealsWorkspace() {
  const t = useTranslations("Deals");
  const common = useTranslations("Common");
  const {
    workspaceStatus, deals, search,
    dealStageLabels, dealPriorityLabels,
    dealClientOptions, dealProjectOptions,
    stage, view, isFormDrawerOpen, editing, deleting, busyId, projectId,
    setSearch, setStage, setView,
    openCreateDrawer, openEditDrawer, closeFormDrawer,
    create, update, confirmRemove, confirmDelete, cancelDelete, moveStage,
  } = useDealsWorkspace();

  const filteredDeals = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return deals.filter((deal) => !needle || matchesDealSearch(deal, needle));
  }, [deals, search]);

  const columns: AppDataTableColumn<Deal>[] = [
    { key: "title", header: "", render: (row) => <div className="min-w-0"><p className="truncate text-sm font-black text-foreground">{row.title}</p><p className="mt-1 truncate text-xs font-bold text-muted-foreground">{row.nextStep || row.source || ""}</p></div> },
    { key: "stage", header: "", render: (row) => <StatusPill label={dealStageLabels[row.stage]} tone={stageTone(row.stage)} /> },
    { key: "priority", header: "", render: (row) => <StatusPill label={dealPriorityLabels[row.priority]} tone={priorityTone(row.priority)} /> },
    { key: "value", header: "", render: (row) => <span className="font-black">{formatValue(row)}</span> },
    { key: "actions", header: "", align: "end", render: (row) => <div className="flex justify-end gap-2"><Link href={`/deals/${row.id}`} className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-[10px] font-bold">{""}</Link><Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-[10px] font-bold" onClick={() => openEditDrawer(row)}>{""}</Button><Button type="button" variant="outline" disabled={busyId === row.id} className="h-8 rounded-lg px-2 text-red-600" onClick={() => confirmRemove(row)}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <DealsToolbar
        stage={stage}
        search={search}
        view={view}
        dealStageLabels={dealStageLabels}
        onStageChange={setStage}
        onSearchChange={setSearch}
        onViewChange={setView}
        onNewDeal={openCreateDrawer}
      />
      <div className="flex-1 overflow-auto p-5 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-full">
          {workspaceStatus !== "ready" ? (
            <WorkspaceQueryState status={workspaceStatus} variant="pipeline" />
          ) : (
            <>
              {filteredDeals.length === 0 ? (
                <EmptyWorkspace icon={BadgeDollarSign} title="" description="" />
              ) : view === "pipeline" ? (
                <DealBoard
                  deals={filteredDeals}
                  labels={dealStageLabels}
                  priorityLabels={dealPriorityLabels}
                  onEdit={openEditDrawer}
                  onDelete={confirmRemove}
                  onMoveStage={moveStage}
                  movingId={busyId}
                />
              ) : (
                <AppDataTable columns={columns} data={filteredDeals} getRowKey={(row) => row.id} />
              )}
              <DeleteRecordDialog
                open={Boolean(deleting)}
                onOpenChange={(open) => { if (!open) cancelDelete(); }}
                title={common("delete")}
                description={common("deleteConfirmation")}
                isDeleting={Boolean(deleting && busyId === deleting.id)}
                onConfirm={confirmDelete}
              />
              <WorkOsRecordDrawer
                open={isFormDrawerOpen}
                eyebrow={editing ? t("form.editDeal") : t("form.newDeal")}
                title={editing ? editing.title : t("form.newDealTitle")}
                onOpenChange={(open) => {
                  if (!open) closeFormDrawer();
                }}
              >
                {editing ? (
                  <DealForm key={editing.id} initialValues={formFromDeal(editing)} isSubmitting={busyId === editing.id} submitLabel={common("save")} clientOptions={dealClientOptions} projectOptions={dealProjectOptions} onCancel={closeFormDrawer} onSubmit={update} />
                ) : (
                  <DealForm key="create" initialValues={{ ...emptyForm, projectId: projectId ?? "" }} isSubmitting={busyId === "create"} submitLabel={common("create")} clientOptions={dealClientOptions} projectOptions={dealProjectOptions} onCancel={closeFormDrawer} onSubmit={create} />
                )}
              </WorkOsRecordDrawer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function DealDetailScreen({ id }: { id: string }) {
  const t = useTranslations("Deals");
  const common = useTranslations("Common");
  const account = useAccountContext();
  const router = useRouter();
  const { invalidate } = useOptimisticInvalidation();
  const workspaceStatus = account.workspace.status;
  const organizationId = workspaceStatus === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const deal = useDealQuery(organizationId, id);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const rawClientOptions = useClientOptionsQuery(organizationId, { enabled: Boolean(organizationId && deal) });
  const clientOptions = useMemo(() => rawClientOptions ?? [], [rawClientOptions]);
  const projectOptionsResult = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const projectOptions = useMemo(() => projectOptionsResult.data ?? [], [projectOptionsResult.data]);
  const dealClientOptions = useMemo(() => clientOptions.map((client) => ({ id: client.id, label: client.name })), [clientOptions]);
  const dealProjectOptions = useMemo(() => projectOptions.map((project) => ({ id: project.id, label: project.name })), [projectOptions]);
  const dealStageLabels = useMemo(
    () => Object.fromEntries(dealStages.map((value) => [value, t(`stages.${value}`)])) as Record<DealStage, string>,
    [t],
  );
  const dealPriorityLabels = useMemo(
    () => Object.fromEntries(DEAL_PRIORITIES.map((value) => [value, t(`priorities.${value}`)])) as Record<DealPriority, string>,
    [t],
  );

  async function refresh() {
    await invalidate([
      { type: "detail", resource: "deals", id },
      { type: "list", resource: "deals" },
      { type: "stats", resource: "deals" },
    ]);
  }

  async function update(values: DealFormValues) {
    if (!organizationId || !deal) return;
    setBusyId(deal.id);
    try {
      await updateDealRequest(organizationId, deal.id, values);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  function remove() {
    if (!organizationId || !deal) return;
    setDeleting(true);
  }

  async function confirmDelete() {
    if (!organizationId || !deal) return;
    setBusyId(deal.id);
    try {
      await deleteDealRequest(organizationId, deal.id);
      await refresh();
      router.push("/deals");
    } finally {
      setBusyId(null);
      setDeleting(false);
    }
  }

  return (
    <AppPageShell maxWidth="wide" contentClassName="space-y-8">
      <AppPageHeader
        title={deal?.title ?? ""}
        context={<Link href="/deals" className="inline-flex h-10 items-center rounded-xl border border-border bg-white px-4 text-xs font-bold text-foreground hover:bg-muted/50 dark:border-white/10 dark:bg-white/5"><ArrowLeft className="me-2 h-4 w-4" />{common("back")}</Link>}
        actions={deal ? <Button type="button" variant="outline" disabled={busyId === deal.id} className="h-10 rounded-xl text-xs font-bold text-red-600" onClick={remove}><Trash2 className="me-2 h-4 w-4" />{common("delete")}</Button> : null}
      />
      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant="detail" />
      ) : deal === undefined ? (
        <AppSection><div className="min-h-52" /></AppSection>
      ) : deal === null ? (
        <DetailNotFoundState title="" description="" backHref="/deals" backLabel="" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <AppSection>
            <DealForm initialValues={formFromDeal(deal)} isSubmitting={busyId === deal.id} submitLabel={common("save")} clientOptions={dealClientOptions} projectOptions={dealProjectOptions} onCancel={() => {}} onSubmit={update} />
          </AppSection>
          <AppSection tone="muted">
            <dl className="grid gap-4 text-sm">
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{""}</dt><dd className="mt-2"><StatusPill label={dealStageLabels[deal.stage]} tone={stageTone(deal.stage)} /></dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{""}</dt><dd className="mt-2"><StatusPill label={dealPriorityLabels[deal.priority]} tone={priorityTone(deal.priority)} /></dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{""}</dt><dd className="mt-1 font-black text-foreground">{formatValue(deal)}</dd></div>
              {deal.dealThinking ? (
                <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{""}</dt><dd className="mt-1 italic text-muted-foreground">{deal.dealThinking}</dd></div>
              ) : null}
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{""}</dt><dd className="mt-1 font-medium text-muted-foreground">{deal.nextStep || ""}</dd></div>
            </dl>
          </AppSection>
        </div>
      )}
      <DeleteRecordDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={common("delete")}
        description={common("deleteConfirmation")}
        isDeleting={Boolean(deal && busyId === deal.id)}
        onConfirm={confirmDelete}
      />
    </AppPageShell>
  );
}
