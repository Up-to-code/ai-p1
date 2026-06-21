"use client";

import React, { useState, useMemo } from "react";
import { type Client } from "../../../store/clients.types";
import { useQuery as useConvexQuery } from "convex/react";
import { api as convexApi } from "@convex/_generated/api";
import { type Id as ConvexId } from "@convex/_generated/dataModel";
import { updateProjectRequest, deleteProjectRequest, createProjectRequest } from "@/domains/projects/api/projects";
import { type Project, type ProjectStatus, type ProjectHealth } from "@/domains/projects/store/projects.types";
import { type ProjectFormValues } from "@/domains/projects/validation/project.schema";
import { useOpportunitiesQuery } from "@/domains/opportunities/api/opportunities";
import { type Opportunity } from "@/domains/opportunities/opportunities.types";
import { EditableText } from "@/components/ui/editable-text";
import { EditableSelect } from "@/components/ui/editable-select";
import { type NotionColorKey } from "@/lib/color-utils";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileText, Activity, AlertCircle, PlayCircle, DollarSign, Users, CheckCircle2 } from "lucide-react";
import { useOperationState } from "@/lib/utils/operation-state";
import { Link } from "@/i18n/routing";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ProjectsTabProps {
  client: Client;
  organizationId: string;
}

const STATUS_OPTIONS = [
  { label: "Planned", value: "planned" as const, icon: PlayCircle },
  { label: "Active", value: "active" as const, icon: PlayCircle },
  { label: "Paused", value: "paused" as const, icon: PlayCircle },
  { label: "Completed", value: "completed" as const, icon: PlayCircle },
  { label: "Archived", value: "archived" as const, icon: PlayCircle },
];

const HEALTH_OPTIONS = [
  { label: "On Track", value: "onTrack" as const, icon: Activity },
  { label: "At Risk", value: "atRisk" as const, icon: AlertCircle },
  { label: "Blocked", value: "blocked" as const, icon: AlertCircle },
];

const defaultStatusColors: Record<ProjectStatus, NotionColorKey> = {
  planned: "gray",
  active: "green",
  paused: "yellow",
  completed: "blue",
  archived: "red",
};

const defaultHealthColors: Record<ProjectHealth, NotionColorKey> = {
  onTrack: "green",
  atRisk: "yellow",
  blocked: "red",
};

function GroupedBadges({ items, icon: Icon, type }: { items: any[], icon?: any, type: string }) {
  if (!items || items.length === 0) {
    return <span className="text-[10px] text-muted-foreground italic">None</span>;
  }
  
  const displayItems = items.slice(0, 2);
  const extraCount = items.length - 2;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {displayItems.map((item, idx) => (
        <span key={idx} className="inline-flex items-center gap-1 rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-semibold text-foreground border border-border max-w-[100px] truncate">
          {Icon && <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />}
          <span className="truncate">{item.title || item.name || item}</span>
        </span>
      ))}
      
      {extraCount > 0 && (
        <Popover>
          <PopoverTrigger className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors border border-primary/20 cursor-pointer">
            +{extraCount}
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 px-1">All {type}</p>
            <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1">
              {items.map((item, idx) => (
                <div key={idx} className="text-xs px-2 py-1.5 rounded hover:bg-muted/50 truncate flex items-center gap-1.5">
                  {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                  {item.title || item.name || item}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export function ProjectsTab({ client, organizationId }: ProjectsTabProps) {
  const projects = useConvexQuery(
    convexApi.projects.read.listByClient,
    organizationId && client.id ? { organizationId, clientId: client.id as ConvexId<"clients"> } : "skip"
  );
  
  const opportunitiesQuery = useOpportunitiesQuery(organizationId, { stage: "all" });

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newStatus, setNewStatus] = useState<ProjectStatus>("planned");
  const [newHealth, setNewHealth] = useState<ProjectHealth>("onTrack");

  const operation = useOperationState({ errorMessage: "Failed to update project." });
  const createOperation = useOperationState({ errorMessage: "Failed to create project." });

  const totalBudget = React.useMemo(() => {
    return (projects ?? []).reduce((sum, p) => sum + (p.budget ?? 0), 0);
  }, [projects]);

  if (projects === undefined || opportunitiesQuery === undefined) {
    return (
      <div className="space-y-6 text-start">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="bg-muted/40 px-4 py-3 border-b border-border">
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-4 py-4">
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateField = async (project: Project, fields: Partial<ProjectFormValues>) => {
    const values: ProjectFormValues = {
      name: project.name,
      clientId: project.clientId || "",
      opportunityId: project.opportunityId || "",
      status: project.status,
      health: project.health,
      visibility: project.visibility || "team",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      budget: project.budget !== undefined ? String(project.budget) : "",
      description: project.description || "",
      tags: project.tags || [],
      templateId: project.templateId || "",
      useAiSetup: false,
      progress: project.progress || 0,
      teamMemberIds: project.teamMemberIds || [],
      ...fields,
    };

    await operation.run(async () => {
      await updateProjectRequest(organizationId, project.id, values);
    });
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;

    const values: ProjectFormValues = {
      name: newName.trim(),
      clientId: client.id,
      opportunityId: "",
      status: newStatus,
      health: newHealth,
      visibility: "team",
      startDate: "",
      endDate: "",
      budget: newBudget.trim(),
      description: "",
      tags: [],
      templateId: "",
      useAiSetup: false,
      progress: 0,
      teamMemberIds: [],
    };

    await createOperation.run(async () => {
      await createProjectRequest(organizationId, values);
      setNewName("");
      setNewBudget("");
      setNewStatus("planned");
      setNewHealth("onTrack");
      setIsAdding(false);
    });
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    await operation.run(async () => {
      await deleteProjectRequest(organizationId, projectId);
    });
  };

  return (
    <div className="space-y-6 text-start">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Budget</p>
            <p className="text-xl font-black text-foreground">${totalBudget.toLocaleString()}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Projects</p>
            <p className="text-xl font-black text-foreground">
              {projects.filter((p) => p.status === "active").length}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">On Track</p>
            <p className="text-xl font-black text-foreground">
              {projects.filter((p) => p.health === "onTrack").length} / {projects.length}
            </p>
          </div>
        </div>
      </div>

      {/* Projects List Container */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_100px_100px_1fr_1fr_100px_40px] items-center gap-4 bg-muted/40 px-4 py-2 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <div>Project Name</div>
          <div>Status</div>
          <div>Health</div>
          <div>Assignees</div>
          <div>Deals / Opps</div>
          <div>Progress</div>
          <div></div>
        </div>

        {/* List Body */}
        <div className="divide-y divide-border">
          {projects.length === 0 && !isAdding && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No projects linked to this client yet.
            </div>
          )}

          {projects.map((project: any) => {
            const projectDeals = (opportunitiesQuery || []).filter(opp => opp.projectId === project.id);
            const teamMembers = project.teamMemberIds || [];

            return (
              <div
                key={project.id}
                className="grid grid-cols-[1.5fr_100px_100px_1fr_1fr_100px_40px] items-center gap-4 px-4 py-3 hover:bg-muted/10 transition-colors group"
              >
                {/* Title & Link */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <EditableText
                      value={project.name}
                      onChange={(name) => handleUpdateField(project, { name })}
                      placeholder="Project name..."
                      className="font-bold text-sm text-foreground truncate"
                    />
                    <Link
                      href={`/projects/${project.id}/overview`}
                      className="text-[10px] text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity shrink-0 font-semibold"
                    >
                      Open
                    </Link>
                  </div>
                  <EditableText
                    value={project.budget !== undefined ? `$${project.budget.toLocaleString()}` : ""}
                    onChange={(val) => {
                      const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
                      handleUpdateField(project, { budget: isNaN(num) ? "" : String(num) });
                    }}
                    placeholder="Set budget..."
                    className="font-medium text-xs text-muted-foreground"
                  />
                </div>

                {/* Status */}
                <div>
                  <EditableSelect
                    value={project.status}
                    options={STATUS_OPTIONS}
                    onChange={(status) => handleUpdateField(project, { status })}
                    colorMapType="project_status"
                    defaultColors={defaultStatusColors}
                  />
                </div>

                {/* Health */}
                <div>
                  <EditableSelect
                    value={project.health}
                    options={HEALTH_OPTIONS}
                    onChange={(health) => handleUpdateField(project, { health })}
                    colorMapType="project_health"
                    defaultColors={defaultHealthColors}
                  />
                </div>

                {/* Assignees */}
                <div>
                  <GroupedBadges items={teamMembers} icon={Users} type="Assignees" />
                </div>

                {/* Deals */}
                <div>
                  <GroupedBadges items={projectDeals} icon={DollarSign} type="Deals" />
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2">
                  <EditableText
                    value={project.progress !== undefined ? `${project.progress}%` : "0%"}
                    onChange={(val) => {
                      let num = parseInt(val.replace(/[^0-9]/g, ""), 10);
                      if (isNaN(num)) num = 0;
                      if (num > 100) num = 100;
                      handleUpdateField(project, { progress: num });
                    }}
                    placeholder="0%"
                    className="font-bold text-xs"
                  />
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shrink-0 hidden sm:block">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleDelete(project.id)}
                    className="p-1 hover:text-red-500 text-muted-foreground transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Inline Row Form */}
          {isAdding && (
            <div className="grid grid-cols-[1.5fr_100px_100px_1fr_1fr_100px_40px] items-center gap-4 px-4 py-3 bg-muted/20 border-t border-border animate-in slide-in-from-top-1">
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Project name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold border-none outline-none focus:ring-0 placeholder:text-muted-foreground text-foreground"
                  autoFocus
                />
                <input
                  type="number"
                  placeholder="Budget..."
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full bg-transparent text-xs border-none outline-none focus:ring-0 placeholder:text-muted-foreground text-muted-foreground"
                />
              </div>
              <div>
                <EditableSelect
                  value={newStatus}
                  options={STATUS_OPTIONS}
                  onChange={setNewStatus}
                  colorMapType="project_status"
                  defaultColors={defaultStatusColors}
                />
              </div>
              <div>
                <EditableSelect
                  value={newHealth}
                  options={HEALTH_OPTIONS}
                  onChange={setNewHealth}
                  colorMapType="project_health"
                  defaultColors={defaultHealthColors}
                />
              </div>
              <div><span className="text-[10px] text-muted-foreground">N/A</span></div>
              <div><span className="text-[10px] text-muted-foreground">N/A</span></div>
              <div><span className="text-[10px] font-bold">0%</span></div>
              
              <div className="flex justify-end gap-1 flex-col">
                <Button size="sm" onClick={handleCreate} disabled={!newName.trim()} className="h-6 px-2 text-[10px]">
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-6 px-2 text-[10px]">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Button to open creation row */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-1 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Project
        </button>
      )}

      {operation.error && <p className="text-xs text-red-500 font-bold">{operation.error}</p>}
      {createOperation.error && <p className="text-xs text-red-500 font-bold">{createOperation.error}</p>}
    </div>
  );
}
