"use client";

import { Check, CloudOff, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AutomationPersistenceStatus } from "../types";

const labels = {
  saved: "Saved",
  unsaved: "Unsaved changes",
  saving: "Saving…",
  error: "Save failed",
} satisfies Record<AutomationPersistenceStatus, string>;

export function AutomationSaveStatus({ status }: { status: AutomationPersistenceStatus }) {
  const Icon = status === "saving" ? LoaderCircle : status === "error" ? CloudOff : Check;
  return (
    <div
      role="status"
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium",
        status === "error" ? "bg-destructive/10 text-destructive" : "text-muted-foreground",
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", status === "saving" && "animate-spin")} />
      {labels[status]}
    </div>
  );
}
