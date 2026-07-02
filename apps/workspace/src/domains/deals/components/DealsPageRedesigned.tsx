"use client";

import { useState } from 'react';
import { useTranslations } from "next-intl";
import { Plus, BadgeDollarSign, Trash2 } from "lucide-react";
import { QentrahTable, type QentrahColumnDef } from "@qentrah/ui";
import { DomainHeader, type HeaderAction } from "@/components/shared/domain/DomainHeader";
import { type ViewMode } from "@/components/shared/view-system/ViewSwitcher";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";
import { StatusPill, EmptyWorkspace, DeleteRecordDialog } from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import { useRouter } from "@/i18n/routing";
import { useDealsWorkspace } from "../hooks/use-deals-workspace";
import { updateDealRequest, deleteDealRequest } from "../api/deals";
import type { Deal, DealStage, DealPriority } from "../store/deals.types";
import { dealStages, stageTone, priorityTone, formatValue, matchesDealSearch } from "../lib/deal-view-model";
import { DealBoard } from "./deal-board";
import { DealForm } from "./deal-form";
import { WorkOsRecordDrawer } from "@/domains/work-os/components/work-os-record-drawer";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { DEAL_PRIORITIES, EMPTY_DEAL_FORM } from "../config/deals.config";
import { formFromDeal } from "../lib/deal-view-model";

export function DealsPageRedesigned() {
  const t = useTranslations("Deals");
  const common = useTranslations("Common");
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewMode>('board');

  const {
    workspaceStatus, deals, search,
    dealStageLabels, dealPriorityLabels,
    dealClientOptions, dealProjectOptions,
    stage, isFormDrawerOpen, editing, deleting, busyId, projectId,
    setSearch, setStage,
    openCreateDrawer, openEditDrawer, closeFormDrawer,
    create, update, confirmRemove, confirmDelete, cancelDelete, moveStage,
  } = useDealsWorkspace();

  const filteredDeals = deals.filter((deal) => !search.trim() || matchesDealSearch(deal, search.trim().toLowerCase()));

  const columns: QentrahColumnDef<Deal>[] = [
    {
      headerName: "Deal",
      field: "title",
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (p: any) => {
        return (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{p.data?.title}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{p.data?.nextStep || p.data?.source || ""}</p>
          </div>
        );
      },
    },
    {
      headerName: "Stage",
      field: "stage",
      width: 120,
      cellRenderer: (p: any) => {
        const stage = p.value as DealStage;
        return <StatusPill label={dealStageLabels[stage]} tone={stageTone(stage)} />;
      },
    },
    {
      headerName: "Priority",
      field: "priority",
      width: 100,
      cellRenderer: (p: any) => {
        const priority = p.value as DealPriority;
        return <StatusPill label={dealPriorityLabels[priority]} tone={priorityTone(priority)} />;
      },
    },
    {
      headerName: "Value",
      field: "value",
      width: 100,
      valueFormatter: (p: any) => formatValue(p.data),
    },
    {
      headerName: "Actions",
      field: "id",
      width: 120,
      cellRenderer: (p: any) => {
        return (
          <div className="flex justify-end gap-2">
            <Link href={`/deals/${p.data?.id}`} className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-[10px] font-bold">
              View
            </Link>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-lg px-3 text-[10px] font-bold"
              onClick={() => openEditDrawer(p.data)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busyId === p.data?.id}
              className="h-8 rounded-lg px-2 text-red-600"
              onClick={() => confirmRemove(p.data)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  const actions: HeaderAction[] = [
    {
      label: t("actions.new"),
      icon: <Plus className="w-4 h-4" />,
      onClick: openCreateDrawer,
      variant: "primary",
    },
  ];

  const availableViews: ViewMode[] = ['table', 'board', 'calendar', 'timeline', 'dashboard', 'widgets'];

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex flex-col h-screen">
        <DomainHeader
          domain="Deals"
          currentSection="All Deals"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <ViewLoading style="spinner" message="Loading workspace..." />
        </div>
      </div>
    );
  }

  if (filteredDeals.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <DomainHeader
          domain="Deals"
          currentSection="All Deals"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <EmptyWorkspace icon={BadgeDollarSign} title="" description="" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <DomainHeader
        domain="Deals"
        currentSection={`${filteredDeals.length} deal${filteredDeals.length !== 1 ? "s" : ""}`}
        actions={actions}
        availableViews={availableViews}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* View content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'table' && (
          <div className="h-full p-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
              <QentrahTable
                rows={filteredDeals}
                columns={columns}
                density="compact"
                height="100%"
                rowSelection="single"
                getRowId={(row) => row.id}
              />
            </div>
          </div>
        )}

        {activeView === 'board' && (
          <div className="h-full p-6">
            <DealBoard
              deals={filteredDeals}
              labels={dealStageLabels}
              priorityLabels={dealPriorityLabels}
              onEdit={openEditDrawer}
              onDelete={confirmRemove}
              onMoveStage={moveStage}
              movingId={busyId}
            />
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="h-full p-6">
            <ViewLoading style="calendar" message="Calendar view coming soon" />
          </div>
        )}

        {activeView === 'timeline' && (
          <div className="h-full p-6">
            <ViewLoading style="table" message="Timeline view coming soon" />
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Dashboard view coming soon" />
          </div>
        )}

        {activeView === 'widgets' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Widgets view coming soon" />
          </div>
        )}
      </div>

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
          <DealForm
            key={editing.id}
            initialValues={formFromDeal(editing)}
            isSubmitting={busyId === editing.id}
            submitLabel={common("save")}
            clientOptions={dealClientOptions}
            projectOptions={dealProjectOptions}
            onCancel={closeFormDrawer}
            onSubmit={update}
          />
        ) : (
          <DealForm
            key="create"
            initialValues={{ ...EMPTY_DEAL_FORM, projectId: projectId ?? "" }}
            isSubmitting={busyId === "create"}
            submitLabel={common("create")}
            clientOptions={dealClientOptions}
            projectOptions={dealProjectOptions}
            onCancel={closeFormDrawer}
            onSubmit={create}
          />
        )}
      </WorkOsRecordDrawer>
    </div>
  );
}
