"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@anan/platform-core/classnames";

/**
 * WHY:   Repeated authorizations with unchanged scopes should continue without unnecessary friction.
 * WHAT:  Auto-submits the approval form when consent can be safely reused.
 * HOW:   Calls `requestSubmit()` on mount only when `requiresConsent` is false.
 */
export default function ConsentAutoSubmit({
  action,
  requiresConsent,
  disabled = false,
  approveLabel,
  children,
  submitClassName,
}: {
  action: (formData: FormData) => void | Promise<void>;
  requiresConsent: boolean;
  disabled?: boolean;
  approveLabel: string;
  children: ReactNode;
  submitClassName?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!requiresConsent && !disabled) {
      formRef.current?.requestSubmit();
    }
  }, [disabled, requiresConsent]);

  return (
    <form ref={formRef} action={action}>
      {children}
      <button
        type="submit"
        className={cn(
          "inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
          submitClassName,
        )}
        disabled={disabled}
      >
        {approveLabel}
      </button>
    </form>
  );
}
