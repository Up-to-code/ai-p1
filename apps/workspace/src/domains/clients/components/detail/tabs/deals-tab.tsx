"use client";

import React, { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery as useConvexQuery } from "convex/react";
import { api as convexApi } from "@convex/_generated/api";

import { type Client } from "../../../store/clients.types";
import { useOpportunitiesQuery, updateOpportunityRequest, createOpportunityRequest, deleteOpportunityRequest } from "@/domains/opportunities/api/opportunities";
import { type Opportunity, type OpportunityStage, type OpportunityPriority, type OpportunityFormValues } from "@/domains/opportunities/opportunities.types";
import { EditableText } from "@/components/ui/editable-text";
import { EditableSelect } from "@/components/ui/editable-select";
import { type NotionColorKey } from "@/lib/color-utils";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Briefcase, DollarSign, BarChart2, Loader2, Check, ChevronDown } from "lucide-react";
import { useOperationState } from "@/lib/utils/operation-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface DealsTabProps {
  client: Client;
  organizationId: string;
}

const STAGE_OPTIONS: { label: string; value: OpportunityStage }[] = [
  { label: "New", value: "new" as const },
  { label: "Qualified", value: "qualified" as const },
  { label: "Proposal", value: "proposal" as const },
  { label: "Negotiation", value: "negotiation" as const },
  { label: "Won", value: "won" as const },
  { label: "Lost", value: "lost" as const },
];

const PRIORITY_OPTIONS: { label: string; value: OpportunityPriority }[] = [
  { label: "Low", value: "low" as const },
  { label: "Normal", value: "normal" as const },
  { label: "High", value: "high" as const },
  { label: "Urgent", value: "urgent" as const },
];

const defaultStageColors: Record<OpportunityStage, NotionColorKey> = {
  new: "blue",
  qualified: "yellow",
  proposal: "purple",
  negotiation: "orange",
  won: "green",
  lost: "red",
};

const defaultPriorityColors: Record<OpportunityPriority, NotionColorKey> = {
  low: "gray",
  normal: "blue",
  high: "orange",
  urgent: "red",
};

function ProjectSelectModal({ value, onChange, projects }: { value: string, onChange: (v: string) => void, projects: any[] }) {
  const selected = projects?.find(p => p.id === value);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="flex h-7 w-full items-center justify-between rounded-md px-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors outline-none focus:ring-0 truncate border border-transparent hover:border-border">
        <span className="truncate">{selected ? selected.name : "No Project"}</span>
        <ChevronDown className="h-3 w-3 opacity-50 ml-2 shrink-0" />
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-1" align="start">
        <div className="max-h-[250px] overflow-y-auto flex flex-col">
          <button
            onClick={() => { onChange(""); setIsOpen(false); }}
            className={cn(
              "flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-left transition-colors",
              !value ? "bg-muted text-foreground font-bold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <span className="flex-1 truncate">No Project</span>
            {!value && <Check className="h-3 w-3" />}
          </button>
          
          {(projects || []).map((p: any) => {
            const isSelected = value === p.id;
            return (
              <button
                key={p.id}
                onClick={() => { onChange(p.id); setIsOpen(false); }}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-left transition-colors",
                  isSelected ? "bg-muted text-foreground font-bold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span className="flex-1 truncate">{p.name}</span>
                {isSelected && <Check className="h-3 w-3 shrink-0" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DealsTab({ client, organizationId }: DealsTabProps) {
  const queryClient = useQueryClient();
  const opportunitiesQuery = useOpportunitiesQuery(organizationId, { stage: "all" });
  const opportunities = useMemo(() => {
    return (opportunitiesQuery ?? []).filter((opp: Opportunity) => opp.clientId === client.id);
  }, [opportunitiesQuery, client.id]);

  const projects = useConvexQuery(
    convexApi.projects.read.list,
    organizationId ? { organizationId } : "skip"
  );

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newStage, setNewStage] = useState<OpportunityStage>("new");
  const [newPriority, setNewPriority] = useState<OpportunityPriority>("normal");
  const [newProjectId, setNewProjectId] = useState("");

  const operation = useOperationState({ errorMessage: "Failed to update deal." });
  const createOperation = useOperationState({ errorMessage: "Failed to create deal." });

  const totalPipelineValue = useMemo(() => {
    return opportunities.reduce((sum: number, opp: Opportunity) => sum + (opp.value ?? 0), 0);
  }, [opportunities]);

  if (opportunitiesQuery === undefined) {
    return (
      <div className="space-y-6 text-start">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <div className="overflow-hidden border-y border-border">
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

  const handleUpdateField = async (opp: Opportunity, fields: Partial<OpportunityFormValues>) => {
    const values: OpportunityFormValues = {
      title: opp.title,
      stage: opp.stage,
      status: opp.status,
      priority: opp.priority,
      value: String(opp.value ?? ""),
      currency: opp.currency || "USD",
      source: opp.source || "",
      closeDate: opp.closeDate || "",
      nextStep: opp.nextStep || "",
      clientId: opp.clientId || "",
      projectId: opp.projectId || "",
      tags: opp.tags?.join(", ") || "",
      ...fields,
    };

    await operation.run(async () => {
      await updateOpportunityRequest(organizationId, opp.id, values);
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    });
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;

    const values: OpportunityFormValues = {
      title: newTitle.trim(),
      stage: newStage,
      status: newStage === "won" ? "won" : newStage === "lost" ? "lost" : "open",
      priority: newPriority,
      value: newValue.trim(),
      currency: "USD",
      source: "",
      closeDate: "",
      nextStep: "",
      clientId: client.id,
      projectId: newProjectId || "",
      tags: "",
    };

    await createOperation.run(async () => {
      await createOpportunityRequest(organizationId, values);
      setNewTitle("");
      setNewValue("");
      setNewStage("new");
      setNewPriority("normal");
      setNewProjectId("");
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    });
  };

  const handleDelete = async (oppId: string) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    await operation.run(async () => {
      await deleteOpportunityRequest(organizationId, oppId);
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    });
  };

  return (
    <div className="space-y-6 text-start">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 border-l-2 border-primary/40 py-2 pl-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Pipeline</p>
            <p className="text-xl font-black text-foreground">${totalPipelineValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-l-2 border-emerald-500/40 py-2 pl-4">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Deals</p>
            <p className="text-xl font-black text-foreground">
              {opportunities.filter((o: Opportunity) => o.status === "open").length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-l-2 border-blue-500/40 py-2 pl-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Conversion Rate</p>
            <p className="text-xl font-black text-foreground">
              {opportunities.length > 0
                ? `${Math.round(
                    (opportunities.filter((o: Opportunity) => o.status === "won").length / opportunities.length) * 100
                  )}%`
                : "0%"}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-y border-border">
        <div className="grid grid-cols-[1fr_100px_130px_120px_130px_40px] items-center gap-4 bg-muted/40 px-4 py-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <div>Deal Name</div>
          <div>Value</div>
          <div>Stage</div>
          <div>Priority</div>
          <div>Project</div>
          <div></div>
        </div>

        <div className="divide-y divide-border">
          {opportunities.length === 0 && !isAdding && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No deals linked to this client yet.
            </div>
          )}

          {opportunities.map((opp: Opportunity) => (
            <div
              key={opp.id}
              className="grid grid-cols-[1fr_100px_130px_120px_130px_40px] items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group"
            >
              <div className="min-w-0 font-semibold text-foreground">
                <EditableText
                  value={opp.title}
                  onChange={(title) => handleUpdateField(opp, { title })}
                  placeholder="Deal name..."
                  className="font-bold text-sm"
                />
              </div>

              <div className="text-sm font-medium text-foreground">
                <EditableText
                  value={opp.value !== undefined ? String(opp.value) : ""}
                  onChange={(val) => handleUpdateField(opp, { value: val })}
                  placeholder="0"
                  className="font-medium text-sm"
                />
              </div>

              <div>
                <EditableSelect
                  value={opp.stage}
                  options={STAGE_OPTIONS}
                  onChange={(stage) => handleUpdateField(opp, { stage, status: stage === "won" ? "won" : stage === "lost" ? "lost" : "open" })}
                  colorMapType="deal_stage"
                  defaultColors={defaultStageColors}
                />
              </div>

              <div>
                <EditableSelect
                  value={opp.priority}
                  options={PRIORITY_OPTIONS}
                  onChange={(priority) => handleUpdateField(opp, { priority })}
                  colorMapType="deal_priority"
                  defaultColors={defaultPriorityColors}
                />
              </div>

              <div>
                <ProjectSelectModal 
                  value={opp.projectId || ""} 
                  onChange={(val) => handleUpdateField(opp, { projectId: val })} 
                  projects={projects || []} 
                />
              </div>

              <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleDelete(opp.id)}
                  className="p-1 hover:text-red-500 text-muted-foreground transition-colors cursor-pointer"
                  disabled={operation.isRunning}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Inline Row Form */}
          {isAdding && (
            <div className="grid grid-cols-[1fr_100px_130px_120px_130px_80px] items-center gap-4 px-4 py-3 bg-muted/20 border-t border-border animate-in slide-in-from-top-1 duration-150">
              <div>
                <Input
                  placeholder="Deal name..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-8 rounded-md border-transparent bg-transparent px-2 text-sm shadow-none hover:border-border focus-visible:border-border focus-visible:ring-0"
                  autoFocus
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Value..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="h-8 rounded-md border-transparent bg-transparent px-2 text-sm shadow-none hover:border-border focus-visible:border-border focus-visible:ring-0"
                />
              </div>
              <div>
                <EditableSelect
                  value={newStage}
                  options={STAGE_OPTIONS}
                  onChange={setNewStage}
                  colorMapType="deal_stage"
                  defaultColors={defaultStageColors}
                />
              </div>
              <div>
                <EditableSelect
                  value={newPriority}
                  options={PRIORITY_OPTIONS}
                  onChange={setNewPriority}
                  colorMapType="deal_priority"
                  defaultColors={defaultPriorityColors}
                />
              </div>
              
              <div>
                <ProjectSelectModal 
                  value={newProjectId} 
                  onChange={setNewProjectId} 
                  projects={projects || []} 
                />
              </div>

              <div className="flex justify-end gap-1">
                <Button size="sm" variant="outline" onClick={() => setIsAdding(false)} className="h-7 px-2 text-xs" disabled={createOperation.isRunning}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreate} disabled={!newTitle.trim() || createOperation.isRunning} className="h-7 px-2 text-xs">
                  {createOperation.isRunning ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Save
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
          Add Opportunity
        </button>
      )}

      {operation.error && <p className="text-xs text-red-500 font-bold">{operation.error}</p>}
      {createOperation.error && <p className="text-xs text-red-500 font-bold">{createOperation.error}</p>}
    </div>
  );
}
