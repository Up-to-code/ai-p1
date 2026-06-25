"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, X } from "lucide-react";
import type { CalendarEvent } from "../store/calendar.types";
import { calendarEventSchema, type CalendarEventFormValues } from "../validation/calendar.schema";
import { format } from "date-fns";
import { useOperationState } from "@/lib/utils/operation-state";
import { AppPrimaryButton } from "@/components/shared";
import { useTranslations, useLocale } from "next-intl";
import { isRtlLocale } from "@/lib/i18n/locale";
import { Button } from "@/components/ui/button";
import { EventTypeBadge, EventStatusBadge } from "@/components/ui/event-badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { EventDrawerReadView } from "./event-drawer-read-view";
import { buildGeneratedEventTitle, EventDrawerForm } from "./event-drawer-form";

type DrawerView = "read" | "edit";

export function EventDrawer({
  mode,
  view: drawerView,
  open,
  onClose,
  onEdit,
  event,
  initialDate,
  organizationId,
  clients = [],
  tasks = [],
  clientsLoading,
  tasksLoading,
  onDelete,
  onSave,
}: {
  mode: "create" | "edit";
  view: DrawerView;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  event?: CalendarEvent;
  initialDate?: Date;
  organizationId?: string;
  clients: Array<{ id: string; name: string }>;
  tasks: Array<{ id: string; title: string; clientId: string }>;
  clientsLoading: boolean;
  tasksLoading: boolean;
  onDelete: () => void;
  onSave: (data: CalendarEventFormValues) => void;
}) {
  const t = useTranslations("Calendar");
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const isRead = mode === "edit" && drawerView === "read" && Boolean(event);
  const isCreate = mode === "create";

  const today = useMemo(() => new Date(), []);
  const defaultDate = initialDate
    ? format(initialDate, "yyyy-MM-dd")
    : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const defaultTime = initialDate ? format(initialDate, "HH:mm") : "10:00";

  const defaultValues: CalendarEventFormValues = {
    title: event?.title ?? "",
    owner: event?.owner ?? "Team",
    date: event?.date ?? defaultDate,
    time: event?.time ?? defaultTime,
    endDate: event?.endDate ?? "",
    endTime: event?.endTime ?? "",
    isMultiDay: event?.isMultiDay ?? false,
    type: event?.type ?? "meeting",
    status: event?.status ?? "confirmed",
    clientId: event?.clientId ?? "",
    assetId: event?.assetId ?? "",
    taskId: event?.taskId ?? "",
    location: event?.location ?? "",
    notes: event?.notes ?? "",
    customFields: [],
  };

  const operation = useOperationState({
    errorMessage: mode === "create" ? "Event creation failed." : "Event update failed.",
  });

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CalendarEventFormValues>({
    resolver: zodResolver(calendarEventSchema as any),
    defaultValues,
  });

  const form = useWatch({ control }) as CalendarEventFormValues;
  const fieldErrors = Object.fromEntries(
    Object.entries(errors).map(([key, error]) => [key, error?.message]),
  ) as Record<keyof CalendarEventFormValues, string | undefined>;

  const selectedClient = clients.find((client) => client.id === form.clientId);
  const selectedTask = tasks.find((task) => task.id === form.taskId);

  function closeDrawer() {
    reset(defaultValues);
    operation.clearError();
    onClose();
  }

  function updateField<TKey extends keyof CalendarEventFormValues>(
    key: TKey,
    value: CalendarEventFormValues[TKey],
  ) {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    operation.clearError();
  }

  const onSubmit = handleSubmit((data) => {
    void operation.run(
      () => onSave(data),
      {
        successMessage: mode === "create" ? "Event created." : "Event updated.",
        onSuccess: closeDrawer,
      },
    );
  });

  function submitSchedule() {
    const values = getValues();
    if (!values.title?.trim()) {
      setValue(
        "title",
        buildGeneratedEventTitle(values, t(`types.${values.type || "meeting"}`), selectedClient?.name),
        { shouldDirty: true, shouldValidate: false },
      );
    }
    if (!values.owner?.trim()) {
      setValue("owner", "Team", { shouldDirty: true, shouldValidate: false });
    }
    void onSubmit();
  }

  const title = isCreate ? t("scheduleBusiness") : isRead ? event?.title ?? "" : t("editSchedule");

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) closeDrawer(); }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="z-[100] !w-[min(96vw,860px)] !max-w-[860px] gap-0 border-s border-border bg-background p-0 text-foreground sm:!max-w-[860px]"
      >
        <div className="flex items-center justify-between border-b border-border px-8 py-5">
          <div className="flex items-center gap-3 min-w-0">
            <SheetTitle className="text-lg font-bold text-foreground truncate">{title}</SheetTitle>
            {isRead && event && (
              <div className="flex items-center gap-2 shrink-0">
                <EventTypeBadge type={event.type} />
                <EventStatusBadge status={event.status} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isRead && (
              <button
                onClick={onEdit}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                {t("detail.edit")}
              </button>
            )}
            <button
              onClick={closeDrawer}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isRead && event && (
          <EventDrawerReadView
            event={event}
            locale={locale}
            labels={{
              title: t("form.titleLabel"),
              date: t("form.dateLabel"),
              time: t("form.timeLabel"),
              type: t("form.typeLabel"),
              status: t("table.status"),
              owner: t("form.ownerLabel"),
              location: t("form.locationLabel"),
              notes: t("form.notesLabel"),
              typeValue: t(`types.${event.type}`),
              statusValue: t(`statuses.${event.status}`),
            }}
          />
        )}

        {!isRead && (
          <EventDrawerForm
            form={form}
            fieldErrors={fieldErrors}
            isRtl={isRtl}
            selectedClientName={selectedClient?.name}
            selectedTaskTitle={selectedTask?.title}
            clients={clients}
            tasks={tasks}
            clientsLoading={clientsLoading}
            tasksLoading={tasksLoading}
            onUpdateField={updateField}
            labels={{
              scheduleName: t("form.scheduleName"),
              titlePlaceholder: t("form.titlePlaceholder"),
              date: t("form.dateLabel"),
              time: t("form.timeLabel"),
              multiDay: "Multi-day event",
              type: t("form.typeLabel"),
              status: t("table.status"),
              owner: t("form.ownerLabel"),
              client: t("form.clientLabel"),
              task: t("form.taskLabel"),
              quickTask: t("form.quickTask"),
              taskPlaceholder: t("form.taskPlaceholder"),
              add: t("form.add"),
              location: t("form.locationLabel"),
              locationPlaceholder: t("form.locationPlaceholder"),
              notes: t("form.notesLabel"),
              notesPlaceholder: t("form.notesPlaceholder"),
              typeOption: (type) => t(`types.${type}`),
              statusOption: (status) => t(`statuses.${status}`),
              chooseClient: t("form.chooseClient"),
              chooseTask: t("form.chooseTask"),
              noClients: t("form.noClients"),
              noTasks: t("form.noTasks"),
              search: t("form.search"),
              noPickerResults: t("form.noPickerResults"),
              clearSelection: t("form.clearSelection"),
              closePicker: t("form.closePicker"),
            }}
          />
        )}

        <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background/95 px-8 py-4 backdrop-blur-sm">
          <div>
            {isRead && (
              <Button
                type="button"
                variant="ghost"
                onClick={onDelete}
                className="h-10 px-4 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete.btn")}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={closeDrawer}
              className="h-10 px-5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t("form.cancel")}
            </Button>
            {!isRead && (
              <AppPrimaryButton disabled={operation.isRunning || isSubmitting} onClick={submitSchedule}>
                {mode === "create" ? t("form.createBtn") : t("form.saveBtn")}
              </AppPrimaryButton>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
