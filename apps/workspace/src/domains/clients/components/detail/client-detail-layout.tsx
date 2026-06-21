"use client";

import React, { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { useAccountContext } from "@/domains/auth";
import { useClientQuery, useUpdateClientOptimisticMutation } from "../../api/clients";
import { useClientTasksQuery } from "../../api/client-tasks";
import { useCalendarEventsQuery } from "@/domains/calendar/api/calendar";
import { useClientFollowUpsQuery } from "../../api/client-follow-ups";
import { clientsIndexQueryBaseKey } from "../../api/clients";
import { clientToFormValues } from "../../client-view-model";
import { type Client } from "../../store/clients.types";

import { AppPageShell, AppTabsList } from "@/components/shared";
import { ProgressiveLoadingState, DetailNotFoundState } from "@/components/shared/crud-ui";

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

export function ClientDetailLayout({ id }: { id: string }) {
  const t = useTranslations('Clients');
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? account.workspace.organizationId ?? undefined : undefined;
  
  const client = useClientQuery(workspaceOrganizationId, id) as Client | null | undefined;
  
  const clientCloseMutation = useUpdateClientOptimisticMutation(
    clientsIndexQueryBaseKey(workspaceOrganizationId)
  );

  const queryDebug = {
    resourceType: "client",
    resourceId: id,
    organizationId: workspaceOrganizationId,
    workspaceStatus,
    isConvexAuthPending: account.workspace.isConvexAuthPending,
    isConvexAuthenticated: account.workspace.isConvexAuthenticated,
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
    <AppPageShell contentClassName="space-y-8 pb-16 pt-8 max-w-[1200px] mx-auto px-6">
      <ClientDetailHeader 
        client={client} 
        onUpdate={handleUpdateClient} 
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <AppTabsList 
          className="bg-transparent border-b border-border rounded-none p-0 h-auto justify-start space-x-6"
          tabs={[
            { value: "overview", label: "Overview", icon: LayoutDashboard },
            { value: "deals", label: "Deals", icon: Briefcase },
            { value: "projects", label: "Projects", icon: FileText },
            { value: "tasks-calendar", label: "Tasks & Calendar", icon: Calendar },
            { value: "activity", label: "Activity", icon: ActivityIcon },
            { value: "documents", label: "Documents", icon: DocsIcon },
            { value: "billing", label: "Billing", icon: FileText },
            { value: "contacts", label: "Contacts", icon: Users },
          ]} 
        />

        <TabsContent value="overview" className="mt-6 border-none p-0 outline-none">
          <OverviewTab client={client} onUpdate={handleUpdateClient} />
        </TabsContent>

        <TabsContent value="deals" className="mt-6 border-none p-0 outline-none">
          {workspaceOrganizationId && (
            <DealsTab client={client} organizationId={workspaceOrganizationId} />
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-6 border-none p-0 outline-none">
          {workspaceOrganizationId && (
            <ProjectsTab client={client} organizationId={workspaceOrganizationId} />
          )}
        </TabsContent>

        <TabsContent value="tasks-calendar" className="mt-6 border-none p-0 outline-none">
          {workspaceOrganizationId && (
            <TasksCalendarTab client={client} organizationId={workspaceOrganizationId} />
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-6 border-none p-0 outline-none">
          {workspaceOrganizationId && (
            <ActivityTab client={client} organizationId={workspaceOrganizationId} />
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-6 border-none p-0 outline-none">
          {workspaceOrganizationId && (
            <DocumentsTab client={client} organizationId={workspaceOrganizationId} />
          )}
        </TabsContent>

        <TabsContent value="billing" className="mt-6 border-none p-0 outline-none">
          <BillingTab client={client} onUpdate={handleUpdateClient} />
        </TabsContent>

        <TabsContent value="contacts" className="mt-6 border-none p-0 outline-none">
          <ContactsTab client={client} onUpdate={handleUpdateClient} />
        </TabsContent>
      </Tabs>
    </AppPageShell>
  );
}
