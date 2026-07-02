"use client";

import { cn } from "@/lib/utils";

// Base skeleton component
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Sidebar-specific skeleton components
export function SidebarHeaderSkeleton() {
  return (
    <div className="flex h-14 shrink-0 items-center justify-between px-4 border-b border-border">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-6 w-6" />
    </div>
  );
}

export function SidebarSectionSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-20" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: items }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export function SidebarItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function SidebarListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

// AI Chat Panel Skeleton
export function AiChatPanelSkeleton() {
  return (
    <div className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-secondary w-72">
      <SidebarHeaderSkeleton />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SidebarItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Spaces Panel Skeleton
export function SpacesPanelSkeleton() {
  return (
    <div className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-secondary w-72">
      <SidebarHeaderSkeleton />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-4">
          <SidebarSectionSkeleton items={4} />
          <SidebarSectionSkeleton items={3} />
        </div>
      </div>
    </div>
  );
}

// Projects Panel Skeleton
export function ProjectsPanelSkeleton() {
  return (
    <div className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-secondary w-72">
      <SidebarHeaderSkeleton />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SidebarListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Tasks Panel Skeleton
export function TasksPanelSkeleton() {
  return (
    <div className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-secondary w-72">
      <SidebarHeaderSkeleton />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SidebarItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Calendar Panel Skeleton
export function CalendarPanelSkeleton() {
  return (
    <div className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-secondary w-72">
      <SidebarHeaderSkeleton />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-32 w-full rounded-lg" />
          <SidebarSectionSkeleton items={3} />
        </div>
      </div>
    </div>
  );
}

// Clients Panel Skeleton
export function ClientsPanelSkeleton() {
  return (
    <div className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-secondary w-72">
      <SidebarHeaderSkeleton />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SidebarItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Opportunities Panel Skeleton
export function OpportunitiesPanelSkeleton() {
  return (
    <div className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-secondary w-72">
      <SidebarHeaderSkeleton />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SidebarItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Deals Panel Skeleton
export function DealsPanelSkeleton() {
  return (
    <div className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-secondary w-72">
      <SidebarHeaderSkeleton />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SidebarItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Docs Panel Skeleton
export function DocsPanelSkeleton() {
  return (
    <div className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-secondary w-72">
      <SidebarHeaderSkeleton />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-4">
          <SidebarSectionSkeleton items={3} />
          <SidebarSectionSkeleton items={2} />
        </div>
      </div>
    </div>
  );
}

// Index/Home Panel Skeleton
export function IndexPanelSkeleton() {
  return (
    <div className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-secondary w-72">
      <SidebarHeaderSkeleton />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <SidebarSectionSkeleton items={4} />
          <SidebarSectionSkeleton items={3} />
        </div>
      </div>
    </div>
  );
}
