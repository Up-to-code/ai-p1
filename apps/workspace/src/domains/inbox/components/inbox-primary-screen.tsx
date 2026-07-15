"use client";

import {
  AtSign,
  Check,
  CheckCheck,
  Clock3,
  ClipboardCheck,
  Inbox,
  RotateCcw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  type InboxAttentionFilter,
  type InboxAttentionView,
  useInboxAttention,
} from "../hooks/use-inbox-attention";

const attentionViews: InboxAttentionView[] = [
  "primary",
  "other",
  "later",
  "cleared",
];
const attentionFilters: InboxAttentionFilter[] = ["all", "mentions", "assigned"];

function attentionView(value: string | null): InboxAttentionView {
  return attentionViews.includes(value as InboxAttentionView)
    ? (value as InboxAttentionView)
    : "primary";
}

function attentionFilter(value: string | null): InboxAttentionFilter {
  return attentionFilters.includes(value as InboxAttentionFilter)
    ? (value as InboxAttentionFilter)
    : "all";
}

function relativeTime(timestamp: number) {
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - timestamp) / 1_000));
  if (elapsedSeconds < 60) return "now";
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h`;
  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `${elapsedDays}d`;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

function InboxAttentionLoading() {
  return (
    <div className="divide-y divide-border/60" aria-label="Loading inbox">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="flex items-start gap-3 px-5 py-4">
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-52 max-w-full rounded-sm" />
            <Skeleton className="h-3 w-80 max-w-[80%] rounded-sm" />
          </div>
          <Skeleton className="h-3 w-8 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

export function InboxPrimaryScreen() {
  const t = useTranslations("Inbox");
  const searchParams = useSearchParams();
  const view = attentionView(searchParams.get("tab"));
  const filter = attentionFilter(searchParams.get("filter"));
  const { events, isLoading, markRead, markAllRead, transition } =
    useInboxAttention(view, filter);
  const unreadCount = events?.filter((event) => !event.readAt).length ?? 0;

  return (
    <main className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
        <h1 className="text-base font-semibold tracking-tight">{t("title")}</h1>
        <button
          type="button"
          disabled={unreadCount === 0}
          onClick={markAllRead}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          {t("markAllRead")}
        </button>
      </div>

      <nav
        aria-label={t("attentionViewsLabel")}
        className="grid shrink-0 grid-cols-4 border-b border-border/60"
      >
        {attentionViews.map((item) => (
          <WorkspaceLink
            key={item}
            href="/inbox"
            extraParams={{
              tab: item === "primary" ? "" : item,
              filter: "",
              channel: "",
              new: "",
              settings: "",
            }}
            className={cn(
              "flex h-11 items-center justify-center border-b-2 px-3 text-xs font-medium transition-colors",
              view === item
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground",
            )}
          >
            {t(`views.${item}`)}
          </WorkspaceLink>
        ))}
      </nav>

      {view === "primary" ? (
        <div className="flex shrink-0 items-center gap-1 border-b border-border/60 px-5 py-2">
          {attentionFilters.map((item) => (
            <WorkspaceLink
              key={item}
              href="/inbox"
              extraParams={{
                filter: item === "all" ? "" : item,
                tab: "",
                channel: "",
              }}
              className={cn(
                "h-7 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                filter === item
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {t(`filters.${item}`)}
            </WorkspaceLink>
          ))}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? <InboxAttentionLoading /> : null}
        {events?.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl border border-border bg-muted/30">
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </span>
            <h2 className="text-sm font-semibold">{t(`empty.${view}.title`)}</h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              {t(`empty.${view}.description`)}
            </p>
          </div>
        ) : null}
        {events && events.length > 0 ? (
          <div className="divide-y divide-border/60">
            {events.map((event) => {
              const EventIcon = event.kind === "mentioned" ? AtSign : ClipboardCheck;
              return (
                <article
                  key={event._id}
                  className={cn(
                    "group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40",
                    !event.readAt && "bg-muted/20",
                  )}
                >
                  <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-background">
                    <EventIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {!event.readAt ? (
                      <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-background" />
                    ) : null}
                  </span>
                  <WorkspaceLink
                    href={event.href}
                    onClick={() => {
                      if (!event.readAt) markRead(event._id);
                    }}
                    className="min-w-0 flex-1"
                  >
                    <span
                      className={cn(
                        "block text-sm",
                        !event.readAt ? "font-semibold" : "font-medium",
                      )}
                    >
                      {event.title}
                    </span>
                    {event.body ? (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {event.body}
                      </span>
                    ) : null}
                  </WorkspaceLink>
                  <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground">
                    {relativeTime(event.createdAt)}
                  </span>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    {view === "primary" || view === "other" ? (
                      <button
                        type="button"
                        onClick={() => transition(event._id, "later")}
                        aria-label={t("actions.later")}
                        title={t("actions.later")}
                        className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    {view === "later" || view === "cleared" ? (
                      <button
                        type="button"
                        onClick={() => transition(event._id, "restore")}
                        aria-label={t("actions.restore")}
                        title={t("actions.restore")}
                        className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    {view !== "cleared" ? (
                      <button
                        type="button"
                        onClick={() => transition(event._id, "clear")}
                        aria-label={t("actions.clear")}
                        title={t("actions.clear")}
                        className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
