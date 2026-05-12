"use client";

import * as React from "react";
import { Bell, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "warning" | "info" | "error";

export interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
  type: ToastType;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismissToast: (id: number) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const typeConfig: Record<
  ToastType,
  {
    icon: React.ElementType;
    tone: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    tone: "border-success/30 bg-success/10 text-success",
  },
  warning: {
    icon: TriangleAlert,
    tone: "border-warning/30 bg-warning/10 text-warning",
  },
  info: {
    icon: Info,
    tone: "border-primary/30 bg-primary/10 text-primary",
  },
  error: {
    icon: Bell,
    tone: "border-danger/30 bg-danger/10 text-danger",
  },
};

function ToastView({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <div className="flex w-full items-start gap-3 rounded-lg border border-border/60 bg-background p-3 shadow-popover">
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
          config.tone
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-sm leading-5 text-text-secondary">
            {item.description}
          </p>
        )}
        {item.action && (
          <Button
            variant="link"
            className="mt-1 h-auto p-0 text-xs"
            onClick={item.action.onClick}
          >
            {item.action.label}
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onDismiss(item.id)}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const nextId = React.useRef(1);
  const timers = React.useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismissToast = React.useCallback((id: number) => {
    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = nextId.current;
      const item: ToastItem = {
        ...options,
        id,
        type: options.type ?? "info",
      };

      nextId.current += 1;
      setItems((current) => [item, ...current].slice(0, 4));

      if (options.duration !== 0) {
        const timer = setTimeout(
          () => dismissToast(id),
          options.duration ?? 5000
        );
        timers.current.set(id, timer);
      }

      return id;
    },
    [dismissToast]
  );

  React.useEffect(() => {
    const activeTimers = timers.current;

    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions removals"
        className="pointer-events-none fixed end-4 top-4 z-50 flex w-[min(360px,calc(100vw-32px))] flex-col gap-2"
      >
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastView item={item} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
