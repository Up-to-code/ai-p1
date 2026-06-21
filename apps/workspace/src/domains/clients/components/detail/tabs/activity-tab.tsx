"use client";

import React, { useState, useMemo } from "react";
import { type Client } from "../../../store/clients.types";
import {
  useClientFollowUpsQuery,
  createFollowUpRequest,
  updateFollowUpRequest,
  deleteFollowUpRequest,
  markFollowUpCompleteRequest,
  type ClientFollowUpPayload,
} from "@/domains/clients/api/client-follow-ups";
import { type ClientFollowUp, type FollowUpType, type FollowUpStatus } from "@/domains/clients/store/client-follow-ups.types";
import { EditableText } from "@/components/ui/editable-text";
import { EditableSelect } from "@/components/ui/editable-select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, PhoneCall, Video, Mail, CheckCircle2, Clock, CheckSquare, MessageSquare } from "lucide-react";
import { useOperationState } from "@/lib/utils/operation-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ActivityTabProps {
  client: Client;
  organizationId: string;
}

const TYPE_OPTIONS = [
  { label: "Call", value: "call" as const, icon: PhoneCall },
  { label: "Meeting", value: "meeting" as const, icon: Video },
  { label: "Email", value: "email" as const, icon: Mail },
  { label: "Task", value: "task" as const, icon: CheckSquare },
];

const STATUS_OPTIONS = [
  { label: "Upcoming", value: "upcoming" as const, icon: Clock },
  { label: "Completed", value: "completed" as const, icon: CheckCircle2 },
  { label: "Past", value: "past" as const, icon: Clock },
  { label: "Canceled", value: "canceled" as const, icon: Clock },
];

export function ActivityTab({ client, organizationId }: ActivityTabProps) {
  const followUpsQuery = useClientFollowUpsQuery(organizationId, client.id);
  const followUps = followUpsQuery ?? [];
  const [filter, setFilter] = useState<"all" | FollowUpStatus>("all");
  const [isAdding, setIsAdding] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<FollowUpType>("call");
  const [newStatus, setNewStatus] = useState<FollowUpStatus>("upcoming");
  const [newNotes, setNewNotes] = useState("");

  const operation = useOperationState({ errorMessage: "Failed to update activity." });
  const createOperation = useOperationState({ errorMessage: "Failed to create activity." });

  const filteredFollowUps = useMemo(() => {
    if (filter === "all") return followUps;
    return followUps.filter((f) => f.status === filter);
  }, [followUps, filter]);

  if (followUpsQuery === undefined) {
    return (
      <div className="space-y-6 text-start">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-8 w-64 rounded-xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return;

    const payload: ClientFollowUpPayload = {
      clientId: client.id,
      type: newType,
      title: newTitle.trim(),
      notes: newNotes.trim() || undefined,
      followUpDate: Date.now(),
      status: newStatus,
      visibility: "private",
    };

    await createOperation.run(async () => {
      await createFollowUpRequest(organizationId, payload);
      setNewTitle("");
      setNewNotes("");
      setNewType("call");
      setNewStatus("upcoming");
      setIsAdding(false);
    });
  };

  const handleUpdateField = async (followUp: ClientFollowUp, patch: Partial<ClientFollowUpPayload>) => {
    const payload: ClientFollowUpPayload = {
      clientId: client.id,
      type: followUp.type,
      title: followUp.title,
      notes: followUp.notes,
      followUpDate: followUp.followUpDate,
      dueDate: followUp.dueDate,
      status: followUp.status,
      opportunityId: followUp.opportunityId,
      projectId: followUp.projectId,
      calendarEventId: followUp.calendarEventId,
      assigneeUserId: followUp.assigneeUserId,
      visibility: followUp.visibility || "private",
      ...patch,
    };

    await operation.run(async () => {
      await updateFollowUpRequest(organizationId, followUp.id, payload);
    });
  };

  const handleToggleComplete = async (followUp: ClientFollowUp) => {
    const nextStatus: FollowUpStatus = followUp.status === "completed" ? "upcoming" : "completed";
    await handleUpdateField(followUp, { status: nextStatus });
  };

  const handleDelete = async (followUpId: string) => {
    if (!window.confirm("Are you sure you want to delete this activity record?")) return;
    await operation.run(async () => {
      await deleteFollowUpRequest(organizationId, followUpId);
    });
  };

  return (
    <div className="space-y-6 text-start">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
          {(["all", "upcoming", "past", "completed", "canceled"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilter(opt)}
              className={cn(
                "h-7 rounded-lg px-3 text-[11px] font-semibold transition-all capitalize",
                filter === opt ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Activities list container */}
      <div className="space-y-4">
        {isAdding && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Activity title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-transparent text-sm border border-border rounded-xl px-3 h-10 outline-none focus:border-ring text-foreground font-semibold"
                autoFocus
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as FollowUpType)}
                className="h-10 rounded-xl border border-border bg-transparent px-3 text-xs font-bold text-foreground outline-none"
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as FollowUpStatus)}
                className="h-10 rounded-xl border border-border bg-transparent px-3 text-xs font-bold text-foreground outline-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Add activity notes or description..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              className="w-full bg-transparent text-sm border border-border rounded-xl px-3 py-2 outline-none focus:border-ring text-foreground resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)} className="h-8 text-xs font-bold">
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={!newTitle.trim()} className="h-8 text-xs font-bold">
                Save Activity
              </Button>
            </div>
          </div>
        )}

        {filteredFollowUps.length === 0 && !isAdding && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No activity records found.
          </div>
        )}

        {filteredFollowUps.map((fu) => {
          const typeOption = TYPE_OPTIONS.find((t) => t.value === fu.type);
          const TypeIcon = typeOption?.icon || MessageSquare;
          const isCompleted = fu.status === "completed";
          const date = new Date(fu.followUpDate);
          const formattedDate = date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

          return (
            <div
              key={fu.id}
              className="group flex gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors"
            >
              {/* Toggle Check Icon */}
              <button
                type="button"
                onClick={() => handleToggleComplete(fu)}
                className="mt-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground/60" />
                )}
              </button>

              {/* Body */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <EditableSelect
                      value={fu.type}
                      options={TYPE_OPTIONS}
                      onChange={(type) => handleUpdateField(fu, { type })}
                      triggerClassName="text-[10px] font-extrabold uppercase tracking-wider py-0.5 px-2 bg-muted rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
                  <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleDelete(fu.id)}
                      className="p-1 hover:text-red-500 text-muted-foreground transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-sm font-semibold text-foreground">
                  <EditableText
                    value={fu.title}
                    onChange={(title) => handleUpdateField(fu, { title })}
                    placeholder="Activity title..."
                    className={cn(isCompleted && "line-through text-muted-foreground")}
                  />
                </div>

                <div className="text-xs text-muted-foreground leading-relaxed">
                  <EditableText
                    value={fu.notes || ""}
                    onChange={(notes) => handleUpdateField(fu, { notes })}
                    placeholder="Click to add details or notes..."
                    multiline
                    className="w-full font-medium"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add trigger */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-1 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Activity
        </button>
      )}

      {operation.error && <p className="text-xs text-red-500 font-bold">{operation.error}</p>}
      {createOperation.error && <p className="text-xs text-red-500 font-bold">{createOperation.error}</p>}
    </div>
  );
}
