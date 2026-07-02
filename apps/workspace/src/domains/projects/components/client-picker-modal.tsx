"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Building2, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useClientsIndexQuery } from "@/domains/clients/api/clients";
import { useAuthSession } from "@/domains/auth";
import type { Client } from "@/domains/clients/store/clients.types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

interface ClientPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClientId?: string;
  selectedClientName?: string;
  onSelect: (clientId: string, clientName: string) => void;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  nurture: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  inactive: "bg-muted/500/10 text-muted-foreground",
  archived: "bg-muted/500/10 text-muted-foreground",
};

const pipelineColors: Record<string, string> = {
  new: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  qualified: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  review: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  negotiation: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  closed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function ClientPickerModal({
  open,
  onOpenChange,
  selectedClientId,
  onSelect,
}: ClientPickerModalProps) {
  const session = useAuthSession();
  const organizationId = session.workspace.status === "ready" ? session.workspace.organizationId : undefined;
  const t = useTranslations("Projects.form.clientPicker");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const clientsQuery = useClientsIndexQuery(organizationId ?? undefined, { search });
  const allClients = useMemo(() => (clientsQuery?.results ?? []) as Client[], [clientsQuery?.results]);

  // Client-side pagination over fetched results
  const totalClients = allClients.length;
  const totalPages = Math.max(1, Math.ceil(totalClients / PAGE_SIZE));
  const pagedClients = allClients.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSelect(client: Client) {
    onSelect(client.id, client.name);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden" showCloseButton>
        <div className="p-5 pb-3">
          <DialogTitle className="text-lg font-bold text-text-primary">{t("title")}</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary mt-1">
            {t("description")}
          </DialogDescription>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="h-10 rounded-lg border-border bg-muted/50 ps-9 text-sm dark:border-white/10 dark:bg-white/5"
            />
          </div>
        </div>

        {/* Client list */}
        <div className="max-h-[360px] min-h-[200px] overflow-y-auto border-t border-border dark:border-white/5">
          {clientsQuery?.queryStatus === "loading" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">{t("loading")}</p>
            </div>
          ) : pagedClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-8 w-8 text-muted-foreground/40 dark:text-foreground" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">{t("noClients")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("noClientsDesc")}</p>
            </div>
          ) : (
            <div className="divide-y divide-border dark:divide-white/5">
              {pagedClients.map((client) => {
                const isSelected = selectedClientId === client.id;
                return (
                  <button
                    key={client.id}
                    onClick={() => handleSelect(client)}
                    className={cn(
                      "flex w-full items-start gap-3 px-5 py-3 text-start transition-colors hover:bg-muted/50",
                      isSelected && "bg-primary/5 dark:bg-primary/10"
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      client.type === "organization"
                        ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                        : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    )}>
                      {client.type === "organization" ? (
                        <Building2 className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-text-primary">{client.name}</span>
                        {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", statusColors[client.status] ?? statusColors.new)}>
                          {client.status}
                        </span>
                        <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", pipelineColors[client.pipelineStage ?? "new"] ?? pipelineColors.new)}>
                          {client.pipelineStage}
                        </span>
                        {client.phone && (
                          <span className="text-[11px] text-muted-foreground">{client.phone}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 dark:border-white/5">
            <span className="text-xs font-medium text-muted-foreground">
              {t("clientsCount", { count: totalClients, page: page + 1, total: totalPages })}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
