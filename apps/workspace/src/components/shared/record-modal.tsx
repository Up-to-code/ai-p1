"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ModulePanel,
  ModulePanelContent,
  ModulePanelHeader,
  ModulePanelBody,
  ModulePanelCloseButton,
  ModulePanelFullscreenToggle,
} from "@/components/shared/module-panel";

export function RecordModal({
  isOpen,
  onClose,
  title,
  actionLabel,
  onAction,
  isSaving = false,
  isUnsaved = false,
  children,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  isSaving?: boolean;
  isUnsaved?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ModulePanel open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModulePanelContent className={className}>
        <ModulePanelHeader
          left={
            <div className="flex items-center gap-3">
              {onAction && actionLabel && (
                <Button
                  type="button"
                  size="sm"
                  onClick={onAction}
                  disabled={isSaving}
                  className="h-8 rounded-xl text-xs transition-all duration-200"
                >
                  {isSaving && <Loader2 className="me-1.5 h-3 w-3 animate-spin" />}
                  {isSaving ? "Saving..." : actionLabel}
                </Button>
              )}
              {isUnsaved && !isSaving && (
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 transition-opacity duration-300">
                  Unsaved changes
                </span>
              )}
            </div>
          }
          right={
            <div className="flex items-center gap-1">
              <ModulePanelFullscreenToggle />
              <ModulePanelCloseButton />
            </div>
          }
        />
        <ModulePanelBody>
          {children}
        </ModulePanelBody>
      </ModulePanelContent>
    </ModulePanel>
  );
}

export function RecordFieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group grid min-h-9 grid-cols-[140px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-transparent px-2 py-1 transition-colors hover:border-border hover:bg-muted/35">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}
