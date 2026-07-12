"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CUSTOM_FIELD_TYPES } from "@/domains/custom-fields/config/field-types.config";
import { useCreateCustomFieldDefinitionMutation, type CustomFieldDefinition } from "@/domains/custom-fields/api/custom-fields";
import { cn } from "@/lib/utils";

interface InlineCustomFieldCreatorProps {
  recordType: "client" | "deal" | "opportunity" | "project" | "task" | "calendarEvent";
  compact?: boolean;
}

function fieldKey(label: string) {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function InlineCustomFieldCreator({ recordType, compact }: InlineCustomFieldCreatorProps) {
  const createField = useCreateCustomFieldDefinitionMutation();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CustomFieldDefinition["type"]>("text");
  const [options, setOptions] = useState("");
  const [required, setRequired] = useState(false);
  const [tableVisible, setTableVisible] = useState(false);
  const [boardVisible, setBoardVisible] = useState(false);
  const supportsOptions = type === "select" || type === "multiSelect";
  const parsedOptions = useMemo(
    () => options.split(",").map((value) => value.trim()).filter(Boolean),
    [options],
  );

  function reset() {
    setLabel("");
    setDescription("");
    setType("text");
    setOptions("");
    setRequired(false);
    setTableVisible(false);
    setBoardVisible(false);
  }

  function submit() {
    const key = fieldKey(label);
    if (!key || (supportsOptions && parsedOptions.length === 0)) return;
    createField.mutate(
      {
        key,
        label: label.trim(),
        description: description.trim() || undefined,
        type,
        required,
        appliesTo: [recordType],
        options: supportsOptions
          ? parsedOptions.map((option, order) => ({ id: crypto.randomUUID(), label: option, order }))
          : undefined,
        display: { detailVisible: true, tableVisible, boardVisible, requiredOnCreate: false },
      },
      { onSuccess: () => { setOpen(false); reset(); } },
    );
  }

  return (
    <>
      <Button type="button" variant={compact ? "ghost" : "outline"} size="sm" onClick={() => setOpen(true)} className="h-7 gap-1.5 text-xs">
        <Plus className="size-3.5" /> Add field
      </Button>
      <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
        <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle>Add custom field</DialogTitle>
            <DialogDescription>Create a reusable field for all {recordType} records.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-5">
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Field type</p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {CUSTOM_FIELD_TYPES.map((item) => {
                  const Icon = item.icon;
                  return <button key={item.value} type="button" onClick={() => setType(item.value)} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs", type === item.value ? "border-primary bg-primary/8 text-foreground" : "border-border text-muted-foreground hover:bg-muted/50")}><Icon className="size-3.5" />{item.label}</button>;
                })}
              </div>
            </div>
            <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">Field name<Input autoFocus value={label} onChange={(event) => setLabel(event.target.value)} placeholder="e.g. Effort estimate" /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">Description<Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tell the team how to use this field" className="min-h-20" /></label>
            {supportsOptions ? <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">Options<Input value={options} onChange={(event) => setOptions(event.target.value)} placeholder="Design, Engineering, Review" /><span className="font-normal text-muted-foreground/70">Separate options with commas.</span></label> : null}
            <div className="divide-y divide-border rounded-lg border border-border">
              {[["Required in tasks", required, setRequired], ["Show in table", tableVisible, setTableVisible], ["Show on board cards", boardVisible, setBoardVisible]].map(([text, checked, setter]) => <label key={String(text)} className="flex items-center justify-between px-3 py-2.5 text-xs font-medium"><span>{String(text)}</span><Switch checked={Boolean(checked)} onCheckedChange={setter as (value: boolean) => void} /></label>)}
            </div>
          </div>
          <DialogFooter className="border-t border-border px-5 py-3"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="button" onClick={submit} disabled={!label.trim() || createField.isPending || (supportsOptions && parsedOptions.length === 0)}>{createField.isPending ? "Creating…" : "Create field"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
