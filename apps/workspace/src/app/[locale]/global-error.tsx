"use client";

import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-text-primary sm:px-6">
          <section
            aria-labelledby="global-error-title"
            className="w-full max-w-[680px] overflow-hidden rounded-[24px] border border-border bg-surface text-start shadow-none"
          >
            <div className="border-b border-border bg-background/70 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10 text-danger">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[12px] font-bold text-danger">System interruption</p>
                  <p className="text-[12px] font-medium text-text-muted">The workspace shell could not finish loading.</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-6 sm:px-6 sm:py-7">
              <p className="text-[12px] font-bold text-text-muted">Error 500</p>
              <h1 id="global-error-title" className="mt-2 text-[28px] font-bold leading-tight tracking-[0] text-text-primary">
                Something went wrong
              </h1>
              <p className="mt-3 max-w-[58ch] text-sm font-medium leading-6 text-text-secondary">
                The issue has been recorded. Try again to reload the workspace from a clean state.
              </p>

              {error.digest && (
                <div className="mt-5 rounded-2xl border border-border bg-background px-4 py-3">
                  <p className="text-[11px] font-bold text-text-muted">Error ID</p>
                  <p className="mt-1 break-all font-mono text-xs text-text-secondary">{error.digest}</p>
                </div>
              )}

              <div className="mt-6 flex">
                <Button onClick={reset} className="h-10 gap-2 rounded-xl px-4 text-sm shadow-none">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try again
                </Button>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
