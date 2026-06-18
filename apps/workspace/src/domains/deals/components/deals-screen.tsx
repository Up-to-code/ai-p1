"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BadgeDollarSign, KanbanSquare, List, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppDataTable, AppPageHeader, AppPageShell, AppPrimaryButton, AppSection, type AppDataTableColumn } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useAccountContext } from "@/domains/auth";
import { WorkspaceQueryState, StatusPill, EmptyWorkspace, DetailNotFoundState, FormActions, SelectField, TextInput, DeleteRecordDialog } from "@/components/shared/crud-ui";
import { useToast } from "@/components/ui/toast";
import { Link, useRouter } from "@/i18n/routing";
import { HeaderSelect } from "@/components/ui/header-select";
import { cn } from "@/lib/utils";
import { WorkOsRecordDrawer } from "@/domains/work-os/components/work-os-record-drawer";
import { WorkOsRecordPicker, type WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import {
  createDealRequest,
  deleteDealRequest,
  updateDealRequest,
  useDealsQuery,
  useDealQuery,
  useDealStatsQuery,
} from "../api/deals";
import type { Deal, DealFormValues, DealPriority, DealStage, DealStats } from "../store/deals.types";
import { dealStages, activeDealStages, stageTone, priorityTone, formatValue, formFromDeal, dealValuesForStage, matchesDealSearch } from "../deal-view-model";

const stages: DealStage[] = ["lead", "qualified", "proposal_sent", "contract_sent", "won", "lost"];
const statuses: Deal["status"][] = ["open", "paused", "won", "lost"];
const priorities: DealPriority[] = ["low", "normal", "high", "urgent"];

const emptyForm: DealFormValues = {
  title: "",
  stage: "lead",
  status: "open",
  priority: "normal",
  value: "",
  currency: "USD",
  dealThinking: "",
  source: "",
  closeDate: "",
  nextStep: "",
  clientId: "",
  projectId: "",
  tags: "",
};

function DealForm({
  initialValues,
  isSubmitting,
  submitLabel,
  clientOptions,
  projectOptions,
  onCancel,
  onSubmit,
}: {
  initialValues: DealFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  clientOptions: WorkOsPickerOption[];
  projectOptions: WorkOsPickerOption[];
  onCancel?: () => void;
  onSubmit: (values: DealFormValues) => void;
}) {
  const t = useTranslations("Deals");
  const common = useTranslations("Common");
  const [values, setValues] = useState(initialValues);
  const stageOptions = stages.map((value) => ({ value, label: t(`stages.${value}`) }));
  const statusOptions = statuses.map((value) => ({ value, label: t(`statuses.${value}`) }));
  const priorityOptions = priorities.map((value) => ({ value, label: t(`priorities.${value}`) }));

  function patch<TName extends keyof DealFormValues>(name: TName, value: DealFormValues[TName]) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <TextInput label={t("form.title")} value={values.title} onChange={(value) => patch("title", value)} />
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label={t("form.stage")} value={values.stage} options={stageOptions} onChange={(value) => patch("stage", value)} />
        <SelectField label={t("form.status")} value={values.status} options={statusOptions} onChange={(value) => patch("status", value)} />
        <SelectField label={t("form.priority")} value={values.priority} options={priorityOptions} onChange={(value) => patch("priority", value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <TextInput label={t("form.value")} inputMode="decimal" value={values.value} onChange={(value) => patch("value", value)} />
        <TextInput label={t("form.currency")} value={values.currency} onChange={(value) => patch("currency", value.toUpperCase())} />
        <TextInput label={t("form.closeDate")} type="date" value={values.closeDate} onChange={(value) => patch("closeDate", value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <WorkOsRecordPicker label={t("form.client")} value={values.clientId} options={clientOptions} placeholder={t("form.clientPlaceholder")} searchPlaceholder={t("form.searchClients")} emptyLabel={t("form.noClients")} clearLabel={t("form.noClient")} closeLabel={common("finish")} onChange={(value) => patch("clientId", value)} />
        <WorkOsRecordPicker label={t("form.project")} value={values.projectId} options={projectOptions} placeholder={t("form.projectPlaceholder")} searchPlaceholder={t("form.searchProjects")} emptyLabel={t("form.noProjects")} clearLabel={t("form.noProject")} closeLabel={common("finish")} onChange={(value) => patch("projectId", value)} />
      </div>
      <TextInput label={t("form.dealThinking")} value={values.dealThinking} onChange={(value) => patch("dealThinking", value)} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label={t("form.source")} value={values.source} onChange={(value) => patch("source", value)} />
        <TextInput label={t("form.tags")} value={values.tags} onChange={(value) => patch("tags", value)} />
      </div>
      <TextInput label={t("form.nextStep")} value={values.nextStep} onChange={(value) => patch("nextStep", value)} />
      {onCancel ? (
        <FormActions onCancel={onCancel} submitLabel={submitLabel} isSubmitting={isSubmitting} />
      ) : (
        <AppPrimaryButton type="submit" disabled={isSubmitting} className="h-11 px-6">
          {submitLabel}
        </AppPrimaryButton>
      )}
    </form>
  );
}

function DealBoard({
  deals,
  labels,
  priorityLabels,
  onEdit,
  onDelete,
  onMoveStage,
  movingId,
}: {
  deals: Deal[];
  labels: Record<DealStage, string>;
  priorityLabels: Record<DealPriority, string>;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  onMoveStage: (deal: Deal, stage: DealStage) => void;
  movingId: string | null;
}) {
  const t = useTranslations("Deals");
  const common = useTranslations("Common");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
      {stages.map((stage) => {
        const rows = deals.filter((deal) => deal.stage === stage);
        const isDragOver = dragOverStage === stage;

        return (
          <section
            key={stage}
            className={cn(
              "flex min-h-[420px] w-[min(100%,280px)] shrink-0 flex-col rounded-[28px] border p-3 transition-all duration-300",
              isDragOver
                ? "border-[var(--q-accent)] bg-[var(--q-accent-muted)] ring-4 ring-[var(--q-accent-border)]"
                : "border-border bg-muted/50/40 dark:border-white/5 dark:bg-white/[0.01]",
            )}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              if (dragOverStage !== stage) setDragOverStage(stage);
            }}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOverStage(null);
              const dealId = event.dataTransfer.getData("dealId") || draggedId;
              if (!dealId) return;
              const moving = deals.find((deal) => deal.id === dealId);
              if (moving && moving.stage !== stage) onMoveStage(moving, stage);
              setDraggedId(null);
            }}
          >
            <div className="mb-4 flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{labels[stage]}</h3>
              <span className="text-[10px] font-black tabular-nums text-muted-foreground/40">{String(rows.length).padStart(2, "0")}</span>
            </div>
            <div className="flex-1 space-y-3">
              {rows.map((deal) => (
                <article
                  key={deal.id}
                  draggable={movingId !== deal.id}
                  onDragStart={(event) => {
                    setDraggedId(deal.id);
                    event.dataTransfer.setData("dealId", deal.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDragOverStage(null);
                  }}
                  className={cn(
                    "rounded-2xl border border-border bg-white p-3 transition-all dark:border-white/10 dark:bg-[#0A0A0A]",
                    draggedId === deal.id && "scale-[0.98] opacity-60",
                    movingId === deal.id && "pointer-events-none opacity-50",
                    movingId !== deal.id && "cursor-grab active:cursor-grabbing",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-black text-foreground">{deal.title}</h4>
                      <p className="mt-1 text-xs font-bold text-muted-foreground">{formatValue(deal)}</p>
                    </div>
                    <StatusPill label={priorityLabels[deal.priority]} tone={priorityTone(deal.priority)} />
                  </div>
                  {deal.nextStep ? (
                    <p className="mt-3 line-clamp-2 text-xs font-medium leading-5 text-muted-foreground">{deal.nextStep}</p>
                  ) : null}
                  {deal.dealThinking ? (
                    <p className="mt-2 line-clamp-2 text-xs italic text-muted-foreground/70">{deal.dealThinking}</p>
                  ) : null}
                  <div className="mt-4 flex justify-end gap-2">
                    <Link
                      href={`/deals/${deal.id}`}
                      draggable={false}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-[10px] font-bold text-foreground hover:bg-muted/50 dark:border-white/10 dark:text-muted-foreground/30"
                    >
                      {t("actions.open")}
                    </Link>
                    <Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-[10px] font-bold" onClick={() => onEdit(deal)}>
                      {common("edit")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 rounded-lg px-2 text-red-600"
                      onClick={() => onDelete(deal)}
                      aria-label={t("actions.deleteDeal")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function DealsWorkspace() {
  const t = useTranslations("Deals");
  const common = useTranslations("Common");
  const account = useAccountContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const workspaceStatus = account.workspace.status;
  const organizationId = workspaceStatus === "ready" ? account.workspace.organizationId ?? undefined : undefined;
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
    () => Object.fromEntries(stages.map((value) => [value, t(`stages.${value}`)])) as Record<DealStage, string>,
    [t],
  );
  const dealPriorityLabels = useMemo(
    () => Object.fromEntries(priorities.map((value) => [value, t(`priorities.${value}`)])) as Record<DealPriority, string>,
    [t],
  );
  const clientOptionMap = useMemo(() => new Map(clientOptions.map((option) => [option.id, option])), [clientOptions]);
  const projectOptionMap = useMemo(() => new Map(projectOptions.map((option) => [option.id, option])), [projectOptions]);
  const dealClientOptions = useMemo(() => clientOptions.map((client) => ({ id: client.id, label: client.name })), [clientOptions]);
  const dealProjectOptions = useMemo(() => projectOptions.map((project) => ({ id: project.id, label: project.name })), [projectOptions]);

  const filteredDeals = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return deals.filter((deal) => !needle || matchesDealSearch(deal, needle));
  }, [deals, search]);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["deals"] });
    await queryClient.invalidateQueries({ queryKey: ["deals-stats"] });
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

  async function update(values: DealFormValues) {
    if (!organizationId || !editing) return;
    setBusyId(editing.id);
    try {
      await updateDealRequest(organizationId, editing.id, values);
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

  async function remove(deal: Deal) {
    if (!organizationId) return;
    setDeleting(deal);
  }

  async function confirmDelete() {
    if (!organizationId || !deleting) return;
    setBusyId(deleting.id);
    try {
      await deleteDealRequest(organizationId, deleting.id);
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
      await queryClient.invalidateQueries({ queryKey: ["deals-stats"] });
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

  const columns: AppDataTableColumn<Deal>[] = [
    { key: "title", header: t("table.title"), render: (row) => <div className="min-w-0"><p className="truncate text-sm font-black text-foreground">{row.title}</p><p className="mt-1 truncate text-xs font-bold text-muted-foreground">{row.nextStep || row.source || t("table.noNextStep")}</p></div> },
    { key: "stage", header: t("table.stage"), render: (row) => <StatusPill label={dealStageLabels[row.stage]} tone={stageTone(row.stage)} /> },
    { key: "priority", header: t("table.priority"), render: (row) => <StatusPill label={dealPriorityLabels[row.priority]} tone={priorityTone(row.priority)} /> },
    { key: "context", header: t("table.context"), render: (row) => projectOptionMap.get(row.projectId ?? "")?.name ?? clientOptionMap.get(row.clientId ?? "")?.name ?? t("table.noContext") },
    { key: "value", header: t("table.value"), render: (row) => <span className="font-black">{formatValue(row)}</span> },
    { key: "dealThinking", header: t("table.thinking"), render: (row) => <span className="line-clamp-1 text-xs italic text-muted-foreground">{row.dealThinking || t("table.noThinking")}</span> },
    { key: "closeDate", header: t("table.close"), render: (row) => row.closeDate || t("table.noDate") },
    { key: "actions", header: "", align: "end", render: (row) => <div className="flex justify-end gap-2"><Link href={`/deals/${row.id}`} className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-[10px] font-bold text-foreground hover:bg-muted/50 dark:border-white/10 dark:text-muted-foreground/30">{t("actions.open")}</Link><Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-[10px] font-bold" onClick={() => openEditDrawer(row)}>{common("edit")}</Button><Button type="button" variant="outline" disabled={busyId === row.id} className="h-8 rounded-lg px-2 text-red-600" onClick={() => remove(row)} aria-label={t("actions.deleteDeal")}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* ── Top Header Bar ── */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-5 py-3">
        {/* Left: Title + Stage filter */}
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">{t("title")}</h1>
          <div className="h-5 w-px bg-border shrink-0" />
          <HeaderSelect
            value={stage}
            onChange={(value) => setStage(value as DealStage | "all")}
            options={[
              { value: "all", label: t("filters.all") },
              ...stages.map((item) => ({ value: item, label: dealStageLabels[item] })),
            ]}
          />
        </div>

        {/* Right: Search + View toggle + New */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search */}
          <div className="flex h-8 items-center gap-2 rounded-lg border border-border bg-card px-3 transition-colors focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/20">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={common("search")}
              className="h-full w-32 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          {/* View toggle */}
          <div className="flex items-center rounded-lg bg-muted p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setView("pipeline")}
              className={cn("flex h-7 w-7 items-center justify-center rounded-md transition-all", view === "pipeline" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              aria-label="Pipeline view"
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
          {/* New Deal */}
          <AppPrimaryButton onClick={openCreateDrawer} className="h-8 px-3 text-xs">
            <Plus className="me-1.5 h-3.5 w-3.5" />
            {t("actions.new")}
          </AppPrimaryButton>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-5 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-full">
      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant="pipeline" />
      ) : (
        <>
            {filteredDeals.length === 0 ? (
              <EmptyWorkspace icon={BadgeDollarSign} title={t("empty.title")} description={t("empty.description")} />
            ) : view === "pipeline" ? (
              <DealBoard
                deals={filteredDeals}
                labels={dealStageLabels}
                priorityLabels={dealPriorityLabels}
                onEdit={openEditDrawer}
                onDelete={remove}
                onMoveStage={moveStage}
                movingId={busyId}
              />
            ) : (
              <AppDataTable columns={columns} data={filteredDeals} getRowKey={(row) => row.id} />
            )}
          <DeleteRecordDialog
            open={Boolean(deleting)}
            onOpenChange={(open) => { if (!open) setDeleting(null); }}
            title={t("delete.title")}
            description={t("delete.description")}
            isDeleting={Boolean(deleting && busyId === deleting.id)}
            onConfirm={confirmDelete}
          />
          <WorkOsRecordDrawer
            open={isFormDrawerOpen}
            eyebrow={t("eyebrow")}
            title={editing ? t("actions.edit") : t("actions.create")}
            description={t("subtitle")}
            onOpenChange={(open) => {
              if (!open) closeFormDrawer();
              if (open && !editing) setIsCreateOpen(true);
            }}
          >
            {editing ? (
              <DealForm key={editing.id} initialValues={formFromDeal(editing)} isSubmitting={busyId === editing.id} submitLabel={t("actions.save")} clientOptions={dealClientOptions} projectOptions={dealProjectOptions} onCancel={closeFormDrawer} onSubmit={update} />
            ) : (
              <DealForm key="create" initialValues={{ ...emptyForm, projectId: projectId ?? "" }} isSubmitting={busyId === "create"} submitLabel={t("actions.create")} clientOptions={dealClientOptions} projectOptions={dealProjectOptions} onCancel={closeFormDrawer} onSubmit={create} />
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
  const queryClient = useQueryClient();
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
    () => Object.fromEntries(stages.map((value) => [value, t(`stages.${value}`)])) as Record<DealStage, string>,
    [t],
  );
  const dealPriorityLabels = useMemo(
    () => Object.fromEntries(priorities.map((value) => [value, t(`priorities.${value}`)])) as Record<DealPriority, string>,
    [t],
  );

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["deal", organizationId, id] });
    await queryClient.invalidateQueries({ queryKey: ["deals"] });
    await queryClient.invalidateQueries({ queryKey: ["deals-stats"] });
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

  async function remove() {
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
        eyebrow={t("detail.eyebrow")}
        title={deal?.title ?? t("title")}
        context={<Link href="/deals" className="inline-flex h-10 items-center rounded-xl border border-border bg-white px-4 text-xs font-bold text-foreground hover:bg-muted/50 dark:border-white/10 dark:bg-white/5"><ArrowLeft className="me-2 h-4 w-4" />{common("back")}</Link>}
        actions={deal ? <Button type="button" variant="outline" disabled={busyId === deal.id} className="h-10 rounded-xl text-xs font-bold text-red-600" onClick={remove}><Trash2 className="me-2 h-4 w-4" />{common("delete")}</Button> : null}
      />
      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant="detail" />
      ) : deal === undefined ? (
        <AppSection><div className="min-h-52" /></AppSection>
      ) : deal === null ? (
        <DetailNotFoundState title={t("detail.notFoundTitle")} description={t("detail.notFoundDescription")} backHref="/deals" backLabel={t("detail.backToDeals")} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <AppSection title={t("detail.record")}>
            <DealForm initialValues={formFromDeal(deal)} isSubmitting={busyId === deal.id} submitLabel={t("actions.save")} clientOptions={dealClientOptions} projectOptions={dealProjectOptions} onSubmit={update} />
          </AppSection>
          <AppSection title={t("detail.summary")} tone="muted">
            <dl className="grid gap-4 text-sm">
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("table.stage")}</dt><dd className="mt-2"><StatusPill label={dealStageLabels[deal.stage]} tone={stageTone(deal.stage)} /></dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("table.priority")}</dt><dd className="mt-2"><StatusPill label={dealPriorityLabels[deal.priority]} tone={priorityTone(deal.priority)} /></dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("table.value")}</dt><dd className="mt-1 font-black text-foreground">{formatValue(deal)}</dd></div>
              {deal.dealThinking ? (
                <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("form.dealThinking")}</dt><dd className="mt-1 italic text-muted-foreground">{deal.dealThinking}</dd></div>
              ) : null}
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("form.nextStep")}</dt><dd className="mt-1 font-medium text-muted-foreground">{deal.nextStep || t("table.noNextStep")}</dd></div>
            </dl>
          </AppSection>
        </div>
      )}
      <DeleteRecordDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t("delete.title")}
        description={t("delete.description")}
        isDeleting={Boolean(deal && busyId === deal.id)}
        onConfirm={confirmDelete}
      />
    </AppPageShell>
  );
}
