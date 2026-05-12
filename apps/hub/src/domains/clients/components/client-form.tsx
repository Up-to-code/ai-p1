"use client";

import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAccountContext } from "@/domains/auth";
import { getOrganizationCapabilities } from "@/domains/organization/api/better-auth-organization";
import { createClientRequest, updateClientRequest } from "@/domains/clients/api/clients";
import type { Client, ClientType, PipelineStage } from "../store/clients.types";
import { clientSchema, type ClientFormValues } from "../validation/client.schema";
import { useOperationState } from "@/lib/utils/operation-state";
import { SelectField, SegmentedControl, FormActions, FormErrorSummary, TextInput } from "@/components/shared/crud-ui";

interface ClientFormProps {
  existing?: Client;
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
}

const pipelineStages = ["new", "qualified", "viewing", "negotiation", "closed"] as const;

export function ClientForm({ existing, onSuccess, onCancel }: ClientFormProps) {
  const t = useTranslations('Clients');
  const account = useAccountContext();
  const capabilitiesQuery = useReactQuery({
    queryKey: ["organization-capabilities", account.organization.id],
    queryFn: () => getOrganizationCapabilities(account.organization.id!),
    enabled: Boolean(account.organization.id),
  });
  const canManageVisibility = capabilitiesQuery.data?.canManageVisibility ?? false;
  
  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema) as Resolver<ClientFormValues>,
    defaultValues: {
      name: existing?.name ?? "",
      type: existing?.type ?? "Buyer" as ClientType,
      contact: existing?.contact ?? "",
      phone: existing?.phone ?? "",
      age: String(existing?.age ?? 30),
      nationality: existing?.nationality ?? "Saudi",
      generation: existing?.generation ?? "Millennial",
      budget: existing?.budget ?? "",
      propertyInterest: existing?.propertyInterest ?? "",
      status: existing?.status ?? "active" as Client["status"],
      visibility: existing?.visibility ?? "private",
      pipelineStage: existing?.pipelineStage ?? "new" as PipelineStage,
      priority: existing?.priority ?? "normal" as Client["priority"],
      nextAction: existing?.nextAction ?? "",
      issue: existing?.issue ?? "",
    },
  });
  const form = useWatch({ control }) as ClientFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof ClientFormValues, string | undefined>;
  const saveOperation = useOperationState({ errorMessage: "Client save failed." });

  const setField = (key: keyof ClientFormValues, value: string) => {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    saveOperation.clearError();
  };

  const onSubmit = handleSubmit((data) => {
    void saveOperation.run(async () => {
      if (!account.organization.id) throw new Error("Select an organization first.");
      const result = existing
        ? await updateClientRequest(account.organization.id, existing.id, data)
        : await createClientRequest(account.organization.id, data);
      return result.client.id;
    }, {
      successMessage: existing ? "Client saved." : "Client created.",
      onSuccess: (nextId) => onSuccess?.(nextId),
    });
  });

  return (
    <form className="flex h-full flex-col" onSubmit={onSubmit}>
      <div className="flex-1 space-y-12">
        <FormErrorSummary errors={fieldErrors} />
        
        <div className="grid gap-8">
          <TextInput name="name" label={t('form.nameLabel')} value={form.name} onChange={(value) => setField("name", value)} placeholder="Example: Abdullah Al-Faisal…" autoComplete="name" error={fieldErrors.name} />
          
          <div className="grid gap-6 md:grid-cols-2">
            <TextInput name="contact" label={t('form.emailLabel')} type="email" value={form.contact} onChange={(value) => setField("contact", value)} placeholder="nt@example.com…" error={fieldErrors.contact} />
            <TextInput name="phone" label={t('form.phoneLabel')} type="tel" value={form.phone} onChange={(value) => setField("phone", value)} placeholder="+966 5XX…" error={fieldErrors.phone} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <TextInput name="age" label={t('form.ageLabel')} type="number" value={form.age} onChange={(value) => setField("age", value)} error={fieldErrors.age} />
            <TextInput name="budget" label={t('form.budgetLabel')} value={form.budget} onChange={(value) => setField("budget", value)} placeholder="900K - 1.2M SAR…" error={fieldErrors.budget} />
          </div>
          
          <TextInput name="propertyInterest" label={t('form.interestLabel')} value={form.propertyInterest} onChange={(value) => setField("propertyInterest", value)} placeholder="...2BR apartment, Riyadh" error={fieldErrors.propertyInterest} />
          <TextInput name="nextAction" label={t('form.actionLabel')} value={form.nextAction} onChange={(value) => setField("nextAction", value)} placeholder="Schedule viewing…" error={fieldErrors.nextAction} />
        </div>

        <div className="grid gap-8">
          <div className="grid gap-6 md:grid-cols-2">
            <SegmentedControl
              id="type"
              label={t('form.typeLabel')}
              value={form.type}
              onChange={(value) => setField("type", value)}
              options={[
                { value: "Buyer", label: t('types.Buyer') },
                { value: "Tenant", label: t('types.Tenant') },
                { value: "Investor", label: t('types.Investor') },
              ]}
              error={fieldErrors.type}
            />

            <SegmentedControl 
              id="priority" 
              label={t('form.priorityLabel')} 
              value={form.priority} 
              onChange={(value) => setField("priority", value)} 
              options={[
                { value: "normal", label: t('priorities.normal') }, 
                { value: "high", label: t('priorities.high') }, 
                { value: "urgent", label: t('priorities.urgent') }
              ]} 
              error={fieldErrors.priority} 
            />
          </div>

          <SelectField 
            id="pipelineStage" 
            label={t('form.stageLabel')} 
            value={form.pipelineStage} 
            onChange={(value) => setField("pipelineStage", value)} 
            options={pipelineStages.map((stage) => ({ value: stage, label: t(`stages.${stage}`) }))} 
            error={fieldErrors.pipelineStage} 
          />
          {canManageVisibility && (
            <SelectField
              id="visibility"
              label={t("form.visibilityLabel")}
              value={form.visibility ?? "private"}
              onChange={(value) => setField("visibility", value)}
              options={[
                { value: "private", label: t("form.visibilityPrivate") },
                { value: "public", label: t("form.visibilityPublic") },
              ]}
              error={fieldErrors.visibility}
            />
          )}
        </div>
      </div>

      <div className="mt-12 border-t border-zinc-100 pt-8 dark:border-white/5">
        <FormActions 
          isSubmitting={saveOperation.isRunning || isSubmitting} 
          onCancel={onCancel || (() => {})} 
          submitLabel={existing ? t('form.saveBtn') : t('form.createBtn')} 
        />
      </div>
    </form>
  );
}
