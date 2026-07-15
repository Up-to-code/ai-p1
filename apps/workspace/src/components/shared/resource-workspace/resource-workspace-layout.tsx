"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MoreHorizontal, X } from "lucide-react";
import { RouteTransition } from "@/components/layout/route-transition";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResourceViewMenu } from "./resource-view-menu";
import type { ResourceWorkspaceAction, ResourceWorkspaceConfig } from "./types";

export type ResourceWorkspaceLayoutProps = {
  config: ResourceWorkspaceConfig;
  toolbar?: ReactNode;
  extensionPanel?: ReactNode;
  extensionPanelOpen?: boolean;
  onExtensionPanelOpenChange?: (open: boolean) => void;
  extensionPanelLabel?: string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

type ResourceWorkspaceExtension = {
  closeExtensionPanel: () => void;
  openExtensionPanel: (content: ReactNode, label?: string) => void;
};

const ResourceWorkspaceExtensionContext =
  createContext<ResourceWorkspaceExtension | null>(null);

export function useResourceWorkspaceExtension() {
  const context = useContext(ResourceWorkspaceExtensionContext);
  if (!context)
    throw new Error(
      "useResourceWorkspaceExtension must be used inside ResourceWorkspaceLayout",
    );
  return context;
}

function actionClassName(action: ResourceWorkspaceAction) {
  if (action.variant === "primary")
    return "bg-foreground text-background hover:opacity-90";
  if (action.variant === "ghost")
    return "text-muted-foreground hover:bg-[var(--q-sidebar)] hover:text-foreground";
  return "bg-[var(--q-sidebar-accent)] text-foreground hover:brightness-95 dark:hover:brightness-125";
}

export function ResourceWorkspaceLayout({
  config,
  toolbar,
  extensionPanel,
  extensionPanelOpen = Boolean(extensionPanel),
  onExtensionPanelOpenChange,
  extensionPanelLabel = "View settings",
  className,
  contentClassName,
  children,
}: ResourceWorkspaceLayoutProps) {
  const [localExtension, setLocalExtension] = useState<{
    content: ReactNode;
    label: string;
  } | null>(null);
  const closeExtensionPanel = useCallback(() => {
    setLocalExtension(null);
    onExtensionPanelOpenChange?.(false);
  }, [onExtensionPanelOpenChange]);
  const openExtensionPanel = useCallback(
    (content: ReactNode, label = "View settings") => {
      setLocalExtension({ content, label });
      onExtensionPanelOpenChange?.(true);
    },
    [onExtensionPanelOpenChange],
  );
  const extensionContext = useMemo(
    () => ({ closeExtensionPanel, openExtensionPanel }),
    [closeExtensionPanel, openExtensionPanel],
  );
  const resolvedExtensionPanel = localExtension?.content ?? extensionPanel;
  const resolvedExtensionLabel = localExtension?.label ?? extensionPanelLabel;
  const resolvedExtensionOpen = localExtension ? true : extensionPanelOpen;

  return (
    <ResourceWorkspaceExtensionContext.Provider value={extensionContext}>
      <section
        className={cn(
          "flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-background",
          className,
        )}
        data-resource-workspace={config.resourceId}
      >
        <header className="shrink-0 border-b border-border/60 bg-background">
          <div className="flex min-h-12 items-center gap-3 px-4 py-2">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-foreground">
                {config.title}
              </h1>
              {config.count !== undefined ? (
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {config.count}
                </div>
              ) : null}
            </div>
            {config.actions?.length ? (
              <div className="flex items-center gap-1.5">
                {config.actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={cn(
                      "flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition disabled:pointer-events-none disabled:opacity-40",
                      actionClassName(action),
                    )}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <nav
            aria-label={`${config.title} views`}
            className="flex min-h-9 items-end gap-0.5 overflow-x-auto px-3"
          >
            {config.views.map((view) => {
              const active = view.id === config.activeViewId;
              return (
                <div key={view.id} className="group/view flex shrink-0 items-end">
                  <Link
                    href={view.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-8 items-center gap-1.5 border-b-2 px-2 text-[11px] font-medium transition-colors",
                      active
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {view.icon ? (
                      <span style={view.color ? { color: view.color } : undefined}>
                        {view.icon}
                      </span>
                    ) : null}
                    {view.label}
                  </Link>
                  {view.actions?.length ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={`${view.label} view actions`}
                        className="mb-0.5 grid h-7 w-6 place-items-center rounded-md text-muted-foreground opacity-0 transition group-hover/view:opacity-100 focus:opacity-100 data-[popup-open]:opacity-100"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" sideOffset={4} className="w-40">
                        {view.actions.map((action) => (
                          <DropdownMenuItem
                            key={action.id}
                            disabled={action.disabled}
                            variant={action.destructive ? "destructive" : "default"}
                            onClick={() => void action.onSelect()}
                          >
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              );
            })}
            {config.viewCatalog?.length && config.onAddView ? (
              <ResourceViewMenu
                catalog={config.viewCatalog}
                onAddView={config.onAddView}
              />
            ) : null}
          </nav>
        </header>

        {toolbar ? (
          <div className="shrink-0 border-b border-border/60 bg-background">
            {toolbar}
          </div>
        ) : null}

        <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 overflow-auto",
              contentClassName,
            )}
          >
            <RouteTransition>{children}</RouteTransition>
          </div>
          {resolvedExtensionPanel && resolvedExtensionOpen ? (
            <aside
              aria-label={resolvedExtensionLabel}
              className="absolute inset-y-0 right-0 z-40 flex w-[min(340px,calc(100vw-24px))] flex-col border-l border-border bg-background shadow-[-12px_0_30px_rgba(0,0,0,0.06)] md:relative md:z-auto md:shrink-0 md:shadow-none"
            >
              {localExtension || onExtensionPanelOpenChange ? (
                <button
                  type="button"
                  onClick={closeExtensionPanel}
                  aria-label={`Close ${resolvedExtensionLabel}`}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-[var(--q-sidebar-accent)] hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
              {resolvedExtensionPanel}
            </aside>
          ) : null}
        </div>
      </section>
    </ResourceWorkspaceExtensionContext.Provider>
  );
}
