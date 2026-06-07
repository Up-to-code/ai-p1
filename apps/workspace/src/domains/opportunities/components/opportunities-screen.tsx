"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, KanbanSquare, List, Plus, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppDataTable, AppPageHeader, AppPageShell, AppPrimaryButton, AppSection, AppStatsGrid, type AppDataTableColumn } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useAccountContext } from "@/domains/auth";
import { WorkspaceQueryState, StatusPill, EmptyWorkspace, DetailNotFoundState, FormActions, SelectField, TextInput } from "@/components/shared/crud-ui";
import { useToast } from "@/components/ui/toast";
import { Link, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { WorkOsRecordDrawer } from "@/domains/work-os/components/work-os-record-drawer";
import { WorkOsRecordPicker, type WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import {
  createOpportunityRequest,
  deleteOpportunityRequest,
  updateOpportunityRequest,
  useOpportunitiesQuery,
  useOpportunityQuery,
  useOpportunityStatsQuery,
} from "../api/opportunities";
import type { Opportunity, OpportunityFormValues, OpportunityPriority, OpportunityStage, OpportunityStatus } from "../opportunities.types";

const stages: OpportunityStage[] = ["new", "qualified", "proposal", "negotiation", "won", "lost"];
const statuses: OpportunityStatus[] = ["open", "paused", "won", "lost"];
const priorities: OpportunityPriority[] = ["low", "normal", "high", "urgent"];

const emptyForm: OpportunityFormValues = {
  title: "",
  stage: "new",
  status: "open",
  priority: "normal",
  value: "",
  currency: "USD",
  source: "",
  closeDate: "",
  nextStep: "",
  clientId: "",
  projectId: "",
  tags: "",
};

function formFromOpportunity(opportunity: Opportunity): OpportunityFormValues {
  return {
    title: opportunity.title,
    stage: opportunity.stage,
    status: opportunity.status,
    priority: opportunity.priority,
    value: opportunity.value ? String(opportunity.value) : "",
    currency: opportunity.currency ?? "USD",
    source: opportunity.source ?? "",
    closeDate: opportunity.closeDate ?? "",
    nextStep: opportunity.nextStep ?? "",
    clientId: opportunity.clientId ?? "",
    projectId: opportunity.projectId ?? "",
    tags: (opportunity.tags ?? []).join(", "),
  };
}

function stageTone(stage: OpportunityStage) {
  if (stage === "won") return "success" as const;
  if (stage === "lost") return "danger" as const;
  if (stage === "proposal" || stage === "negotiation") return "info" as const;
  return "neutral" as const;
}

function priorityTone(priority: OpportunityPriority) {
  if (priority === "urgent") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "neutral" as const;
}

function formatValue(opportunity: Opportunity) {
  if (!opportunity.value) return "No value";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: opportunity.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(opportunity.value);
}

function OpportunityForm({
  initialValues,
  isSubmitting,
  submitLabel,
  clientOptions,
  projectOptions,
  onCancel,
  onSubmit,
}: {
  initialValues: OpportunityFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  clientOptions: WorkOsPickerOption[];
  projectOptions: WorkOsPickerOption[];
  onCancel?: () => void;
  onSubmit: (values: OpportunityFormValues) => void;
}) {
  const t = useTranslations("Opportunities");
  const common = useTranslations("Common");
  const [values, setValues] = useState(initialValues);
  const stageOptions = stages.map((value) => ({ value, label: t(`stages.${value}`) }));
  const statusOptions = statuses.map((value) => ({ value, label: t(`statuses.${value}`) }));
  const priorityOptions = priorities.map((value) => ({ value, label: t(`priorities.${value}`) }));

  function patch<TName extends keyof OpportunityFormValues>(name: TName, value: OpportunityFormValues[TName]) {
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

function opportunityValuesForStage(opportunity: Opportunity, stage: OpportunityStage): OpportunityFormValues {
  const values = formFromOpportunity(opportunity);
  values.stage = stage;
  if (stage === "won") values.status = "won";
  else if (stage === "lost") values.status = "lost";
  else if (values.status === "won" || values.status === "lost") values.status = "open";
  return values;
}

function OpportunityBoard({
  opportunities,
  labels,
  priorityLabels,
  onEdit,
  onDelete,
  onMoveStage,
  movingId,
}: {
  opportunities: Opportunity[];
  labels: Record<OpportunityStage, string>;
  priorityLabels: Record<OpportunityPriority, string>;
  onEdit: (opportunity: Opportunity) => void;
  onDelete: (opportunity: Opportunity) => void;
  onMoveStage: (opportunity: Opportunity, stage: OpportunityStage) => void;
  movingId: string | null;
}) {
  const t = useTranslations("Opportunities");
  const common = useTranslations("Common");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OpportunityStage | null>(null);

  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
      {stages.map((stage) => {
        const rows = opportunities.filter((opportunity) => opportunity.stage === stage);
        const isDragOver = dragOverStage === stage;

        return (
          <section
            key={stage}
            className={cn(
              "flex min-h-[420px] w-[min(100%,280px)] shrink-0 flex-col rounded-[28px] border p-3 transition-all duration-300",
              isDragOver
                ? "border-[#0B5CFF] bg-[#0B5CFF]/5 ring-4 ring-[#0B5CFF]/10"
                : "border-zinc-100 bg-zinc-50/40 dark:border-white/5 dark:bg-white/[0.01]",
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
              const opportunityId = event.dataTransfer.getData("opportunityId") || draggedId;
              if (!opportunityId) return;
              const moving = opportunities.find((opportunity) => opportunity.id === opportunityId);
              if (moving && moving.stage !== stage) onMoveStage(moving, stage);
              setDraggedId(null);
            }}
          >
            <div className="mb-4 flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{labels[stage]}</h3>
              <span className="text-[10px] font-black tabular-nums text-zinc-300">{String(rows.length).padStart(2, "0")}</span>
            </div>
            <div className="flex-1 space-y-3">
              {rows.map((opportunity) => (
                <article
                  key={opportunity.id}
                  draggable={movingId !== opportunity.id}
                  onDragStart={(event) => {
                    setDraggedId(opportunity.id);
                    event.dataTransfer.setData("opportunityId", opportunity.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDragOverStage(null);
                  }}
                  className={cn(
                    "rounded-2xl border border-zinc-200 bg-white p-3 transition-all dark:border-white/10 dark:bg-[#0A0A0A]",
                    draggedId === opportunity.id && "scale-[0.98] opacity-60",
                    movingId === opportunity.id && "pointer-events-none opacity-50",
                    movingId !== opportunity.id && "cursor-grab active:cursor-grabbing",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-black text-zinc-950 dark:text-white">{opportunity.title}</h4>
                      <p className="mt-1 text-xs font-bold text-zinc-400">{formatValue(opportunity)}</p>
                    </div>
                    <StatusPill label={priorityLabels[opportunity.priority]} tone={priorityTone(opportunity.priority)} />
                  </div>
                  {opportunity.nextStep ? (
                    <p className="mt-3 line-clamp-2 text-xs font-medium leading-5 text-zinc-500">{opportunity.nextStep}</p>
                  ) : null}
                  <div className="mt-4 flex justify-end gap-2">
                    <Link
                      href={`/opportunities/${opportunity.id}`}
                      draggable={false}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-[10px] font-bold text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
                    >
                      {t("actions.open")}
                    </Link>
                    <Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-[10px] font-bold" onClick={() => onEdit(opportunity)}>
                      {common("edit")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 rounded-lg px-2 text-red-600"
                      onClick={() => onDelete(opportunity)}
                      aria-label={t("actions.deleteOpportunity")}
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

export function OpportunitiesScreen() {
  const t = useTranslations("Opportunities");
  const common = useTranslations("Common");
  const account = useAccountContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const workspaceStatus = account.workspace.status;
  const organizationId = workspaceStatus === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<OpportunityStage | "all">("all");
  const [view, setView] = useState<"board" | "list">("board");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const isFormDrawerOpen = isCreateOpen || Boolean(editing);
  const queriedOpportunities = useOpportunitiesQuery(organizationId, { stage, search });
  const opportunities = useMemo(() => queriedOpportunities ?? [], [queriedOpportunities]);
  const stats = useOpportunityStatsQuery(organizationId);
  const rawClientOptions = useClientOptionsQuery(organizationId, { enabled: Boolean(organizationId && isFormDrawerOpen) });
  const clientOptions = useMemo(() => rawClientOptions ?? [], [rawClientOptions]);
  const projectOptionsResult = useProjectOptionsQueryResult(
    organizationId && isFormDrawerOpen ? organizationId : undefined,
    { limit: 200 },
  );
  const projectOptions = useMemo(() => projectOptionsResult.data ?? [], [projectOptionsResult.data]);
  const opportunityStageLabels = useMemo(
    () => Object.fromEntries(stages.map((value) => [value, t(`stages.${value}`)])) as Record<OpportunityStage, string>,
    [t],
  );
  const opportunityPriorityLabels = useMemo(
    () => Object.fromEntries(priorities.map((value) => [value, t(`priorities.${value}`)])) as Record<OpportunityPriority, string>,
    [t],
  );
  const clientOptionMap = useMemo(() => new Map(clientOptions.map((option) => [option.id, option])), [clientOptions]);
  const projectOptionMap = useMemo(() => new Map(projectOptions.map((option) => [option.id, option])), [projectOptions]);
  const opportunityClientOptions = useMemo(() => clientOptions.map((client) => ({ id: client.id, label: client.name })), [clientOptions]);
  const opportunityProjectOptions = useMemo(() => projectOptions.map((project) => ({ id: project.id, label: project.name })), [projectOptions]);

  const filteredOpportunities = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return opportunities.filter((opportunity) => !needle || [opportunity.title, opportunity.nextStep, opportunity.source, ...(opportunity.tags ?? [])].some((value) => value?.toLowerCase().includes(needle)));
  }, [opportunities, search]);

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
    if (!organizationId || !window.confirm(`Delete ${opportunity.title}?`)) return;
    setBusyId(opportunity.id);
    try {
      await deleteOpportunityRequest(organizationId, opportunity.id);
      await refresh();
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
    { key: "title", header: t("table.opportunity"), render: (row) => <div className="min-w-0"><p className="truncate text-sm font-black text-zinc-950 dark:text-white">{row.title}</p><p className="mt-1 truncate text-xs font-bold text-zinc-400">{row.nextStep || row.source || t("table.noNextStep")}</p></div> },
    { key: "stage", header: t("table.stage"), render: (row) => <StatusPill label={opportunityStageLabels[row.stage]} tone={stageTone(row.stage)} /> },
    { key: "priority", header: t("table.priority"), render: (row) => <StatusPill label={opportunityPriorityLabels[row.priority]} tone={priorityTone(row.priority)} /> },
    { key: "context", header: t("table.context"), render: (row) => projectOptionMap.get(row.projectId ?? "")?.name ?? clientOptionMap.get(row.clientId ?? "")?.name ?? t("table.noContext") },
    { key: "value", header: t("table.value"), render: formatValue },
    { key: "closeDate", header: t("table.close"), render: (row) => row.closeDate || t("table.noDate") },
    { key: "actions", header: "", align: "end", render: (row) => <div className="flex justify-end gap-2"><Link href={`/opportunities/${row.id}`} className="inline-flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-[10px] font-bold text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5">{t("actions.open")}</Link><Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-[10px] font-bold" onClick={() => openEditDrawer(row)}>{common("edit")}</Button><Button type="button" variant="outline" disabled={busyId === row.id} className="h-8 rounded-lg px-2 text-red-600" onClick={() => remove(row)} aria-label={t("actions.deleteOpportunity")}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
  ];

  return (
    <AppPageShell maxWidth="full" contentClassName="space-y-8">
      <AppPageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={<AppPrimaryButton onClick={openCreateDrawer}><Plus className="me-2 h-3.5 w-3.5" />{t("actions.new")}</AppPrimaryButton>}
      />
      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant="pipeline" />
      ) : (
        <>
          <AppStatsGrid stats={[
            { label: t("stats.open"), value: stats?.open ?? 0, icon: KanbanSquare },
            { label: t("stats.qualified"), value: stats?.qualified ?? 0, icon: BriefcaseBusiness },
            { label: t("stats.won"), value: stats?.won ?? 0, icon: CheckCircle2 },
            { label: t("stats.value"), value: new Intl.NumberFormat("en", { notation: "compact" }).format(stats?.value ?? 0), icon: CalendarDays },
          ]} />
          <AppSection
            title={t("workspaceView")}
            actions={(
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <Search className="h-3.5 w-3.5 text-zinc-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={common("search")} className="h-8 w-36 bg-transparent text-xs font-bold outline-none" />
                </div>
                <select value={stage} onChange={(event) => setStage(event.target.value as OpportunityStage | "all")} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold dark:border-white/10 dark:bg-white/[0.03]">
                  <option value="all">{t("filters.allStages")}</option>
                  {stages.map((item) => <option key={item} value={item}>{opportunityStageLabels[item]}</option>)}
                </select>
                <Button type="button" variant={view === "board" ? "default" : "outline"} className="h-10 rounded-xl px-3" onClick={() => setView("board")} aria-label="Board view"><KanbanSquare className="h-4 w-4" /></Button>
                <Button type="button" variant={view === "list" ? "default" : "outline"} className="h-10 rounded-xl px-3" onClick={() => setView("list")} aria-label="List view"><List className="h-4 w-4" /></Button>
              </div>
            )}
          >
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
          </AppSection>
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
              <OpportunityForm key="create" initialValues={emptyForm} isSubmitting={busyId === "create"} submitLabel={t("actions.create")} clientOptions={opportunityClientOptions} projectOptions={opportunityProjectOptions} onCancel={closeFormDrawer} onSubmit={create} />
            )}
          </WorkOsRecordDrawer>
        </>
      )}
    </AppPageShell>
  );
}

export function OpportunityDetailScreen({ id }: { id: string }) {
  const t = useTranslations("Opportunities");
  const common = useTranslations("Common");
  const account = useAccountContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const workspaceStatus = account.workspace.status;
  const organizationId = workspaceStatus === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const opportunity = useOpportunityQuery(organizationId, id);
  const [busyId, setBusyId] = useState<string | null>(null);
  const rawClientOptions = useClientOptionsQuery(organizationId, { enabled: Boolean(organizationId && opportunity) });
  const clientOptions = useMemo(() => rawClientOptions ?? [], [rawClientOptions]);
  const projectOptionsResult = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const projectOptions = useMemo(() => projectOptionsResult.data ?? [], [projectOptionsResult.data]);
  const opportunityClientOptions = useMemo(() => clientOptions.map((client) => ({ id: client.id, label: client.name })), [clientOptions]);
  const opportunityProjectOptions = useMemo(() => projectOptions.map((project) => ({ id: project.id, label: project.name })), [projectOptions]);
  const opportunityStageLabels = useMemo(
    () => Object.fromEntries(stages.map((value) => [value, t(`stages.${value}`)])) as Record<OpportunityStage, string>,
    [t],
  );
  const opportunityPriorityLabels = useMemo(
    () => Object.fromEntries(priorities.map((value) => [value, t(`priorities.${value}`)])) as Record<OpportunityPriority, string>,
    [t],
  );

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["opportunity", organizationId, id] });
    await queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    await queryClient.invalidateQueries({ queryKey: ["opportunities-stats"] });
  }

  async function update(values: OpportunityFormValues) {
    if (!organizationId || !opportunity) return;
    setBusyId(opportunity.id);
    try {
      await updateOpportunityRequest(organizationId, opportunity.id, values);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    if (!organizationId || !opportunity || !window.confirm(`Delete ${opportunity.title}?`)) return;
    setBusyId(opportunity.id);
    try {
      await deleteOpportunityRequest(organizationId, opportunity.id);
      await refresh();
      router.push("/opportunities");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppPageShell maxWidth="wide" contentClassName="space-y-8">
      <AppPageHeader
        eyebrow={t("detail.eyebrow")}
        title={opportunity?.title ?? t("title")}
        context={<Link href="/opportunities" className="inline-flex h-10 items-center rounded-xl border border-zinc-100 bg-white px-4 text-xs font-bold text-zinc-900 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white"><ArrowLeft className="me-2 h-4 w-4" />{common("back")}</Link>}
        actions={opportunity ? <Button type="button" variant="outline" disabled={busyId === opportunity.id} className="h-10 rounded-xl text-xs font-bold text-red-600" onClick={remove}><Trash2 className="me-2 h-4 w-4" />{common("delete")}</Button> : null}
      />
      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant="detail" />
      ) : opportunity === undefined ? (
        <AppSection><div className="min-h-52" /></AppSection>
      ) : opportunity === null ? (
        <DetailNotFoundState title={t("detail.notFoundTitle")} description={t("detail.notFoundDescription")} backHref="/opportunities" backLabel={t("detail.backToOpportunities")} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <AppSection title={t("detail.record")}>
            <OpportunityForm initialValues={formFromOpportunity(opportunity)} isSubmitting={busyId === opportunity.id} submitLabel={t("actions.save")} clientOptions={opportunityClientOptions} projectOptions={opportunityProjectOptions} onSubmit={update} />
          </AppSection>
          <AppSection title={t("detail.summary")} tone="muted">
            <dl className="grid gap-4 text-sm">
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("table.stage")}</dt><dd className="mt-2"><StatusPill label={opportunityStageLabels[opportunity.stage]} tone={stageTone(opportunity.stage)} /></dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("table.priority")}</dt><dd className="mt-2"><StatusPill label={opportunityPriorityLabels[opportunity.priority]} tone={priorityTone(opportunity.priority)} /></dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("table.value")}</dt><dd className="mt-1 font-black text-zinc-950 dark:text-white">{formatValue(opportunity)}</dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("form.nextStep")}</dt><dd className="mt-1 font-medium text-zinc-500">{opportunity.nextStep || t("table.noNextStep")}</dd></div>
            </dl>
          </AppSection>
        </div>
      )}
    </AppPageShell>
  );
}
