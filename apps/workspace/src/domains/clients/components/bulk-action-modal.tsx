"use client";

import { useState } from "react";
import { Layers, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface BulkActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onApply: (action: string, value: string) => void;
}

/* ── Actions ───────────────────────────────────────────────────────────────── */

const actions = [
  {
    key: "pipelineStage",
    label: "Change Stage",
    options: [
      { value: "blank", label: "Blank" },
      { value: "new_lead", label: "New Lead" },
      { value: "attempted", label: "Attempted" },
      { value: "contacted", label: "Contacted" },
      { value: "qualified", label: "Qualified" },
      { value: "unqualified", label: "Unqualified" },
    ],
  },
  {
    key: "status",
    label: "Change Status",
    options: [
      { value: "new", label: "New" },
      { value: "active", label: "Active" },
      { value: "nurture", label: "Nurture" },
      { value: "inactive", label: "Inactive" },
      { value: "archived", label: "Archived" },
    ],
  },
  {
    key: "type",
    label: "Change Type",
    options: [
      { value: "person", label: "Person" },
      { value: "organization", label: "Organization" },
    ],
  },
  {
    key: "priority",
    label: "Change Priority",
    options: [
      { value: "normal", label: "Normal" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
  },
] as const;

/* ── Component ─────────────────────────────────────────────────────────────── */

export function BulkActionModal({
  open,
  onOpenChange,
  selectedCount,
  onApply,
}: BulkActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");

  const activeAction = actions.find((a) => a.key === selectedAction);

  const handleApply = () => {
    if (!selectedAction || !selectedValue) return;
    onApply(selectedAction, selectedValue);
    setSelectedAction("");
    setSelectedValue("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedAction("");
    setSelectedValue("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Bulk Action
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Select an action to apply to{" "}
            <span className="font-semibold text-foreground">
              {selectedCount} client{selectedCount !== 1 ? "s" : ""}
            </span>
          </p>

          {/* Action selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Action
            </label>
            <div className="grid grid-cols-2 gap-2">
              {actions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => {
                    setSelectedAction(action.key);
                    setSelectedValue("");
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all",
                    selectedAction === action.key
                      ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                      : "border-border bg-muted/50 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Value selection */}
          {activeAction && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <label className="text-xs font-medium text-muted-foreground">
                New Value
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeAction.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedValue(opt.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                      selectedValue === opt.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted text-muted-foreground hover:border-border hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} size="sm">
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selectedAction || !selectedValue}
            size="sm"
            className="gap-1.5"
          >
            Apply
            <ArrowRight className="h-3 w-3" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
