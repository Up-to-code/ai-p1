"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  AppWindow,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  FolderGit2,
  Layers,
  Plus,
  SlidersHorizontal,
  Tags,
  UsersRound,
  Workflow,
} from "lucide-react";
import { useAuthSession } from "@/domains/auth";
import { authClient } from "@/lib/auth-client";
import { useOrganizationSwitch } from "@/components/layout/sidebar/hooks/use-organization-switch";
import type { BetterAuthOrganization } from "@/components/layout/sidebar/lib/types";
import { useNavigation } from "@/domains/navigation";
import { useWorkspaceSpacesQuery } from "@/domains/spaces/api/spaces";
import { SpaceCreateForm } from "@/domains/spaces";
import { useProjectSwitcher } from "@/domains/projects/hooks/use-project-switcher";
import { CreateProjectForm } from "@/domains/projects/components/create-project-form";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function organizationInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "O";
}

function planLabel(type?: string | null) {
  return type === "company" ? "Business" : "Free";
}

function WorkspaceContextSection({ organizationId }: { organizationId?: string }) {
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const { spaceSlug, setSpace, setProject } = useNavigation();
  const spaces = useWorkspaceSpacesQuery(organizationId);
  const { projects, activeProject, isLoading: projectsLoading } = useProjectSwitcher();

  const spaceList = spaces ?? [];
  const activeSpace = spaceList.find((space) => space.slug === spaceSlug) ?? null;
  const isLoadingSpaces = spaces === undefined;

  return (
    <>
      <DropdownMenuSeparator />
      <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
        Workspace context
      </div>
      <div className="space-y-1 px-1.5 pb-1">
        <div className="rounded-lg border border-border/70 bg-muted/30 p-1">
          <div className="px-1.5 pb-1 text-[10px] font-semibold uppercase text-muted-foreground">
            Space
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
            onClick={() => setSpace(null)}
          >
            <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{activeSpace?.name ?? "All Spaces"}</span>
            {!activeSpace && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
          </button>
          <div className="max-h-32 overflow-y-auto">
            {isLoadingSpaces ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">Loading spaces...</div>
            ) : (
              spaceList.slice(0, 5).map((space) => (
                <button
                  key={space.id}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                  onClick={() => setSpace(space.slug)}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
                    style={space.color ? { backgroundColor: space.color } : undefined}
                  />
                  <span className="min-w-0 flex-1 truncate">{space.name}</span>
                  {activeSpace?.id === space.id && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/30 p-1">
          <div className="px-1.5 pb-1 text-[10px] font-semibold uppercase text-muted-foreground">
            Project
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
            onClick={() => setProject(null)}
          >
            <FolderGit2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">All Projects</span>
            {!activeProject && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
          </button>
          <div className="max-h-32 overflow-y-auto">
            {projectsLoading ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">Loading projects...</div>
            ) : (
              projects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                  onClick={() => setProject(project.id)}
                >
                  <FolderGit2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{project.name}</span>
                  {activeProject?.id === project.id && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                </button>
              ))
            )}
            {!projectsLoading && projects.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">No projects yet</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border/70 px-2 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
            onClick={() => setCreateSpaceOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Space
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border/70 px-2 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
            onClick={() => setCreateProjectOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Project
          </button>
        </div>
      </div>

      <SpaceCreateForm open={createSpaceOpen} onOpenChange={setCreateSpaceOpen} />
      <CreateProjectForm
        isOpen={createProjectOpen}
        onSuccess={() => setCreateProjectOpen(false)}
        onCancel={() => setCreateProjectOpen(false)}
      />
    </>
  );
}

export function TopbarEssential() {
  const locale = useLocale();
  const session = useAuthSession();
  const organizationsQuery = authClient.useListOrganizations();
  const allOrgs = useMemo(
    () =>
      ((organizationsQuery.data ?? []) as BetterAuthOrganization[])
        .filter((organization) => organization.id),
    [organizationsQuery.data],
  );
  const { switchingOrganizationId, switchOrganization } = useOrganizationSwitch(session.organization.id ?? "");
  const organizationDisplayName =
    session.organization.legalName?.trim() ||
    session.organization.name ||
    "Organization";
  const currentPlan = planLabel(session.organization.type);
  const currentInitials = organizationInitials(organizationDisplayName);
  const organizationCount = Math.max(allOrgs.length, session.organization.id ? 1 : 0);
  const currentOrganization = allOrgs.find((org) => org.id === session.organization.id);
  const currentRole = (currentOrganization as BetterAuthOrganization & { role?: string | null } | undefined)?.role;
  const isOwner = currentRole?.includes("owner") ?? false;
  const organizationId =
    session.workspace.status === "ready"
      ? session.workspace.organizationId ?? undefined
      : undefined;

  return (
    <div className="flex items-center gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex h-8 min-w-[148px] items-center gap-2 rounded-md px-2 transition-colors hover:bg-[var(--q-bg-secondary)]"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--q-bg-secondary)] text-[10px] font-black uppercase">
                {session.organization.logo ? (
                  <img src={session.organization.logo} alt="" className="h-full w-full object-cover" />
                ) : (
                  currentInitials
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-start leading-tight">
                <span className="w-full truncate text-[12px] font-semibold text-foreground">{organizationDisplayName}</span>
                <span className="text-[10px] font-medium text-muted-foreground">{currentPlan}</span>
              </div>
              <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          }
        />
        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="w-72 rounded-xl border-border p-1.5"
        >
          <DropdownMenuItem
            render={<Link href={`/${locale}/organization`} />}
            className="flex items-start gap-3 rounded-lg px-2 py-2.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-sm font-black uppercase text-primary-foreground">
              {session.organization.logo ? (
                <img src={session.organization.logo} alt="" className="h-full w-full object-cover" />
              ) : (
                currentInitials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="max-w-[190px] truncate text-left text-sm font-semibold text-foreground">{organizationDisplayName}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>{currentPlan}</span>
                {isOwner && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span>Owner</span>
                  </>
                )}
                <span aria-hidden="true">/</span>
                <span>{organizationCount} workspace{organizationCount === 1 ? "" : "s"}</span>
              </div>
            </div>
          </DropdownMenuItem>

          {[
            { label: "Organization", icon: Building2, href: `/${locale}/organization` },
            { label: "People", icon: UsersRound, href: `/${locale}/organization?tab=members` },
            { label: "WS Settings", icon: SlidersHorizontal, href: `/${locale}/settings/general` },
            { label: "Billing", icon: CreditCard, href: `/${locale}/settings/billing` },
          ].map((item) => (
            <DropdownMenuItem
              key={item.label}
              render={<Link href={item.href} />}
              className="mx-1.5 gap-2 rounded-lg px-2 py-1.5 text-sm"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{item.label}</span>
            </DropdownMenuItem>
          ))}

          <WorkspaceContextSection organizationId={organizationId} />

          <DropdownMenuSeparator />

          <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
            Manage
          </div>
          {[
            { label: "Apps", icon: AppWindow },
            { label: "Custom Fields", icon: Tags },
            { label: "Automations", icon: Workflow },
          ].map((item) => (
            <DropdownMenuItem
              key={item.label}
              disabled
              className="mx-1.5 gap-2 rounded-lg px-2 py-1.5 text-sm opacity-100"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{item.label}</span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Coming soon
              </span>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
            Workspaces
          </div>
          {allOrgs.map((org) => {
            const isActive = org.id === session.organization.id;
            const displayName = org.name || "Organization";
            const initials = organizationInitials(displayName);
            return (
              <DropdownMenuItem
                key={org.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5"
                onClick={() => {
                  if (!isActive && org.id) {
                    switchOrganization(org.id);
                  }
                }}
                disabled={isActive || switchingOrganizationId === org.id}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md text-[10px] font-black uppercase",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {org.logo ? (
                    <img src={org.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm text-foreground">{displayName}</span>
                    {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
          {allOrgs.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No organizations found</div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={<Link href={`/${locale}/choose-org`} />}
            className="mx-1.5 justify-center gap-2 rounded-lg border border-border/70 px-2 py-1.5 text-sm"
          >
            <Plus className="h-4 w-4" />
            Create Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
