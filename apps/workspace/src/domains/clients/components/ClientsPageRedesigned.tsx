"use client";

import { useState } from 'react';
import { useTranslations } from "next-intl";
import { UserPlus, Users } from "lucide-react";
import { QentrahTable, type QentrahColumnDef } from "@qentrah/ui";
import { DomainHeader, type HeaderAction } from "@/components/shared/domain/DomainHeader";
import { type ViewMode } from "@/components/shared/view-system/ViewSwitcher";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/domains/auth";
import { useRouter } from "@/i18n/routing";
import {
  CLIENTS_PAGE_SIZE,
  useClientsIndexQuery,
  useDeleteClientOptimisticMutation,
} from "@/domains/clients/api/clients";
import type { Client } from "../store/clients.types";
import { DeleteRecordDialog, EmptyWorkspace } from "@/components/shared/crud-ui";
import { ClientSheet } from "./client-sheet";
import { clientToCardItem } from "./client-view-helpers";
import { GroupedList } from "@/components/shared/view-system";

export function ClientsPageRedesigned() {
  const t = useTranslations('Clients');
  const router = useRouter();
  const session = useAuthSession();
  const [activeView, setActiveView] = useState<ViewMode>('table');
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const workspaceStatus = session.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? session.workspace.organizationId ?? undefined : undefined;

  const clientsQuery = useClientsIndexQuery(workspaceOrganizationId);
  const deleteClientMutation = useDeleteClientOptimisticMutation(clientsQuery.queryKey);
  const clients = clientsQuery.results as Client[] || [];
  const isLoading = isWorkspaceReady && clientsQuery.queryStatus === "loading";

  const columns: QentrahColumnDef<Client>[] = [
    {
      headerName: "Name",
      field: "name",
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (p: any) => {
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">{p.data?.name}</div>
              {p.data?.company && (
                <div className="truncate text-xs text-muted-foreground">{p.data.company}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      headerName: "Contact",
      field: "contact",
      width: 180,
      cellRenderer: (p: any) => {
        return (
          <div className="text-sm">
            <div className="text-foreground">{p.data?.contact?.email || "—"}</div>
            <div className="text-xs text-muted-foreground">{p.data?.contact?.phone || "—"}</div>
          </div>
        );
      },
    },
    {
      headerName: "Stage",
      field: "pipelineStage",
      width: 120,
      cellRenderer: (p: any) => {
        const stage = p.data?.pipelineStage || "new";
        const stageColors: Record<string, string> = {
          new: "#6b7280",
          qualified: "#3b82f6",
          proposal: "#f59e0b",
          negotiation: "#ef4444",
          closed: "#22c55e",
        };
        return (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border"
            style={{
              backgroundColor: `${stageColors[stage]}20`,
              color: stageColors[stage],
              borderColor: `${stageColors[stage]}40`,
            }}
          >
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </span>
        );
      },
    },
    {
      headerName: "Type",
      field: "type",
      width: 100,
      valueFormatter: (p: any) => {
        return p.value?.charAt(0).toUpperCase() + p.value?.slice(1) || "—";
      },
    },
    {
      headerName: "Created",
      field: "createdAt",
      width: 140,
      valueFormatter: (p: any) => {
        if (!p.value) return "—";
        return new Date(p.value).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
    },
  ];

  const actions: HeaderAction[] = [
    {
      label: "Add Client",
      icon: <UserPlus className="w-4 h-4" />,
      onClick: () => setIsCreateOpen(true),
      variant: "primary",
    },
  ];

  const availableViews: ViewMode[] = ['table', 'board', 'calendar', 'timeline', 'dashboard', 'widgets'];

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex flex-col h-full">
        <DomainHeader
          domain="Clients"
          currentSection="All Clients"
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

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <DomainHeader
          domain="Clients"
          currentSection="All Clients"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 relative">
          <ViewLoading style="table" message="Loading clients..." />
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <DomainHeader
          domain="Clients"
          currentSection="All Clients"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <EmptyWorkspace icon={Users} title={t('empty.title')} description={t('empty.desc')} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DomainHeader
        domain="Clients"
        currentSection={`${clients.length} client${clients.length !== 1 ? "s" : ""}`}
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
                rows={clients}
                columns={columns}
                density="compact"
                height="100%"
                rowSelection="single"
                getRowId={(row) => row.id}
                onRowClicked={(p) => {
                  if (p.data?.id) router.push(`/clients/${p.data.id}`);
                }}
              />
            </div>
          </div>
        )}

        {activeView === 'board' && (
          <div className="h-full p-6">
            <GroupedList
              items={clients.map((client) => clientToCardItem({
                id: client.id,
                name: client.name,
                contact: client.contact,
                phone: client.phone,
                company: client.company,
                source: client.source,
                pipelineStage: client.pipelineStage ?? "new",
                type: client.type,
              }))}
              stages={[
                {
                  key: "all",
                  name: t("filters.all"),
                  color: "#9CA3AF",
                  order: 0,
                }
              ]}
              showSearch
              showCount
              defaultExpanded
              onRowClick={(item) => {
                const client = clients.find((c) => c.id === item.id);
                if (client) router.push(`/clients/${client.id}`);
              }}
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
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('delete.title')}
        description={t('delete.desc', { name: deleting?.name ?? "..." })}
        isDeleting={deleteClientMutation.isPending}
        error={deleteClientMutation.error instanceof Error ? deleteClientMutation.error.message : null}
        onConfirm={() => {
          if (!deleting || !clients.some((client) => client.id === deleting.id)) {
            return;
          }
          const organizationId = session.organization?.id;
          if (!organizationId) return;
          const clientId = deleting.id;
          setDeleting(null);
          deleteClientMutation.mutate({ organizationId, clientId });
        }}
      />

      <ClientSheet
        open={isCreateOpen}
        indexQueryKey={clientsQuery.queryKey}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
        }}
        onSuccess={() => {
          // Refresh handled by optimistic mutation
        }}
      />
    </div>
  );
}
