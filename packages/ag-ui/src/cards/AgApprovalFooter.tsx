"use client";

import { CheckCircle2, RotateCcw } from "lucide-react";
import type { AgUiCardComponentProps } from "../protocol";

type AgApprovalFooterProps = AgUiCardComponentProps<{
  approveLabel?: string;
  editLabel?: string;
  onApprove?: () => void;
  onEdit?: () => void;
}>;

/**
 * WHY:   Structured AI actions need a consistent affordance for final approval or revision.
 * WHAT:  Renders the default approve/edit footer and dispatches host-owned action callbacks when clicked.
 * HOW:   Prefers explicit props, then falls back to the renderer action context for `approve` and `edit`.
 */
export default function AgApprovalFooter({
  approveLabel = "اعتماد التنفيذ",
  editLabel = "طلب تعديل",
  onApprove,
  onEdit,
  agUiContext,
}: AgApprovalFooterProps) {
  return (
    <div className="flex w-full max-w-[340px] gap-3">
      <button
        type="button"
        onClick={() => onApprove?.() ?? agUiContext?.dispatchAction("approve")}
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-highlight)_50%,transparent)] bg-[var(--workspace-highlight)] px-4 py-3 text-xs font-black tracking-[0.22em] text-[var(--primary-foreground)] transition hover:brightness-110"
      >
        <CheckCircle2 className="h-4 w-4" />
        {approveLabel}
      </button>
      <button
        type="button"
        onClick={() => onEdit?.() ?? agUiContext?.dispatchAction("edit")}
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-3 text-xs font-black tracking-[0.22em] text-[var(--workspace-bubble-other-foreground)] transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_32%,transparent)] hover:bg-[var(--workspace-accent-soft)] hover:text-[var(--workspace-highlight)]"
      >
        <RotateCcw className="h-4 w-4" />
        {editLabel}
      </button>
    </div>
  );
}
