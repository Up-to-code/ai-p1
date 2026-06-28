"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";

export function useWidgetLayout(organizationId?: string, userId?: string) {
  return useQuery(
    api.workspace.widgetLayouts.getWidgetLayout,
    organizationId && userId ? { organizationId, userId } : "skip",
  );
}

export function useSaveWidgetLayout() {
  return useMutation(api.workspace.widgetLayouts.saveWidgetLayout);
}
