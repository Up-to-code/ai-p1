"use client";

import { Button } from "@/components/ui/button";
import { Triangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-white shadow-none mb-8">
            <Triangle className="h-6 w-6 fill-current" />
          </div>

          <p className="text-6xl font-bold text-text-primary tracking-tighter mb-4">500</p>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">Something went wrong</h1>
          <p className="text-text-secondary leading-relaxed mb-2 max-w-md">
            An unexpected error occurred. Our team has been notified. Please try again.
          </p>
          {error.digest && (
            <p className="text-xs text-text-muted font-mono mb-8">Error ID: {error.digest}</p>
          )}

          <Button onClick={reset} className="h-10 shadow-none gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </body>
    </html>
  );
}
