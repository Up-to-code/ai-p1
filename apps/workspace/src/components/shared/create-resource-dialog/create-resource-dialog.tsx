"use client";

import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { CheckSquare2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export type QuickTaskInput = {
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "normal" | "high" | "urgent";
};

export type QuickDocumentInput = {
  title: string;
  content: string;
};

type ResourceKind = "task" | "document";

function dateFromKey(value: string): Date | undefined {
  return value ? new Date(`${value}T12:00:00`) : undefined;
}

type CreateResourceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (input: QuickTaskInput) => Promise<unknown>;
  onCreateDocument: (input: QuickDocumentInput) => Promise<unknown>;
  taskPending?: boolean;
  documentPending?: boolean;
};

export function CreateResourceDialog({
  open,
  onOpenChange,
  onCreateTask,
  onCreateDocument,
  taskPending = false,
  documentPending = false,
}: CreateResourceDialogProps) {
  const [kind, setKind] = useState<ResourceKind>("task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<QuickTaskInput["priority"]>("normal");

  useEffect(() => {
    if (open) return;
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("normal");
    setKind("task");
  }, [open]);

  const pending = kind === "task" ? taskPending : documentPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = title.trim();
    if (!normalizedTitle || pending) return;

    if (kind === "task") {
      await onCreateTask({ title: normalizedTitle, description: description.trim(), dueDate, priority });
    } else {
      await onCreateDocument({ title: normalizedTitle, content: description.trim() });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Create</DialogTitle>
          <DialogDescription>Create a task or start a document from one place.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={kind} onValueChange={(value: string) => setKind(value as ResourceKind)} className="flex-col gap-0">
            <div className="border-b border-border px-6">
              <TabsList variant="line" className="h-11 gap-6">
                <TabsTrigger value="task" className="px-0"><CheckSquare2 />Task</TabsTrigger>
                <TabsTrigger value="document" className="px-0"><FileText />Document</TabsTrigger>
              </TabsList>
            </div>

            <div className="space-y-4 px-6 py-5">
              <label className="sr-only" htmlFor="create-resource-title">{kind === "task" ? "Task title" : "Document title"}</label>
              <Input
                id="create-resource-title"
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={kind === "task" ? "Task name or type '/' for commands" : "Document title"}
                className="h-11 text-base"
              />

              <label className="sr-only" htmlFor="create-resource-description">Description</label>
              <Textarea
                id="create-resource-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={kind === "task" ? "Add a description, brief, or acceptance criteria…" : "Start writing, or leave this empty to open the editor…"}
                className="min-h-32 border-0 bg-transparent px-0 py-2 focus:border-0"
              />

              {kind === "task" ? (
                <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
                  <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                    Due date
                    <DatePicker
                      date={dateFromKey(dueDate)}
                      setDate={(date) => setDueDate(date ? format(date, "yyyy-MM-dd") : "")}
                      className="h-9 w-40 px-3 text-xs"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                    Priority
                    <Select value={priority} onValueChange={(value: string | null) => value && setPriority(value as QuickTaskInput["priority"])}>
                      <SelectTrigger aria-label="Task priority" size="sm" className="w-36 bg-input text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                </div>
              ) : null}
            </div>
          </Tabs>

          <DialogFooter className="m-0 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!title.trim() || pending}>{pending ? "Creating…" : kind === "task" ? "Create task" : "Create document"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
