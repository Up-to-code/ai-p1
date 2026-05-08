"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { normalizeErrorMessage } from "@/lib/utils/form-errors";

interface RunOptions<TResult> {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result: TResult) => void;
  onError?: (message: string) => void;
}

export function useOperationState(defaults: {
  successMessage?: string;
  errorMessage?: string;
} = {}) {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const run = useCallback(async <TResult,>(
    action: () => TResult | Promise<TResult>,
    options: RunOptions<TResult> = {},
  ) => {
    if (isRunning) return undefined;

    setIsRunning(true);
    setError(null);

    try {
      const result = await action();
      const successMessage = options.successMessage ?? defaults.successMessage;

      if (successMessage) {
        toast({ title: successMessage, type: "success" });
      }

      options.onSuccess?.(result);
      return result;
    } catch (caught) {
      const message = normalizeErrorMessage(caught, options.errorMessage ?? defaults.errorMessage ?? "The operation could not be completed.");
      setError(message);
      toast({ title: options.errorMessage ?? defaults.errorMessage ?? "Operation failed", description: message, type: "error" });
      options.onError?.(message);
      return undefined;
    } finally {
      setIsRunning(false);
    }
  }, [defaults.errorMessage, defaults.successMessage, isRunning, toast]);

  return { run, isRunning, error, clearError };
}
