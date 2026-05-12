"use client";

import { AlertTriangle, X } from "lucide-react";

/**
 * WHY:   The Anan workspace uses a strong destructive-action confirmation modal that should remain available through the package adapter entrypoint.
 * WHAT:  Renders the Anan-flavored delete confirmation modal with title, description, and confirm/cancel actions.
 * HOW:   Shows nothing when closed and closes on backdrop click or the close button.
 */
export default function AgDeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "حذف نهائياً",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md border-2 border-slate-100 bg-white">
        <div className="h-1.5 w-full bg-red-600" />

        <div className="flex items-start justify-between px-8 pt-8 pb-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-red-100 bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black text-slate-950">{title}</h2>
              {description ? (
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{description}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-slate-400 transition hover:text-slate-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-8 mb-6 border border-red-100 bg-red-50 p-4">
          <p className="text-right text-xs font-black leading-relaxed text-red-700">
            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع البيانات المرتبطة بهذا العنصر.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-8 pb-8">
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-200 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-slate-400 hover:text-slate-950"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="border-2 border-red-600 bg-red-600 px-8 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-red-700 hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
