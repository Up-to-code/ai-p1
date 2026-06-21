"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CustomFieldDefinition, CustomFieldValue } from "@/domains/custom-fields/api/custom-fields";
import { useUpsertCustomFieldValueMutation } from "@/domains/custom-fields/api/custom-fields";
import { Pencil, Check, X, ExternalLink, Calendar, Hash, DollarSign, ToggleLeft, Tag, ListTodo, Link2, User } from "lucide-react";
import { EditableTags } from "@/components/ui/editable-tags";

interface CustomFieldRendererProps {
  definition: CustomFieldDefinition;
  value?: CustomFieldValue;
  recordType: string;
  recordId: string;
  editable?: boolean;
}

function formatFieldValue(definition: CustomFieldDefinition, value?: CustomFieldValue): string {
  if (!value) return "";
  switch (definition.type) {
    case "text":
    case "longText":
      return value.textValue ?? "";
    case "number":
      return value.numberValue != null ? String(value.numberValue) : "";
    case "currency":
      return value.currencyValue != null ? `$${value.currencyValue.toLocaleString()}` : "";
    case "date":
      return value.dateValue ?? "";
    case "dateTime":
      return value.dateTimeValue ?? "";
    case "select":
      return value.selectValue ?? "";
    case "multiSelect":
      return value.multiSelectValue?.join(", ") ?? "";
    case "boolean":
      return value.booleanValue != null ? (value.booleanValue ? "Yes" : "No") : "";
    case "url":
      return value.urlValue ?? "";
    case "user":
      return value.userValue ?? "";
    default:
      return "";
  }
}

function getFieldIcon(type: CustomFieldDefinition["type"]) {
  switch (type) {
    case "text":
    case "longText":
      return Pencil;
    case "number":
      return Hash;
    case "currency":
      return DollarSign;
    case "date":
    case "dateTime":
      return Calendar;
    case "select":
    case "multiSelect":
      return Tag;
    case "boolean":
      return ToggleLeft;
    case "url":
      return Link2;
    case "user":
      return User;
    default:
      return Pencil;
  }
}

export function CustomFieldRenderer({
  definition,
  value,
  recordType,
  recordId,
  editable = true,
}: CustomFieldRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => formatFieldValue(definition, value));
  const upsertMutation = useUpsertCustomFieldValueMutation();
  const Icon = getFieldIcon(definition.type);

  function handleSave() {
    const payload: Record<string, unknown> = {
      fieldDefinitionId: definition.id,
      fieldKey: definition.key,
      recordType,
      recordId,
      type: definition.type,
    };

    switch (definition.type) {
      case "text":
      case "longText":
        payload.textValue = draft;
        break;
      case "number":
        payload.numberValue = draft ? Number(draft) : undefined;
        break;
      case "currency":
        payload.currencyValue = draft ? Number(draft.replace(/[$,]/g, "")) : undefined;
        break;
      case "date":
        payload.dateValue = draft || undefined;
        break;
      case "dateTime":
        payload.dateTimeValue = draft || undefined;
        break;
      case "select":
        payload.selectValue = draft || undefined;
        break;
      case "boolean":
        payload.booleanValue = draft === "Yes";
        break;
      case "url":
        payload.urlValue = draft || undefined;
        break;
      default:
        payload.textValue = draft;
    }

    upsertMutation.mutate(payload as any, {
      onSuccess: () => setIsEditing(false),
    });
  }

  function handleMultiSelectChange(tags: string[]) {
    upsertMutation.mutate({
      fieldDefinitionId: definition.id,
      fieldKey: definition.key,
      recordType,
      recordId,
      type: definition.type,
      multiSelectValue: tags,
    } as any);
  }

  // Read-only view
  if (!editable || !isEditing) {
    const displayValue = formatFieldValue(definition, value);

    return (
      <div
        className={cn(
          "group grid grid-cols-[140px_minmax(0,1fr)] items-start gap-3 rounded-lg border border-transparent px-2 py-2.5 text-sm transition-colors",
          editable && "hover:border-border hover:bg-muted/30",
        )}
      >
        <div className="flex min-w-0 items-center gap-2 pt-0.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate text-xs font-medium">{definition.label}</span>
        </div>
        <div className="min-w-0 flex-1">
          {definition.type === "multiSelect" && value?.multiSelectValue ? (
            <EditableTags
              tags={value.multiSelectValue}
              onChange={handleMultiSelectChange}
              availableTags={definition.options?.map((o) => o.label) ?? []}
              disabled={!editable}
            />
          ) : definition.type === "boolean" ? (
            <span className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
              value?.booleanValue
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
            )}>
              {value?.booleanValue ? "Yes" : "No"}
            </span>
          ) : definition.type === "select" && value?.selectValue ? (
            <SelectBadge value={value.selectValue} options={definition.options} />
          ) : definition.type === "url" && value?.urlValue ? (
            <a
              href={value.urlValue}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {value.urlValue}
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className={cn(
              "text-sm font-medium",
              displayValue ? "text-foreground" : "text-muted-foreground italic",
            )}>
              {displayValue || "Empty"}
            </span>
          )}
        </div>
        {editable && (
          <button
            type="button"
            onClick={() => {
              setDraft(formatFieldValue(definition, value));
              setIsEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground pt-0.5"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  // Editing view
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-start gap-3 rounded-lg border border-ring/30 bg-muted/20 px-2 py-2.5">
      <div className="flex min-w-0 items-center gap-2 pt-0.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate text-xs font-medium">{definition.label}</span>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {definition.type === "longText" ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            autoFocus
          />
        ) : definition.type === "select" ? (
          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          >
            <option value="">Select...</option>
            {definition.options?.filter((o) => !o.archivedAt).map((opt) => (
              <option key={opt.id} value={opt.label}>{opt.label}</option>
            ))}
          </select>
        ) : definition.type === "boolean" ? (
          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          >
            <option value="">Select...</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        ) : (
          <input
            type={definition.type === "date" ? "date" : definition.type === "number" || definition.type === "currency" ? "number" : definition.type === "url" ? "url" : "text"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setIsEditing(false);
            }}
          />
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={upsertMutation.isPending}
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-bold text-white hover:bg-primary/90 transition-colors"
          >
            <Check className="h-3 w-3" />
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex h-7 items-center gap-1 rounded-lg px-3 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectBadge({ value, options }: { value: string; options?: CustomFieldDefinition["options"] }) {
  const option = options?.find((o) => o.label === value);
  const color = option?.color;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border",
        color
          ? "bg-primary/10 text-primary border-primary/20"
          : "bg-muted text-foreground border-border",
      )}
    >
      {value}
    </span>
  );
}
