"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import {
  AtSign,
  Bot,
  CalendarClock,
  CheckSquare2,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Hash,
  Inbox,
  Layers3,
  ListChecks,
  MessageSquareReply,
  Plus,
  Search,
  UserCheck,
} from "lucide-react";
import { api } from "@convex/_generated/api";
import { useAuthSession } from "@/domains/auth";
import { useInboxState } from "@/domains/inbox";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { cn } from "@/lib/utils";
import type { ProjectManagementTreeProjection } from "@/components/shared";
import {
  workspaceSurfaceIdentity,
  type WorkspaceSurface,
} from "../workspace-surface";
import { useWorkspaceSurface } from "./workspace-surface-provider";

function IndexButton({
  icon,
  label,
  count,
  active,
  onClick,
  nested = false,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  nested?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-7 w-full items-center gap-2 rounded-md px-2 text-start text-xs transition-colors",
        nested && "ps-7",
        active
          ? "bg-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
      )}
    >
      <span className="shrink-0 opacity-80">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === "number" && count > 0 ? (
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {count > 999 ? "999+" : count}
        </span>
      ) : null}
    </button>
  );
}

function Section({
  title,
  open,
  onToggle,
  action,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  action?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex h-7 items-center gap-1 px-1">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          {open ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronRight className="size-3" />
          )}
          <span className="truncate">{title}</span>
        </button>
        {action ? (
          <button
            type="button"
            onClick={action}
            aria-label={`Add ${title}`}
            className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-3" />
          </button>
        ) : null}
      </div>
      {open ? <div className="space-y-0.5">{children}</div> : null}
    </section>
  );
}

export function WorkspaceIndex() {
  const session = useAuthSession();
  const organizationId =
    session.workspace.status === "ready"
      ? session.workspace.organizationId ?? undefined
      : undefined;
  const { surface, selectSurface } = useWorkspaceSurface();
  const activeIdentity = workspaceSurfaceIdentity(surface);
  const { channels } = useInboxState();
  const tasks = useTasksQuery(organizationId, { status: "all" }).data ?? [];
  const projection = useQuery(
    api.projectWorkspace.read.getProjectManagementTree,
    organizationId ? { organizationId } : "skip",
  ) as ProjectManagementTreeProjection | undefined;
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] = useState(
    () => new Set(["myTasks", "aiChats", "channels", "directMessages", "spaces"]),
  );

  const assignedCount = tasks.filter((task) =>
    task.assigneeUserIds?.includes(session.user.id) ||
    task.assigneeUserId === session.user.id,
  ).length;
  const directMessages = channels.filter(
    (channel) => channel.type === "dm" || channel.visibility === "dm",
  );
  const publicChannels = channels.filter(
    (channel) => channel.type !== "dm" && channel.visibility !== "dm",
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredChannels = useMemo(
    () =>
      publicChannels.filter((channel) =>
        channel.name.toLocaleLowerCase().includes(normalizedQuery),
      ),
    [normalizedQuery, publicChannels],
  );

  function isActive(next: WorkspaceSurface) {
    return activeIdentity === workspaceSurfaceIdentity(next);
  }

  function toggleSection(id: string) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <aside className="flex h-full min-h-0 w-[238px] shrink-0 flex-col border-e border-border bg-[var(--q-sidebar-bg,var(--background))]">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">Workspace</p>
          <p className="truncate text-[10px] text-muted-foreground">Everything in one place</p>
        </div>
        <button
          type="button"
          className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Create"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      <div className="shrink-0 p-2">
        <label className="flex h-7 items-center gap-2 rounded-md border border-border bg-background px-2">
          <Search className="size-3 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find in workspace"
            className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-2 pb-3">
        <div className="space-y-0.5">
          <IndexButton icon={<Inbox className="size-3.5" />} label="Inbox" active={isActive({ type: "inbox" })} onClick={() => selectSurface({ type: "inbox" })} />
          <IndexButton icon={<MessageSquareReply className="size-3.5" />} label="Replies" active={isActive({ type: "replies" })} onClick={() => selectSurface({ type: "replies" })} />
          <IndexButton icon={<UserCheck className="size-3.5" />} label="Assigned to me" count={assignedCount} active={isActive({ type: "assigned" })} onClick={() => selectSurface({ type: "assigned" })} />
          <IndexButton icon={<Hash className="size-3.5" />} label="All Channels" count={publicChannels.length} active={isActive({ type: "allChannels" })} onClick={() => selectSurface({ type: "allChannels" })} />
          <IndexButton icon={<Layers3 className="size-3.5" />} label="All Spaces" count={projection?.spaces.length} active={isActive({ type: "allSpaces" })} onClick={() => selectSurface({ type: "allSpaces" })} />
          <IndexButton icon={<ListChecks className="size-3.5" />} label="All Tasks" count={tasks.length} active={surface.type === "allTasks"} onClick={() => selectSurface({ type: "allTasks", view: "list" })} />
        </div>

        <Section title="My Tasks" open={openSections.has("myTasks")} onToggle={() => toggleSection("myTasks")}>
          <IndexButton nested icon={<CheckSquare2 className="size-3" />} label="Assigned to me" count={assignedCount} active={isActive({ type: "myTasks", filter: "my", view: "list" })} onClick={() => selectSurface({ type: "myTasks", filter: "my", view: "list" })} />
          <IndexButton nested icon={<CalendarClock className="size-3" />} label="Today & Overdue" active={surface.type === "myTasks" && (surface.filter === "today" || surface.filter === "overdue")} onClick={() => selectSurface({ type: "myTasks", filter: "today", view: "list" })} />
          <IndexButton nested icon={<CircleUserRound className="size-3" />} label="Personal List" active={false} onClick={() => selectSurface({ type: "myTasks", filter: "my", view: "table" })} />
        </Section>

        <Section title="AI Chats" open={openSections.has("aiChats")} onToggle={() => toggleSection("aiChats")} action={() => selectSurface({ type: "aiChat" })}>
          <IndexButton nested icon={<Bot className="size-3" />} label="Ask, build, create" active={surface.type === "aiChat"} onClick={() => selectSurface({ type: "aiChat" })} />
        </Section>

        <Section title="Channels" open={openSections.has("channels")} onToggle={() => toggleSection("channels")}>
          {filteredChannels.map((channel) => (
            <IndexButton
              key={channel.id}
              nested
              icon={<Hash className="size-3" />}
              label={channel.name}
              count={channel.unreadCount}
              active={isActive({ type: "channel", channelId: channel.id })}
              onClick={() => selectSurface({ type: "channel", channelId: channel.id })}
            />
          ))}
        </Section>

        <Section title="Direct Messages" open={openSections.has("directMessages")} onToggle={() => toggleSection("directMessages")}>
          {directMessages.map((channel) => (
            <IndexButton
              key={channel.id}
              nested
              icon={<AtSign className="size-3" />}
              label={channel.name}
              count={channel.unreadCount}
              active={isActive({ type: "directMessage", channelId: channel.id })}
              onClick={() => selectSurface({ type: "directMessage", channelId: channel.id })}
            />
          ))}
          {directMessages.length === 0 ? (
            <p className="px-7 py-1 text-[10px] text-muted-foreground">No conversations yet</p>
          ) : null}
        </Section>

        <Section title="Spaces" open={openSections.has("spaces")} onToggle={() => toggleSection("spaces")}>
          {projection?.spaces.map((space) => (
            <div key={space.id}>
              <IndexButton
                nested
                icon={<span className="size-2.5 rounded-sm" style={{ backgroundColor: space.color ?? "var(--primary)" }} />}
                label={space.name}
                count={space.projects.reduce((sum, project) => sum + project.taskCount, 0)}
                active={surface.type === "space" && surface.spaceId === space.id}
                onClick={() => selectSurface({ type: "space", spaceId: space.id, view: "overview" })}
              />
              {surface.type === "space" && surface.spaceId === space.id
                ? space.projects.map((project) => (
                    <div key={project.id} className="flex h-6 items-center gap-2 ps-10 pe-2 text-[10px] text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                      <span className="min-w-0 flex-1 truncate">{project.name}</span>
                      {project.taskCount ? <span>{project.taskCount}</span> : null}
                    </div>
                  ))
                : null}
            </div>
          ))}
        </Section>
      </div>
    </aside>
  );
}
