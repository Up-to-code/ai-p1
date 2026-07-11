"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAuthSession } from "@/domains/auth";
import { useClientQuery, useDeleteClientOptimisticMutation, useUpdateClientOptimisticMutation } from "../../api/clients";
import { clientsIndexQueryBaseKey } from "../../api/clients";
import { clientToFormValues } from "../../client-view-model";
import { type Client } from "../../store/clients.types";

import { AppPageShell, AppTabsList } from "@/components/shared";
import { DeleteRecordDialog, ProgressiveLoadingState, DetailNotFoundState } from "@/components/shared/crud-ui";

import { ClientDetailHeader } from "./client-detail-header";
import { OverviewTab } from "./tabs/overview-tab";
import { DealsTab } from "./tabs/deals-tab";
import { ProjectsTab } from "./tabs/projects-tab";
import { TasksCalendarTab } from "./tabs/tasks-calendar-tab";
import { ActivityTab } from "./tabs/activity-tab";
import { DocumentsTab } from "./tabs/documents-tab";
import { BillingTab } from "./tabs/billing-tab";
import { ContactsTab } from "./tabs/contacts-tab";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { LayoutDashboard, Briefcase, FileText, Calendar, Activity as ActivityIcon, Folder as DocsIcon, Users } from "lucide-react";

export function ClientDetailLayout({
  id,
  embedded = false,
  onDeleted,
}: {
  id: string;
  embedded?: boolean;
  onDeleted?: () => void;
}) {
  const t = useTranslations('Clients');
  const session = useAuthSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const workspaceStatus = session.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? session.workspace.organizationId ?? undefined : undefined;
  
  const client = useClientQuery(workspaceOrganizationId, id) as Client | null | undefined;
  
  const clientCloseMutation = useUpdateClientOptimisticMutation(
    clientsIndexQueryBaseKey(workspaceOrganizationId)
  );
  const deleteClientMutation = useDeleteClientOptimisticMutation(
    clientsIndexQueryBaseKey(workspaceOrganizationId)
  );

  const queryDebug = {
    resourceType: "client",
    resourceId: id,
    organizationId: workspaceOrganizationId,
    workspaceStatus,
    isConvexAuthPending: session.workspace.isConvexAuthPending,
    isConvexAuthenticated: session.workspace.isConvexAuthenticated,
  };

  if (workspaceStatus !== "ready") {
    // using a dummy loading state for simplicity
    return <AppPageShell><div className="p-8">Loading workspace...</div></AppPageShell>;
  }

  if (client === undefined) {
    return (
      <AppPageShell>
        <ProgressiveLoadingState
          title={t("detail.loadingTitle")}
          description={t("detail.loadingDesc")}
          debug={queryDebug}
          variant="detail"
        />
      </AppPageShell>
    );
  }

  if (client === null) {
    return (
      <AppPageShell>
        <DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/clients" backLabel={t('detail.back')} />
      </AppPageShell>
    );
  }

  const handleUpdateClient = (updatedValues: Partial<import("../../validation/client.schema").ClientFormValues>) => {
    if (!workspaceOrganizationId) return;
    clientCloseMutation.mutate({
      organizationId: workspaceOrganizationId,
      client,
      values: {
        ...clientToFormValues(client),
        ...updatedValues,
      },
    });
  };

  return (
    <AppPageShell
      className={embedded
        ? "h-full min-w-0 overflow-x-hidden bg-background p-0"
        : "min-w-0 overflow-x-hidden bg-background p-4 sm:p-6 lg:p-8"}
      contentClassName={embedded
        ? "mx-auto min-h-full w-full min-w-0 max-w-none space-y-0 pb-0"
        : "mx-auto w-full min-w-0 max-w-[1180px] space-y-0 pb-12"}
    >
      <ClientDetailHeader
        client={client} 
        onUpdate={handleUpdateClient}
        onSchedule={() => setActiveTab("tasks-calendar")}
        onDelete={() => setDeleteOpen(true)}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex w-full min-w-0 flex-col gap-0 overflow-hidden bg-background"
      >
        <AppTabsList 
          className="h-12 min-w-0 gap-5 border-0 bg-background px-4 sm:px-6"
          tabs={[
            { value: "overview", label: "Overview", icon: LayoutDashboard },
            { value: "deals", label: "Deals", icon: Briefcase },
            { value: "projects", label: "Projects", icon: FileText },
            { value: "tasks-calendar", label: "Tasks & Schedule", icon: Calendar },
            { value: "activity", label: "Timeline & Comments", icon: ActivityIcon },
            { value: "documents", label: "Documents", icon: DocsIcon },
            { value: "billing", label: "Billing", icon: FileText },
            { value: "contacts", label: "Contacts", icon: Users },
          ]} 
        />

        <TabsContent value="overview" className="min-w-0 border-none p-4 outline-none sm:p-6">
          <OverviewTab client={client} onUpdate={handleUpdateClient} onShowActivity={() => setActiveTab("activity")} />
        </TabsContent>

        <TabsContent value="deals" className="min-w-0 border-none p-4 outline-none sm:p-6">
          {workspaceOrganizationId && (
            <DealsTab client={client} organizationId={workspaceOrganizationId} />
          )}
        </TabsContent>

        <TabsContent value="projects" className="min-w-0 border-none p-4 outline-none sm:p-6">
          {workspaceOrganizationId && (
            <ProjectsTab client={client} organizationId={workspaceOrganizationId} />
          )}
        </TabsContent>

        <TabsContent value="tasks-calendar" className="min-w-0 border-none p-4 outline-none sm:p-6">
          {workspaceOrganizationId && (
            <TasksCalendarTab client={client} organizationId={workspaceOrganizationId} />
          )}
        </TabsContent>

        <TabsContent value="activity" className="min-w-0 border-none p-4 outline-none sm:p-6">
          {workspaceOrganizationId && (
            <ActivityTab client={client} organizationId={workspaceOrganizationId} />
          )}
        </TabsContent>

        <TabsContent value="documents" className="min-w-0 border-none p-4 outline-none sm:p-6">
          {workspaceOrganizationId && (
            <DocumentsTab client={client} organizationId={workspaceOrganizationId} />
          )}
        </TabsContent>

        <TabsContent value="billing" className="min-w-0 border-none p-4 outline-none sm:p-6">
          {workspaceOrganizationId && <BillingTab client={client} organizationId={workspaceOrganizationId} onUpdate={handleUpdateClient} />}
        </TabsContent>

        <TabsContent value="contacts" className="min-w-0 border-none p-4 outline-none sm:p-6">
          <ContactsTab client={client} onUpdate={handleUpdateClient} />
        </TabsContent>
      </Tabs>

      <DeleteRecordDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete client?"
        description={`Delete ${client.name} and remove it from this workspace. This action cannot be undone.`}
        isDeleting={deleteClientMutation.isPending}
        error={deleteClientMutation.error instanceof Error ? deleteClientMutation.error.message : null}
        onConfirm={() => {
          if (!workspaceOrganizationId) return;
          deleteClientMutation.mutate(
            { organizationId: workspaceOrganizationId, clientId: client.id },
            { onSuccess: () => onDeleted ? onDeleted() : router.replace("/clients") },
          );
        }}
      />
    </AppPageShell>
  );
}
