"use client";

import { useState, useMemo } from "react";
import {
  useCustomFieldDefinitionsQuery,
  useCreateCustomFieldDefinitionMutation,
  useUpdateCustomFieldDefinitionMutation,
  useDeleteCustomFieldDefinitionMutation,
  type CustomFieldDefinition,
} from "../api/custom-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, Settings, Hash, Calendar, Tag, ToggleLeft, Link2, User, DollarSign, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const FIELD_TYPES: Array<{ value: CustomFieldDefinition["type"]; label: string; icon: React.ElementType }> = [
  { value: "text", label: "Text", icon: FileText },
  { value: "longText", label: "Long Text", icon: FileText },
  { value: "number", label: "Number", icon: Hash },
  { value: "currency", label: "Currency", icon: DollarSign },
  { value: "date", label: "Date", icon: Calendar },
  { value: "dateTime", label: "Date & Time", icon: Calendar },
  { value: "select", label: "Select", icon: Tag },
  { value: "multiSelect", label: "Multi-Select", icon: Tag },
  { value: "boolean", label: "Checkbox", icon: ToggleLeft },
  { value: "url", label: "URL", icon: Link2 },
  { value: "user", label: "Person / User", icon: User },
];

const RECORD_TYPES = [
  { value: "client", label: "Clients" },
  { value: "project", label: "Projects" },
  { value: "deal", label: "Deals" },
  { value: "opportunity", label: "Opportunities" },
  { value: "task", label: "Tasks" },
  { value: "calendarEvent", label: "Calendar Events" },
];

interface NewFieldForm {
  key: string;
  label: string;
  description: string;
  type: CustomFieldDefinition["type"];
  required: boolean;
  appliesTo: string[];
  options: Array<{ id: string; label: string; color?: string; order: number }>;
  display: {
    tableVisible: boolean;
    boardVisible: boolean;
    detailVisible: boolean;
    requiredOnCreate: boolean;
  };
}

const defaultForm: NewFieldForm = {
  key: "",
  label: "",
  description: "",
  type: "text",
  required: false,
  appliesTo: ["client"],
  options: [],
  display: {
    tableVisible: false,
    boardVisible: false,
    detailVisible: true,
    requiredOnCreate: false,
  },
};

export function CustomFieldsSettings() {
  const definitionsQuery = useCustomFieldDefinitionsQuery();
  const createMutation = useCreateCustomFieldDefinitionMutation();
  const updateMutation = useUpdateCustomFieldDefinitionMutation();
  const deleteMutation = useDeleteCustomFieldDefinitionMutation();

  const definitions = useMemo(() => (definitionsQuery.data as any)?.definitions ?? [], [definitionsQuery.data]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [form, setForm] = useState<NewFieldForm>(defaultForm);
  const [optionInput, setOptionInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("client");

  const filteredDefinitions = useMemo(
    () => definitions.filter((d: CustomFieldDefinition) => d.appliesTo.includes(activeTab)),
    [definitions, activeTab],
  );

  function generateKey(label: string) {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function addOption() {
    const label = optionInput.trim();
    if (!label || form.options.some((o) => o.label === label)) {
      setOptionInput("");
      return;
    }
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { id: crypto.randomUUID(), label, order: prev.options.length }],
    }));
    setOptionInput("");
  }

  function removeOption(id: string) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o.id !== id),
    }));
  }

  function toggleAppliesTo(value: string) {
    setForm((prev) => ({
      ...prev,
      appliesTo: prev.appliesTo.includes(value)
        ? prev.appliesTo.filter((v) => v !== value)
        : [...prev.appliesTo, value],
    }));
  }

  function handleCreate() {
    if (!form.label.trim()) return;
    const key = form.key || generateKey(form.label);
    createMutation.mutate(
      {
        key,
        label: form.label,
        description: form.description || undefined,
        type: form.type,
        required: form.required,
        appliesTo: form.appliesTo as any,
        options: form.options.length > 0 ? form.options : undefined,
        display: form.display,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setForm(defaultForm);
        },
      },
    );
  }

  function handleUpdate() {
    if (!editingField) return;
    updateMutation.mutate(
      {
        fieldId: editingField.id,
        input: {
          label: form.label,
          description: form.description || undefined,
          required: form.required,
          appliesTo: form.appliesTo as any,
          options: form.options.length > 0 ? form.options : undefined,
          display: form.display,
        },
      },
      {
        onSuccess: () => {
          setEditingField(null);
          setForm(defaultForm);
        },
      },
    );
  }

  function handleDelete(fieldId: string) {
    if (!confirm("Are you sure you want to delete this custom field? This will also delete all values.")) return;
    deleteMutation.mutate(fieldId);
  }

  function startEdit(field: CustomFieldDefinition) {
    setEditingField(field);
    setForm({
      key: field.key,
      label: field.label,
      description: field.description ?? "",
      type: field.type,
      required: field.required,
      appliesTo: field.appliesTo,
      options: field.options ?? [],
      display: field.display ?? {
        tableVisible: false,
        boardVisible: false,
        detailVisible: true,
        requiredOnCreate: false,
      },
    });
  }

  const hasOptions = form.type === "select" || form.type === "multiSelect";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-6 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-text-primary">Custom Fields</h1>
              <p className="mt-1 text-sm font-medium text-text-secondary">
                Define custom data points for your entities.
              </p>
            </div>
          </div>
          <Button onClick={() => { setForm(defaultForm); setIsCreateOpen(true); }} className="h-10 rounded-xl px-5 font-bold">
            <Plus className="me-2 h-4 w-4" />
            Add Field
          </Button>
        </div>
      </div>

      {/* Entity tabs */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-border pb-px dark:border-white/5">
        {RECORD_TYPES.map((rt) => (
          <button
            key={rt.value}
            type="button"
            onClick={() => setActiveTab(rt.value)}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-xs font-bold transition-colors",
              activeTab === rt.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {rt.label}
            <span className="ml-1.5 text-muted-foreground/60">
              {definitions.filter((d: CustomFieldDefinition) => d.appliesTo.includes(rt.value)).length}
            </span>
          </button>
        ))}
      </div>

      {/* Fields list */}
      {filteredDefinitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center dark:border-white/10 dark:bg-white/5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted dark:bg-white/10">
            <Settings className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-black text-text-primary">No custom fields</h3>
          <p className="mt-1.5 max-w-xs text-sm text-text-secondary">
            Add custom fields to extend {RECORD_TYPES.find((r) => r.value === activeTab)?.label.toLowerCase()} with your own data points.
          </p>
          <Button onClick={() => { setForm(defaultForm); setIsCreateOpen(true); }} className="mt-5 h-10 rounded-xl px-5 font-bold">
            <Plus className="me-2 h-4 w-4" />
            Add Field
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDefinitions.map((field: CustomFieldDefinition) => {
            const typeInfo = FIELD_TYPES.find((t) => t.value === field.type);
            const TypeIcon = typeInfo?.icon ?? FileText;
            return (
              <div
                key={field.id}
                className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-muted/30 dark:border-white/5 dark:hover:bg-white/[0.02]"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted dark:bg-white/5">
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{field.label}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground dark:bg-white/5">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-500">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono text-[10px]">{field.key}</span>
                    {field.options && field.options.length > 0 && (
                      <span>· {field.options.filter((o) => !o.archivedAt).length} options</span>
                    )}
                    {field.display?.tableVisible && <span>· Shown in table</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => startEdit(field)}
                    className="rounded-lg px-2 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(field.id)}
                    className="rounded-lg px-2 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={isCreateOpen || Boolean(editingField)} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingField(null);
          setForm(defaultForm);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogTitle>{editingField ? "Edit Custom Field" : "New Custom Field"}</DialogTitle>
          <DialogDescription>
            {editingField ? "Update the field definition." : "Define a new custom field for your entities."}
          </DialogDescription>

          <div className="space-y-5 py-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Label</label>
              <Input
                value={form.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    label,
                    key: prev.key || generateKey(label),
                  }));
                }}
                placeholder="e.g. Industry"
                className="mt-1.5 h-10"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Key (slug)</label>
              <Input
                value={form.key}
                onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))}
                placeholder="e.g. industry"
                className="mt-1.5 h-10 font-mono text-xs"
                disabled={Boolean(editingField)}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                className="mt-1.5 h-10"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as CustomFieldDefinition["type"] }))}
                className="mt-1.5 flex h-10 w-full items-center rounded-xl border border-border bg-background px-3 text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary dark:border-white/10 dark:bg-white/5"
              >
                {FIELD_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>

            {/* Options for select/multiSelect */}
            {hasOptions && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Options</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <Input
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                    placeholder="Add option..."
                    className="h-9 flex-1 text-xs"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={addOption} className="h-9 px-3 text-xs font-bold">
                    Add
                  </Button>
                </div>
                {form.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.options.map((opt) => (
                      <span
                        key={opt.id}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-bold dark:border-white/10 dark:bg-white/5"
                      >
                        {opt.label}
                        <button type="button" onClick={() => removeOption(opt.id)} className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Applies to */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Applies To</label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {RECORD_TYPES.map((rt) => (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => toggleAppliesTo(rt.value)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors",
                      form.appliesTo.includes(rt.value)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted dark:border-white/10",
                    )}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display options */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Display</label>
              <div className="mt-1.5 space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.display.tableVisible}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      display: { ...prev.display, tableVisible: e.target.checked },
                    }))}
                    className="h-4 w-4 rounded border-border"
                  />
                  Show in table view
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.display.detailVisible}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      display: { ...prev.display, detailVisible: e.target.checked },
                    }))}
                    className="h-4 w-4 rounded border-border"
                  />
                  Show in detail view
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.required}
                    onChange={(e) => setForm((prev) => ({ ...prev, required: e.target.checked }))}
                    className="h-4 w-4 rounded border-border"
                  />
                  Required field
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingField(null);
                setForm(defaultForm);
              }}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={editingField ? handleUpdate : handleCreate}
              disabled={!form.label.trim() || createMutation.isPending || updateMutation.isPending}
              className="font-bold"
            >
              {editingField ? "Save Changes" : "Create Field"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
