"use client";

import { useQuery } from "convex/react";
import { Bot, Plus } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { api } from "@convex/_generated/api";
import { useAuthSession } from "@/domains/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function CustomAgentsScreen() {
  const t = useTranslations("CustomAgents");
  const locale = useLocale();
  const session = useAuthSession();
  const organizationId = session.workspace.organizationId ?? "";
  const agents = useQuery(
    api.customAgents.read.listMine,
    organizationId ? { organizationId } : "skip",
  );

  return (
    <main className="h-[calc(100dvh-3.5rem)] overflow-y-auto bg-background px-5 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t("eyebrow")}
            </p>
            <h1 className="mt-2 text-2xl font-semibold">{t("title")}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href={`/${locale}/ai/agents/new`} />}
          >
            <Plus className="size-4" />
            {t("newAgent")}
          </Button>
        </header>

        {agents === undefined ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : agents.length === 0 ? (
          <section className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bot className="size-5" />
            </span>
            <h2 className="mt-4 font-semibold">{t("emptyTitle")}</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {t("emptyDescription")}
            </p>
            <Button
              className="mt-5"
              nativeButton={false}
              render={<Link href={`/${locale}/ai/agents/new`} />}
            >
              <Plus className="size-4" />
              {t("newAgent")}
            </Button>
          </section>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {agents.map((agent) => (
              <Link
                key={agent._id}
                href={`/${locale}/ai/agents/${agent._id}`}
                className="group rounded-xl border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="truncate font-semibold">{agent.name}</h2>
                      <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                        {t(`status.${agent.status}`)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {agent.description || t("noDescription")}
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {t("revision", { revision: agent.draftRevision })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
