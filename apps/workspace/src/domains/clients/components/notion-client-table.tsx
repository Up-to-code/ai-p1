"use client";

import { useState, useMemo, useCallback } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAccountContext } from "@/domains/auth";
import {
  useUpdateClientOptimisticMutation,
  useDeleteClientOptimisticMutation,
} from "@/domains/clients/api/clients";
import type { Client } from "@/domains/clients/store/clients.types";
import { useCustomFieldDefinitionsForTableQuery, useAllCustomFieldValuesQuery, useUpsertCustomFieldValueMutation } from "@/domains/custom-fields/api/custom-fields";
import { clientToFormValues } from "@/domains/clients/client-view-model";
import { EditableText } from "@/components/ui/editable-text";
import { EditableTags } from "@/components/ui/editable-tags";
import { EditableSelect } from "@/components/ui/editable-select";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { cn } from "@/lib/utils";
import {
  Edit,
  Trash2,
  CheckCircle2,
  Plus,
  Search,
  User,
  Building2,
  Users,
  Calendar,
  Tag,
  Settings,
  Link2,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";

const clientTypes = ["person", "organization"] as const;
const clientStatuses = ["new", "active", "nurture", "inactive", "archived"] as const;
const pipelineStages = ["new", "qualified", "review", "negotation", "closed"] as const;

const statusTone: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  nurture: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  inactive: "bg-muted text-muted-foreground border-border",
  archived: "bg-muted text-muted-foreground border-border",
};

const stageTone: Record<string, string> = {
  new: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  qualified: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  review: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  negotiation: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  closed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

interface NotionClientTableProps {
  clients: Client[];
  isLoading: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  onLoadMore: (numItems: number) => void;
  hasMore: boolean;
}

export function NotionClientTable({
  clients,
  isLoading,
  search,
  onSearchChange,
  onLoadMore,
  hasMore,
}: NotionClientTableProps) {
  const t = useTranslations("Clients");
  const router = useRouter();
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;

  const [deleting, setDeleting] = useState<Client | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const updateMutation = useUpdateClientOptimisticMutation(["clients-index"]);
  const deleteMutation = useDeleteClientOptimisticMutation(["clients-index"]);
  const upsertValueMutation = useUpsertCustomFieldValueMutation();

  // Custom fields for table columns
  const customFieldDefsQuery = useCustomFieldDefinitionsForTableQuery("client");
  const customFieldDefs = useMemo(() => (customFieldDefsQuery.data as any)?.definitions ?? [], [customFieldDefsQuery.data]);
  const allValuesQuery = useAllCustomFieldValuesQuery("client");
  const allValues = useMemo(() => (allValuesQuery.data as any)?.values ?? [], [allValuesQuery.data]);

  // Build value map: recordId -> fieldKey -> value
  const valueMap = useMemo(() => {
    const map = new Map<string, Map<string, any>>();
    for (const v of allValues) {
      if (!map.has(v.recordId)) map.set(v.recordId, new Map());
      map.get(v.recordId)!.set(v.fieldKey, v);
    }
    return map;
  }, [allValues]);

  const updateClientField = useCallback(
    (client: Client, field: string, value: any) => {
      if (!orgId) return;
      updateMutation.mutate({
        organizationId: orgId,
        client,
        values: { ...clientToFormValues(client), [field]: value },
      });
    },
    [orgId, updateMutation],
  );

  const updateCustomField = useCallback(
    (client: Client, definition: any, value: any) => {
      if (!orgId) return;
      const currentValue = valueMap.get(client.id)?.get(definition.key);
      upsertValueMutation.mutate({
        fieldDefinitionId: definition.id,
        fieldKey: definition.key,
        recordType: "client",
        recordId: client.id,
        type: definition.type,
        ...(definition.type === "text" || definition.type === "longText"
          ? { textValue: value }
          : definition.type === "number"
            ? { numberValue: Number(value) }
            : definition.type === "select"
              ? { selectValue: value }
              : definition.type === "multiSelect"
                ? { multiSelectValue: value }
                : definition.type === "boolean"
                  ? { booleanValue: value }
                  : definition.type === "url"
                    ? { urlValue: value }
                    : definition.type === "date"
                      ? { dateValue: value }
                      : { textValue: value }),
      });
    },
    [orgId, valueMap, upsertValueMutation],
  );

  function getInitials(name: string) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
  }

  function getCustomFieldValue(clientId: string, fieldKey: string, type: string) {
    const v = valueMap.get(clientId)?.get(fieldKey);
    if (!v) return undefined;
    switch (type) {
      case "text":
      case "longText":
        return v.textValue;
      case "number":
        return v.numberValue;
      case "select":
        return v.selectValue;
      case "multiSelect":
        return v.multiSelectValue;
      case "boolean":
        return v.booleanValue;
      case "date":
        return v.dateValue;
      case "url":
        return v.urlValue;
      default:
        return v.textValue;
    }
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-muted/30 dark:bg-white/[0.01]">
              <tr className="border-b border-border dark:border-white/5">
                <th className="w-12 px-3 py-2.5"></th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    Name
                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                  </span>
                </th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Type</th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Status</th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Stage</th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Last Contact</th>
                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Tags</th>
                {customFieldDefs.map((def: any) => (
                  <th key={def.key} className="px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                    {def.label}
                  </th>
                ))}
                <th className="w-20 px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  onMouseEnter={() => setHoveredRow(client.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={cn(
                    "border-b border-border/50 last:border-0 transition-colors",
                    hoveredRow === client.id && "bg-muted/20 dark:bg-white/[0.02]",
                  )}
                >
                  {/* Avatar */}
                  <td className="px-3 py-2.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-black",
                        client.type === "organization"
                          ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                          : "bg-sky-500/10 text-sky-600 dark:text-sky-400",
                      )}
                    >
                      {client.type === "organization" ? (
                        <Building2 className="h-3.5 w-3.5" />
                      ) : (
                        getInitials(client.name)
                      )}
                    </div>
                  </td>

                  {/* Name + Contact */}
                  <td className="px-3 py-2.5">
                    <div className="min-w-0">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-sm font-bold text-foreground hover:underline"
                      >
                        {client.name}
                      </Link>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {client.contact || "No contact"}
                      </p>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-3 py-2.5">
                    <EditableSelect
                      value={client.type}
                      options={clientTypes.map((t) => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: t }))}
                      onChange={(type) => updateClientField(client, "type", type)}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <EditableSelect
                      value={client.status}
                      options={clientStatuses.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))}
                      onChange={(status) => updateClientField(client, "status", status)}
                      colorMapType="client-status"
                      defaultColors={{
                        new: "blue",
                        active: "green",
                        nurture: "yellow",
                        inactive: "gray",
                        archived: "gray",
                      }}
                    />
                  </td>

                  {/* Pipeline Stage */}
                  <td className="px-3 py-2.5">
                    <EditableSelect
                      value={client.pipelineStage}
                      options={pipelineStages.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))}
                      onChange={(stage) => updateClientField(client, "pipelineStage", stage)}
                      colorMapType="client-stage"
                      defaultColors={{
                        new: "blue",
                        qualified: "purple",
                        review: "yellow",
                        negotiation: "orange",
                        closed: "green",
                      }}
                    />
                  </td>

                  {/* Last Contact */}
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-muted-foreground">
                      {client.lastContact || "—"}
                    </span>
                  </td>

                  {/* Tags */}
                  <td className="px-3 py-2.5">
                    <EditableTags
                      tags={client.tags ?? []}
                      onChange={(tags) => updateClientField(client, "tags", tags)}
                    />
                  </td>

                  {/* Custom fields */}
                  {customFieldDefs.map((def: any) => {
                    const val = getCustomFieldValue(client.id, def.key, def.type);
                    return (
                      <td key={def.key} className="px-3 py-2.5">
                        {def.type === "boolean" ? (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                              val ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-muted text-muted-foreground border-border",
                            )}
                          >
                            {val ? "Yes" : "No"}
                          </span>
                        ) : def.type === "select" && val ? (
                          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            {String(val)}
                          </span>
                        ) : def.type === "multiSelect" && Array.isArray(val) ? (
                          <div className="flex flex-wrap gap-1">
                            {val.slice(0, 2).map((v: string) => (
                              <span key={v} className="inline-flex items-center rounded-full border border-border bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                                {v}
                              </span>
                            ))}
                            {val.length > 2 && (
                              <span className="text-[9px] text-muted-foreground">+{val.length - 2}</span>
                            )}
                          </div>
                        ) : val != null ? (
                          <span className="text-xs text-foreground">{String(val)}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Actions */}
                  <td className="px-3 py-2.5">
                    <div
                      className={cn(
                        "flex items-center gap-0.5 transition-opacity",
                        hoveredRow === client.id ? "opacity-100" : "opacity-0",
                      )}
                    >
                      {client.pipelineStage !== "closed" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateClientField(client, "pipelineStage", "closed");
                          }}
                          className="p-1.5 text-muted-foreground/40 hover:text-emerald-600 transition-colors rounded-md hover:bg-emerald-500/10"
                          title="Mark closed"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/clients/${client.id}/edit`);
                        }}
                        className="p-1.5 text-muted-foreground/40 hover:text-foreground transition-colors rounded-md hover:bg-muted"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleting(client);
                        }}
                        className="p-1.5 text-muted-foreground/40 hover:text-red-500 transition-colors rounded-md hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="border-t border-border dark:border-white/5">
            <button
              type="button"
              onClick={() => onLoadMore(50)}
              className="w-full py-3 text-xs font-bold text-muted-foreground hover:bg-muted/30 transition-colors"
            >
              Load more clients...
            </button>
          </div>
        )}
      </div>

      <DeleteRecordDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("delete.title")}
        description={t("delete.desc", { name: deleting?.name ?? "..." })}
        isDeleting={deleteMutation.isPending}
        error={deleteMutation.error instanceof Error ? deleteMutation.error.message : null}
        onConfirm={() => {
          if (!deleting || !account.organization.id) return;
          const clientId = deleting.id;
          setDeleting(null);
          deleteMutation.mutate({ organizationId: account.organization.id, clientId });
        }}
      />
    </div>
  );
}
