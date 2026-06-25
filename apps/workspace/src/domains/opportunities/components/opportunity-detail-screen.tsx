"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppPageHeader, AppPageShell, AppSection } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useAccountContext } from "@/domains/auth";
import { WorkspaceQueryState, StatusPill, DetailNotFoundState, DeleteRecordDialog } from "@/components/shared/crud-ui";
import { Link, useRouter } from "@/i18n/routing";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import {
  deleteOpportunityRequest,
  updateOpportunityRequest,
  useOpportunityQuery,
} from "../api/opportunities";
import { OPPORTUNITY_PRIORITIES, OPPORTUNITY_STAGES } from "../config/opportunities.config";
import {
  formFromOpportunity,
  formatValue,
  priorityTone,
  stageTone,
} from "../lib/opportunity-view-model";
import type { OpportunityFormValues, OpportunityPriority, OpportunityStage } from "../opportunities.types";
import { OpportunityForm } from "./opportunity-form";

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
  const [deleting, setDeleting] = useState(false);
  const rawClientOptions = useClientOptionsQuery(organizationId, { enabled: Boolean(organizationId && opportunity) });
  const clientOptions = useMemo(() => rawClientOptions ?? [], [rawClientOptions]);
  const projectOptionsResult = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const projectOptions = useMemo(() => projectOptionsResult.data ?? [], [projectOptionsResult.data]);
  const opportunityClientOptions = useMemo(() => clientOptions.map((client) => ({ id: client.id, label: client.name })), [clientOptions]);
  const opportunityProjectOptions = useMemo(() => projectOptions.map((project) => ({ id: project.id, label: project.name })), [projectOptions]);
  const opportunityStageLabels = useMemo(
    () => Object.fromEntries(OPPORTUNITY_STAGES.map((value) => [value, t(`stages.${value}`)])) as Record<OpportunityStage, string>,
    [t],
  );
  const opportunityPriorityLabels = useMemo(
    () => Object.fromEntries(OPPORTUNITY_PRIORITIES.map((value) => [value, t(`priorities.${value}`)])) as Record<OpportunityPriority, string>,
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
    if (!organizationId || !opportunity) return;
    setDeleting(true);
  }

  async function confirmDelete() {
    if (!organizationId || !opportunity) return;
    setBusyId(opportunity.id);
    try {
      await deleteOpportunityRequest(organizationId, opportunity.id);
      await refresh();
      router.push("/opportunities");
    } finally {
      setBusyId(null);
      setDeleting(false);
    }
  }

  return (
    <AppPageShell maxWidth="wide" contentClassName="space-y-8">
      <AppPageHeader
        eyebrow={t("detail.eyebrow")}
        title={opportunity?.title ?? t("title")}
        context={<Link href="/opportunities" className="inline-flex h-10 items-center rounded-xl border border-border bg-white px-4 text-xs font-bold text-foreground hover:bg-muted/50 dark:border-white/10 dark:bg-white/5"><ArrowLeft className="me-2 h-4 w-4" />{common("back")}</Link>}
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
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("table.stage")}</dt><dd className="mt-2"><StatusPill label={opportunityStageLabels[opportunity.stage]} tone={stageTone(opportunity.stage)} /></dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("table.priority")}</dt><dd className="mt-2"><StatusPill label={opportunityPriorityLabels[opportunity.priority]} tone={priorityTone(opportunity.priority)} /></dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("table.value")}</dt><dd className="mt-1 font-black text-foreground">{formatValue(opportunity)}</dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("form.nextStep")}</dt><dd className="mt-1 font-medium text-muted-foreground">{opportunity.nextStep || t("table.noNextStep")}</dd></div>
            </dl>
          </AppSection>
        </div>
      )}
      <DeleteRecordDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t("actions.deleteTitle")}
        description={t("actions.deleteDesc", { title: opportunity?.title ?? "..." })}
        isDeleting={Boolean(opportunity && busyId === opportunity.id)}
        onConfirm={confirmDelete}
      />
    </AppPageShell>
  );
}
