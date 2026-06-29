"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountContext } from "@/domains/auth";
import { useProjectQuery } from "../api/projects";
import { useTasksQuery, createTaskRequest, updateTaskRequest, deleteTaskRequest } from "@/domains/tasks/api/tasks";
import { listOrganizationMembers } from "@/domains/organization/api/members";
import { 
  Box, Table2, KanbanSquare, LayoutGrid, ListTodo, Calendar, Clock, Activity, 
  BarChart, Network, Users, MapPin, Globe, FileSpreadsheet, Plus, Search, 
  Lock, Pin, ArrowLeft, ArrowUpDown, ChevronDown, Check, Circle, Trash2, 
  Flag, Globe2, Sparkles, CheckCircle2, ChevronRight, X, AlertCircle, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectDashboard } from "./project-dashboard";
import { AddViewDropdown, type ViewOption, type ViewType } from "./add-view-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProjectDetailOverviewProps {
  projectId: string;
}

interface ActiveView {
  id: string;
  type: string;
  label: string;
}

const DEFAULT_VIEWS: ActiveView[] = [
  { id: "view-1", type: "dashboard", label: "Box" },
  { id: "view-2", type: "table", label: "Table" },
  { id: "view-3", type: "board", label: "Board" },
];

export function getViewIcon(type: string) {
  switch (type) {
    case "list": return ListTodo;
    case "calendar": return Calendar;
    case "board": return KanbanSquare;
    case "doc": return FileSpreadsheet;
    case "form": return CheckCircle2;
    case "dashboard": return LayoutGrid;
    case "table": return Table2;
    case "timeline": return Clock;
    case "activity": return Activity;
    case "workload": return BarChart;
    case "mindmap": return Network;
    case "team": return Users;
    case "map": return MapPin;
    default: return LayoutGrid;
  }
}

export function getViewColor(type: string) {
  switch (type) {
    case "list": return "#3a3a3a";
    case "calendar": return "#e87732";
    case "board": return "#7c3aed";
    case "doc": return "#2563eb";
    case "form": return "#db2777";
    case "dashboard": return "#4f46e5";
    case "table": return "#16a34a";
    case "timeline": return "#e87732";
    case "activity": return "#0891b2";
    case "workload": return "#0d9488";
    case "mindmap": return "#db2777";
    case "team": return "#7c3aed";
    case "map": return "#dc2626";
    default: return "#4f46e5";
  }
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  todo: { bg: "bg-muted/40", text: "text-muted-foreground", border: "border-muted" },
  inProgress: { bg: "bg-[var(--q-info)]/10", text: "text-[var(--q-info)]", border: "border-[var(--q-info)]/20" },
  waiting: { bg: "bg-[var(--q-warning)]/10", text: "text-[var(--q-warning)]", border: "border-[var(--q-warning)]/20" },
  done: { bg: "bg-[var(--q-success)]/10", text: "text-[var(--q-success)]", border: "border-[var(--q-success)]/20" },
  canceled: { bg: "bg-muted/20", text: "text-muted-foreground/60", border: "border-muted/30" },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  urgent: { bg: "bg-[var(--q-error)]/10", text: "text-[var(--q-error)]", border: "border-[var(--q-error)]/20" },
  high: { bg: "bg-[var(--q-warning)]/10", text: "text-[var(--q-warning)]", border: "border-[var(--q-warning)]/20" },
  normal: { bg: "bg-[var(--q-info)]/10", text: "text-[var(--q-info)]", border: "border-[var(--q-info)]/20" },
  low: { bg: "bg-muted/40", text: "text-muted-foreground", border: "border-muted" },
};

const COUNTRY_FLAGS: Record<string, string> = {
  Egypt: "🇪🇬",
  "Saudi Arabia": "🇸🇦",
  "United States": "🇺🇸",
  USA: "🇺🇸",
  Jordan: "🇯🇴",
  Germany: "🇩🇪",
  UK: "🇬🇧",
  France: "🇫🇷",
  UAE: "🇦🇪",
  Canada: "🇨🇦",
  Japan: "🇯🇵",
};

export function ProjectDetailOverview({ projectId }: ProjectDetailOverviewProps) {
  const account = useAccountContext();
  const workspaceOrganizationId = account.workspace.status === "ready" ? account.workspace.organizationId : undefined;
  const project = useProjectQuery(workspaceOrganizationId ?? undefined, projectId);

  const [views, setViews] = useState<ActiveView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string>("");

  useEffect(() => {
    const savedViews = localStorage.getItem(`project-views-${projectId}`);
    if (savedViews) {
      try {
        const parsed = JSON.parse(savedViews);
        if (parsed.length > 0) {
          setViews(parsed);
          setActiveViewId(parsed[0].id);
          return;
        }
      } catch (e) { /* ignore */ }
    }
    setViews(DEFAULT_VIEWS);
    setActiveViewId(DEFAULT_VIEWS[0].id);
  }, [projectId]);

  const handleAddView = (option: ViewOption) => {
    const newView: ActiveView = {
      id: `view-${Date.now()}`,
      type: option.type,
      label: option.label,
    };
    const updatedViews = [...views, newView];
    setViews(updatedViews);
    setActiveViewId(newView.id);
    localStorage.setItem(`project-views-${projectId}`, JSON.stringify(updatedViews));
  };

  if (project === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const activeView = views.find(v => v.id === activeViewId) || views[0];
  const activeType = activeView?.type || "dashboard";

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6 space-y-6 h-full flex flex-col">
      {/* Header Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center px-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Box className="h-5 w-5" />
          </div>
          <div className="min-w-0 mr-4">
            <h1 className="text-xl font-black tracking-tight text-foreground truncate">{project.name || "Project Details"}</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 ml-6 text-sm font-bold text-muted-foreground">
            {views.map((view) => {
              const Icon = getViewIcon(view.type);
              const color = getViewColor(view.type);
              const isActive = activeViewId === view.id;
              return (
                <button 
                  key={view.id}
                  onClick={() => setActiveViewId(view.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 transition-all rounded-lg text-xs font-black",
                    isActive 
                      ? "text-foreground bg-background border border-border shadow-sm" 
                      : "hover:text-foreground hover:bg-muted/50 border border-transparent"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                  <span style={isActive ? { color } : {}}>{view.label}</span>
                </button>
              );
            })}
            
            <div className="ml-2 pl-2 border-l border-border/80">
              <AddViewDropdown onAddView={handleAddView} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 px-4">
        {activeType === "dashboard" && <ProjectDashboard projectId={projectId} />}
        {activeType === "table" && <TaskTableView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "list" && <TaskListView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "board" && <TaskBoardView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "calendar" && <TaskCalendarView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "timeline" && <TaskTimelineView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "map" && <TaskMapView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
      </div>
    </div>
  );
}

/* ==========================================================================
   TASK TABLE VIEW
   ========================================================================== */
export function TaskTableView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const queryClient = useQueryClient();
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];

  const { data: members = [] } = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId),
    enabled: !!organizationId,
  });

  const [newTitle, setNewTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await createTaskRequest(organizationId, {
        title: newTitle.trim(),
        status: "todo",
        priority: "normal",
        visibility: "team",
        assigneeUserId: "",
        clientId: "",
        projectId,
        dueDate: "",
        description: "",
        tags: "",
      });
      setNewTitle("");
      queryClient.invalidateQueries({ queryKey: ["tasks", organizationId] });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (task: any, updates: any) => {
    try {
      await updateTaskRequest(organizationId, task.id, {
        title: task.title,
        status: task.status,
        priority: task.priority,
        visibility: task.visibility || "team",
        assigneeUserId: task.assigneeUserId || "",
        clientId: task.clientId || "",
        projectId: task.projectId || "",
        dueDate: task.dueDate || "",
        description: task.description || "",
        tags: (task.tags || []).join(", "),
        ...updates,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", organizationId] });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTaskRequest(organizationId, taskId);
      queryClient.invalidateQueries({ queryKey: ["tasks", organizationId] });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full font-sans overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#141414] border-b border-[#222]">
        <div className="flex items-center gap-1.5">
          <span className="bg-[#1e2a1e] text-[#4ade80] text-[11px] px-2 py-0.5 rounded-full border border-[#2a3a2a]">● Shown</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="bg-[#7c3aed] text-white border-none rounded-md px-3 py-1 text-[12px] font-medium cursor-pointer flex items-center gap-1 hover:bg-[#6d28d9] transition-colors">
            + Task <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-[#111]">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-[#2a2a2a]">
              <th className="w-8 px-3 py-2 text-left text-[11px] font-medium text-[#6b7280] uppercase tracking-[0.04em] whitespace-nowrap"></th>
              <th className="w-9 px-3 py-2 text-center text-[11px] font-medium text-[#444] uppercase tracking-[0.04em] whitespace-nowrap">#</th>
              <th className="min-w-[220px] px-3 py-2 text-left text-[11px] font-medium text-[#6b7280] uppercase tracking-[0.04em] whitespace-nowrap">Name</th>
              <th className="min-w-[140px] px-3 py-2 text-left text-[11px] font-medium text-[#6b7280] uppercase tracking-[0.04em] whitespace-nowrap">Assignee</th>
              <th className="min-w-[130px] px-3 py-2 text-left text-[11px] font-medium text-[#6b7280] uppercase tracking-[0.04em] whitespace-nowrap">Status</th>
              <th className="min-w-[140px] px-3 py-2 text-left text-[11px] font-medium text-[#6b7280] uppercase tracking-[0.04em] whitespace-nowrap">Due date</th>
              <th className="min-w-[100px] px-3 py-2 text-left text-[11px] font-medium text-[#6b7280] uppercase tracking-[0.04em] whitespace-nowrap">Priority</th>
              <th className="w-8 px-3 py-2 text-center"><span className="text-[#3a3a3a] text-[18px] cursor-pointer hover:text-[#6b7280] font-normal leading-none">+</span></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => {
              const assigneeMember = members.find(m => m.userId === task.assigneeUserId);
              
              // Status Badge
              let statusBadgeClass = "bg-[#2a2a2a] text-[#a1a1aa] border-transparent";
              let statusText = "TO DO";
              let StatusBadgeIcon = () => <div className="w-[8px] h-[8px] rounded-full border-[1.5px] border-[#a1a1aa]" />;
              
              if (task.status === "inProgress") {
                statusBadgeClass = "bg-[#3b82f6] text-white border-transparent";
                statusText = "IN PROGRESS";
                StatusBadgeIcon = () => <div className="w-[8px] h-[8px] rounded-full bg-white" />;
              } else if (task.status === "done") {
                statusBadgeClass = "bg-[#22c55e] text-white border-transparent";
                statusText = "COMPLETE";
                StatusBadgeIcon = () => <Check className="w-[10px] h-[10px] stroke-[3]" />;
              }

              // Status Icon (circle next to name)
              let statusIconClass = "border-2 border-[#4b5563] bg-transparent text-transparent";
              let StatusIconInner = null;
              if (task.status === "inProgress") {
                statusIconClass = "border-2 border-[#3b82f6] bg-transparent text-transparent";
              } else if (task.status === "done") {
                statusIconClass = "bg-[#16a34a] border-none text-white";
                StatusIconInner = () => <Check className="w-[9px] h-[9px] stroke-[4]" />;
              }

              // Priority
              let priorityContent = null;
              if (task.priority === "urgent") {
                priorityContent = <span className="inline-flex items-center gap-[6px] text-[11px] font-medium text-[#fca5a5] bg-[#ef4444]/10 px-2 py-0.5 rounded-[4px]"><Flag className="w-[10px] h-[10px] fill-[#ef4444] text-[#ef4444]" /> Urgent</span>;
              } else if (task.priority === "high") {
                priorityContent = <span className="inline-flex items-center gap-[6px] text-[11px] font-medium text-[#fcd34d] bg-[#f59e0b]/10 px-2 py-0.5 rounded-[4px]"><Flag className="w-[10px] h-[10px] fill-[#f59e0b] text-[#f59e0b]" /> High</span>;
              } else if (task.priority === "normal") {
                priorityContent = <span className="inline-flex items-center gap-[6px] text-[11px] font-medium text-[#9ca3af]"><Flag className="w-[10px] h-[10px] text-[#6b7280]" /> Normal</span>;
              } else if (task.priority === "low") {
                priorityContent = <span className="inline-flex items-center gap-[6px] text-[11px] font-medium text-[#9ca3af]"><Flag className="w-[10px] h-[10px] text-[#6b7280]" /> Low</span>;
              }

              return (
                <tr key={task.id} className="border-b border-[#1f1f1f] cursor-pointer transition-colors hover:bg-[#1a1a1a] group">
                  <td className="px-3 py-[7px] whitespace-nowrap align-middle">
                    <input type="checkbox" className="w-[14px] h-[14px] border-[1.5px] border-[#3a3a3a] rounded-[3px] bg-transparent accent-[#7c3aed] cursor-pointer shrink-0 align-middle m-0" />
                  </td>
                  <td className="px-3 py-[7px] whitespace-nowrap align-middle text-[#444] text-[11px] text-center">{index + 1}</td>
                  
                  <td className="px-3 py-[7px] whitespace-nowrap align-middle text-[#e5e7eb] font-normal min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-[14px] h-[14px] rounded-full shrink-0 inline-flex items-center justify-center overflow-hidden", statusIconClass)}>
                        {StatusIconInner && <StatusIconInner />}
                      </div>
                      
                      {editingTaskId === task.id ? (
                        <input
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          onBlur={() => {
                            if (editTitleValue.trim() && editTitleValue.trim() !== task.title) {
                              handleUpdate(task, { title: editTitleValue.trim() });
                            }
                            setEditingTaskId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (editTitleValue.trim() && editTitleValue.trim() !== task.title) {
                                handleUpdate(task, { title: editTitleValue.trim() });
                              }
                              setEditingTaskId(null);
                            }
                            if (e.key === "Escape") setEditingTaskId(null);
                          }}
                          autoFocus
                          className="bg-transparent border-b border-[#7c3aed] text-white font-normal outline-none w-full px-1 py-0 text-[13px] z-20"
                        />
                      ) : (
                        <span
                          onDoubleClick={() => {
                            setEditingTaskId(task.id);
                            setEditTitleValue(task.title);
                          }}
                          className={cn("truncate", task.status === "done" && "line-through text-muted-foreground")}
                        >
                          {task.title}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-[7px] whitespace-nowrap align-middle">
                    <div className="flex items-center gap-1.5 text-[#9ca3af] text-[12px]">
                      {task.assigneeUserId ? (
                        <>
                          <div className="w-[22px] h-[22px] rounded-full bg-[#0891b2] text-white text-[10px] font-semibold inline-flex items-center justify-center shrink-0">
                            {assigneeMember?.user?.name?.charAt(0) || "U"}
                          </div>
                          <span>{assigneeMember?.user?.name || "User"}</span>
                        </>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-3 py-[7px] whitespace-nowrap align-middle">
                    <span className={cn(
                      "inline-flex items-center gap-[6px] rounded-full text-[10px] font-bold px-[8px] py-[3px] tracking-wide border",
                      statusBadgeClass
                    )}>
                      <StatusBadgeIcon />
                      {statusText}
                    </span>
                  </td>

                  <td className="px-3 py-[7px] whitespace-nowrap align-middle text-[#9ca3af] text-[12px]">
                    {task.dueDate || ""}
                  </td>

                  <td className="px-3 py-[7px] whitespace-nowrap align-middle">
                    {priorityContent}
                  </td>
                  <td></td>
                </tr>
              );
            })}
            
            {/* Add new task row */}
            <tr className="hover:bg-transparent">
              <td className="px-3 py-1.5 whitespace-nowrap align-middle"></td>
              <td className="px-3 py-1.5 whitespace-nowrap align-middle"></td>
              <td className="px-3 py-1.5 whitespace-nowrap align-middle">
                <form onSubmit={handleCreate} className="flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                  <span className="text-[#4b5563] text-[18px] cursor-pointer hover:text-[#9ca3af] leading-none">+</span>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Click here to add a new task..." 
                    className="bg-transparent border-none outline-none text-[#4b5563] text-[12px] w-full placeholder:text-[#4b5563]"
                  />
                </form>
              </td>
              <td colSpan={5} className="px-3 py-1.5 whitespace-nowrap align-middle"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================================================
   TASK LIST VIEW
   ========================================================================== */
export function TaskListView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const queryClient = useQueryClient();
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];

  const [expandedStatus, setExpandedStatus] = useState<Record<string, boolean>>({
    todo: true,
    inProgress: true,
    waiting: true,
    done: true,
  });

  const tasksByStatus = useMemo(() => {
    return {
      todo: tasks.filter(t => t.status === "todo"),
      inProgress: tasks.filter(t => t.status === "inProgress"),
      waiting: tasks.filter(t => t.status === "waiting"),
      done: tasks.filter(t => t.status === "done" || t.status === "canceled"),
    };
  }, [tasks]);

  const toggleExpand = (status: string) => {
    setExpandedStatus(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const handleUpdate = async (task: any, updates: any) => {
    try {
      await updateTaskRequest(organizationId, task.id, {
        title: task.title,
        status: task.status,
        priority: task.priority,
        visibility: task.visibility || "team",
        assigneeUserId: task.assigneeUserId || "",
        clientId: task.clientId || "",
        projectId: task.projectId || "",
        dueDate: task.dueDate || "",
        description: task.description || "",
        tags: (task.tags || []).join(", "),
        ...updates,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", organizationId] });
    } catch (e) {
      console.error(e);
    }
  };

  const renderGroup = (statusKey: string, title: string, list: any[], colorStyle: any) => {
    const isExpanded = expandedStatus[statusKey];
    return (
      <div key={statusKey} className="space-y-1 bg-card rounded-2xl border border-border/80 p-3 shadow-sm">
        <button
          onClick={() => toggleExpand(statusKey)}
          className="flex items-center gap-2 w-full text-left font-black uppercase text-xs tracking-wider pb-2 border-b border-border/40"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <span className={cn(colorStyle.text)}>{title}</span>
          <span className="bg-muted text-muted-foreground font-black px-1.5 py-0.5 rounded-full text-[9px] ml-2">
            {list.length}
          </span>
        </button>

        {isExpanded && (
          <div className="pt-2 divide-y divide-border/30">
            {list.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/60 py-3 text-center">No tasks in this status</p>
            ) : (
              list.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2.5 group">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdate(task, { status: task.status === "done" ? "todo" : "done" })}
                      className={cn(
                        "h-4 w-4 rounded border transition-colors flex items-center justify-center",
                        task.status === "done" ? "bg-[var(--q-success)] border-[var(--q-success)] text-white" : "border-muted-foreground/30 hover:border-muted-foreground/60"
                      )}
                    >
                      {task.status === "done" && <Check className="h-3 w-3" />}
                    </button>
                    <span className={cn("text-xs font-bold text-foreground", task.status === "done" && "line-through text-muted-foreground/50")}>
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.dueDate && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                        <Calendar className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className={cn("text-[9px] font-black uppercase tracking-wider border rounded-full px-2 py-0.5", PRIORITY_COLORS[task.priority]?.bg, PRIORITY_COLORS[task.priority]?.text, PRIORITY_COLORS[task.priority]?.border)}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
      {renderGroup("todo", "To Do", tasksByStatus.todo, STATUS_COLORS.todo)}
      {renderGroup("inProgress", "In Progress", tasksByStatus.inProgress, STATUS_COLORS.inProgress)}
      {renderGroup("waiting", "Waiting", tasksByStatus.waiting, STATUS_COLORS.waiting)}
      {renderGroup("done", "Complete / Done", tasksByStatus.done, STATUS_COLORS.done)}
    </div>
  );
}

/* ==========================================================================
   TASK BOARD (KANBAN) VIEW
   ========================================================================== */
export function TaskBoardView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const queryClient = useQueryClient();
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];

  const columns = [
    { key: "todo", label: "To Do", color: STATUS_COLORS.todo },
    { key: "inProgress", label: "In Progress", color: STATUS_COLORS.inProgress },
    { key: "waiting", label: "Waiting", color: STATUS_COLORS.waiting },
    { key: "done", label: "Done", color: STATUS_COLORS.done },
  ];

  const handleUpdate = async (task: any, updates: any) => {
    try {
      await updateTaskRequest(organizationId, task.id, {
        title: task.title,
        status: task.status,
        priority: task.priority,
        visibility: task.visibility || "team",
        assigneeUserId: task.assigneeUserId || "",
        clientId: task.clientId || "",
        projectId: task.projectId || "",
        dueDate: task.dueDate || "",
        description: task.description || "",
        tags: (task.tags || []).join(", "),
        ...updates,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", organizationId] });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 h-[550px] overflow-hidden">
      {columns.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <div key={col.key} className="flex flex-col bg-muted/20 border border-border/80 rounded-2xl p-3 h-full overflow-hidden">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
              <span className={cn("text-xs font-black uppercase tracking-wider", col.color.text)}>{col.label}</span>
              <span className="bg-muted text-muted-foreground font-black px-1.5 py-0.5 rounded-full text-[9px]">
                {colTasks.length}
              </span>
            </div>

            {/* Cards container */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-none">
              {colTasks.map((task) => {
                const priorityStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.normal;
                return (
                  <div key={task.id} className="bg-card border border-border/80 hover:border-primary/20 p-3 rounded-xl shadow-sm transition-colors group">
                    <h4 className="text-xs font-bold text-foreground leading-snug">{task.title}</h4>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/30">
                      {task.dueDate ? (
                        <span className="text-[9px] text-muted-foreground font-bold flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : <span />}

                      <span className={cn("text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border", priorityStyle.bg, priorityStyle.text, priorityStyle.border)}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Cycle buttons */}
                    <div className="mt-2.5 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {columns.filter(c => c.key !== task.status).slice(0, 2).map((c) => (
                        <button
                          key={c.key}
                          onClick={() => handleUpdate(task, { status: c.key })}
                          className="text-[9px] font-black text-muted-foreground hover:text-foreground bg-muted/60 px-1.5 py-0.5 rounded"
                        >
                          → {c.label.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {colTasks.length === 0 && (
                <div className="text-center py-8 text-[11px] text-muted-foreground/40 font-bold">No Tasks</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ==========================================================================
   TASK CALENDAR VIEW
   ========================================================================== */
export function TaskCalendarView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];

  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill prefix spaces for the starting day of the week
    const startDay = date.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Fill actual month dates
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const t of tasks) {
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)?.push(t);
      }
    }
    return map;
  }, [tasks]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-md flex flex-col h-[550px]">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
        <h3 className="text-sm font-black text-foreground">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="px-2.5 py-1 text-xs font-bold bg-muted hover:bg-muted/80 border rounded-lg">Prev</button>
          <button onClick={nextMonth} className="px-2.5 py-1 text-xs font-bold bg-muted hover:bg-muted/80 border rounded-lg">Next</button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1.5 text-center mb-1 bg-muted/20 py-1.5 rounded-lg border border-border/40">
        {weekdayLabels.map((w) => (
          <span key={w} className="text-[10px] font-black uppercase text-muted-foreground">{w}</span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 overflow-y-auto pr-1">
        {daysInMonth.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-muted/5 border border-transparent rounded-lg min-h-[60px]" />;
          
          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const dayTasks = tasksByDay.get(key) || [];
          const isToday = new Date().toDateString() === day.toDateString();

          return (
            <div
              key={key}
              className={cn(
                "bg-muted/10 border border-border/40 rounded-xl p-1.5 min-h-[65px] flex flex-col justify-between transition-colors hover:bg-muted/20",
                isToday && "ring-2 ring-primary/40 bg-muted/20 border-primary/20"
              )}
            >
              <div className="flex justify-between items-center">
                <span className={cn("text-[10px] font-bold text-muted-foreground", isToday && "text-primary font-black")}>
                  {day.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <span className="bg-primary/20 text-primary rounded-full text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Tasks bullet list */}
              <div className="mt-1 space-y-0.5 overflow-hidden flex-1 max-h-[40px]">
                {dayTasks.slice(0, 2).map((t: any) => (
                  <div key={t.id} className="text-[8px] font-bold truncate text-foreground/80 bg-card border border-border/40 px-1 py-0.5 rounded">
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-[7px] text-muted-foreground/60 font-black text-center mt-0.5">
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   TASK TIMELINE (GANTT) VIEW
   ========================================================================== */
export function TaskTimelineView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];

  const timelineData = useMemo(() => {
    const withDue = tasks.filter(t => t.dueDate).map(t => ({
      ...t,
      dueTime: new Date(t.dueDate!).getTime(),
    })).sort((a, b) => a.dueTime - b.dueTime);

    if (withDue.length === 0) return [];

    const minTime = withDue[0].dueTime - 5 * 86400000; // start 5 days before first due date
    const maxTime = withDue[withDue.length - 1].dueTime + 5 * 86400000;
    const span = maxTime - minTime || 86400000;

    return withDue.map((t) => {
      // Simulate progress bar starting 3 days before due date
      const start = t.dueTime - 3 * 86400000;
      const left = Math.max(0, ((start - minTime) / span) * 100);
      const width = Math.min(100 - left, (3 * 86400000 / span) * 100);
      return {
        ...t,
        left,
        width: Math.max(width, 2),
      };
    });
  }, [tasks]);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-md flex flex-col h-[550px]">
      <div className="pb-3 border-b border-border/40 mb-3 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Project Timeline & Duration Map</span>
        <span className="text-[10px] font-bold text-muted-foreground/60">{timelineData.length} tasks scheduled</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-none">
        {timelineData.map((task) => {
          const statusStyle = STATUS_COLORS[task.status] || STATUS_COLORS.todo;
          return (
            <div key={task.id} className="flex items-center gap-3 p-2 bg-muted/10 border border-border/40 hover:border-primary/20 rounded-xl transition-colors">
              <div className="w-48 shrink-0 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{task.title}</p>
                <p className="text-[9px] text-muted-foreground/60 font-semibold mt-0.5">Due: {new Date(task.dueDate!).toLocaleDateString()}</p>
              </div>

              {/* Gantt Bar */}
              <div className="flex-1 relative h-6 bg-muted/30 border border-border/30 rounded-lg overflow-hidden">
                <div
                  className={cn("absolute h-4 top-1 rounded-md transition-all", statusStyle.bg, statusStyle.border, "border shadow-sm")}
                  style={{
                    left: `${task.left}%`,
                    width: `${task.width}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
        {timelineData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-bold text-muted-foreground/60">No tasks with due dates to map</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   TASK MAP VIEW (LAND OF COUNTRIES)
   ========================================================================== */
export function TaskMapView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];

  // Categorize tasks by country matching in their tags or title
  const countriesData = useMemo(() => {
    const list = [
      { name: "Egypt", coords: "30.0444° N, 31.2357° E", color: "bg-emerald-500", text: "text-emerald-500" },
      { name: "Saudi Arabia", coords: "24.7136° N, 46.6753° E", color: "bg-blue-500", text: "text-blue-500" },
      { name: "Jordan", coords: "31.9522° N, 35.9106° E", color: "bg-purple-500", text: "text-purple-500" },
      { name: "Germany", coords: "51.1657° N, 10.4515° E", color: "bg-amber-500", text: "text-amber-500" },
      { name: "United States", coords: "37.0902° N, 95.7129° W", color: "bg-rose-500", text: "text-rose-500" },
    ];

    return list.map((c) => {
      const countryTasks = tasks.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(c.name.toLowerCase());
        const descMatch = t.description?.toLowerCase().includes(c.name.toLowerCase());
        const tagMatch = (t.tags || []).some(tag => tag.toLowerCase() === c.name.toLowerCase());
        return titleMatch || descMatch || tagMatch;
      });

      const total = countryTasks.length;
      const completed = countryTasks.filter(t => t.status === "done").length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...c,
        flag: COUNTRY_FLAGS[c.name] || "🏳️",
        tasks: countryTasks,
        total,
        completed,
        pct,
      };
    }).sort((a, b) => b.total - a.total);
  }, [tasks]);

  const unassignedTasks = useMemo(() => {
    return tasks.filter((t) => {
      return !countriesData.some(c => {
        const titleMatch = t.title.toLowerCase().includes(c.name.toLowerCase());
        const descMatch = t.description?.toLowerCase().includes(c.name.toLowerCase());
        const tagMatch = (t.tags || []).some(tag => tag.toLowerCase() === c.name.toLowerCase());
        return titleMatch || descMatch || tagMatch;
      });
    });
  }, [tasks, countriesData]);

  return (
    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
      {/* Geographic Header Info */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <Globe2 className="h-6 w-6 text-primary shrink-0 animate-spin-slow" />
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Global Operations Map</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tasks mapped to operations in target sovereign countries. Tag tasks with country names to pin them.</p>
        </div>
      </div>

      {/* Grid of Sovereign Country Cards */}
      <div className="grid grid-cols-3 gap-4">
        {countriesData.map((country) => (
          <div key={country.name} className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[170px] hover:border-primary/20 transition-colors">
            <div>
              {/* Flag + Name */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl leading-none shrink-0">{country.flag}</span>
                  <h4 className="text-sm font-black text-foreground">{country.name}</h4>
                </div>
                <span className={cn("text-[9px] font-bold text-muted-foreground/60 font-mono")}>{country.coords}</span>
              </div>

              {/* Progress metric */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1">
                  <span>Tasks Completed</span>
                  <span className="text-foreground">{country.pct}% ({country.completed}/{country.total})</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", country.color)}
                    style={{ width: `${country.pct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Country Task List items */}
            <div className="mt-4 pt-2 border-t border-border/40 flex-1">
              <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-1.5">MAPPED TASKS</p>
              {country.tasks.length === 0 ? (
                <p className="text-[10px] text-muted-foreground/40 font-bold italic py-1">No operations pinned</p>
              ) : (
                <div className="space-y-1 max-h-[60px] overflow-y-auto scrollbar-none">
                  {country.tasks.map(t => (
                    <div key={t.id} className="text-[10px] font-bold text-foreground/80 flex items-center gap-1.5 truncate">
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", country.color)} />
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unassigned to Map section */}
      {unassignedTasks.length > 0 && (
        <div className="bg-muted/10 border border-border/60 rounded-2xl p-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground/80 mb-2">Unassigned Locations ({unassignedTasks.length})</h4>
          <div className="flex flex-wrap gap-2">
            {unassignedTasks.map(t => (
              <span key={t.id} className="text-[10px] font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 border border-border/40 rounded-lg">
                {t.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
