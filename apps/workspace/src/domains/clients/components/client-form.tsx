"use client";

import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAuthSession } from "@/domains/auth";
import {
  clientsIndexQueryBaseKey,
  updateClientRequest,
  useCreateClientOptimisticMutation,
} from "@/domains/clients/api/clients";
import type { Client, ClientType, PipelineStage } from "../store/clients.types";
import { clientSchema, type ClientFormValues } from "../validation/client.schema";
import { useOperationState } from "@/lib/utils/operation-state";
import { FormActions, TextInput } from "@/components/shared/crud-ui";

function SelectField({ name, label, value, options, onChange }: {
  name: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground" htmlFor={name}>
      {label}
      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/15"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

interface ClientFormProps {
  existing?: Client;
  indexQueryKey?: readonly unknown[];
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
}

export function ClientForm({ existing, indexQueryKey, onSuccess, onCancel }: ClientFormProps) {
  const t = useTranslations("Clients");
  const session = useAuthSession();
  const queryClient = useQueryClient();
  const createClientMutation = useCreateClientOptimisticMutation(indexQueryKey);
  
  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema as any) as Resolver<ClientFormValues>,
    defaultValues: {
      name: existing?.name ?? "",
      type: existing?.type ?? "person" as ClientType,
      contact: existing?.contact ?? "",
      phone: existing?.phone ?? "",
      company: existing?.company ?? "",
      contactName: existing?.contactName ?? "",
      website: existing?.website ?? "",
      source: existing?.source ?? "manual",
      lastContact: existing?.lastContact ?? "",
      age: "",
      nationality: "",
      generation: "",
      budget: existing?.budget ?? "",
      assetInterest: existing?.assetInterest ?? "",
      status: existing?.status ?? "new" as Client["status"],
      visibility: existing?.visibility ?? "private",
      pipelineStage: (existing?.pipelineStage ?? "new") as ClientFormValues["pipelineStage"],
      priority: (existing?.priority ?? "normal") as ClientFormValues["priority"],
      nextAction: "",
      issue: "",
    },
  });
  const form = useWatch({ control }) as ClientFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof ClientFormValues, string | undefined>;
  const saveOperation = useOperationState({ errorMessage: "Client save failed." });

  const setField = (key: keyof ClientFormValues, value: string) => {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    saveOperation.clearError();
  };

  const onSubmit = handleSubmit((data: ClientFormValues) => {
    if (!session.organization.id) return;

    if (existing) {
      void saveOperation.run(async () => {
        const result = await updateClientRequest(session.organization.id!, existing.id, data);
        await queryClient.invalidateQueries({ queryKey: clientsIndexQueryBaseKey(session.organization.id ?? undefined) });
        return result.client.id;
      }, {
        successMessage: "Client saved.",
        onSuccess: (nextId) => onSuccess?.(nextId),
      });
      return;
    }

    createClientMutation.mutate(
      { organizationId: session.organization.id, values: data },
      { onSuccess: (result) => onSuccess?.(result.client.id) },
    );
  });

  return (
    <form className="flex h-full flex-col" onSubmit={onSubmit}>
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        <section className="grid gap-5 rounded-2xl border border-border/70 bg-muted/15 p-4">
          <div>
            <h3 className="text-sm font-semibold">Client identity</h3>
            <p className="text-xs text-muted-foreground">Core contact and account information.</p>
          </div>
          <TextInput
            name="name"
            label={t("form.nameLabel")}
            value={form.name}
            onChange={(value) => setField("name", value)}
            placeholder={t("form.namePlaceholder")}
            autoComplete="name"
            error={fieldErrors.name}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              name="contact"
              label={t("form.emailLabel")}
              type="email"
              value={form.contact}
              onChange={(value) => setField("contact", value)}
              placeholder={t("form.emailPlaceholder")}
              autoComplete="email"
              error={fieldErrors.contact}
            />
            <TextInput
              name="phone"
              label={t("form.phoneLabel")}
              type="tel"
              value={form.phone}
              onChange={(value) => setField("phone", value)}
              placeholder={t("form.phonePlaceholder")}
              autoComplete="tel"
              error={fieldErrors.phone}
            />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField name="type" label="Client type" value={form.type} onChange={(value) => setField("type", value)} options={[{ value: "person", label: "Person" }, { value: "organization", label: "Organization" }]} />
            <SelectField name="visibility" label="Visibility" value={form.visibility ?? "private"} onChange={(value) => setField("visibility", value)} options={[{ value: "private", label: "Private" }, { value: "team", label: "Team" }, { value: "workspace", label: "Workspace" }]} />
          </div>
        </section>

        <section className="grid gap-5 rounded-2xl border border-border/70 bg-muted/15 p-4">
          <div>
            <h3 className="text-sm font-semibold">Pipeline</h3>
            <p className="text-xs text-muted-foreground">Qualify and prioritize the relationship.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <SelectField name="status" label="Status" value={form.status} onChange={(value) => setField("status", value)} options={["new", "active", "nurture", "inactive", "archived"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} />
            <SelectField name="pipelineStage" label="Pipeline stage" value={form.pipelineStage} onChange={(value) => setField("pipelineStage", value)} options={["new", "qualified", "review", "negotiation", "closed"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} />
            <SelectField name="priority" label="Priority" value={form.priority} onChange={(value) => setField("priority", value)} options={["normal", "high", "urgent"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <TextInput name="budget" label="Budget" value={form.budget} onChange={(value) => setField("budget", value)} placeholder="e.g. $25,000" />
            <TextInput name="assetInterest" label="Service or asset interest" value={form.assetInterest} onChange={(value) => setField("assetInterest", value)} placeholder="What are they interested in?" />
          </div>
          <TextInput name="nextAction" label="Next action" value={form.nextAction} onChange={(value) => setField("nextAction", value)} placeholder="Schedule discovery call" />
        </section>
      </div>

      <div className="mt-8 border-t border-border pt-6 dark:border-white/5">
        <FormActions 
          isSubmitting={saveOperation.isRunning || createClientMutation.isPending || isSubmitting} 
          onCancel={onCancel || (() => {})} 
          submitLabel={existing ? t('form.saveBtn') : t('form.createBtn')} 
        />
      </div>
    </form>
  );
}
