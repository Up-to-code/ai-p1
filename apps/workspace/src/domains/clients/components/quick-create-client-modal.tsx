"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CustomSelect } from "@/components/ui/custom-select";
import { useQueryClient } from "@tanstack/react-query";
import { createClientRequest, clientsIndexQueryBaseKey } from "@/domains/clients/api/clients";
import type { ClientFormValues } from "@/domains/clients/validation/client.schema";
import type { PipelineStage } from "../store/clients.types";

interface QuickCreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  queryKey: readonly unknown[];
  defaultStage?: PipelineStage;
  onSuccess?: (id: string) => void;
}

const stageOptions = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "review", label: "Review" },
  { value: "negotiation", label: "Negotiation" },
];

const typeOptions = [
  { value: "person", label: "Person" },
  { value: "organization", label: "Organization" },
];

const sourceOptions = [
  { value: "manual", label: "Manual" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social", label: "Social Media" },
  { value: "cold_call", label: "Cold Call" },
  { value: "advertisement", label: "Advertisement" },
  { value: "partner", label: "Partner" },
  { value: "other", label: "Other" },
];

export function QuickCreateClientModal({
  open,
  onOpenChange,
  organizationId,
  queryKey,
  defaultStage = "new",
  onSuccess,
}: QuickCreateClientModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<"person" | "organization">("person");
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>(defaultStage);
  const [source, setSource] = useState("manual");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});
  const [dialogKey, setDialogKey] = useState(0);

  function validate(): boolean {
    const newErrors: { name?: string; contact?: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!contact.trim() && !phone.trim()) newErrors.contact = "Email or phone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const values: ClientFormValues = {
        name: name.trim(),
        type,
        contact: contact.trim(),
        phone: phone.trim(),
        age: "",
        nationality: "",
        generation: "",
        budget: budget.trim(),
        assetInterest: "",
        status: "new",
        visibility: "private",
        pipelineStage,
        priority: "normal",
        nextAction: "",
        issue: "",
        notes: notes.trim(),
        tags: [],
      };
      const result = await createClientRequest(organizationId, values);
      await queryClient.invalidateQueries({ queryKey: clientsIndexQueryBaseKey(organizationId) });
      onOpenChange(false);
      onSuccess?.(result?.client?.id ?? "");
    } catch {
      setIsSaving(false);
    }
  }

  return (
    <Dialog key={dialogKey} open={open} onOpenChange={(isOpen) => {
      if (isOpen) setDialogKey((k) => k + 1);
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[625px] p-6 gap-4 animate-in fade-in-0 zoom-in-95 duration-150">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
            <UserPlus className="h-5 w-5" />
            New Client
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a new client to your pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Name *</label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
              placeholder="Client name"
              autoFocus
              className={errors.name ? "border-destructive" : ""}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            />
            {errors.name && <p className="text-[11px] text-destructive mt-1">{errors.name}</p>}
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Email *</label>
              <Input
                value={contact}
                onChange={(e) => { setContact(e.target.value); if (errors.contact) setErrors((p) => ({ ...p, contact: undefined })); }}
                placeholder="email@example.com"
                type="email"
                className={errors.contact ? "border-destructive" : ""}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              />
              {errors.contact && <p className="text-[11px] text-destructive mt-1">{errors.contact}</p>}
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Phone *</label>
              <Input
                value={phone}
                onChange={(e) => { setPhone(e.target.value); if (errors.contact) setErrors((p) => ({ ...p, contact: undefined })); }}
                placeholder="+1 (555) 000-0000"
                type="tel"
                className={errors.contact ? "border-destructive" : ""}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Type</label>
              <CustomSelect
                value={type}
                options={typeOptions}
                onChange={(v) => setType(v as "person" | "organization")}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Stage</label>
              <CustomSelect
                value={pipelineStage}
                options={stageOptions}
                onChange={(v) => setPipelineStage(v as PipelineStage)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Source</label>
              <CustomSelect
                value={source}
                options={sourceOptions}
                onChange={setSource}
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Company</label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name"
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Budget</label>
              <Input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. $500,000"
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            Create Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
