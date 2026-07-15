"use client";

import {
  ListTodo,
  CalendarDays,
  FileText,
  Users,
  Circle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useProjectQuery } from "@/domains/projects/api/projects";
import { useAuthSession } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import { ProjectsPanelSkeleton } from "@/components/loading-ui";

const projectTabs = [
  { name: "overview", path: "project", icon: Circle },
  { name: "tasks", path: "tasks", icon: ListTodo },
  { name: "milestones", path: "tasks", view: "milestones", icon: Circle },
  { name: "timeline", path: "tasks", view: "timeline", icon: CalendarDays },
  { name: "calendar", path: "calendar", icon: CalendarDays },
  { name: "documents", path: "docs", icon: FileText },
  { name: "discussions", path: "channels", icon: FileText },
  { name: "time", path: "delivery", view: "time", icon: CalendarDays },
  { name: "expenses", path: "finance", view: "expenses", icon: FileText },
  { name: "clientApprovals", path: "delivery", view: "approvals", icon: Circle },
  { name: "budgetMargin", path: "finance", view: "project-budgets", icon: Circle },
  { name: "team", path: "team", icon: Users },
  { name: "automations", path: "automations", icon: Circle },
  { name: "settings", path: "project", view: "settings", icon: Circle },
];

export function SidebarProjectPanel() {
  const t = useTranslations("Sidebar");
  const session = useAuthSession();
  const { projectId, spaceSlug } = useNavigation();

  const orgId =
    session.workspace.status === "ready"
      ? session.workspace.organizationId ?? undefined
      : undefined;

  const projectQuery = useProjectQuery(orgId, projectId ?? "");
  const project = projectId ? projectQuery : null;
  const isLoadingProject = project === undefined;

  if (isLoadingProject) {
    return <ProjectsPanelSkeleton />;
  }

  if (!project) {
    return (
      <SidebarPanelLayout title="Project">
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <p className="text-xs font-semibold text-text-muted">No project selected</p>
        </div>
      </SidebarPanelLayout>
    );
  }

  return (
    <SidebarPanelLayout title={project.name}>
      <div className="flex flex-col py-2">
        {projectTabs.map((tab) => {
          const base = tab.path === "project" ? `/projects/${projectId}` : `/${tab.path}`;
          const params = new URLSearchParams();
          if (spaceSlug) params.set("space", spaceSlug);
          params.set("project", projectId!);
          if (tab.view) params.set(tab.path === "project" ? "tab" : "view", tab.view);
          const href = `${base}?${params.toString()}`;

          return (
            <WorkspaceLink
              key={tab.name}
              href={href}
              className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
            >
              <tab.icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span className="truncate">{t.has(`nodes.${tab.name}`) ? t(`nodes.${tab.name}`) : t(tab.name)}</span>
            </WorkspaceLink>
          );
        })}
      </div>

      <div className="mx-4 my-2 h-px bg-border/50" />

      {project.teamMemberIds && project.teamMemberIds.length > 0 && (
        <div className="px-4 py-1">
          <p className="mb-2 text-xs font-semibold text-text-muted">Team</p>
          <div className="flex flex-wrap gap-1.5">
            {project.teamMemberIds.slice(0, 8).map((memberId: string) => (
              <div
                key={memberId}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted text-[9px] font-black uppercase text-foreground"
              >
                {memberId.charAt(0).toUpperCase()}
              </div>
            ))}
            {project.teamMemberIds.length > 8 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted text-[9px] font-bold text-muted-foreground">
                +{project.teamMemberIds.length - 8}
              </div>
            )}
          </div>
        </div>
      )}
    </SidebarPanelLayout>
  );
}
