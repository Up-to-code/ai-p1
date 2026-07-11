"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { CustomField, CustomFieldColor } from "../docs.types";

const statusColorClasses: Record<CustomFieldColor, string> = {
  gray: "border-border bg-muted text-foreground",
  blue: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  green:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  yellow:
    "border-yellow-500/20 bg-yellow-500/10 text-yellow-800 dark:text-yellow-300",
  orange:
    "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  red: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
  purple:
    "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  pink: "border-pink-500/20 bg-pink-500/10 text-pink-700 dark:text-pink-300",
};

const colorDotClasses: Record<CustomFieldColor, string> = {
  gray: "bg-zinc-400",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  purple: "bg-violet-500",
  pink: "bg-pink-500",
};

export function DocumentCustomFields({
  fields,
  onChange,
  onManage,
}: {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  onManage: () => void;
}) {
  const updateField = (fieldId: string, changes: Partial<CustomField>) => {
    onChange(
      fields.map((field) =>
        field.id === fieldId ? { ...field, ...changes } : field,
      ),
    );
  };

  return (
    <section className="max-w-3xl py-1">
      <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.id}
            className={`group grid min-h-9 grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted/45 ${field.layout === "full" ? "sm:col-span-2" : ""}`}
          >
            <p
              className="flex min-w-0 items-center gap-2 truncate text-[11px] font-medium text-muted-foreground"
              title={field.name || "Untitled property"}
            >
              <span
                className={`size-1.5 shrink-0 rounded-sm ${colorDotClasses[field.color ?? "gray"]}`}
              />
              <span className="truncate">
                {field.name || "Untitled property"}
              </span>
            </p>
            <div className="min-w-0">
              {field.type === "date" ? (
                <DatePicker
                  date={
                    typeof field.value === "string" && field.value
                      ? new Date(`${field.value}T12:00:00`)
                      : undefined
                  }
                  setDate={(date) =>
                    updateField(field.id, {
                      value: date ? format(date, "yyyy-MM-dd") : "",
                    })
                  }
                  className="h-8 w-fit min-w-28 rounded-md border-transparent bg-transparent px-2 text-xs shadow-none hover:bg-muted"
                />
              ) : field.type === "boolean" ? (
                <Select
                  value={String(field.value ?? "false")}
                  onValueChange={(value: string | null) =>
                    value && updateField(field.id, { value: value === "true" })
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="h-8 w-fit min-w-20 rounded-md border-transparent bg-transparent px-2 text-xs shadow-none hover:bg-muted"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-popover p-1 shadow-lg">
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              ) : field.type === "select" || field.type === "status" ? (
                <Select
                  value={String(field.value ?? "")}
                  onValueChange={(value: string | null) =>
                    updateField(field.id, { value: value ?? "" })
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className={`h-8 w-fit min-w-24 max-w-full rounded-md px-2 text-xs shadow-none ${field.type === "status" ? statusColorClasses[field.color ?? "gray"] : "border-transparent bg-transparent hover:bg-muted"}`}
                  >
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-popover p-1 shadow-lg">
                    {(
                      field.options ??
                      (field.value ? [String(field.value)] : [])
                    ).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={String(field.value ?? "")}
                  onChange={(event) =>
                    updateField(field.id, {
                      value:
                        field.type === "number" && event.target.value
                          ? Number(event.target.value)
                          : event.target.value,
                    })
                  }
                  type={field.type === "number" ? "number" : "text"}
                  placeholder="Empty"
                  className="h-8 w-full max-w-sm rounded-md border-transparent bg-transparent px-2 text-xs shadow-none hover:bg-muted focus-visible:bg-background focus-visible:ring-1"
                />
              )}
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onManage}
          className="h-8 justify-start rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground sm:col-span-2"
        >
          <Plus className="size-3.5" />{" "}
          {fields.length ? "Add or manage properties" : "Add a property"}
        </Button>
      </div>
    </section>
  );
}
