"use client";

import { Loader2, MessageSquareText, Search, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { workspaceModeHref } from "@/domains/dashboard/store/dashboard.store";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import type { AgentThread } from "../lib/types";

type SidebarThreadHistoryDialogProps = {
  open: boolean;
  search: string;
  threads: AgentThread[];
  activeThreadId?: string;
  deletingThreadId: string | null;
  onOpenChange: (open: boolean) => void;
  onSearchChange: (value: string) => void;
  onDeleteRequest: (thread: AgentThread) => void;
};

export function SidebarThreadHistoryDialog({
  open,
  search,
  threads,
  activeThreadId,
  deletingThreadId,
  onOpenChange,
  onSearchChange,
  onDeleteRequest,
}: SidebarThreadHistoryDialogProps) {
  const locale = useLocale();
  const tThreads = useTranslations("Sidebar.threads");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-4 rounded-2xl p-5">
        <DialogHeader>
          <DialogTitle>{tThreads("historyTitle")}</DialogTitle>
          <DialogDescription>{tThreads("historyDescription")}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={tThreads("searchPlaceholder")}
            className="rounded-xl ps-9"
          />
        </div>
        <div className="max-h-[420px] space-y-1 overflow-y-auto pe-1">
          {threads.length > 0 ? (
            threads.map((thread) => {
              const isActive = activeThreadId === thread.id;
              const isDeleting = deletingThreadId === thread.id;

              return (
                <div
                  key={thread.id}
                  className={cn(
                    "group/thread flex min-h-11 items-center gap-1 rounded-xl transition-all",
                    isActive
                      ? "bg-primary/10 text-foreground dark:bg-primary/20"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <WorkspaceLink
                    href={workspaceModeHref("ai", thread.id)}
                    onClick={() => onOpenChange(false)}
                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-start"
                    title={thread.title}
                  >
                    <MessageSquareText
                      className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black leading-tight">{thread.title}</span>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {new Date(thread.lastMessageAt).toLocaleDateString(locale, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </span>
                  </WorkspaceLink>
                  <button
                    type="button"
                    aria-label={`Delete: ${thread.title}`}
                    disabled={isDeleting}
                    onClick={() => onDeleteRequest(thread)}
                    className="me-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 disabled:opacity-60 group-hover/thread:opacity-100 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="rounded-xl bg-muted px-3 py-6 text-center text-sm font-semibold text-muted-foreground dark:bg-muted">
              {tThreads("empty")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
