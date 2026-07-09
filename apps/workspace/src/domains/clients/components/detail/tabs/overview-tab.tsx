"use client";

import React, { useState, useMemo } from "react";
import { type Client } from "../../../store/clients.types";
import { type ClientFormValues } from "../../../validation/client.schema";
import { EditableText } from "@/components/ui/editable-text";
import { YooptaRichTextEditor } from "@/components/shared/yoopta-rich-text-editor";
import { useClientTasksQuery } from "../../../api/client-tasks";
import { useClientFollowUpsQuery } from "../../../api/client-follow-ups";
import { useOpportunitiesQuery } from "@/domains/opportunities/api/opportunities";
import { type Opportunity } from "@/domains/opportunities/opportunities.types";
import { useQuery as useConvexQuery } from "convex/react";
import { api as convexApi } from "@convex/_generated/api";
import { type Id as ConvexId } from "@convex/_generated/dataModel";
import { useAuthSession } from "@/domains/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  FolderGit2,
  TrendingUp,
  CalendarClock,
  MessageSquare,
  Plus,
  Trash2,
  Settings,
} from "lucide-react";
import { CustomFieldsSection } from "@/components/shared/custom-fields";
import { Link } from "@/i18n/routing";

interface ClientNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

const parseClientNotes = (notesStr: string | undefined): ClientNote[] => {
  if (!notesStr) return [];
  try {
    const parsed = JSON.parse(notesStr);
    if (Array.isArray(parsed)) {
      return parsed as ClientNote[];
    }
  } catch (e) {
    // Treat legacy notes as a single note
    return [
      {
        id: "legacy",
        title: "Legacy Notes",
        content: notesStr,
        createdAt: Date.now(),
      },
    ];
  }
  return [];
};

interface OverviewTabProps {
  client: Client;
  onUpdate: (values: Partial<ClientFormValues>) => void;
}

export function OverviewTab({ client, onUpdate }: OverviewTabProps) {
  const session = useAuthSession();
  const organizationId = session.workspace.status === "ready" ? session.workspace.organizationId ?? "" : "";

  // Real Queries
  const tasks = useClientTasksQuery(organizationId) ?? [];
  const followUps = useClientFollowUpsQuery(organizationId, client.id) ?? [];
  const opportunitiesQuery = useOpportunitiesQuery(organizationId, { stage: "all" });
  const projects = useConvexQuery(
    convexApi.projects.read.listByClient,
    organizationId && client.id ? { organizationId, clientId: client.id as ConvexId<"clients"> } : "skip"
  ) ?? [];

  const clientTasks = useMemo(() => tasks.filter((t: any) => t.clientId === client.id), [tasks, client.id]);
  const clientOpportunities = useMemo(() => (opportunitiesQuery ?? []).filter((o: Opportunity) => o.clientId === client.id), [opportunitiesQuery, client.id]);

  // Derived Metrics
  const pipelineValue = useMemo(() => clientOpportunities.reduce((sum: number, opp: Opportunity) => sum + (opp.value ?? 0), 0), [clientOpportunities]);
  const activeProjectsCount = projects.filter((p: any) => p.status === "active").length;
  const nextDeadline = useMemo(() => {
    const upcoming = clientTasks.filter((t: any) => t.status !== "done" && t.dueDate).sort((a: any, b: any) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    return upcoming[0]?.dueDate || "No deadline";
  }, [clientTasks]);

  const metrics = [
    { label: "Total Budget", value: client.budget ? `$${Number(client.budget).toLocaleString() || client.budget}` : "$0", icon: DollarSign },
    { label: "Active Projects", value: String(activeProjectsCount), icon: FolderGit2 },
    { label: "Pipeline Value", value: `$${pipelineValue.toLocaleString()}`, icon: TrendingUp },
    { label: "Next Deadline", value: nextDeadline, icon: CalendarClock },
  ];

  // Real activities from follow-ups
  const recentActivity = useMemo(() => {
    return followUps.slice(0, 5).map((f) => {
      const date = new Date(f.followUpDate);
      return {
        id: f.id,
        content: `${f.type.toUpperCase()}: ${f.title}`,
        date: date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
      };
    });
  }, [followUps]);

  // Notes Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null);

  // Memoize note array parsing
  const notes = useMemo(() => parseClientNotes(client.notes), [client.notes]);

  const handleOpenAddModal = () => {
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note: ClientNote) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setIsModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim()) return;

    let updatedNotes: ClientNote[];
    if (editingNote) {
      // Edit existing note
      updatedNotes = notes.map((n) =>
        n.id === editingNote.id ? { ...n, title: noteTitle.trim(), content: noteContent } : n
      );
    } else {
      // Add new note
      const newNoteObj: ClientNote = {
        id: Math.random().toString(36).substring(2, 9),
        title: noteTitle.trim(),
        content: noteContent,
        createdAt: Date.now(),
      };
      updatedNotes = [newNoteObj, ...notes];
    }

    onUpdate({ notes: JSON.stringify(updatedNotes) });
    setIsModalOpen(false);
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((n) => n.id !== noteId);
    onUpdate({ notes: JSON.stringify(updatedNotes) });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-200">
      {/* Main Content Column */}
      <div className="xl:col-span-2 space-y-10">
        
        {/* Basic Info Section */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">Contact Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group rounded-xl border border-transparent hover:border-border hover:bg-muted/30 p-3 transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Email</p>
              <EditableText
                value={client.contact}
                onChange={(contact) => onUpdate({ contact })}
                placeholder="Add email address..."
                className="text-sm font-medium"
              />
            </div>
            <div className="group rounded-xl border border-transparent hover:border-border hover:bg-muted/30 p-3 transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Phone</p>
              <EditableText
                value={client.phone || ""}
                onChange={(phone) => onUpdate({ phone })}
                placeholder="Add phone number..."
                className="text-sm font-medium"
              />
            </div>
            <div className="group rounded-xl border border-transparent hover:border-border hover:bg-muted/30 p-3 transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Contact Name</p>
              <div className="text-sm font-medium">
                {client.contactName || "Not set"}
              </div>
            </div>
            <div className="group rounded-xl border border-transparent hover:border-border hover:bg-muted/30 p-3 transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Budget</p>
              <EditableText
                value={client.budget || ""}
                onChange={(budget) => onUpdate({ budget })}
                placeholder="Add budget..."
                className="text-sm font-medium"
              />
            </div>
          </div>
        </section>

        {/* Custom Fields Section */}
        <section>
          <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              Custom Fields
            </h2>
            <Link
              href="/organization?tab=profile"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Manage
            </Link>
          </div>
          <CustomFieldsSection recordType="client" recordId={client.id} />
        </section>

        {/* Internal Notes Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              Internal Notes
              {notes.length > 0 && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  {notes.length}
                </span>
              )}
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold cursor-pointer select-none"
              onClick={handleOpenAddModal}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Note
            </Button>
          </div>

          {notes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              No internal notes added yet. Click "Add Note" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group relative rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
                  onClick={() => handleOpenEditModal(note)}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {note.title}
                      </h3>
                      <button
                        type="button"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-3 mb-4 whitespace-pre-wrap">
                      {note.content.replace(/<[^>]*>/g, "").trim() || "No content"}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-auto flex items-center justify-between border-t border-border/20 pt-2">
                    <span>
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-[10px] text-primary/70 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Edit note →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Sidebar Column */}
      <div className="space-y-10">
        
        {/* Metrics Section */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors cursor-default">
                <metric.icon className="h-4 w-4 text-muted-foreground mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{metric.label}</p>
                <p className="text-lg font-black text-foreground">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground">Recent Activity</h2>
            <button className="text-xs font-medium text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="group relative pl-6 pb-4 border-l border-border last:border-0 last:pb-0">
                <span className="absolute -left-[5px] top-1 flex h-2.5 w-2.5 rounded-full bg-border ring-4 ring-background group-hover:bg-primary transition-colors" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-foreground">{activity.content}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{activity.date}</p>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="w-full rounded-xl border border-dashed border-border py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Add Note
            </button>
          </div>
        </section>
        
      </div>

      {/* Note Edit/Add Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px] p-6 gap-4 animate-in fade-in-0 zoom-in-95 duration-150">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight">
              {editingNote ? "Edit Note" : "New Note"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Write down client insights, internal summaries, or project briefs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="note-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Title
              </label>
              <input
                id="note-title"
                type="text"
                placeholder="Note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-all font-medium text-foreground"
                autoFocus
              />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Content
              </label>
              <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[220px]">
                <YooptaRichTextEditor
                  value={noteContent}
                  onChange={setNoteContent}
                  placeholder="Start typing note details (Markdown supported)..."
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveNote}
              disabled={!noteTitle.trim()}
              className="h-9 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
            >
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
