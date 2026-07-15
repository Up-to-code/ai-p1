"use client";

import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Hash,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInboxState } from "@/domains/inbox";
import { useAuthSession } from "@/domains/auth";
import { useWorkspaceSpacesQuery, type Space } from "@/domains/spaces/api/spaces";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChannelSection } from "./sidebar-inbox-panel/channel-section";
import {
  filterChannelsByScope,
  groupInboxChannels,
} from "./sidebar-inbox-panel/channel-filter";
import { orgFilterOptions } from "./sidebar-inbox-panel/data";
import type {
  OrgFilterType,
  SidebarInboxChannel,
} from "./sidebar-inbox-panel/types";
import { SidebarProjectedDomainLinks } from "./sidebar-projected-domain-links";

export function SidebarInboxPanel() {
  const t = useTranslations("Inbox.sidebar");
  const organizationId = useAuthSession().workspace.organizationId ?? undefined;
  const { channels, isLoadingChannels } = useInboxState();
  const spaces = useWorkspaceSpacesQuery(organizationId);
  const [selectedOrgFilter, setSelectedOrgFilter] =
    useState<OrgFilterType>("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filteredChannels = filterChannelsByScope(
    channels as SidebarInboxChannel[],
    selectedOrgFilter,
  );
  const groupedChannels = groupInboxChannels(filteredChannels);

  const toggle = (section: string) =>
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));

  return (
    <SidebarPanelLayout
      title={t("title")}
      header={
        <div className="p-2 pb-0">
          <InboxScopeFilter selectedOrgFilter={selectedOrgFilter} onSelect={setSelectedOrgFilter} />
        </div>
      }
      primaryAction={
        <WorkspaceLink
          href="/inbox"
          extraParams={{ new: "true", channel: "", settings: "" }}
          className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("newChannel")}
        </WorkspaceLink>
      }
    >
      <div className="mb-3 border-b border-border/60 pb-3">
        <SidebarProjectedDomainLinks domainId="inbox" />
      </div>
      <InboxSpaceTree
        organizationId={organizationId}
        spaces={spaces}
        title={t("spaces")}
        emptyLabel={t("noSpaces")}
      />
      <div className="mb-1 mt-3 flex h-7 items-center gap-1.5 px-1.5">
        <Hash className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t("channels")}
        </span>
      </div>
      {isLoadingChannels ? <InboxChannelSkeleton /> : null}

      {!isLoadingChannels && channels.length === 0 ? (
        <EmptyInboxChannels
          emptyLabel={t("noChannels")}
          createLabel={t("createFirstChannel")}
        />
      ) : null}

      {!isLoadingChannels && channels.length > 0 ? (
        <>
          <ChannelSection
            title={t("organization")}
            icon={Hash}
            channels={groupedChannels.organization}
            collapsed={collapsed.org ?? false}
            onToggle={() => toggle("org")}
          />
          <ChannelSection
            title={t("spaces")}
            icon={FolderOpen}
            channels={groupedChannels.spaces}
            collapsed={collapsed.space ?? false}
            onToggle={() => toggle("space")}
          />
          <ChannelSection
            title={t("projects")}
            icon={FolderOpen}
            channels={groupedChannels.projects}
            collapsed={collapsed.project ?? false}
            onToggle={() => toggle("project")}
          />
          <ChannelSection
            title={t("directMessages")}
            icon={Users}
            channels={groupedChannels.directMessages}
            collapsed={collapsed.dm ?? false}
            onToggle={() => toggle("dm")}
          />
          <ChannelSection
            title={t("clients")}
            icon={Hash}
            channels={groupedChannels.clients}
            collapsed={collapsed.client ?? false}
            onToggle={() => toggle("client")}
          />
        </>
      ) : null}
    </SidebarPanelLayout>
  );
}

function InboxSpaceTree({
  organizationId,
  spaces,
  title,
  emptyLabel,
}: {
  organizationId?: string;
  spaces: Space[] | undefined;
  title: string;
  emptyLabel: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-7 w-full items-center gap-1.5 rounded-md px-1.5 text-start transition-colors hover:bg-accent"
      >
        {open ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        )}
        <FolderOpen className="h-3 w-3 text-muted-foreground/60" />
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
      </button>
      {open ? (
        <div className="mt-0.5 space-y-0.5 pl-1">
          {spaces === undefined ? (
            <div className="space-y-1 px-2 py-1">
              <div className="h-6 animate-pulse rounded bg-muted" />
              <div className="h-6 animate-pulse rounded bg-muted" />
            </div>
          ) : null}
          {spaces?.length === 0 ? (
            <p className="px-2 py-1.5 text-[11px] text-muted-foreground">{emptyLabel}</p>
          ) : null}
          {spaces?.map((space) => (
            <InboxSpaceNode
              key={space.id}
              organizationId={organizationId}
              space={space}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function InboxSpaceNode({
  organizationId,
  space,
}: {
  organizationId?: string;
  space: Space;
}) {
  const t = useTranslations("Inbox.sidebar");
  const [open, setOpen] = useState(false);
  const projects = useQuery(
    api.projects.read.listBySpace,
    organizationId && open
      ? {
          organizationId,
          spaceId: space.id as Id<"spaces">,
          limit: 100,
        }
      : "skip",
  );

  return (
    <div>
      <div className="group flex items-center rounded-md hover:bg-accent">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? t("collapseSpace", { name: space.name }) : t("expandSpace", { name: space.name })}
          className="grid h-7 w-6 shrink-0 place-items-center text-muted-foreground"
        >
          {open ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
        <WorkspaceLink
          href="/spaces"
          extraParams={{ space: space.slug }}
          className="flex h-7 min-w-0 flex-1 items-center gap-2 pe-2 text-[12px] font-medium text-muted-foreground group-hover:text-foreground"
        >
          <span
            className={cn("h-2.5 w-2.5 shrink-0 rounded-full", !space.color && "bg-primary")}
            style={space.color ? { backgroundColor: space.color } : undefined}
          />
          <span className="truncate">{space.name}</span>
        </WorkspaceLink>
      </div>
      {open ? (
        <div className="ms-6 border-s border-border/60 ps-1">
          {projects === undefined ? (
            <div className="h-6 animate-pulse rounded bg-muted" />
          ) : null}
          {projects?.length === 0 ? (
            <p className="px-2 py-1 text-[11px] text-muted-foreground">{t("noProjects")}</p>
          ) : null}
          {projects?.map((project) => (
            <WorkspaceLink
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex h-7 items-center gap-2 rounded-md px-2 text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <span className="truncate">{project.name}</span>
            </WorkspaceLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function InboxScopeFilter({
  selectedOrgFilter,
  onSelect,
}: {
  selectedOrgFilter: OrgFilterType;
  onSelect: (value: OrgFilterType) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 h-8 w-full justify-between rounded-md px-2 text-[12px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              {
                orgFilterOptions.find(
                  (option) => option.id === selectedOrgFilter,
                )?.label
              }
            </div>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        }
      />
      <PopoverContent side="bottom" align="start" className="w-40 p-1">
        {orgFilterOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              selectedOrgFilter === option.id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function InboxChannelSkeleton() {
  return (
    <div className="space-y-4 px-1">
      {["Organization", "Projects", "Direct messages"].map((section) => (
        <div key={section} className="space-y-1">
          <div className="flex h-6 items-center gap-2 px-1.5">
            <div className="h-3 w-3 animate-pulse rounded bg-muted" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {section}
            </span>
          </div>
          {Array.from({ length: section === "Organization" ? 1 : 2 }).map(
            (_, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
              >
                <div className="h-3.5 w-3.5 shrink-0 animate-pulse rounded bg-muted" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-14 animate-pulse rounded bg-muted/60" />
                </div>
              </div>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyInboxChannels({
  emptyLabel,
  createLabel,
}: {
  emptyLabel: string;
  createLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Hash className="mb-2 h-8 w-8 text-muted-foreground/30" />
      <p className="text-xs text-muted-foreground">{emptyLabel}</p>
      <WorkspaceLink
        href="/inbox"
        extraParams={{ new: "true", channel: "", settings: "" }}
        className="mt-3 text-xs font-medium text-primary hover:underline"
      >
        {createLabel}
      </WorkspaceLink>
    </div>
  );
}
