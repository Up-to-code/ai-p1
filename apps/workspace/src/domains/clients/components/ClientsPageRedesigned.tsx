"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, Users, Search, Trash2, Eye, Ellipsis, ChevronLeft, ChevronRight } from "lucide-react";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";
import { useAuthSession } from "@/domains/auth";
import { useClientsIndexQuery, useDeleteClientOptimisticMutation, useUpdateClientOptimisticMutation } from "@/domains/clients/api/clients";
import type { Client } from "../store/clients.types";
import { clientToFormValues } from "../client-view-model";
import { DeleteRecordDialog, EmptyWorkspace } from "@/components/shared/crud-ui";
import { ClientSheet } from "./client-sheet";
import { clientToCardItem } from "./client-view-helpers";
import { GroupedList } from "@/components/shared/view-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { EditableTitle } from "@/components/ui/editable-title";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientDetailLayout } from "./detail/client-detail-layout";
import { cn } from "@/lib/utils";
import { ClientsResourceLayout } from "./clients-resource-layout";

const CLIENT_TABLE_PAGE_SIZE = 10;

const CLIENT_TYPES = ["person", "organization"] as const;
const CLIENT_STATUSES = ["new", "active", "nurture", "inactive", "archived"] as const;
const CLIENT_STAGES = ["new", "qualified", "review", "negotiation", "closed"] as const;
const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function selectTone(value: string) {
  if (["active", "closed"].includes(value)) return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (["qualified", "review"].includes(value)) return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
  if (["negotiation", "nurture"].includes(value)) return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return "bg-muted text-muted-foreground";
}

function InlineSelectCell<TValue extends string>({
  value,
  options,
  onChange,
  colored = false,
}: {
  value: TValue;
  options: readonly TValue[];
  onChange: (value: TValue) => void;
  colored?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(nextValue: string | null) => nextValue && onChange(nextValue as TValue)}>
      <SelectTrigger className={cn(
        "!h-8 w-28 gap-1 rounded-md border border-border bg-background px-2 text-xs font-medium shadow-none hover:bg-muted",
        colored && selectTone(value),
      )}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" sideOffset={2} className="min-w-28 rounded-md p-0.5">
        {options.map((option) => <SelectItem key={option} value={option} className="rounded px-2 py-1 text-xs">{titleCase(option)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function ClientsPageRedesigned() {
  const t = useTranslations('Clients');
  const session = useAuthSession();
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const workspaceStatus = session.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady ? session.workspace.organizationId ?? undefined : undefined;

  const clientsQuery = useClientsIndexQuery(workspaceOrganizationId);
  const deleteClientMutation = useDeleteClientOptimisticMutation(clientsQuery.queryKey);
  const updateClientMutation = useUpdateClientOptimisticMutation(clientsQuery.queryKey);
  const clients = clientsQuery.results as Client[] || [];
  const isLoading = isWorkspaceReady && clientsQuery.queryStatus === "loading";

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) =>
      [client.name, client.contact, client.phone, client.company, client.pipelineStage, client.type]
        .some((value) => String(value ?? "").toLowerCase().includes(query)),
    );
  }, [clients, search]);
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / CLIENT_TABLE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleClients = filteredClients.slice(
    (currentPage - 1) * CLIENT_TABLE_PAGE_SIZE,
    currentPage * CLIENT_TABLE_PAGE_SIZE,
  );

  const updateClientField = (
    client: Client,
    field: keyof ReturnType<typeof clientToFormValues>,
    value: string,
  ) => {
    if (!workspaceOrganizationId) return;
    updateClientMutation.mutate({
      organizationId: workspaceOrganizationId,
      client,
      values: { ...clientToFormValues(client), [field]: value },
    });
  };

  if (workspaceStatus !== "ready") {
    return (
      <ClientsResourceLayout
        clientCount={0}
        search={search}
        onSearchChange={setSearch}
        onAddClient={() => setIsCreateOpen(true)}
      >
        <div className="flex-1 flex items-center justify-center">
          <ViewLoading style="spinner" message="Loading workspace..." />
        </div>
      </ClientsResourceLayout>
    );
  }

  if (isLoading) {
    return (
      <ClientsResourceLayout
        clientCount={0}
        search={search}
        onSearchChange={setSearch}
        onAddClient={() => setIsCreateOpen(true)}
      >
        <div className="flex-1 relative">
          <ViewLoading style="table" message="Loading clients..." />
        </div>
      </ClientsResourceLayout>
    );
  }

  if (clients.length === 0) {
    return (
      <ClientsResourceLayout
        clientCount={0}
        search={search}
        onSearchChange={setSearch}
        onAddClient={() => setIsCreateOpen(true)}
      >
        <div className="flex-1 flex items-center justify-center">
          <EmptyWorkspace icon={Users} title={t('empty.title')} description={t('empty.desc')} />
        </div>
      </ClientsResourceLayout>
    );
  }

  return (
    <ClientsResourceLayout
      clientCount={clients.length}
      search={search}
      onSearchChange={setSearch}
      onAddClient={() => setIsCreateOpen(true)}
    >
      <div className="min-h-0 flex-1 overflow-auto bg-background">
        <div className="min-w-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[25%]">Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleClients.map((client) => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedClientId(client.id)}
                  >
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <div className="flex min-w-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedClientId(client.id)}
                          aria-label={`Open ${client.name}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
                        >
                          {client.type === "organization" ? <Building2 className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <EditableTitle
                            value={client.name}
                            onChange={(name) => {
                              if (name.trim()) updateClientField(client, "name", name.trim());
                            }}
                            trigger="doubleClick"
                            size="md"
                            ariaLabel={`Edit ${client.name} name`}
                            className="block text-sm text-foreground hover:text-foreground"
                          />
                          {client.company ? <p className="truncate text-xs text-muted-foreground">{client.company}</p> : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <EditableTitle
                        value={client.contact || ""}
                        onChange={(contact) => updateClientField(client, "contact", contact.trim())}
                        placeholder="Add email"
                        trigger="doubleClick"
                        size="md"
                        ariaLabel={`Edit ${client.name} email`}
                        className="block max-w-56 text-sm font-normal text-foreground hover:text-foreground"
                      />
                      <EditableTitle
                        value={client.phone || ""}
                        onChange={(phone) => updateClientField(client, "phone", phone.trim())}
                        placeholder="Add phone"
                        trigger="doubleClick"
                        size="sm"
                        ariaLabel={`Edit ${client.name} phone`}
                        className="mt-0.5 block max-w-56 font-normal text-muted-foreground hover:text-foreground"
                      />
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <InlineSelectCell
                        value={(client.pipelineStage ?? "new") as (typeof CLIENT_STAGES)[number]}
                        options={CLIENT_STAGES}
                        onChange={(pipelineStage) => updateClientField(client, "pipelineStage", pipelineStage)}
                        colored
                      />
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <InlineSelectCell
                        value={client.status}
                        options={CLIENT_STATUSES}
                        onChange={(status) => updateClientField(client, "status", status)}
                        colored
                      />
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <InlineSelectCell
                        value={client.type}
                        options={CLIENT_TYPES}
                        onChange={(type) => updateClientField(client, "type", type)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {client.createdAt ? new Date(client.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label={`Actions for ${client.name}`}>
                              <Ellipsis className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" sideOffset={2} className="min-w-36 rounded-md p-0.5">
                          <DropdownMenuItem className="px-2 py-1 text-xs" onClick={() => setSelectedClientId(client.id)}>
                            <Eye className="h-4 w-4" /> View client
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="px-2 py-1 text-xs" variant="destructive" onClick={() => setDeleting(client)}>
                            <Trash2 className="h-4 w-4" /> Delete client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {visibleClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">No clients match your search.</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border/70 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {filteredClients.length === 0 ? 0 : (currentPage - 1) * CLIENT_TABLE_PAGE_SIZE + 1}–{Math.min(currentPage * CLIENT_TABLE_PAGE_SIZE, filteredClients.length)} of {filteredClients.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-16 text-center text-xs font-medium">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(selectedClientId)} onOpenChange={(open) => !open && setSelectedClientId(null)}>
        <DialogContent
          className="h-[90vh] w-[90vw] max-w-[90vw] gap-0 overflow-hidden rounded-xl bg-background p-0 shadow-none"
          containerClassName="p-0"
        >
          <DialogTitle className="sr-only">Client workspace</DialogTitle>
          <DialogDescription className="sr-only">View and edit the selected client without leaving the client list.</DialogDescription>
          {selectedClientId ? (
            <ClientDetailLayout
              id={selectedClientId}
              embedded
              onDeleted={() => setSelectedClientId(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteRecordDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('delete.title')}
        description={t('delete.desc', { name: deleting?.name ?? "..." })}
        isDeleting={deleteClientMutation.isPending}
        error={deleteClientMutation.error instanceof Error ? deleteClientMutation.error.message : null}
        onConfirm={() => {
          if (!deleting || !clients.some((client) => client.id === deleting.id)) {
            return;
          }
          const organizationId = session.organization?.id;
          if (!organizationId) return;
          const clientId = deleting.id;
          setDeleting(null);
          deleteClientMutation.mutate({ organizationId, clientId });
        }}
      />

      <ClientSheet
        open={isCreateOpen}
        indexQueryKey={clientsQuery.queryKey}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
        }}
        onSuccess={() => {
          // Refresh handled by optimistic mutation
        }}
      />
    </ClientsResourceLayout>
  );
}
