"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthSession } from "@/domains/auth";
import { EveDashboardChat, type RestoredThread } from "@/components/dashboard/eve-dashboard-chat";
import { getThread } from "@/domains/eve";
import { Skeleton } from "@/components/ui/skeleton";

type RestoreState = RestoredThread | "not-found" | "loading" | null;

export function DashboardScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadIdParam = searchParams.get("threadId");
  const session = useAuthSession();
  const organizationId =
    session.workspace.status === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;

  const [restoredThread, setRestoredThread] = useState<RestoreState>(
    threadIdParam ? "loading" : null,
  );

  useEffect(() => {
    if (!threadIdParam || !organizationId) {
      setRestoredThread(null);
      return;
    }
    setRestoredThread("loading");
    let cancelled = false;
    getThread(organizationId, threadIdParam).then((thread) => {
      if (cancelled) return;
      if (thread && thread.sessionState) {
        setRestoredThread({
          id: thread.id,
          title: thread.title,
          sessionState: thread.sessionState,
          events: thread.events,
        });
      } else {
        setRestoredThread("not-found");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [threadIdParam, organizationId]);

  // Redirect to clean /ai when thread doesn't exist
  useEffect(() => {
    if (restoredThread === "not-found") {
      router.replace("/ai");
    }
  }, [restoredThread, router]);

  if (restoredThread === "loading" || restoredThread === "not-found") {
    return (
      <div className="flex h-full flex-col gap-4 bg-[var(--q-ai-canvas)] p-6">
        <Skeleton className="h-4 w-1/3 rounded-full" />
        <Skeleton className="flex-1 rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <EveDashboardChat
      key={restoredThread?.id ?? "new"}
      organizationId={organizationId}
      restoredThread={restoredThread}
    />
  );
}
