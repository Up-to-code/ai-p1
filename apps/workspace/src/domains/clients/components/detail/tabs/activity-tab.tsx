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
import { Button } from "@/components/ui/button";
import { Plus, Trash2, PhoneCall, Video, Mail, CheckCircle2, Clock, CheckSquare, MessageSquare } from "lucide-react";
import { useOperationState } from "@/lib/utils/operation-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    const matching = filter === "all" ? followUps : followUps.filter((f) => f.status === filter);
    return [...matching].sort((left, right) => right.followUpDate - left.followUpDate);
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
        <div className="flex items-center gap-1 border-b border-border pb-2">
          {(["all", "upcoming", "past", "completed", "canceled"] as const).map((opt) => (
            <Button
              key={opt}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setFilter(opt)}
              className={cn(
                "h-7 rounded-md px-3 text-[11px] font-semibold capitalize shadow-none",
                filter === opt ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {opt}
            </Button>
          ))}
        </div>
      </div>

      {/* Activities list container */}
      <div className="space-y-4">
        {isAdding && (
          <div className="space-y-3 border-y border-border py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Activity title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-9 rounded-md text-sm font-medium shadow-none"
                autoFocus
              />
              <Select value={newType} onValueChange={(value: string | null) => value && setNewType(value as FollowUpType)}>
                <SelectTrigger size="sm" className="h-9 rounded-md bg-background px-3 text-xs shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent>{TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={newStatus} onValueChange={(value: string | null) => value && setNewStatus(value as FollowUpStatus)}>
                <SelectTrigger size="sm" className="h-9 rounded-md bg-background px-3 text-xs shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Add activity notes or description..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              className="min-h-20 resize-none rounded-md text-sm shadow-none"
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
            No activity or comments yet.
          </div>
        )}

        {filteredFollowUps.map((fu, index) => {
          const typeOption = TYPE_OPTIONS.find((t) => t.value === fu.type);
          const TypeIcon = typeOption?.icon || MessageSquare;
          const isCompleted = fu.status === "completed";
          const date = new Date(fu.followUpDate);
          const formattedDate = date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
          const monthLabel = date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
          const previous = filteredFollowUps[index - 1];
          const previousMonthLabel = previous
            ? new Date(previous.followUpDate).toLocaleDateString(undefined, { month: "long", year: "numeric" })
            : null;

          return (
            <React.Fragment key={fu.id}>
            {monthLabel !== previousMonthLabel ? (
              <div className="sticky top-0 z-10 border-b border-border bg-background py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {monthLabel}
              </div>
            ) : null}
            <div className="group flex gap-4 border-b border-border/70 py-4 transition-colors hover:bg-muted/20">
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
                    <Select value={fu.type} onValueChange={(type: string | null) => type && handleUpdateField(fu, { type: type as FollowUpType })}>
                      <SelectTrigger size="sm" className="h-7 w-28 rounded-md border-0 bg-muted px-2 text-[10px] font-semibold uppercase tracking-wider shadow-none"><SelectValue /></SelectTrigger>
                      <SelectContent>{TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
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
            </React.Fragment>
          );
        })}
      </div>

      {/* Add trigger */}
      {!isAdding && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setIsAdding(true)}
          className="h-8 gap-1.5 rounded-md px-2 text-xs font-semibold text-muted-foreground shadow-none hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add activity or comment
        </Button>
      )}

      {operation.error && <p className="text-xs text-red-500 font-bold">{operation.error}</p>}
      {createOperation.error && <p className="text-xs text-red-500 font-bold">{createOperation.error}</p>}
    </div>
  );
}
