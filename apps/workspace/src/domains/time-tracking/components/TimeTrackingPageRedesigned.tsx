"use client";

import { useState } from 'react';
import { useTranslations } from "next-intl";
import { Plus, Clock, Play, Pause, Calendar, User, BarChart3 } from "lucide-react";
import { QentrahTable, type QentrahColumnDef } from "@qentrah/ui";
import { DomainHeader, type HeaderAction } from "@/components/shared/domain/DomainHeader";
import { type ViewMode } from "@/components/shared/view-system/ViewSwitcher";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";
import { EmptyWorkspace, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useAuthSession } from "@/domains/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Mock time entry data structure
interface TimeEntry {
  id: string;
  description: string;
  project?: string;
  user: string;
  duration: number; // in minutes
  date: string;
  status: 'running' | 'completed';
}

export function TimeTrackingPageRedesigned() {
  const t = useTranslations("TimeTracking");
  const [activeView, setActiveView] = useState<ViewMode>('table');
  const session = useAuthSession();
  const workspaceStatus = session.workspace.status;

  // Mock data - replace with actual API calls
  const timeEntries: TimeEntry[] = [
    {
      id: '1',
      description: 'Design system review',
      project: 'Qentrah Platform',
      user: 'John Doe',
      duration: 120,
      date: '2026-07-02',
      status: 'completed',
    },
    {
      id: '2',
      description: 'API integration',
      project: 'Qentrah Platform',
      user: 'Jane Smith',
      duration: 45,
      date: '2026-07-02',
      status: 'running',
    },
    {
      id: '3',
      description: 'Bug fixes',
      project: 'Qentrah Platform',
      user: 'John Doe',
      duration: 90,
      date: '2026-07-01',
      status: 'completed',
    },
  ];

  const columns: QentrahColumnDef<TimeEntry>[] = [
    {
      headerName: "Description",
      field: "description",
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (p: any) => {
        const isRunning = p.data?.status === 'running';
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              isRunning ? "bg-green-500/10 text-green-600" : "bg-muted/50 text-muted-foreground"
            )}>
              {isRunning ? (
                <Play className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Clock className="h-3.5 w-3.5" />
              )}
            </div>
            <span className="text-sm font-medium text-foreground truncate">
              {p.data?.description}
            </span>
          </div>
        );
      },
    },
    {
      headerName: "Project",
      field: "project",
      width: 160,
      cellRenderer: (p: any) => (
        <span className="text-xs text-muted-foreground">
          {p.data?.project || "—"}
        </span>
      ),
    },
    {
      headerName: "User",
      field: "user",
      width: 120,
      cellRenderer: (p: any) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
            {p.data?.user?.charAt(0) || 'U'}
          </div>
          <span className="text-xs text-foreground">
            {p.data?.user}
          </span>
        </div>
      ),
    },
    {
      headerName: "Duration",
      field: "duration",
      width: 100,
      cellRenderer: (p: any) => {
        const minutes = p.data?.duration || 0;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return (
          <span className="text-xs font-medium text-foreground">
            {hours > 0 ? `${hours}h ` : ''}{mins}m
          </span>
        );
      },
    },
    {
      headerName: "Date",
      field: "date",
      width: 120,
      valueFormatter: (p: any) => {
        if (!p.value) return "—";
        return new Date(p.value).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
      },
    },
  ];

  const actions: HeaderAction[] = [
    {
      label: t("actions.startTimer"),
      icon: <Play className="w-4 h-4" />,
      onClick: () => {},
      variant: "primary",
    },
  ];

  const availableViews: ViewMode[] = ['table', 'timeline', 'calendar', 'dashboard', 'widgets'];

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex flex-col h-screen">
        <DomainHeader
          domain="Time Tracking"
          currentSection="All Entries"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <WorkspaceQueryState status={workspaceStatus} variant="table" />
        </div>
      </div>
    );
  }

  if (timeEntries.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <DomainHeader
          domain="Time Tracking"
          currentSection="All Entries"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <EmptyWorkspace
            icon={Clock}
            title="No time entries yet"
            description="Start tracking time for your projects and tasks"
          />
        </div>
      </div>
    );
  }

  const totalDuration = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMins = totalDuration % 60;

  return (
    <div className="flex flex-col h-screen">
      <DomainHeader
        domain="Time Tracking"
        currentSection={`${timeEntries.length} entries • ${totalHours > 0 ? `${totalHours}h ` : ''}${totalMins}m total`}
        actions={actions}
        availableViews={availableViews}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <div className="flex-1 overflow-hidden">
        {activeView === 'table' && (
          <div className="h-full p-6">
            <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
              <QentrahTable
                rows={timeEntries}
                columns={columns}
                density="compact"
                height="100%"
                rowSelection="single"
                getRowId={(row) => row.id}
              />
            </div>
          </div>
        )}

        {activeView === 'timeline' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Timeline view coming soon" />
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="h-full p-6">
            <ViewLoading style="calendar" message="Calendar view coming soon" />
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Dashboard view coming soon" />
          </div>
        )}

        {activeView === 'widgets' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Widgets view coming soon" />
          </div>
        )}
      </div>
    </div>
  );
}
