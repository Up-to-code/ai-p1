"use client";

import { useMemo } from "react";
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  FileText,
  Users,
  Circle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useProjectQuery } from "@/domains/projects/api/projects";
import { useAccountContext } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import { ProjectsPanelSkeleton } from "@/components/loading-ui";

const projectTabs = [
  { name: "overview", href: "", icon: LayoutDashboard },
  { name: "tasks", href: "/tasks", icon: ListTodo },
  { name: "calendar", href: "/calendar", icon: CalendarDays },
  { name: "files", href: "/files", icon: FileText },
  { name: "team", href: "/team", icon: Users },
];

const statusColor: Record<string, string> = {
  active: "#22c55e",
  planned: "#3b82f6",
  paused: "#f59e0b",
  completed: "#8b5cf6",
  archived: "#6b7280",
};

export function SidebarProjectPanel() {
  const t = useTranslations("Sidebar");
  const account = useAccountContext();
  const { projectId, spaceSlug } = useNavigation();

  const orgId =
    account.workspace.status === "ready"
      ? account.workspace.organizationId ?? undefined
      : undefined;

  const project = projectId ? useProjectQuery(orgId, projectId) : null;
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

  const status = project.status ?? "active";

  return (
    <SidebarPanelLayout title={project.name}>
      <div className="flex flex-col py-2">
        {projectTabs.map((tab) => {
          const href = spaceSlug
            ? `/${tab.href}?space=${spaceSlug}&project=${projectId}`
            : `/${tab.href}?project=${projectId}`;

          return (
            <WorkspaceLink
              key={tab.name}
              href={href}
              className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
            >
              <tab.icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span className="truncate">{t(tab.name)}</span>
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
