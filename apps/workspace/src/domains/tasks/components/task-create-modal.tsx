"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useTaskMutations } from "../hooks/use-task-mutations";
import type { TaskPriority } from "../tasks.types";

interface TaskCreateModalProps {
  organizationId?: string;
  projectId?: string | null;
  spaceId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (taskId: string) => void;
}

export function TaskCreateModal({
  organizationId,
  projectId,
  spaceId,
  open,
  onOpenChange,
  onCreated,
}: TaskCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? "");
  const { createTask, createTaskMutation } = useTaskMutations(organizationId ?? "");
  const projectOptions = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const projects = useMemo(() => projectOptions.data ?? [], [projectOptions.data]);

  useEffect(() => {
    if (open) {
      setSelectedProjectId(projectId ?? "");
      return;
    }
    setTitle("");
    setDescription("");
    setPriority("normal");
  }, [open, projectId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = title.trim();
    if (!organizationId || !normalizedTitle || createTaskMutation.isPending) return;

    try {
      const activeProjectId = projects.some((project) => project.id === selectedProjectId)
        ? selectedProjectId
        : "";
      const result = await createTask({
        title: normalizedTitle,
        description: description.trim(),
        priority,
        projectId: activeProjectId,
        spaceId: spaceId ?? "",
      });
      onOpenChange(false);
      onCreated(result.task.id);
    } catch {
      // The mutation owns user-facing feedback. Handling the rejection keeps
      // authorization failures out of Next's runtime overlay.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Add the task now, then continue in the full editor.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            <Input
              autoFocus
              aria-label="Task title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task name"
              className="h-11 text-base"
            />
            <Textarea
              aria-label="Task description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a description or acceptance criteria…"
              className="min-h-28"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                Priority
                <Select value={priority} onValueChange={(value: string | null) => value && setPriority(value as TaskPriority)}>
                  <SelectTrigger aria-label="Task priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                Project
                <Select value={selectedProjectId || "unscoped"} onValueChange={(value: string | null) => setSelectedProjectId(value === "unscoped" ? "" : (value ?? ""))}>
                  <SelectTrigger aria-label="Task project"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unscoped">No project (private)</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
          </div>
          <DialogFooter className="m-0 border-t border-border px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!organizationId || !title.trim() || createTaskMutation.isPending}>
              {createTaskMutation.isPending ? "Creating…" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
