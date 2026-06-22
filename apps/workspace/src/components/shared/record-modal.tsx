"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * RecordModal — shared Apple-style modal overlay.
 *
 * Drop-in replacement for Dialog/Sheet with:
 * - Backdrop blur + scale-up spring animation (same as tasks)
 * - Fullscreen toggle
 * - Header with action button, fullscreen toggle, close
 * - Scrollable body
 *
 * Usage:
 * ```tsx
 * <RecordModal
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   title="Create Project"
 *   actionLabel="Create"
 *   onAction={handleSubmit}
 *   isSaving={isSubmitting}
 * >
 *   <YourFormContent />
 * </RecordModal>
 * ```
 */
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = useCallback(() => setIsFullscreen((v) => !v), []);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleFullscreen();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, toggleFullscreen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center modal-overlay-animate-in">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default bg-black/20 backdrop-blur-[2px] dark:bg-black/45"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative z-10 overflow-hidden border border-border bg-background flex flex-col modal-content-animate-in",
          isFullscreen
            ? "w-screen h-screen rounded-none border-0"
            : "w-[90vw] h-[90vh] rounded-2xl",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 shrink-0">
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
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit full screen" : "Full screen"}
              className="transition-all duration-200 h-8 w-8"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              title="Close"
              className="transition-all duration-200 hover:bg-destructive/10 hover:text-destructive h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * RecordFieldRow — hover-reveal metadata row matching WorkOsDocEditor pattern.
 *
 * ```tsx
 * <RecordFieldRow label="Status">
 *   <StatusPicker value={status} onChange={setStatus} />
 * </RecordFieldRow>
 * ```
 */
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
