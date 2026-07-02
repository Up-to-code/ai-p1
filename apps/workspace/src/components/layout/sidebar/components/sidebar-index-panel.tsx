"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ListTodo,
  FolderGit2,
  Layers,
  Users,
  UserRound,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
  CalendarDays,
  KanbanSquare,
  BadgeDollarSign,
  Bot,
} from "lucide-react";
import { useAuthSession } from "@/domains/auth";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";
import { useWorkspaceSpacesQuery } from "@/domains/spaces/api/spaces";
import { listOrganizationMembers } from "@/domains/organization/api/members";
import { cn } from "@/lib/utils";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import { CollapsibleSection } from "./collapsible-section";
import { IndexPanelSkeleton } from "@/components/loading-ui";

function IndexItem({
  icon: Icon,
  label,
  href,
  meta,
  isMe,
}: {
  icon: typeof ListTodo;
  label: string;
  href: string;
  meta?: string;
  isMe?: boolean;
}) {
  return (
    <WorkspaceLink
      href={href}
      className="group/item flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {isMe && (
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          me
        </span>
      )}
      {meta && (
        <span className="text-[11px] text-text-muted">{meta}</span>
      )}
    </WorkspaceLink>
  );
}

export function SidebarIndexPanel() {
  const session = useAuthSession();
  const orgId = session.workspace.status === "ready"
    ? session.workspace.organizationId ?? undefined
    : undefined;
  const currentUserId = session.user?.id;

  const tasksQuery = useTasksQuery(orgId);
  const tasks = tasksQuery?.data ?? [];

  const projectsQuery = useProjectsIndexQuery(orgId);
  const projects = projectsQuery?.results ?? [];

  const spaces = useWorkspaceSpacesQuery(orgId) ?? [];

  const { data: members } = useQuery({
    queryKey: ["organization-members-summary", orgId],
    queryFn: () => listOrganizationMembers(orgId ?? ""),
    enabled: Boolean(orgId),
  });

  const isLoading = tasksQuery === undefined || projectsQuery === undefined || spaces === undefined;

  if (isLoading) {
    return <IndexPanelSkeleton />;
  }

  return (
    <SidebarPanelLayout title="Home">
      <div className="flex flex-col gap-2">
        {/* Tasks */}
        <CollapsibleSection
          title="Tasks"
          href="/tasks"
          count={tasks.length}
          moreHref="/tasks"
        >
          {tasks.slice(0, 5).map((task) => (
            <IndexItem
              key={task.id}
              icon={task.status === "done" ? CheckCircle2 : ListTodo}
              label={task.title}
              href={`/tasks/${task.id}`}
              meta={task.status}
            />
          ))}
          {tasks.length === 0 && (
            <div className="px-4 py-1.5 text-xs text-text-muted">No tasks yet</div>
          )}
        </CollapsibleSection>

        {/* Projects */}
        <CollapsibleSection
          title="Projects"
          href="/projects"
          count={projects.length}
          moreHref="/projects"
        >
          {projects.slice(0, 5).map((project) => (
            <IndexItem
              key={project.id}
              icon={FolderGit2}
              label={project.name}
              href={`/projects/${project.id}`}
            />
          ))}
          {projects.length === 0 && (
            <div className="px-4 py-1.5 text-xs text-text-muted">No projects yet</div>
          )}
        </CollapsibleSection>

        {/* Spaces */}
        <CollapsibleSection
          title="Spaces"
          href="/spaces"
          count={spaces.length}
          moreHref="/spaces"
        >
          {spaces.slice(0, 5).map((space) => (
            <IndexItem
              key={space.id}
              icon={Layers}
              label={space.name}
              href={`/spaces?id=${space.id}`}
            />
          ))}
          {spaces.length === 0 && (
            <div className="px-4 py-1.5 text-xs text-text-muted">No spaces yet</div>
          )}
        </CollapsibleSection>


      </div>
    </SidebarPanelLayout>
  );
}
