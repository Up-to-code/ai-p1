"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
      <Card className="border-border/60 shadow-none max-w-lg w-full">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-error" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary tracking-tight mb-2">Something went wrong</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-2 max-w-sm">
            An error occurred while loading this page. You can try again or navigate back to the dashboard.
          </p>
          {error.digest && (
            <p className="text-xs text-text-muted font-mono mb-6">Error ID: {error.digest}</p>
          )}
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="h-9 gap-2 text-sm">
                <ArrowLeft className="w-3.5 h-3.5" />
                Dashboard
              </Button>
            </Link>
            <Button onClick={reset} className="h-9 gap-2 text-sm shadow-none">
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
