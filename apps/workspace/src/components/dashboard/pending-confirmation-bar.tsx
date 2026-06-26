"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { approveAgentConfirmationRequest, cancelAgentConfirmationRequest } from "@/domains/agents";

export type PendingConfirmation = {
  confirmationId: string;
  summary: string;
  resource?: string;
  action?: string;
  inputPreview?: string;
  expiresAt: number;
  status: "pending" | "executed" | "canceled" | "failed";
};

type PendingConfirmationBarProps = {
  confirmation: PendingConfirmation | null;
  organizationId?: string;
  onApproved?: (confirmationId: string) => void;
  onCanceled?: (confirmationId: string) => void;
};

function parsePreviewRows(inputPreview?: string) {
  if (!inputPreview) return [];
  try {
    const value = JSON.parse(inputPreview) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    return Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .slice(0, 4)
      .map(([key, value]) => ({
        key: key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " "),
        value: typeof value === "object" ? JSON.stringify(value) : String(value),
      }));
  } catch {
    return [];
  }
}

export function PendingConfirmationBar({
  confirmation,
  organizationId,
  onApproved,
  onCanceled,
}: PendingConfirmationBarProps) {
  const [actionState, setActionState] = useState<"idle" | "approving" | "canceling" | "done" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState<string>();

  if (!confirmation || confirmation.status !== "pending") return null;

  const previewRows = parsePreviewRows(confirmation.inputPreview);
  const showRawPreview = confirmation.inputPreview && previewRows.length === 0;

  const handleApprove = async () => {
    if (!organizationId || actionState === "approving") return;
    setActionState("approving");
    setErrorMessage(undefined);
    try {
      await approveAgentConfirmationRequest(organizationId, confirmation.confirmationId);
      setActionState("done");
      onApproved?.(confirmation.confirmationId);
    } catch (error) {
      setActionState("failed");
      setErrorMessage(error instanceof Error ? error.message : "Approval failed.");
    }
  };

  const handleCancel = async () => {
    if (!organizationId || actionState === "canceling") return;
    setActionState("canceling");
    setErrorMessage(undefined);
    try {
      await cancelAgentConfirmationRequest(organizationId, confirmation.confirmationId);
      setActionState("done");
      onCanceled?.(confirmation.confirmationId);
    } catch (error) {
      setActionState("failed");
      setErrorMessage(error instanceof Error ? error.message : "Cancel failed.");
    }
  };

  if (actionState === "done") return null;

  const isBusy = actionState === "approving" || actionState === "canceling";

  return (
    <div className="w-full px-3 sm:px-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
              {isBusy ? "Processing..." : "Approval needed"}
            </p>
            <p className="mt-0.5 text-sm font-bold leading-snug text-text-primary">
              {confirmation.summary}
            </p>
            {previewRows.length > 0 ? (
              <div className="mt-2 divide-y divide-border/60">
                {previewRows.map((row) => (
                  <div key={row.key} className="flex items-baseline justify-between gap-2 py-1.5">
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-text-muted">
                      {row.key}
                    </span>
                    <span className="min-w-0 truncate text-xs font-semibold text-text-primary">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : showRawPreview ? (
              <p className="mt-1 text-xs text-text-muted line-clamp-2">
                {confirmation.inputPreview}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="mt-1.5 text-xs font-semibold text-danger">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-4">
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-text-secondary transition hover:border-border hover:text-text-primary active:scale-95"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--q-user-bubble)] text-[var(--q-bg)] transition hover:opacity-90 active:scale-95"
                  title="Approve"
                >
                  <Check className="h-4 w-4 stroke-[2.5px]" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
