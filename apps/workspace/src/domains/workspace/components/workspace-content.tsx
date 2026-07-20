"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import {
  Bot,
  Bookmark,
  CalendarDays,
  FileText,
  FolderKanban,
  Hash,
  Inbox,
  LayoutDashboard,
  List,
  MessageSquareReply,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Table2,
  Workflow,
} from "lucide-react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ResourceWorkspaceLayout,
  type ResourceWorkspaceConfig,
} from "@/components/shared";
import { useAuthSession } from "@/domains/auth";
import { useInboxState } from "@/domains/inbox";
import { InboxChannelScreen } from "@/domains/inbox/components/inbox-channel-screen";
import {
  useInboxAttention,
  useInboxReplies,
} from "@/domains/inbox/hooks/use-inbox-attention";
import { useWorkspaceSpacesQuery } from "@/domains/spaces/api/spaces";
import { TaskWorkspaceProvider } from "@/domains/tasks/components/task-workspace-provider";
import {
  TaskBoardRouteAdapter,
  TaskCalendarRouteAdapter,
  TaskListRouteAdapter,
  TaskTableRouteAdapter,
  TaskTimelineRouteAdapter,
} from "@/domains/tasks/components/task-route-adapters";
import { TaskDetailScreen } from "@/domains/tasks/components/task-detail-screen";
import {
  defaultTaskWorkspaceViewState,
  type TaskWorkspaceViewState,
} from "@/domains/tasks/workspace/task-workspace-view-state";
import { EveDashboardChat } from "@/components/dashboard/eve-dashboard-chat";
import type { ProjectManagementTreeProjection } from "@/components/shared";
import { WorkspaceCommandCenter } from "./workspace-command-center";
import { useWorkspaceSurface } from "./workspace-surface-provider";
import type {
  SpaceWorkspaceView,
  WorkspaceTaskView,
} from "../workspace-surface";

function SurfaceHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
        {description ? (
          <p className="truncate text-[10px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
    </header>
  );
}

function EmptySurface({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Inbox;
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-72 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid size-10 place-items-center rounded-xl border border-border bg-muted/30">
          <Icon className="size-4 text-muted-foreground" />
        </span>
        <h2 className="mt-3 text-sm font-semibold">{title}</h2>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function AttentionSurface({ replies = false }: { replies?: boolean }) {
  const attention = useInboxAttention("primary", "all");
  const replyEvents = useInboxReplies("unread");
  const result = replies ? replyEvents : attention;
  const { selectSurface } = useWorkspaceSurface();

  function openHref(href: string) {
    const taskMatch = href.match(/\/tasks\/([^/?#]+)/);
    if (taskMatch) selectSurface({ type: "task", taskId: taskMatch[1] });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SurfaceHeader
        title={replies ? "Replies" : "Inbox"}
        description={replies ? "Replies from across your work" : "Updates that need your attention"}
        actions={
          <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={result.markAllRead}>
            Mark all read
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-auto">
        {result.isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-14 w-full" />)}
          </div>
        ) : null}
        {result.events?.length === 0 ? (
          <EmptySurface icon={replies ? MessageSquareReply : Inbox} title={replies ? "No unread replies" : "Inbox zero"} description="New activity will appear here in real time." />
        ) : null}
        {result.events?.map((event) => (
          <button
            type="button"
            key={event._id}
            onClick={() => {
              if (!event.readAt) result.markRead(event._id);
              openHref(event.href);
            }}
            className="flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-start hover:bg-muted/40"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border">
              {replies ? <MessageSquareReply className="size-3.5" /> : <Inbox className="size-3.5" />}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{event.title}</span>
              {event.body ? <span className="block truncate text-xs text-muted-foreground">{event.body}</span> : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChannelDirectory() {
  const { channels, isLoadingChannels } = useInboxState();
  const { selectSurface } = useWorkspaceSurface();
  const [query, setQuery] = useState("");
  const visible = channels.filter(
    (channel) =>
      channel.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()) &&
      channel.type !== "dm" &&
      channel.visibility !== "dm",
  );
  return (
    <div className="flex h-full min-h-0 flex-col">
      <SurfaceHeader title="All Channels" description="Organization, Space, and Project conversations" />
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <label className="mb-3 flex h-9 items-center gap-2 rounded-md border border-border px-3">
          <Search className="size-3.5 text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search channels" className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
        </label>
        <div className="overflow-hidden rounded-md border border-border">
          {isLoadingChannels ? <div className="p-4 text-xs text-muted-foreground">Loading channels…</div> : null}
          {visible.map((channel) => (
            <button
              type="button"
              key={channel.id}
              onClick={() => selectSurface({ type: "channel", channelId: channel.id })}
              className="flex w-full items-center gap-3 border-b border-border/60 px-3 py-3 text-start last:border-0 hover:bg-muted/40"
            >
              <span className="grid size-8 place-items-center rounded-md bg-muted"><Hash className="size-3.5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">{channel.name}</span>
                <span className="block truncate text-[10px] capitalize text-muted-foreground">{channel.type} · {channel.visibility}</span>
              </span>
              <span className="text-[10px] text-muted-foreground">{channel.memberIds.length} members</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpacesDirectory({
  projection,
}: {
  projection?: ProjectManagementTreeProjection;
}) {
  const spaces = useWorkspaceSpacesQuery(
    useAuthSession().workspace.organizationId ?? undefined,
  );
  const { selectSurface } = useWorkspaceSurface();
  const [query, setQuery] = useState("");
  const visible = (spaces ?? []).filter((space) =>
    space.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <div className="flex h-full min-h-0 flex-col">
      <SurfaceHeader title="All Spaces" description="Browse every Space you can access" actions={<Button size="sm" className="h-7 gap-1.5 text-[11px]"><Plus className="size-3" />New Space</Button>} />
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <label className="mb-4 flex h-9 max-w-md items-center gap-2 rounded-md border border-border px-3">
          <Search className="size-3.5 text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Spaces" className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((space) => {
            const treeSpace = projection?.spaces.find((item) => item.id === space.id);
            return (
              <button
                type="button"
                key={space.id}
                onClick={() => selectSurface({ type: "space", spaceId: space.id, view: "overview" })}
                className="rounded-lg border border-border bg-card p-4 text-start transition-colors hover:bg-muted/30"
              >
                <span className="mb-4 grid size-9 place-items-center rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: space.color ?? "var(--primary)" }}>{space.name.slice(0, 1).toUpperCase()}</span>
                <span className="block text-sm font-semibold">{space.name}</span>
                <span className="mt-1 block text-[11px] text-muted-foreground">{treeSpace?.projects.length ?? 0} lists · {space.visibility}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TaskSurface({
  view,
  filter,
  spaceId,
}: {
  view: WorkspaceTaskView;
  filter: TaskWorkspaceViewState["filter"];
  spaceId?: string | null;
}) {
  const { selectSurface } = useWorkspaceSurface();
  const viewState = useMemo<TaskWorkspaceViewState>(
    () => ({ ...defaultTaskWorkspaceViewState, filter }),
    [filter],
  );
  const taskViews: ResourceWorkspaceConfig["views"] = [
    { id: "list", label: "List", href: "#", icon: <List className="h-3.5 w-3.5" /> },
    { id: "board", label: "Board", href: "#", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    { id: "table", label: "Table", href: "#", icon: <Table2 className="h-3.5 w-3.5" /> },
    { id: "calendar", label: "Calendar", href: "#", icon: <CalendarDays className="h-3.5 w-3.5" /> },
    { id: "timeline", label: "Timeline", href: "#", icon: <RefreshCw className="h-3.5 w-3.5" /> },
  ];
  const config: ResourceWorkspaceConfig = {
    resourceId: "ws-tasks",
    title: "Tasks",
    count: filter === "my" ? "Assigned to me" : filter === "today" ? "Today" : filter === "overdue" ? "Overdue" : "All tasks",
    views: taskViews,
    activeViewId: view,
    onViewSelect: (viewId) => {
      if (spaceId) selectSurface({ type: "space", spaceId, view: viewId === "timeline" ? "list" : viewId as SpaceWorkspaceView });
      else selectSurface(filter === "all" ? { type: "allTasks", view: viewId as WorkspaceTaskView } : { type: "myTasks", view: viewId as WorkspaceTaskView, filter: filter === "today" || filter === "overdue" ? filter : "my" });
    },
  };
  return (
    <TaskWorkspaceProvider
      spaceId={spaceId}
      viewState={viewState}
      onOpenTask={(taskId) => selectSurface({ type: "task", taskId })}
    >
      <ResourceWorkspaceLayout config={config}>
        <div className="min-h-0 flex-1">
          {view === "board" ? <TaskBoardRouteAdapter /> : view === "table" ? <TaskTableRouteAdapter /> : view === "calendar" ? <TaskCalendarRouteAdapter /> : view === "timeline" ? <TaskTimelineRouteAdapter /> : <TaskListRouteAdapter />}
        </div>
      </ResourceWorkspaceLayout>
    </TaskWorkspaceProvider>
  );
}

function OverviewCard({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-h-48 rounded-lg border border-border bg-card", className)}>
      <header className="flex h-10 items-center gap-2 border-b border-border/60 px-3 text-xs font-semibold">{icon}{title}</header>
      <div className="p-3">{children}</div>
    </section>
  );
}

function SpaceSurface({
  projection,
}: {
  projection?: ProjectManagementTreeProjection;
}) {
  const { surface, selectSurface } = useWorkspaceSurface();
  const { channels } = useInboxState();
  if (surface.type !== "space") return null;
  const space = projection?.spaces.find((item) => item.id === surface.spaceId);
  if (!space) return <EmptySurface icon={FolderKanban} title="Space unavailable" description="It may have been removed or you no longer have access." />;
  const spaceChannel = channels.find((channel) => channel.spaceId === space.id);

  const spaceViews: ResourceWorkspaceConfig["views"] = [
    { id: "channel", label: "Channel", href: "#", icon: <Hash className="h-3.5 w-3.5" /> },
    { id: "overview", label: "Overview", href: "#", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    { id: "list", label: "List", href: "#", icon: <List className="h-3.5 w-3.5" /> },
    { id: "board", label: "Board", href: "#", icon: <Workflow className="h-3.5 w-3.5" /> },
  ];
  const spaceConfig: ResourceWorkspaceConfig = {
    resourceId: `ws-space-${space.id}`,
    title: space.name,
    views: spaceViews,
    activeViewId: surface.view,
    onViewSelect: (viewId) => selectSurface({ type: "space", spaceId: space.id, view: viewId as SpaceWorkspaceView }),
  };

  if (surface.view === "channel") {
    if (!spaceChannel) return (
      <ResourceWorkspaceLayout config={spaceConfig}>
        <EmptySurface icon={Hash} title="No Space channel" description="Create a channel for this Space to start collaborating." />
      </ResourceWorkspaceLayout>
    );
    return (
      <ResourceWorkspaceLayout config={spaceConfig}>
        <InboxChannelScreen channelId={spaceChannel.id} onSelectChannel={(channelId) => selectSurface({ type: "channel", channelId })} onOpenSpace={(spaceId) => selectSurface({ type: "space", spaceId, view: "overview" })} />
      </ResourceWorkspaceLayout>
    );
  }
  if (surface.view === "list" || surface.view === "board" || surface.view === "table" || surface.view === "calendar") {
    return <TaskSurface view={surface.view} filter="all" spaceId={space.id} />;
  }
  return (
    <ResourceWorkspaceLayout config={spaceConfig}>
      <div className="min-h-0 flex-1 overflow-auto bg-muted/10 p-3">
        <div className="grid auto-rows-min gap-3 lg:grid-cols-2 xl:grid-cols-3">
          <OverviewCard title="Recent" icon={<RefreshCw className="size-3.5" />}>
            <div className="space-y-2">
              {space.projects.slice(0, 4).map((project) => <div key={project.id} className="flex items-center gap-2 text-xs"><List className="size-3 text-muted-foreground" /><span className="truncate">{project.name}</span><span className="ms-auto text-[10px] text-muted-foreground">{project.taskCount}</span></div>)}
            </div>
          </OverviewCard>
          <OverviewCard title="Bookmarks" icon={<Bookmark className="size-3.5" />}>
            <EmptySurface icon={Bookmark} title="Save important work" description="Bookmarks for this Space will appear here." />
          </OverviewCard>
          <OverviewCard title="Folders" icon={<FolderKanban className="size-3.5" />} className="lg:col-span-2 xl:col-span-3">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{space.projects.map((project) => <div key={project.id} className="rounded-md border border-border p-3"><FolderKanban className="size-4 text-muted-foreground" /><p className="mt-2 truncate text-xs font-medium">{project.name}</p><p className="text-[10px] text-muted-foreground">{project.taskCount} tasks</p></div>)}</div>
          </OverviewCard>
          <OverviewCard title="AI Brain" icon={<Bot className="size-3.5" />}>
            <button type="button" onClick={() => selectSurface({ type: "aiChat" })} className="grid min-h-32 w-full place-items-center rounded-md text-center hover:bg-muted/40"><span><Sparkles className="mx-auto size-5 text-primary" /><span className="mt-2 block text-xs">Ask Brain about this Space</span></span></button>
          </OverviewCard>
          <OverviewCard title="Docs" icon={<FileText className="size-3.5" />}>
            <div className="space-y-2">{space.documents.slice(0, 6).map((document) => <div key={document.id} className="flex items-center gap-2 text-xs"><FileText className="size-3 text-blue-500" /><span className="truncate">{document.title || "Untitled"}</span></div>)}</div>
          </OverviewCard>
          <OverviewCard title="Lists" icon={<Table2 className="size-3.5" />}>
            <div className="space-y-2">{space.projects.map((project) => <button type="button" key={project.id} onClick={() => selectSurface({ type: "space", spaceId: space.id, view: "list" })} className="flex w-full items-center gap-2 rounded px-1 py-1 text-xs hover:bg-muted"><List className="size-3" /><span className="truncate">{project.name}</span><span className="ms-auto text-[10px]">{project.taskCount}</span></button>)}</div>
          </OverviewCard>
        </div>
      </div>
    </ResourceWorkspaceLayout>
  );
}

export function WorkspaceContent() {
  const session = useAuthSession();
  const organizationId = session.workspace.organizationId ?? undefined;
  const { surface, selectSurface, resetSurface } = useWorkspaceSurface();
  const { channels, isLoadingChannels } = useInboxState();
  const spaces = useWorkspaceSpacesQuery(organizationId);
  const projection = useQuery(
    api.projectWorkspace.read.getProjectManagementTree,
    organizationId ? { organizationId } : "skip",
  ) as ProjectManagementTreeProjection | undefined;

  const selectedChannelId =
    surface.type === "channel" || surface.type === "directMessage"
      ? surface.channelId
      : undefined;
  const selectedChannelValid =
    selectedChannelId === undefined ||
    isLoadingChannels ||
    channels.some((channel) => channel.id === selectedChannelId);
  const selectedSpaceValid =
    surface.type !== "space" ||
    spaces === undefined ||
    spaces.some((space) => space.id === surface.spaceId);

  const selectionInvalid = !selectedChannelValid || !selectedSpaceValid;
  useEffect(() => {
    if (selectionInvalid) resetSurface();
  }, [resetSurface, selectionInvalid]);

  if (selectionInvalid) {
    return <div className="grid h-full place-items-center"><RefreshCw className="size-4 animate-spin text-muted-foreground" /></div>;
  }

  switch (surface.type) {
    case "overview":
      return <WorkspaceCommandCenter />;
    case "inbox":
      return <AttentionSurface />;
    case "replies":
      return <AttentionSurface replies />;
    case "assigned":
      return <TaskSurface view="list" filter="my" />;
    case "allChannels":
      return <ChannelDirectory />;
    case "channel":
    case "directMessage":
      return <InboxChannelScreen channelId={surface.channelId} onSelectChannel={(channelId) => selectSurface({ type: "channel", channelId })} onOpenSpace={(spaceId) => selectSurface({ type: "space", spaceId, view: "overview" })} />;
    case "allSpaces":
      return <SpacesDirectory projection={projection} />;
    case "space":
      return <SpaceSurface projection={projection} />;
    case "allTasks":
      return <TaskSurface view={surface.view} filter="all" />;
    case "myTasks":
      return <TaskSurface view={surface.view} filter={surface.filter === "my" ? "my" : surface.filter} />;
    case "task":
      return <TaskDetailScreen id={surface.taskId} />;
    case "aiChat":
      return <div className="h-full min-h-0"><EveDashboardChat organizationId={organizationId} /></div>;
  }
}
