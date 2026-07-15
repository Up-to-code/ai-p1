"use client";

import { useEffect, useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import {
  MessageSquare,
  EllipsisVertical,
  Pencil,
  Trash2,
  Link,
  Search,
  Bot,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useWorkspaceRouter } from "@/hooks/use-workspace-router";
import { listThreads, deleteThread, renameThread } from "@/domains/eve";
import type { ThreadMeta } from "@/domains/eve";
import { useOrgId } from "@/domains/auth";
import { SidebarPanelLayout } from "./sidebar-panel-layout";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { workspaceAssets } from "@/lib/assets/workspace-assets";

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function SidebarChatPanel() {
  const t = useTranslations("Sidebar.aiPanel");
  const router = useWorkspaceRouter();
  const searchParams = useSearchParams();
  const activeThreadId = searchParams.get("threadId");
  const orgId = useOrgId();
  const [threads, setThreads] = useState<ThreadMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const loadThreads = useCallback(() => {
    if (!orgId) return;
    setLoading(true);
    listThreads(orgId).then((result) => {
      setThreads(result);
      setLoading(false);
    });
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    void listThreads(orgId).then((result) => {
      if (cancelled) return;
      setThreads(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    const onFocus = () => loadThreads();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadThreads, orgId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    if (!orgId) return;
    e.preventDefault();
    e.stopPropagation();
    await deleteThread(orgId, id);
    if (activeThreadId === id) {
      router.replace("/ai", { extraParams: { threadId: "", state: "" } });
    }
    loadThreads();
  };

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/ai?threadId=${id}`;
    navigator.clipboard.writeText(url);
  };

  const handleRename = async (id: string, newTitle: string) => {
    if (!orgId) return;
    try {
      await renameThread(orgId, id, newTitle);
      loadThreads();
    } catch (err) {
      logger.error("thread rename failed", { module: 'sidebar-chat-panel' }, err as Error);
    }
    setRenamingId(null);
  };

  const handleRenameKeyDown = (
    e: React.KeyboardEvent,
    id: string,
    originalTitle: string,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value.trim();
      if (value && value !== originalTitle) {
        handleRename(id, value);
      } else {
        setRenamingId(null);
      }
    }
    if (e.key === "Escape") {
      setRenamingId(null);
    }
  };

  const filtered = search.trim()
    ? threads.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : threads;

  return (
    <SidebarPanelLayout
      title={t("title")}
      bodyClassName="p-0"
      primaryAction={
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 rounded-md border-transparent bg-transparent pl-8 text-[11px] shadow-none focus-visible:border-[var(--q-sidebar-border)] focus-visible:bg-[var(--q-sidebar-accent)] focus-visible:ring-0" />
        </div>
      }
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-border/60 p-2">
          <div className="flex items-center gap-2 rounded-lg bg-[var(--q-sidebar-accent)] px-2.5 py-2.5">
            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1 text-xs font-medium">{t("agents")}</span>
            <span className="rounded-full bg-background px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("comingSoon")}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between px-3 pb-1.5 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("recent")}</p>
          {!loading && threads.length > 0 ? <span className="text-[10px] tabular-nums text-muted-foreground/60">{threads.length}</span> : null}
        </div>

        <div className="flex-1 overflow-y-auto px-1.5 pb-1.5">
          {loading && orgId ? (
            <div className="flex flex-col gap-1 px-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 py-2">
                  <Skeleton className="h-4 w-4 shrink-0 rounded" />
                  <Skeleton className="h-3 flex-1 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {filtered.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <div
                    key={thread.id}
                    className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs transition-colors ${
                      isActive
                        ? "bg-[var(--q-sidebar-accent)] text-[var(--q-sidebar-accent-foreground)]"
                        : "text-muted-foreground hover:bg-[var(--q-sidebar-accent)] hover:text-foreground"
                    }`}
                    onClick={() => {
                      if (renamingId !== thread.id) {
                        // Clear state so the workspace router doesn't carry
                        // the previous thread's session into the new thread
                        router.push(`/ai?threadId=${thread.id}`, {
                          extraParams: { state: "" },
                        });
                      }
                    }}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    {renamingId === thread.id ? (
                      <input
                        type="text"
                        defaultValue={thread.title}
                        autoFocus
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value && value !== thread.title) {
                            handleRename(thread.id, value);
                          } else {
                            setRenamingId(null);
                          }
                        }}
                        onKeyDown={(e) =>
                          handleRenameKeyDown(e, thread.id, thread.title)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 truncate rounded border border-primary/40 bg-background px-1 py-0.5 text-xs text-foreground outline-none ring-1 ring-primary/20"
                      />
                    ) : (
                      <span className="flex-1 truncate">{thread.title}</span>
                    )}
                    <span className="shrink-0 text-[10px] text-muted-foreground/60">
                      {formatTime(thread.updatedAt)}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingId(thread.id);
                      }}
                      title="Rename"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button
                            type="button"
                            onClick={(e: React.MouseEvent) =>
                              e.stopPropagation()
                            }
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground"
                          >
                            <EllipsisVertical className="h-3.5 w-3.5" />
                          </button>
                        }
                      />
                      <DropdownMenuContent align="end" sideOffset={2}>
                        <DropdownMenuItem
                          onClick={(e: React.MouseEvent) =>
                            handleCopyLink(e, thread.id)
                          }
                        >
                          <Link className="h-3.5 w-3.5 mr-2" />
                          Copy link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e: React.MouseEvent) =>
                            handleDelete(e, thread.id)
                          }
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          ) : search.trim() ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-xs text-muted-foreground">
                {t("noMatches")}
              </p>
            </div>
          ) : (
            <div className="mx-2 mt-2 flex flex-col items-start rounded-xl bg-[var(--q-sidebar-accent)] p-4 text-left">
              <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={workspaceAssets.ai.logo}
                  alt=""
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px] object-contain"
                />
              </span>
              <p className="text-xs font-semibold text-foreground">{t("emptyTitle")}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{t("emptyDescription")}</p>
            </div>
          )}
        </div>
      </div>
    </SidebarPanelLayout>
  );
}
