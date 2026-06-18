"use client";

import { useState, useCallback } from "react";
import type { CalendarEvent } from "../store/calendar.types";

export type CalendarDrawerMode = "create" | "edit" | null;
export type CalendarDrawerView = "read" | "edit";

export interface CalendarDrawerState {
  mode: CalendarDrawerMode;
  view: CalendarDrawerView;
  event: CalendarEvent | null;
  initialDate: Date | null;
  isOpen: boolean;
}

export function useCalendarDrawer() {
  const [state, setState] = useState<CalendarDrawerState>({
    mode: null,
    view: "edit",
    event: null,
    initialDate: null,
    isOpen: false,
  });

  const openCreate = useCallback((initialDate?: Date) => {
    setState({ mode: "create", view: "edit", event: null, initialDate: initialDate ?? null, isOpen: true });
  }, []);

  const openRead = useCallback((event: CalendarEvent) => {
    setState({ mode: "edit", view: "read", event, initialDate: null, isOpen: true });
  }, []);

  const openEdit = useCallback((event: CalendarEvent) => {
    setState({ mode: "edit", view: "edit", event, initialDate: null, isOpen: true });
  }, []);

  const setView = useCallback((view: CalendarDrawerView) => {
    setState((prev) => ({ ...prev, view }));
  }, []);

  const close = useCallback(() => {
    setState({ mode: null, view: "edit", event: null, initialDate: null, isOpen: false });
  }, []);

  return {
    ...state,
    openCreate,
    openRead,
    openEdit,
    setView,
    close,
  };
}
