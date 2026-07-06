"use client";

import {
  LayoutGrid,
  ListTodo,
  Layers,
  UserCircle,
  Grid3X3,
  BarChart3,
  Building2,
  ChevronRight,
} from "lucide-react";
import { useAuthSession } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { cn } from "@/lib/utils";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { SidebarPanelLayout } from "./sidebar-panel-layout";

function LauncherItem({
  icon: Icon,
  label,
  href,
  meta,
  onClick,
}: {
  icon: typeof LayoutGrid;
  label: string;
  href?: string;
  meta?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-[13px] font-medium text-foreground">{label}</div>
        {meta && <div className="truncate text-[11px] text-muted-foreground">{meta}</div>}
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
    </>
  );

  const className = cn(
    "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
    "hover:bg-accent/60 hover:text-foreground",
  );

  if (href) {
    return (
      <WorkspaceLink href={href} className={className}>
        {content}
      </WorkspaceLink>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function LauncherSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

export function SidebarIndexPanel() {
  const session = useAuthSession();
  const { activeSpace } = useNavigation();

  const orgName =
    session.organization.legalName?.trim() ||
    session.organization.name ||
    "Workspace";

  return (
    <SidebarPanelLayout title="Workspace">
      <div className="flex flex-col">
        {/* Current context */}
        <LauncherSection title="Current">
          <LauncherItem
            icon={Building2}
            label={orgName}
            meta="Workspace I am in"
            href="/ws"
          />
          {activeSpace && (
            <LauncherItem
              icon={Layers}
              label={activeSpace.name}
              meta="Space I am in"
              href={`/spaces?space=${activeSpace.slug}`}
            />
          )}
        </LauncherSection>

        {/* Overview & navigation */}
        <LauncherSection title="Overview">
          <LauncherItem
            icon={BarChart3}
            label="Overview"
            href="/ws"
          />
          <LauncherItem
            icon={Grid3X3}
            label="Custom widgets"
            href="/ws"
          />
        </LauncherSection>

        {/* Work */}
        <LauncherSection title="Work">
          <LauncherItem
            icon={LayoutGrid}
            label="Spaces"
            href="/spaces"
          />
          <LauncherItem
            icon={ListTodo}
            label="All tasks"
            href="/tasks"
          />
          <LauncherItem
            icon={UserCircle}
            label="My tasks"
            href="/tasks"
          />
        </LauncherSection>
      </div>
    </SidebarPanelLayout>
  );
}
