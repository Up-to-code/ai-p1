"use client";

import { MessageSquareText } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { cn } from "@/lib/utils";
import { InboxEmptyState } from "./inbox-empty-state";
import { InboxRouteHeader } from "./inbox-route-header";

export function InboxAssignedCommentsScreen() {
  const t = useTranslations("Inbox.assignedComments");
  const delegated = useSearchParams().get("scope") === "delegated";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <InboxRouteHeader title={t("title")} description={t("description")} />
      <nav
        aria-label={t("scopeLabel")}
        className="flex h-10 items-end gap-5 border-b border-border/60 px-4"
      >
        {(["assigned", "delegated"] as const).map((item) => {
          const active = item === "delegated" ? delegated : !delegated;
          return (
            <WorkspaceLink
              key={item}
              href="/inbox/assigned-comments"
              extraParams={{ scope: item === "assigned" ? "" : item }}
              className={cn(
                "flex h-10 items-center border-b-2 text-[12px] font-medium",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {t(item)}
            </WorkspaceLink>
          );
        })}
      </nav>
      <div className="min-h-0 flex-1 overflow-auto">
        <InboxEmptyState
          icon={MessageSquareText}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      </div>
    </div>
  );
}
