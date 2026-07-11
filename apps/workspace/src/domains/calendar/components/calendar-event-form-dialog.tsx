"use client";

import { useEffect, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { DayPicker, type DateRange } from "react-day-picker";
import type { LucideIcon } from "lucide-react";
import { Bell, CalendarDays, CheckSquare2, Clock3, FileText, Flag, Focus, Link2, MapPin, Trash2, UserRound, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { YooptaRichTextEditor } from "@/components/shared/yoopta-rich-text-editor";
import { TimePicker } from "@/components/ui/time-picker";
import { calendarClassNames } from "@/components/ui/date-picker";
import { CalendarRelationPicker } from "./calendar-relation-picker";
import { useCalendarComposerOptions, type CalendarRelationOption } from "../hooks/use-calendar-composer-options";
import { calendarEventEnd, calendarEventStart, calendarIsoDate } from "../calendar-view-model";
import type { CalendarEvent } from "../store/calendar.types";
import type { CalendarEventFormValues } from "../validation/calendar.schema";

type CalendarEventType = CalendarEvent["type"];
type CalendarEventFormDialogProps = {
  organizationId?: string;
  contextProjectId?: string;
  event: CalendarEvent | null;
  initialSlot: { start: Date; end: Date } | null;
  isPending: boolean;
  onClose: () => void;
  onDelete: (eventId: string) => void;
  onSubmit: (values: CalendarEventFormValues) => void;
};
type FormState = Required<Pick<CalendarEventFormValues, "title" | "date" | "time" | "type" | "status" | "durationMinutes">> &
  Pick<CalendarEventFormValues, "ownerUserId" | "projectId" | "taskId" | "documentId" | "location" | "meetingUrl" | "notes"> & {
    externalAttendees: string;
    endDate: string;
    endTime: string;
  };

const eventTypes: Array<{ value: CalendarEventType; label: string; description: string; icon: LucideIcon }> = [
  { value: "meeting", label: "Meeting", description: "People, place, and call details", icon: CalendarDays },
  { value: "deadline", label: "Task", description: "Schedule a task or deadline", icon: CheckSquare2 },
  { value: "document", label: "Document", description: "Schedule document work or review", icon: FileText },
  { value: "reminder", label: "Reminder", description: "A lightweight personal reminder", icon: Bell },
  { value: "milestone", label: "Milestone", description: "A project checkpoint", icon: Flag },
  { value: "focusBlock", label: "Focus", description: "Reserve uninterrupted work time", icon: Focus },
];

function formStateFor(event: CalendarEvent | null, initialSlot: { start: Date; end: Date } | null, contextProjectId?: string): FormState {
  const start = event ? calendarEventStart(event) : initialSlot?.start ?? new Date();
  const end = event ? calendarEventEnd(event) : initialSlot?.end ?? new Date(start.getTime() + 60 * 60_000);
  return {
    title: event?.title ?? "",
    date: event?.date ?? calendarIsoDate(start),
    time: event?.time ?? clockValue(start),
    endDate: calendarIsoDate(end),
    endTime: clockValue(end),
    type: event?.type ?? "meeting",
    status: event?.status ?? "confirmed",
    durationMinutes: Math.max(1, Math.round((end.getTime() - start.getTime()) / 60_000)),
    ownerUserId: event?.ownerUserId ?? "",
    projectId: event?.projectId ?? contextProjectId ?? "",
    taskId: event?.taskId ?? "",
    documentId: event?.documentId ?? "",
    location: event?.location ?? "",
    meetingUrl: event?.meetingUrl ?? "",
    notes: event?.notes ?? "",
    externalAttendees: event?.externalAttendees?.join(", ") ?? "",
  };
}

export function CalendarEventFormDialog({ organizationId, contextProjectId, event, initialSlot, isPending, onClose, onDelete, onSubmit }: CalendarEventFormDialogProps) {
  const open = Boolean(event || initialSlot);
  const [form, setForm] = useState<FormState>(() => formStateFor(event, initialSlot, contextProjectId));
  const options = useCalendarComposerOptions(open ? organizationId : undefined);

  useEffect(() => {
    if (open) setForm(formStateFor(event, initialSlot, contextProjectId));
  }, [contextProjectId, event, initialSlot, open]);

  const activeType = eventTypes.find((type) => type.value === form.type) ?? eventTypes[0];
  const ActiveIcon = activeType.icon;
  const isEditing = Boolean(event);
  const setField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => setForm((current) => ({ ...current, [key]: value }));

  function changeType(type: CalendarEventType) {
    setForm((current) => ({
      ...current,
      type,
      taskId: type === "deadline" || type === "focusBlock" ? current.taskId : "",
      documentId: type === "document" ? current.documentId : "",
      projectId: type === "deadline" || type === "document" || type === "milestone" || type === "focusBlock" ? current.projectId : "",
      location: type === "meeting" ? current.location : "",
      meetingUrl: type === "meeting" ? current.meetingUrl : "",
      externalAttendees: type === "meeting" ? current.externalAttendees : "",
      durationMinutes: type === "meeting" || type === "focusBlock" ? Number(current.durationMinutes) : 30,
    }));
  }

  function submit() {
    if (!form.title.trim()) return;
    const startAt = new Date(`${form.date}T${form.time}:00`);
    const endAt = new Date(`${form.endDate}T${form.endTime}:00`);
    const durationMinutes = endAt > startAt
      ? Math.max(1, Math.round((endAt.getTime() - startAt.getTime()) / 60_000))
      : Number(form.durationMinutes);
    onSubmit({
      title: form.title.trim(), date: form.date, time: form.time, type: form.type, status: form.status,
      durationMinutes, projectId: form.projectId || undefined,
      ownerUserId: form.ownerUserId || undefined,
      taskId: form.taskId || undefined, documentId: form.documentId || undefined,
      location: form.location?.trim() || undefined, meetingUrl: form.meetingUrl?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
      externalAttendees: splitList(form.externalAttendees),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent showCloseButton={false} className="h-[90vh] max-h-[960px] w-[96vw] max-w-[1320px] gap-0 overflow-hidden rounded-2xl border border-border bg-background p-0 shadow-2xl">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-5 sm:px-7">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><ActiveIcon className="size-4" />{isEditing ? "Edit event" : "New event"}</div>
          <div className="flex items-center gap-2"><Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button type="button" size="sm" disabled={isPending || !form.title.trim()} onClick={submit}>{isPending ? "Saving…" : isEditing ? "Save changes" : "Create event"}</Button></div>
        </div>

        <div className="h-[calc(90vh-3.5rem)] min-h-0 overflow-y-auto">
          <main className="mx-auto max-w-[1080px] px-6 py-8 sm:px-10 lg:py-12">
            <EventTypeTabs value={form.type} onChange={changeType} />
            <DialogHeader className="gap-5">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-foreground"><ActiveIcon className="size-7" /></div>
              <DialogTitle className="sr-only">{isEditing ? "Edit calendar item" : "New calendar item"}</DialogTitle>
              <DialogDescription className="sr-only">{activeType.description}</DialogDescription>
              <Label htmlFor="calendar-item-title" className="sr-only">Title</Label>
              <Input id="calendar-item-title" autoFocus value={form.title} onChange={(input) => setField("title", input.target.value)} placeholder={titlePlaceholder(form.type)} className="h-auto rounded-none border-0 bg-transparent px-0 py-0 text-3xl font-bold tracking-tight shadow-none placeholder:text-muted-foreground/35 focus-visible:ring-0 sm:text-4xl" />
            </DialogHeader>

            <section className="mt-8 border-y border-border py-3">
              <div className="grid gap-x-8 md:grid-cols-2">
                <PropertyCell icon={CalendarDays} label="Dates"><EventDateRangePicker startDate={form.date} endDate={form.endDate} onStartDateChange={(date) => setForm((current) => ({ ...current, date, endDate: current.endDate === current.date ? date : current.endDate }))} onEndDateChange={(endDate) => setField("endDate", endDate)} /></PropertyCell>
                <PropertyCell icon={CheckSquare2} label="Status"><SimpleSelect value={form.status} options={[{ value: "confirmed", label: "Confirmed" }, { value: "pending", label: "Pending" }, { value: "draft", label: "Draft" }]} onChange={(value) => setField("status", value as CalendarEvent["status"])} /></PropertyCell>
                <div className="md:col-span-2"><PropertyCell icon={Clock3} label="Time"><EventTimeRangePicker startTime={form.time} endTime={form.endTime} onStartTimeChange={(time) => setField("time", time)} onEndTimeChange={(time) => setField("endTime", time)} /></PropertyCell></div>
              </div>
              <TypeSpecificFields type={form.type} form={form} taskOptions={options.taskOptions} documentOptions={options.documentOptions} projectOptions={options.projectOptions} memberOptions={options.memberOptions} setField={setField} />
            </section>

            <section className="mt-8">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{bodyLabel(form.type)}</p>
              <YooptaRichTextEditor value={form.notes ?? ""} onChange={(value) => setField("notes", value)} placeholder={bodyPlaceholder(form.type)} variant="card" compactFormatting minHeightClassName="min-h-[320px]" className="bg-transparent" editorClassName="text-[15px] leading-7" />
            </section>

            {event ? <div className="mt-12 border-t border-border pt-6"><Button type="button" variant="ghost" className="text-destructive hover:text-destructive" disabled={isPending} onClick={() => onDelete(event.id)}><Trash2 className="size-4" />Delete event</Button></div> : null}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EventTypeTabs({ value, onChange }: { value: CalendarEventType; onChange: (type: CalendarEventType) => void }) {
  return (
    <div className="mb-8 flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-border bg-muted/30 p-1" role="tablist" aria-label="Calendar item type">
      {eventTypes.map((type) => {
        const Icon = type.icon;
        const active = value === type.value;
        return (
          <button key={type.value} type="button" role="tab" aria-selected={active} onClick={() => onChange(type.value)} className={`flex h-9 min-w-max flex-1 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors ${active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/60 hover:text-foreground"}`}>
            <Icon className="size-3.5" />{type.label}
          </button>
        );
      })}
    </div>
  );
}

function PropertyCell({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return <div className="grid min-h-10 grid-cols-[112px_1fr] items-center gap-3 border-b border-border/70 py-1.5 last:border-b-0"><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="size-3.5" />{label}</div><div className="min-w-0">{children}</div></div>;
}

function EventDateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange }: { startDate: string; endDate: string; onStartDateChange: (date: string) => void; onEndDateChange: (date: string) => void }) {
  const start = dateFromIso(startDate);
  const end = dateFromIso(endDate);
  const [range, setRange] = useState<DateRange>({ from: start, to: end });

  useEffect(() => {
    setRange({ from: start, to: end });
  }, [startDate, endDate]);

  function selectRange(next: DateRange | undefined) {
    if (!next?.from) return;
    setRange(next);
    onStartDateChange(calendarIsoDate(next.from));
    if (next.to) onEndDateChange(calendarIsoDate(next.to));
  }

  return (
    <Popover onOpenChange={(open) => {
      if (!open && range.from && !range.to) {
        setRange({ from: range.from, to: range.from });
        onEndDateChange(calendarIsoDate(range.from));
      }
    }}>
      <PopoverTrigger render={<Button type="button" variant="ghost" className="h-8 w-full justify-start gap-1.5 px-0 text-xs font-medium hover:bg-transparent"><span>{format(start, "MMM d, yyyy")}</span><span className="text-muted-foreground">→</span><span>{format(end, "MMM d, yyyy")}</span></Button>} />
      <PopoverContent align="start" className="w-[440px] overflow-hidden rounded-xl p-0">
        <div className="flex items-center gap-3 border-b border-border p-3">
          <div className="min-w-0 flex-1 rounded-lg border border-primary/50 bg-primary/5 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Start</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{range.from ? format(range.from, "MMM d, yyyy") : "Select"}</p>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Due</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{range.to ? format(range.to, "MMM d, yyyy") : "Select end"}</p>
          </div>
        </div>
        <DayPicker
          mode="range"
          selected={range}
          onSelect={selectRange}
          defaultMonth={range.from}
          numberOfMonths={1}
          classNames={{
            ...calendarClassNames,
            root: "p-5",
            weekday: "flex size-11 items-center justify-center text-xs font-medium text-muted-foreground",
            day: "size-11 text-center text-sm",
            day_button: "inline-flex size-11 items-center justify-center rounded-md text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            range_start: "rounded-l-md bg-primary text-primary-foreground",
            range_middle: "rounded-none bg-primary/15 text-foreground",
            range_end: "rounded-r-md bg-primary text-primary-foreground",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function EventTimeRangePicker({ startTime, endTime, onStartTimeChange, onEndTimeChange }: { startTime: string; endTime: string; onStartTimeChange: (time: string) => void; onEndTimeChange: (time: string) => void }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      <TimePicker value={startTime} onChange={onStartTimeChange} />
      <span className="text-xs text-muted-foreground">→</span>
      <TimePicker value={endTime} onChange={onEndTimeChange} />
    </div>
  );
}

function TypeSpecificFields({ type, form, taskOptions, documentOptions, projectOptions, memberOptions, setField }: { type: CalendarEventType; form: FormState; taskOptions: CalendarRelationOption[]; documentOptions: CalendarRelationOption[]; projectOptions: CalendarRelationOption[]; memberOptions: CalendarRelationOption[]; setField: <Key extends keyof FormState>(key: Key, value: FormState[Key]) => void }) {
  if (type === "meeting") return <div className="mt-8 divide-y divide-border border-y border-border"><PropertyRow icon={UserRound} label="Organizer"><CalendarRelationPicker value={form.ownerUserId ?? ""} options={memberOptions} placeholder="Choose an organizer" searchPlaceholder="Search people by name…" onChange={(value) => setField("ownerUserId", value)} /></PropertyRow><PropertyRow icon={Users} label="Participants"><Input value={form.externalAttendees} onChange={(input) => setField("externalAttendees", input.target.value)} placeholder="Emails, separated by commas" className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></PropertyRow><PropertyRow icon={MapPin} label="Location"><Input value={form.location ?? ""} onChange={(input) => setField("location", input.target.value)} placeholder="Room or address" className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></PropertyRow><PropertyRow icon={Link2} label="Meeting link"><Input type="url" value={form.meetingUrl ?? ""} onChange={(input) => setField("meetingUrl", input.target.value)} placeholder="https://…" className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></PropertyRow></div>;
  if (type === "deadline") return <RelationFields ownerUserId={form.ownerUserId} taskId={form.taskId} projectId={form.projectId} memberOptions={memberOptions} taskOptions={taskOptions} projectOptions={projectOptions} onOwnerChange={(value) => setField("ownerUserId", value)} onTaskChange={(value) => setField("taskId", value)} onProjectChange={(value) => setField("projectId", value)} />;
  if (type === "document") return <div className="mt-8 divide-y divide-border border-y border-border"><PropertyRow icon={FileText} label="Document"><CalendarRelationPicker value={form.documentId ?? ""} options={documentOptions} placeholder="Choose a document" searchPlaceholder="Search documents by name…" onChange={(value) => setField("documentId", value)} /></PropertyRow><PropertyRow icon={Flag} label="Project"><CalendarRelationPicker value={form.projectId ?? ""} options={projectOptions} placeholder="Choose a project" searchPlaceholder="Search projects by name…" onChange={(value) => setField("projectId", value)} /></PropertyRow></div>;
  if (type === "milestone") return <div className="mt-8 border-y border-border"><PropertyRow icon={Flag} label="Project"><CalendarRelationPicker value={form.projectId ?? ""} options={projectOptions} placeholder="Choose a project" searchPlaceholder="Search projects by name…" onChange={(value) => setField("projectId", value)} /></PropertyRow></div>;
  if (type === "focusBlock") return <RelationFields ownerUserId={form.ownerUserId} taskId={form.taskId} projectId={form.projectId} memberOptions={memberOptions} taskOptions={taskOptions} projectOptions={projectOptions} onOwnerChange={(value) => setField("ownerUserId", value)} onTaskChange={(value) => setField("taskId", value)} onProjectChange={(value) => setField("projectId", value)} />;
  return null;
}

function RelationFields({ ownerUserId, taskId, projectId, memberOptions, taskOptions, projectOptions, onOwnerChange, onTaskChange, onProjectChange }: { ownerUserId?: string; taskId?: string; projectId?: string; memberOptions: CalendarRelationOption[]; taskOptions: CalendarRelationOption[]; projectOptions: CalendarRelationOption[]; onOwnerChange: (value: string) => void; onTaskChange: (value: string) => void; onProjectChange: (value: string) => void }) { return <div className="mt-8 divide-y divide-border border-y border-border"><PropertyRow icon={UserRound} label="Assignee"><CalendarRelationPicker value={ownerUserId ?? ""} options={memberOptions} placeholder="Choose an assignee" searchPlaceholder="Search people by name…" onChange={onOwnerChange} /></PropertyRow><PropertyRow icon={CheckSquare2} label="Task"><CalendarRelationPicker value={taskId ?? ""} options={taskOptions} placeholder="Choose a task" searchPlaceholder="Search tasks by name…" onChange={onTaskChange} /></PropertyRow><PropertyRow icon={Flag} label="Project"><CalendarRelationPicker value={projectId ?? ""} options={projectOptions} placeholder="Choose a project" searchPlaceholder="Search projects by name…" onChange={onProjectChange} /></PropertyRow></div>; }
function PropertyRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) { return <div className="grid min-h-12 grid-cols-1 items-center gap-1 py-2 sm:grid-cols-[140px_1fr] sm:gap-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className="size-4" />{label}</div><div className="min-w-0">{children}</div></div>; }
function SimpleSelect({ value, options, onChange }: { value: string; options: CalendarRelationOption[]; onChange: (value: string) => void }) { return <Select value={value} onValueChange={(next: string | null) => next && onChange(next)}><SelectTrigger className="h-9 border-0 bg-transparent px-0 shadow-none focus:ring-0"><SelectValue /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>; }
function titlePlaceholder(type: CalendarEventType) { return type === "deadline" ? "Task or deadline" : type === "document" ? "Document work" : type === "reminder" ? "Remind me…" : type === "milestone" ? "Milestone" : type === "focusBlock" ? "Focus on…" : "Meeting title"; }
function bodyLabel(type: CalendarEventType) { return type === "meeting" ? "Agenda" : type === "deadline" ? "Task context" : type === "document" ? "Review brief" : type === "reminder" ? "Reminder" : type === "milestone" ? "Milestone notes" : "Focus notes"; }
function bodyPlaceholder(type: CalendarEventType) { return type === "meeting" ? "Add an agenda, talking points, or preparation notes…" : type === "deadline" ? "Describe the expected outcome or acceptance criteria…" : type === "document" ? "What should be written, reviewed, or approved?" : type === "reminder" ? "What should you remember?" : type === "milestone" ? "Describe the checkpoint and what success means…" : "What do you want to accomplish in this block?"; }
function splitList(value: string) { const values = value.split(",").map((item) => item.trim()).filter(Boolean); return values.length ? values : undefined; }
function clockValue(date: Date) { return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`; }
function dateFromIso(value: string) { return new Date(`${value}T12:00:00`); }
