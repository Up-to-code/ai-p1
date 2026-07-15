"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ModulePanel,
  ModulePanelContent,
  ModulePanelHeader,
  ModulePanelBody,
  ModulePanelCloseButton,
  ModulePanelDescription,
  ModulePanelFullscreenToggle,
  ModulePanelTitle,
} from "@/components/shared/module-panel";

export function RecordModal({
  isOpen,
  onClose,
  title,
  description,
  actionLabel,
  onAction,
  isSaving = false,
  isUnsaved = false,
  children,
  className,
  defaultWidth,
  defaultHeight,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  isSaving?: boolean;
  isUnsaved?: boolean;
  children: React.ReactNode;
  className?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}) {
  const action = onAction && actionLabel ? (
    <Button
      type="button"
      size="sm"
      onClick={onAction}
      disabled={isSaving}
      className="h-8 rounded-lg px-3 text-xs font-semibold transition-all duration-200"
    >
      {isSaving && <Loader2 className="me-1.5 h-3 w-3 animate-spin" />}
      {isSaving ? "Saving..." : actionLabel}
    </Button>
  ) : null;

  return (
    <ModulePanel
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      defaultWidth={defaultWidth}
      defaultHeight={defaultHeight}
      minWidth={minWidth}
      maxWidth={maxWidth}
      minHeight={minHeight}
      maxHeight={maxHeight}
    >
      <ModulePanelContent className={className}>
        <ModulePanelHeader
          left={
            title ? (
              <div className="min-w-0">
                <ModulePanelTitle>{title}</ModulePanelTitle>
                {description ? (
                  <ModulePanelDescription className="mt-0.5 truncate text-xs">
                    {description}
                  </ModulePanelDescription>
                ) : null}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {action}
                {isUnsaved && !isSaving && (
                  <span className="text-[10px] font-medium text-amber-600 transition-opacity duration-300 dark:text-amber-400">
                    Unsaved changes
                  </span>
                )}
              </div>
            )
          }
          right={
            <div className="flex items-center gap-1">
              {title ? action : null}
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
