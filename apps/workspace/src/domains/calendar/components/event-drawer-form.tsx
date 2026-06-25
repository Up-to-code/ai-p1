"use client";

import { useState, type ReactNode } from "react";
import { ClipboardList, Loader2, MapPin, Search, User, X } from "lucide-react";
import type { CalendarEventFormValues } from "../validation/calendar.schema";
import {
  calendarScheduleTitle,
  customEventTypeValues,
} from "@/domains/calendar/calendar-view-model";
import { FormErrorSummary } from "@/components/shared/crud-ui";
import { cn } from "@/lib/utils";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { OwnerPicker } from "@/components/ui/owner-picker";
import { CustomSelect } from "@/components/ui/custom-select";
import { ContextPickerOverlay, TicketPickerButton } from "./event-drawer-pickers";

type PickerKind = "client" | "task";

export function EventDrawerForm({
  form,
  fieldErrors,
  isRtl,
  selectedClientName,
  selectedTaskTitle,
  clients,
  tasks,
  clientsLoading,
  tasksLoading,
  onUpdateField,
  labels,
}: {
  form: CalendarEventFormValues;
  fieldErrors: Record<keyof CalendarEventFormValues, string | undefined>;
  isRtl: boolean;
  selectedClientName?: string;
  selectedTaskTitle?: string;
  clients: Array<{ id: string; name: string }>;
  tasks: Array<{ id: string; title: string; clientId: string }>;
  clientsLoading: boolean;
  tasksLoading: boolean;
  onUpdateField: <TKey extends keyof CalendarEventFormValues>(
    key: TKey,
    value: CalendarEventFormValues[TKey],
  ) => void;
  labels: {
    scheduleName: string;
    titlePlaceholder: string;
    date: string;
    time: string;
    multiDay: string;
    type: string;
    status: string;
    owner: string;
    client: string;
    task: string;
    quickTask: string;
    taskPlaceholder: string;
    add: string;
    location: string;
    locationPlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    typeOption: (type: string) => string;
    statusOption: (status: string) => string;
    chooseClient: string;
    chooseTask: string;
    noClients: string;
    noTasks: string;
    search: string;
    noPickerResults: string;
    clearSelection: string;
    closePicker: string;
  };
}) {
  const [picker, setPicker] = useState<PickerKind | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const filteredTasks = form.clientId
    ? tasks.filter((task) => task.clientId === form.clientId)
    : tasks;

  const pickerConfig = picker
    ? {
        client: {
          title: labels.chooseClient,
          empty: labels.noClients,
          loading: clientsLoading,
          options: clients.map((client) => ({
            id: client.id,
            label: client.name,
            icon: <User className="h-4 w-4" />,
          })),
          selectedId: form.clientId ?? "",
        },
        task: {
          title: labels.chooseTask,
          empty: labels.noTasks,
          loading: tasksLoading,
          options: filteredTasks.map((task) => ({
            id: task.id,
            label: task.title,
            icon: <ClipboardList className="h-4 w-4" />,
          })),
          selectedId: form.taskId ?? "",
        },
      }[picker]
    : null;

  function openPicker(kind: PickerKind) {
    setPicker(kind);
    setPickerSearch("");
  }

  function selectPickerValue(id: string) {
    if (picker === "client") onUpdateField("clientId", id);
    if (picker === "task") {
      const task = tasks.find((item) => item.id === id);
      onUpdateField("taskId", id);
      if (task?.clientId && !form.clientId) onUpdateField("clientId", task.clientId);
    }
    setPicker(null);
  }

  function clearPickerValue(kind: PickerKind) {
    if (kind === "client") onUpdateField("clientId", "");
    if (kind === "task") onUpdateField("taskId", "");
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-8 py-5">
        <FormErrorSummary errors={fieldErrors} />
        <div className="space-y-6">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{labels.scheduleName}</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => onUpdateField("title", e.target.value)}
              placeholder={labels.titlePlaceholder}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10"
            />
            {fieldErrors.title && <p className="text-xs font-medium text-red-500">{fieldErrors.title}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <CalendarDatePicker
              value={form.date}
              onChange={(value) => onUpdateField("date", value)}
              endDate={form.isMultiDay ? form.endDate : undefined}
              onEndDateChange={(value) => onUpdateField("endDate", value)}
              label={labels.date}
              error={fieldErrors.date}
            />
            <TimePicker
              value={form.time}
              onChange={(value) => onUpdateField("time", value)}
              label={labels.time}
              error={fieldErrors.time}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onUpdateField("isMultiDay", !form.isMultiDay);
                if (!form.isMultiDay) onUpdateField("endDate", form.date);
              }}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                form.isMultiDay ? "bg-foreground" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform",
                  form.isMultiDay ? "left-[18px]" : "left-0.5",
                )}
              />
            </button>
            <span className="text-xs font-semibold text-muted-foreground">{labels.multiDay}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <CustomSelect
              value={form.type}
              onChange={(value) => onUpdateField("type", value as CalendarEventFormValues["type"])}
              options={customEventTypeValues.map((type) => ({
                value: type,
                label: labels.typeOption(type),
              }))}
              label={labels.type}
            />
            <CustomSelect
              value={form.status}
              onChange={(value) => onUpdateField("status", value as CalendarEventFormValues["status"])}
              options={(["confirmed", "pending", "draft"] as const).map((status) => ({
                value: status,
                label: labels.statusOption(status),
              }))}
              label={labels.status}
            />
          </div>

          <OwnerPicker
            value={form.owner}
            onChange={(value) => onUpdateField("owner", value)}
            options={[{ id: "team", name: "Team" }]}
            label={labels.owner}
            error={fieldErrors.owner}
          />

          <div className="border-t border-border" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">{labels.client}</span>
              <TicketPickerButton
                label={labels.client}
                value={selectedClientName}
                icon={<User className="h-4 w-4" />}
                onClick={() => openPicker("client")}
                onClear={form.clientId ? () => clearPickerValue("client") : undefined}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{labels.task}</span>
                <button
                  type="button"
                  onClick={() => setIsCreatingTask(true)}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  + {labels.quickTask}
                </button>
              </div>
              {isCreatingTask ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    placeholder={labels.taskPlaceholder}
                    autoFocus
                    className="h-10 flex-1 rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-foreground/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && quickTaskTitle.trim()) {
                        setIsCreatingTask(false);
                        setQuickTaskTitle("");
                      }
                      if (e.key === "Escape") {
                        setIsCreatingTask(false);
                        setQuickTaskTitle("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (quickTaskTitle.trim()) {
                        setIsCreatingTask(false);
                        setQuickTaskTitle("");
                      }
                    }}
                    className="h-10 rounded-xl bg-foreground px-3 text-[10px] font-semibold text-background"
                  >
                    {labels.add}
                  </button>
                </div>
              ) : (
                <TicketPickerButton
                  label={labels.task}
                  value={selectedTaskTitle}
                  icon={<ClipboardList className="h-4 w-4" />}
                  onClick={() => openPicker("task")}
                  onClear={form.taskId ? () => clearPickerValue("task") : undefined}
                />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{labels.location}</span>
            <div className="relative">
              <MapPin
                className={cn(
                  "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60",
                  isRtl ? "right-3" : "left-3",
                )}
              />
              <input
                type="text"
                value={form.location ?? ""}
                onChange={(e) => onUpdateField("location", e.target.value)}
                placeholder={labels.locationPlaceholder}
                className={cn(
                  "h-10 w-full rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10",
                  isRtl ? "pr-9 pl-3" : "pl-9 pr-3",
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{labels.notes}</span>
            <RichTextEditor
              value={form.notes ?? ""}
              onChange={(value) => onUpdateField("notes", value)}
              placeholder={labels.notesPlaceholder}
              minHeight="100px"
            />
          </div>
        </div>
      </div>

      {picker && pickerConfig && (
        <ContextPickerOverlay
          title={pickerConfig.title}
          searchLabel={labels.search}
          searchValue={pickerSearch}
          onSearchChange={setPickerSearch}
          selectedId={pickerConfig.selectedId}
          options={pickerConfig.options}
          loading={pickerConfig.loading}
          emptyLabel={pickerConfig.empty}
          noResultsLabel={labels.noPickerResults}
          clearLabel={labels.clearSelection}
          closeLabel={labels.closePicker}
          onClear={() => clearPickerValue(picker)}
          onSelect={selectPickerValue}
          onClose={() => setPicker(null)}
        />
      )}
    </>
  );
}

export function buildGeneratedEventTitle(
  form: CalendarEventFormValues,
  typeLabel: string,
  selectedClientName?: string,
) {
  const context = selectedClientName || form.location?.trim();
  return calendarScheduleTitle(typeLabel, context);
}
