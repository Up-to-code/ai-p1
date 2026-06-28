"use client";

import type { ElementType } from "react";
import { Plus, Bot, Star, ChevronRight } from "lucide-react";

const pinnedItems = [
  "Website Redesign",
  "Q4 Budget",
  "Client Meeting Notes",
  "Product Roadmap",
  "Design System",
];

const notifications = [
  { text: "Task completed by John", time: "2m ago" },
  { text: "New comment on design", time: "15m ago" },
  { text: "Meeting scheduled", time: "1h ago" },
  { text: "File uploaded to assets", time: "3h ago" },
  { text: "Invoice approved", time: "5h ago" },
];

export function WorkspaceRightSidebar() {
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col gap-2.5 overflow-y-auto border-l border-border bg-inherit p-4 scrollbar-none">
      {/* Agents section */}
      <SectionLabel label="Agents" />
      <div className="flex flex-col gap-2">
        <Card icon={Plus} label="New agent" subtitle="Create a workflow" />
        <Card icon={Bot} label="My agents" subtitle="3 active" />
      </div>

      {/* Pinned items */}
      <SectionLabel label="Pinned" />
      <div className="flex flex-col gap-1.5">
        {pinnedItems.map((item) => (
          <div key={item} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-secondary">
            <Star className="h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="currentColor" fillOpacity={0.3} />
            <span className="truncate text-xs text-foreground">{item}</span>
          </div>
        ))}
      </div>

      {/* Token usage */}
      <SectionLabel label="Token usage" />
      <div className="flex flex-col gap-2 rounded-lg bg-secondary p-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[62%] rounded-full bg-accent" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">62% used</span>
          <button type="button" className="flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-accent">
            View details
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <SectionLabel label="Notifications" />
      <div className="flex flex-col gap-1.5 rounded-lg">
        {notifications.map((n) => (
          <div key={n.text} className="flex items-start gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-secondary">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs text-foreground">{n.text}</span>
              <span className="text-[10px] text-muted-foreground">{n.time}</span>
            </div>
          </div>
        ))}
        <button type="button" className="flex items-center gap-0.5 px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-accent">
          View all
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </aside>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <span className="pt-2 text-[10px] uppercase tracking-wider text-muted-foreground first:pt-0">
      {label}
    </span>
  );
}

function Card({
  icon: Icon,
  label,
  subtitle,
}: {
  icon: ElementType;
  label: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 text-left transition-all hover:border-accent border border-border"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground">{subtitle}</span>
      </div>
    </button>
  );
}
