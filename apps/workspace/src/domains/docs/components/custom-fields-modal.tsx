"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import type { CustomField, CustomFieldColor } from "../docs.types";

const STATUS_COLORS: Array<{ value: CustomFieldColor; label: string }> = [
  { value: "gray", label: "Gray" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
  { value: "orange", label: "Orange" },
  { value: "red", label: "Red" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
];

interface CustomFieldsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customFields: CustomField[];
  onSave: (fields: CustomField[]) => void;
}

export function CustomFieldsModal({
  open,
  onOpenChange,
  customFields,
  onSave,
}: CustomFieldsModalProps) {
  const [fields, setFields] = useState<CustomField[]>(customFields);

  useEffect(() => {
    if (open) setFields(customFields);
  }, [customFields, open]);

  const handleAddField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      name: "",
      type: "text",
      value: "",
      color: "gray",
      layout: "half",
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, updates: Partial<CustomField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const handleTypeChange = (index: number, type: CustomField["type"]) => {
    const field = fields[index];
    if (!field) return;

    handleUpdateField(index, {
      type,
      value: type === "boolean" ? false : "",
      options:
        type === "select" || type === "status"
          ? (field.options ?? [])
          : undefined,
    });
  };

  const handleDeleteField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  const handleSave = () => {
    onSave(fields);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(760px,calc(100vh-2rem))] max-w-2xl gap-0 overflow-hidden rounded-2xl border-border/80 bg-background p-0">
        <DialogHeader className="border-b border-border/80 bg-background px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground">
              <SlidersHorizontal className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold tracking-[-0.01em]">
                Custom fields
              </DialogTitle>
              <DialogDescription className="mt-1 max-w-lg text-xs leading-5">
                Add structured information that makes this document easier to
                scan and manage.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 px-6 py-5">
          <div className="space-y-3">
            {fields.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background px-5 py-10 text-center">
                <p className="text-sm font-medium text-foreground">
                  No custom fields yet
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                  Create fields for owners, review dates, approval state, or any
                  workflow detail.
                </p>
              </div>
            ) : (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-xl border border-border/80 bg-background p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="h-5 rounded-md px-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                    >
                      Field {index + 1}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteField(index)}
                      className="size-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${field.name || "custom field"}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_8.5rem]">
                    <div className="grid min-w-0 gap-1.5">
                      <Label
                        htmlFor={`custom-field-name-${field.id}`}
                        className="text-[11px] font-medium text-muted-foreground"
                      >
                        Field name
                      </Label>
                      <Input
                        id={`custom-field-name-${field.id}`}
                        value={field.name}
                        onChange={(e) =>
                          handleUpdateField(index, { name: e.target.value })
                        }
                        placeholder="e.g. Review owner"
                        className="h-9 rounded-lg bg-background text-sm"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        Field type
                      </Label>
                      <Select
                        value={field.type}
                        onValueChange={(value: string | null) =>
                          value &&
                          handleTypeChange(index, value as CustomField["type"])
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="rounded-lg bg-background px-3 text-sm"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-popover p-1 shadow-lg">
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-1.5">
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      {field.type === "select"
                        ? "Default value and choices"
                        : field.type === "status"
                          ? "Status value, choices, and color"
                          : "Default value"}
                    </Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {field.type === "date" ? (
                        <DatePicker
                          date={
                            typeof field.value === "string" && field.value
                              ? new Date(`${field.value}T12:00:00`)
                              : undefined
                          }
                          setDate={(date) =>
                            handleUpdateField(index, {
                              value: date ? format(date, "yyyy-MM-dd") : "",
                            })
                          }
                          className="h-9 w-full rounded-lg bg-background text-sm"
                        />
                      ) : field.type === "boolean" ? (
                        <Select
                          value={String(field.value ?? "false")}
                          onValueChange={(value: string | null) =>
                            value &&
                            handleUpdateField(index, {
                              value: value === "true",
                            })
                          }
                        >
                          <SelectTrigger
                            size="sm"
                            className="rounded-lg bg-background px-3 text-sm"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl bg-popover p-1 shadow-lg">
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.type === "number" ? "number" : "text"}
                          value={String(field.value ?? "")}
                          onChange={(e) =>
                            handleUpdateField(index, {
                              value:
                                field.type === "number" && e.target.value
                                  ? Number(e.target.value)
                                  : e.target.value,
                            })
                          }
                          placeholder={
                            field.type === "select" || field.type === "status"
                              ? "Default value"
                              : "Optional value"
                          }
                          className="h-9 rounded-lg bg-background text-sm"
                        />
                      )}
                      {field.type === "select" || field.type === "status" ? (
                        <Input
                          value={(field.options ?? []).join(", ")}
                          onChange={(event) =>
                            handleUpdateField(index, {
                              options: event.target.value
                                .split(",")
                                .map((option) => option.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Options, comma separated"
                          className="h-9 rounded-lg bg-background text-sm"
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        Width
                      </Label>
                      <Select
                        value={field.layout ?? "half"}
                        onValueChange={(value: string | null) =>
                          value &&
                          handleUpdateField(index, {
                            layout: value as CustomField["layout"],
                          })
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="rounded-lg bg-background px-3 text-sm"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-popover p-1 shadow-lg">
                          <SelectItem value="half">
                            Half — two columns
                          </SelectItem>
                          <SelectItem value="full">Full row</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        Color
                      </Label>
                      <Select
                        value={field.color ?? "gray"}
                        onValueChange={(value: string | null) =>
                          value &&
                          handleUpdateField(index, {
                            color: value as CustomFieldColor,
                          })
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="rounded-lg bg-background px-3 text-sm"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-popover p-1 shadow-lg">
                          {STATUS_COLORS.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              {color.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddField}
              className="h-10 w-full rounded-xl border-dashed bg-background text-xs font-medium text-muted-foreground hover:border-border hover:bg-background hover:text-foreground"
            >
              <Plus className="size-3.5" />
              Add another field
            </Button>
          </div>
        </div>
        <DialogFooter className="m-0 border-border/80 bg-background px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-lg px-4 text-xs font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="h-9 rounded-lg px-4 text-xs font-medium"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
