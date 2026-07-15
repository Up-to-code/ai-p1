"use client";

import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { NavigationDomainId } from "@qentrah/domain-contracts";
import { useTranslations } from "next-intl";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useAuthSession } from "@/domains/auth";
import { useDocsQuery } from "@/domains/docs/api/docs";
import { SpaceCreateForm } from "@/domains/spaces";
import { CreateProjectForm } from "@/domains/projects/components/create-project-form";
import { ProjectManagementTree, type ProjectManagementTreeProjection } from "@/components/shared";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import { SidebarProjectedDomainLinks } from "./sidebar-projected-domain-links";

function ProjectedDomainPanel({ domainId }: { domainId: NavigationDomainId }) {
  const t = useTranslations("Sidebar");
  return (
    <SidebarPanelLayout title={t(domainId)}>
      <SidebarProjectedDomainLinks domainId={domainId} />
    </SidebarPanelLayout>
  );
}

export function SidebarTasksPanel() {
  return <ProjectedDomainPanel domainId="tasks" />;
}

export function SidebarCalendarPanel() {
  return <ProjectedDomainPanel domainId="calendar" />;
}

export function SidebarProjectsPanel() {
  const organizationId = useAuthSession().workspace.organizationId ?? undefined;
  const projection = useConvexQuery(
    api.projectWorkspace.read.getProjectManagementTree,
    organizationId ? { organizationId } : "skip",
  ) as ProjectManagementTreeProjection | undefined;
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(["spaces", "channels", "direct-messages"]),
  );
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  function toggle(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  return (
    <>
      <SidebarPanelLayout title="Projects">
        {projection ? (
          <ProjectManagementTree
            projection={projection}
            expandedIds={expandedIds}
            onToggle={toggle}
            onCreateSpace={() => setCreateSpaceOpen(true)}
            onCreateProject={() => setCreateProjectOpen(true)}
          />
        ) : (
          <div className="space-y-1 p-2" aria-label="Loading Project navigation">
            <div className="h-7 animate-pulse rounded bg-muted" />
            <div className="h-7 animate-pulse rounded bg-muted" />
            <div className="h-7 animate-pulse rounded bg-muted" />
          </div>
        )}
      </SidebarPanelLayout>
      <SpaceCreateForm open={createSpaceOpen} onOpenChange={setCreateSpaceOpen} />
      <CreateProjectForm isOpen={createProjectOpen} onCancel={() => setCreateProjectOpen(false)} onSuccess={() => setCreateProjectOpen(false)} />
    </>
  );
}

export function SidebarCrmPanel() {
  return <ProjectedDomainPanel domainId="crm" />;
}

export function SidebarDeliveryPanel() {
  return <ProjectedDomainPanel domainId="delivery" />;
}

export function SidebarResourcesPanel() {
  return <ProjectedDomainPanel domainId="resources" />;
}

export function SidebarFinancePanel() {
  return <ProjectedDomainPanel domainId="finance" />;
}

export function SidebarReportsPanel() {
  return <ProjectedDomainPanel domainId="reports" />;
}

export function SidebarAutomationsPanel() {
  return <ProjectedDomainPanel domainId="automations" />;
}

export function SidebarAdminPanel() {
  return <ProjectedDomainPanel domainId="admin" />;
}

export function SidebarDocsPanel() {
  const session = useAuthSession();
  const organizationId = session.workspace.status === "ready" ? (session.workspace.organizationId ?? undefined) : undefined;
  const docsResult = useDocsQuery(organizationId);
  const recentDocs = [...(docsResult.data ?? [])]
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, 5);

  return (
    <SidebarPanelLayout
      title="Docs"
      primaryAction={
        <WorkspaceLink
          href="/docs?new=true"
          className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          New document
        </WorkspaceLink>
      }
    >
      <div className="flex flex-col gap-2">
        <SidebarProjectedDomainLinks domainId="docs" />
        <div className="mx-2 mt-3 border-t border-border/60 pt-3">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recently edited</p>
          <div className="space-y-0.5">
            {recentDocs.map((doc) => (
              <WorkspaceLink
                key={doc.id}
                href={`/docs/${doc.id}`}
                className="group flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-[var(--q-bg-tertiary)] hover:text-foreground"
              >
                <FileText className="size-3.5 shrink-0 opacity-70" />
                <span className="min-w-0 flex-1 truncate">{doc.title || "Untitled document"}</span>
              </WorkspaceLink>
            ))}
            {!docsResult.isLoading && recentDocs.length === 0 ? (
              <p className="px-2 py-2 text-xs text-muted-foreground">No recent documents</p>
            ) : null}
          </div>
        </div>
      </div>
    </SidebarPanelLayout>
  );
}
