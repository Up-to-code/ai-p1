"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAccountContext } from "@/domains/auth";
import { useOperationState } from "@/lib/utils/operation-state";
import {
  createCalendarEventRequest,
  updateCalendarEventRequest,
  deleteCalendarEventRequest,
} from "../api/calendar";
import type { CalendarEventFormValues } from "../validation/calendar.schema";

export function useCalendarEventMutations(queryKey?: readonly unknown[]) {
  const account = useAccountContext();
  const organizationId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const queryClient = useQueryClient();

  const createOperation = useOperationState({ errorMessage: "Event creation failed." });
  const updateOperation = useOperationState({ errorMessage: "Event update failed." });
  const deleteOperation = useOperationState({ errorMessage: "Event delete failed." });

  async function createEvent(values: CalendarEventFormValues, options?: { onSuccess?: () => void }) {
    if (!organizationId) throw new Error("Select an organization first.");
    return createOperation.run(
      () => createCalendarEventRequest(organizationId, values),
      {
        successMessage: "Event created.",
        onSuccess: () => {
          if (queryKey) queryClient.invalidateQueries({ queryKey });
          options?.onSuccess?.();
        },
      },
    );
  }

  async function updateEvent(eventId: string, values: CalendarEventFormValues, options?: { onSuccess?: () => void }) {
    if (!organizationId) throw new Error("Select an organization first.");
    return updateOperation.run(
      () => updateCalendarEventRequest(organizationId, eventId, values),
      {
        successMessage: "Event updated.",
        onSuccess: () => {
          if (queryKey) queryClient.invalidateQueries({ queryKey });
          options?.onSuccess?.();
        },
      },
    );
  }

  async function deleteEvent(eventId: string, options?: { onSuccess?: () => void }) {
    if (!organizationId) throw new Error("Select an organization first.");
    return deleteOperation.run(
      () => deleteCalendarEventRequest(organizationId, eventId),
      {
        successMessage: "Event deleted.",
        onSuccess: () => {
          if (queryKey) queryClient.invalidateQueries({ queryKey });
          options?.onSuccess?.();
        },
      },
    );
  }

  return {
    organizationId,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating: createOperation.isRunning,
    isUpdating: updateOperation.isRunning,
    isDeleting: deleteOperation.isRunning,
    createError: createOperation.error,
    updateError: updateOperation.error,
    deleteError: deleteOperation.error,
  };
}
